package com.lora_connect.application.map

import com.graphhopper.routing.util.FlagEncoder
import com.graphhopper.routing.weighting.FastestWeighting
import com.graphhopper.util.EdgeIteratorState

class ObstacleAvoidanceWeighting(
    encoder: FlagEncoder,
    private val obstacleEdges: Set<Int>
) : FastestWeighting(encoder) {

    override fun calcEdgeWeight(edge: EdgeIteratorState, reverse: Boolean): Double {
        // Apply a penalty to obstacle edges
        if (obstacleEdges.contains(edge.edge)) {
            return Double.POSITIVE_INFINITY
        }

        return super.calcEdgeWeight(edge, reverse)
    }
}


