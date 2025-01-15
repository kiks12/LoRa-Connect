package com.lora_connect.application.map

import android.content.Context
import android.util.Log
import com.graphhopper.GHRequest
import com.graphhopper.GraphHopper
import com.graphhopper.ResponsePath
import com.graphhopper.config.CHProfile
import com.graphhopper.config.Profile
import com.graphhopper.util.shapes.GHPoint
import java.io.File
import java.lang.Exception

class OfflineRouting(private val context: Context) {
    private lateinit var graphHopper: GraphHopper

    fun initializeGraphHopper() {
        graphHopper = GraphHopper().forMobile()
        graphHopper.setProfiles(Profile("car").setVehicle("car").setWeighting("fastest"))
        graphHopper.chPreparationHandler.setCHProfiles(CHProfile("car"))
        val graphFolder = File(context.filesDir, "graph-cache")
        Log.w("OFFLINE ROUTING", "GRAPH CACHE EXISTS: ${graphFolder.exists()}")
        graphHopper.graphHopperLocation = graphFolder.absolutePath
        try {
            graphHopper.load(graphFolder.absolutePath)
            Log.w("OFFLINE ROUTING", "GRAPH HOPPER LOADED SUCCESSFULLY")
        } catch (e: Exception) {
            Log.w("OFFLINE ROUTING", e.message.toString())
        }
    }

    fun getRoute(startLat: Double, startLong: Double, endLat: Double, endLong: Double) : ResponsePath? {
        val startPoint = GHPoint(startLat, startLong)
        val endPoint = GHPoint(endLat, endLong)

        val request = GHRequest(startPoint, endPoint)
        request.setProfile("car")

        val response = graphHopper.route(request)
        Log.w("OFFLINE ROUTING", response.best.toString())

        if (response.hasErrors()) {
            Log.w("OFFLINE ROUTING", "Errors: ${response.errors}")
            return null
        }

        return response.best
    }
}