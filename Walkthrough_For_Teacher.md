# Emergency Response System - Project Walkthrough

This document explains the Data Structures and Algorithms (DSA) concepts implemented in this project. It is designed to help you explain the inner workings of the system to your teacher or anyone else.

---

## 1. Project Overview
This is an **Emergency Response Simulation** that efficiently manages incoming emergency calls and dispatches ambulances using the shortest path. 

**Core Problem Solved:** 
1. **Prioritization:** Deciding which emergency to handle first based on severity and waiting time.
2. **Pathfinding:** Finding the quickest route through a city grid that may have traffic or obstacles.

---

## 2. Key DSA Concepts & Implementations

### A. Priority Queue (Max-Heap)
**File:** `backend/dsa/PriorityQueue.js`

**Concept:** 
A **Priority Queue** is used to manage the list of active emergency calls. Unlike a regular queue (First-In-First-Out), a Priority Queue serves the "most important" element first. We implemented this using a **Max-Heap**, which ensures the highest priority item is always at the top (index 0) of the array.

**Why use it?** 
In an emergency, you don't just answer calls in order. A severe heart attack (High Severity) should be handled before a minor injury, even if the minor injury call came in first.

**Important Functions:**
*   **`insert(callId, severity, waitingTime, location)`**: 
    *   **What it does:** Adds a new emergency call to the heap.
    *   **Logic:** It calculates a `priority` score using the formula `(severity * 10) + waitingTime`. High severity has a huge impact, but long waiting times can also bump up priority.
    *   **DSA Mechanism:** It places the new item at the bottom and calls `bubbleUp()` to swap it upwards until it sits in the correct position to maintain the Max-Heap property.
*   **`extractMax()`**: 
    *   **What it does:** Removes and returns the emergency with the highest priority score.
    *   **DSA Mechanism:** It takes the root (index 0), replaces it with the last item in the heap, and calls `sinkDown()` to swap it downwards until the heap structure is restored.

---

### B. Graph (Adjacency List)
**File:** `backend/dsa/Graph.js`

**Concept:** 
The city grid is converted into a **Graph**. A graph consists of **Nodes** (locations on the grid) and **Edges** (connections between adjacent cells). We use an **Adjacency List** to represent this, where every node has a list of its neighbors and the "cost" (weight) to travel to them.

**Why use it?** 
Pathfinding algorithms like Dijkstra's cannot run directly on a raw 2D array (grid). They need a graph structure to understand connections and movement costs.

**Important Functions:**
*   **`addNode(node)`**: Creates an entry for a grid cell (e.g., "0,1") in the list.
*   **`addEdge(node1, node2, weight)`**: Creates a directed connection between two cells.
    *   *Weight Example:* A normal road has a weight of **1**. A Traffic zone has a weight of **3**. This tells the algorithm that traffic takes longer to cross.

---

### C. Dijkstra's Algorithm
**File:** `backend/dsa/Dijkstra.js`

**Concept:** 
**Dijkstra's Algorithm** is the standard algorithm for finding the **Shortest Path** in a weighted graph. It guarantees the path with the lowest total travel cost.

**Why use it?** 
We don't just want *any* path; we want the *fastest* path. Dijkstra accounts for the "cost" of traffic versus clear roads, avoiding high-traffic areas if a slightly longer but faster route exists.

**Important Functions:**
*   **`dijkstra(graph, startNode, endNode)`**:
    *   **What it does:** Calculates the best path from the ambulance to the emergency.
    *   **Logic:**
        1.  Initializes all distances to `Infinity` and the start node to `0`.
        2.  Uses a temporary "frontier" list (acting as a Min-Priority Queue) to explore nodes with the shortest known distance first.
        3.  **Relaxation:** For every neighbor of the current node, it checks: *Is the distance to this neighbor shorter if I go through the current node?* If yes, it updates the distance.
        4.  **Backtracking:** Once the target is reached, it uses the `previous` pointers to reconstruct the exact path taken.

---

## 3. How It All Connects (The Flow)

**File:** `backend/server.js`

This file acts as the "Controller" or "Brain" that ties the DSA components together.

1.  **Receiving a Call:**
    *   When you click "Add Emergency" on the frontend, `server.js` calls `globalPQ.insert()`.
    *   The Priority Queue re-orders itself instantly so the most critical call is ready.
    *   *Code:* `globalPQ.insert(callId, ...)`

2.  **Dispatching:**
    *   When you click "Dispatch Next":
    *   **Step 1 (Get Priority):** It calls `globalPQ.extractMax()` to get the most urgent emergency.
    *   **Step 2 (Build Graph):** It loops through the grid sent from the frontend and builds a fresh `Graph` instance, assigning weights (1 for road, 3 for traffic).
    *   **Step 3 (Find Path):** It runs `dijkstra(graph, start, end)` to find the route.
    *   **Step 4 (Response):** It sends the path back to the frontend to be drawn on the screen.

---

## 4. Summary for your Teacher

*   "I used a **Priority Queue (Max-Heap)** to ensure we always treat the most severe patients first."
*   "I modeled the city map as a **Weighted Graph**, where edge weights represent travel time (traffic takes longer)."
*   "I implemented **Dijkstra's Algorithm** to calculate the optimal path, avoiding traffic jams where possible to minimize response time."
