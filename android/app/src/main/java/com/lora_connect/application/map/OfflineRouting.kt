package com.lora_connect.application.map

import android.content.Context
import android.util.Log
import androidx.lifecycle.asFlow
import com.graphhopper.GraphHopper
import com.graphhopper.ResponsePath
import com.graphhopper.config.CHProfile
import com.graphhopper.config.Profile
import com.graphhopper.routing.AlgorithmOptions
import com.graphhopper.routing.util.EdgeFilter
import com.graphhopper.routing.util.EncodingManager
import com.graphhopper.util.FetchMode
import com.graphhopper.util.Instruction
import com.graphhopper.util.InstructionAnnotation
import com.graphhopper.util.InstructionList
import com.graphhopper.util.Parameters.Algorithms
import com.lora_connect.application.repositories.ObstacleRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.Locale

class OfflineRouting(private val context: Context) {
    private lateinit var graphHopper: GraphHopper
    private val obstacleRepository = ObstacleRepository(context)
    private val obstacles = obstacleRepository.getAllObstacles().asFlow()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    fun initializeGraphHopper() {
        graphHopper = GraphHopper().forMobile()
        graphHopper.chPreparationHandler.setCHProfiles(CHProfile("car")).setDisablingAllowed(true)
        graphHopper.setProfiles(Profile("car").setVehicle("car").setWeighting("fastest"))
            .setStoreOnFlush(true)
            .setEncodingManager(EncodingManager.create("car"))
        val graphFolder = File(context.filesDir, "graph-cache-v1")
        Log.w("OFFLINE ROUTING", "GRAPH CACHE EXISTS: ${graphFolder.exists()}")
        graphHopper.graphHopperLocation = graphFolder.absolutePath
        try {
            graphHopper.load(graphFolder.absolutePath)
            Log.w("OFFLINE ROUTING", "GRAPH HOPPER LOADED SUCCESSFULLY")
        } catch (e: Exception) {
            Log.w("OFFLINE ROUTING", e.message.toString())
        }
    }

    suspend fun getRoute(startLat: Double, startLong: Double, endLat: Double, endLong: Double) : ResponsePath? {
        return withContext(Dispatchers.IO) {
            val graph = graphHopper.graphHopperStorage
            val locationIndex = graphHopper.locationIndex
            val obstacleEdges = mutableSetOf<Int>()
            val encoder = graphHopper.encodingManager.getEncoder("car")
            val translationMap = graphHopper.translationMap // For localized instructions
            val translation = translationMap.getWithFallBack(Locale.US)

            scope.launch {
                async {
                    obstacles.collect { obstacleList ->
                        obstacleList.forEach { obstacle ->
                            if (obstacle.latitude != null && obstacle.longitude != null) {
                                val qr = graphHopper.locationIndex.findClosest(
                                    obstacle.latitude.toDouble(),
                                    obstacle.longitude.toDouble(),
                                    EdgeFilter.ALL_EDGES
                                )

                                if (qr.isValid) {
                                    val edge = qr.closestEdge
                                    obstacleEdges.add(edge.edge)
                                    Log.w("OFFLINE ROUTING", "Penalizing edge ID: ${edge.edge} at ${obstacle.latitude}, ${obstacle.longitude}")
                                }
                            }
                        }
                    }
                }.await()
            }

            async {
                graphHopper.graphHopperStorage.flush()
                val weighting = ObstacleAvoidanceWeighting(encoder, obstacleEdges)
                val algorithmOptions = AlgorithmOptions.start()
                    .algorithm(Algorithms.DIJKSTRA_BI)
                    .weighting(weighting)
                    .build()
                val routingAlgorithmFactory = graphHopper.getAlgorithmFactory("car", true, true)
                val algorithm = routingAlgorithmFactory.createAlgo(graph, algorithmOptions)

                val startNode = locationIndex.findClosest(startLat, startLong, EdgeFilter.ALL_EDGES).closestNode
                val endNode = locationIndex.findClosest(endLat, endLong, EdgeFilter.ALL_EDGES).closestNode

                val path = algorithm.calcPath(startNode, endNode)
                val instructionList = InstructionList(translation)

                path.calcEdges().forEach { edge ->
                    val distance = edge.distance
                    val speed = edge.get(encoder.averageSpeedEnc)
                    val time = if (speed > 0) (distance / speed) * 3600 * 1000 else 0
                    val points = edge.fetchWayGeometry(FetchMode.ALL)
                    val instruction = Instruction(Instruction.CONTINUE_ON_STREET, edge.name, InstructionAnnotation.EMPTY, points)
                    instruction.distance = distance
                    instruction.time = time.toLong()
                    instructionList.add(instruction)
                }

                if (path.isFound) {
                    val responsePath = ResponsePath()
                    responsePath.setPoints(path.calcPoints())
                    responsePath.setDistance(path.distance)
                    responsePath.setTime(path.time)
                    responsePath.instructions = instructionList
                    return@async responsePath
                }

                return@async null
            }.await()
        }
    }
}