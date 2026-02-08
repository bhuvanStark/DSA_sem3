# Emergency Response System - Comprehensive Technical Walkthrough

This document provides an in-depth analysis of the Data Structures and Algorithms (DSA) concepts implemented in this project, including mathematical formulas, complexity analysis, code examples, and execution traces.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Priority Queue (Max-Heap)](#2-priority-queue-max-heap)
3. [Graph (Adjacency List)](#3-graph-adjacency-list)
4. [Dijkstra's Algorithm](#4-dijkstras-algorithm)
5. [System Integration](#5-system-integration)
6. [Complexity Analysis Summary](#6-complexity-analysis-summary)
7. [Execution Examples](#7-execution-examples)

---

## 1. Project Overview

### Problem Statement
Design an emergency response system that:
1. **Prioritizes** multiple emergency calls based on severity and waiting time
2. **Finds** the optimal (shortest/fastest) path for ambulance dispatch
3. **Handles** real-world constraints like traffic congestion and obstacles

### Real-World Application
This simulates systems used by:
- Emergency Medical Services (EMS) dispatch centers
- Fire department response coordination
- Police emergency response units
- Disaster management systems

### Technologies Used
- **Backend**: Node.js with Express (REST API)
- **DSA**: Custom implementations (no external libraries)
- **Frontend**: Vanilla JavaScript with HTML5/CSS3
- **Communication**: JSON-based REST API with CORS

---

## 2. Priority Queue (Max-Heap)

### 📁 File: [`backend/dsa/PriorityQueue.js`](backend/dsa/PriorityQueue.js)

### 2.1 Concept Overview

A **Priority Queue** is an abstract data type where each element has a **priority** value. Unlike regular queues (FIFO), elements are served based on priority, not insertion order.

**Why Max-Heap?**
- We use a **Max-Heap** implementation to ensure the highest priority emergency is always at the root (index 0)
- Provides O(log n) insertion and extraction times
- Maintains heap property: Parent ≥ All Children

### 2.2 Priority Formula

```
Priority = (Severity × 10) + WaitingTime
```

**Where:**
- **Severity**: Integer scale (1 = Low, 2 = Medium, 3 = High)
- **WaitingTime**: Minutes the patient has been waiting

**Example Calculations:**
| Severity | Waiting Time | Priority | Reasoning |
|----------|--------------|----------|-----------|
| High (3) | 5 min | 35 | Critical case, moderate wait |
| High (3) | 15 min | 45 | Critical case, long wait (highest priority) |
| Medium (2) | 10 min | 30 | Moderate case |
| Low (1) | 8 min | 18 | Minor case (lowest priority) |

**Why this formula?**
- Severity has 10× weight to ensure critical cases are prioritized
- Waiting time acts as a "tie-breaker" and prevents starvation
- A high-severity case with 0 wait (30) > low-severity with 20 min wait (21)

### 2.3 Heap Structure

**Array Representation:**
```
         [45]              Index 0: Parent
        /    \
      [35]   [30]          Index 1,2: Children of 0
     /  \    /
   [18][20][25]            Index 3,4,5: Children of 1,2
```

**Index Formulas:**
- **Parent Index**: `⌊(i - 1) / 2⌋`
- **Left Child Index**: `2i + 1`
- **Right Child Index**: `2i + 2`

**Example:**
- Element at index 4 → Parent at `⌊(4-1)/2⌋ = ⌊3/2⌋ = 1`
- Element at index 1 → Left child at `2(1)+1 = 3`, Right child at `2(1)+2 = 4`

### 2.4 Core Operations

#### **A. Insert (Bubble-Up)**

**Code:**
```javascript
insert(callId, severity, waitingTime, location) {
    const priority = (severity * 10) + waitingTime;
    const emergencyCall = { callId, severity, waitingTime, location, priority };
    this.heap.push(emergencyCall);  // Add to end
    this.bubbleUp();                 // Restore heap property
}

bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
        let parentIndex = Math.floor((index - 1) / 2);
        if (this.heap[parentIndex].priority >= this.heap[index].priority) break;
        // Swap child with parent
        [this.heap[parentIndex], this.heap[index]] = 
        [this.heap[index], this.heap[parentIndex]];
        index = parentIndex;
    }
}
```

**Algorithm:**
1. Add new element to the end of the array
2. Compare with parent: `parent_index = ⌊(current - 1) / 2⌋`
3. If new element > parent, swap them
4. Repeat until heap property is satisfied or reach root

**Time Complexity**: **O(log n)**
- Worst case: Element bubbles from leaf to root
- Tree height = log₂(n), so maximum log₂(n) swaps

**Visual Example:**
```
Initial: [45, 35, 30, 18, 20]
Insert 40:

Step 1: Add to end
[45, 35, 30, 18, 20, 40]
                     ↑ (index 5)

Step 2: Compare with parent (index 2)
40 > 30? YES → Swap
[45, 35, 40, 18, 20, 30]
         ↑

Step 3: Compare with parent (index 0)
40 > 45? NO → Stop

Final: [45, 35, 40, 18, 20, 30]
```

#### **B. ExtractMax (Sink-Down)**

**Code:**
```javascript
extractMax() {
    if (this.heap.length === 0) return null;
    const max = this.heap[0];           // Save root
    const end = this.heap.pop();        // Remove last element
    if (this.heap.length > 0) {
        this.heap[0] = end;             // Move last to root
        this.sinkDown();                // Restore heap property
    }
    return max;
}

sinkDown() {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];
    while (true) {
        let leftChildIdx = 2 * index + 1;
        let rightChildIdx = 2 * index + 2;
        let swap = null;

        // Check if left child is larger
        if (leftChildIdx < length) {
            if (this.heap[leftChildIdx].priority > element.priority) {
                swap = leftChildIdx;
            }
        }

        // Check if right child is larger than current max
        if (rightChildIdx < length) {
            if ((swap === null && this.heap[rightChildIdx].priority > element.priority) ||
                (swap !== null && this.heap[rightChildIdx].priority > this.heap[leftChildIdx].priority)) {
                swap = rightChildIdx;
            }
        }

        if (swap === null) break;  // Correct position found
        [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
        index = swap;
    }
}
```

**Algorithm:**
1. Save the root (max element) to return
2. Move the last element to the root
3. Compare with children and swap with the **larger** child
4. Repeat until heap property restored

**Time Complexity**: **O(log n)**
- Similar to bubble-up: maximum log₂(n) swaps down the tree

**Visual Example:**
```
Initial: [45, 35, 40, 18, 20, 30]
Extract Max:

Step 1: Remove root (45), move last (30) to root
[30, 35, 40, 18, 20]
 ↓

Step 2: Compare with children (35, 40)
Larger child = 40 → Swap
[40, 35, 30, 18, 20]
         ↓

Step 3: 30 has no children → Stop

Final: [40, 35, 30, 18, 20]
Returned: 45
```

### 2.5 Heap Property Invariant

**Max-Heap Property:**
```
For all nodes i (except root):
heap[parent(i)].priority ≥ heap[i].priority
```

**Proof of Correctness:**
- **Insert**: Bubble-up only swaps when child > parent, restoring property
- **ExtractMax**: Sink-down only swaps when parent < child, restoring property
- Both operations maintain the invariant at every step

---

## 3. Graph (Adjacency List)

### 📁 File: [`backend/dsa/Graph.js`](backend/dsa/Graph.js)

### 3.1 Concept Overview

A **Graph** G = (V, E) consists of:
- **V**: Set of vertices (nodes) - grid cells in our case
- **E**: Set of edges (connections) - traversable paths between cells

**Why Adjacency List?**
- **Space Efficient**: O(V + E) vs O(V²) for adjacency matrix
- **Fast Neighbor Access**: O(degree(v)) to iterate neighbors
- **Dynamic**: Easy to add/remove edges
- **Ideal for Sparse Graphs**: City grids have few connections per cell (max 4 neighbors)

### 3.2 Grid to Graph Conversion

**2D Grid → Graph Mapping:**
```
Grid (3×3):              Graph Representation:
+---+---+---+
| . | T | . |            "0,0": [{"1,0", w=1}, {"0,1", w=3}]
+---+---+---+            "0,1": [{"0,0", w=3}, {"1,1", w=1}, {"0,2", w=1}]
| . | . | X |            "0,2": [{"0,1", w=1}, {"1,2", w=1}]
+---+---+---+            "1,0": [{"0,0", w=1}, {"2,0", w=1}]
| . | . | . |            "1,1": [{"0,1", w=1}, {"2,1", w=1}]
+---+---+---+            "1,2": [{"0,2", w=1}, {"2,2", w=1}]
                         "2,0": [{"1,0", w=1}, {"2,1", w=1}]
                         "2,1": [{"2,0", w=1}, {"1,1", w=1}, {"2,2", w=1}]
                         "2,2": [{"2,1", w=1}, {"1,2", w=1}]

Legend:
. = Normal road (weight = 1)
T = Traffic (weight = 3)
X = Obstacle (no edge)
```

**Node Naming Convention:**
- Node ID = `"row,col"` (e.g., `"2,3"` for row 2, column 3)

### 3.3 Edge Weights

**Weight Mapping:**
```javascript
function getCellCost(type) {
    switch (type) {
        case '.': return 1;  // Normal road
        case 'S': return 1;  // Start (ambulance)
        case 'D': return 1;  // Destination (emergency)
        case 'T': return 3;  // Traffic (3× slower)
        case 'X': return ∞;  // Obstacle (impassable)
    }
}
```

**Physical Interpretation:**
- Weight 1 = 1 minute travel time
- Weight 3 = 3 minutes (traffic congestion)
- Weight ∞ = Cannot traverse

**Example:**
Moving from clear road to traffic zone: Edge weight = 3 (destination's weight)

### 3.4 Core Operations

#### **A. Add Node**

```javascript
addNode(node) {
    if (!this.adjacencyList[node]) {
        this.adjacencyList[node] = [];  // Initialize empty neighbor list
    }
}
```

**Time Complexity**: **O(1)** - Hash table insertion

#### **B. Add Edge (Directed)**

```javascript
addEdge(node1, node2, weight) {
    if (!this.adjacencyList[node1]) this.addNode(node1);
    this.adjacencyList[node1].push({ node: node2, weight });
}
```

**Time Complexity**: **O(1)** - Array push operation

**Why Directed?**
- Each direction might have different weights (though in our grid, both are same)
- Allows flexibility for one-way streets in future

#### **C. Graph Construction Algorithm**

**From [`server.js`](backend/server.js):**
```javascript
for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        const cellType = grid[r][c];
        if (cellType === 'X') continue;  // Skip obstacles

        const nodeId = `${r},${c}`;
        const neighbors = [
            { dr: -1, dc: 0 },  // Up
            { dr: 1, dc: 0 },   // Down
            { dr: 0, dc: -1 },  // Left
            { dr: 0, dc: 1 }    // Right
        ];

        neighbors.forEach(({ dr, dc }) => {
            const nr = r + dr;
            const nc = c + dc;
            // Check bounds
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                const neighborType = grid[nr][nc];
                if (neighborType !== 'X') {
                    const weight = getCellCost(neighborType);
                    graph.addEdge(nodeId, `${nr},${nc}`, weight);
                }
            }
        });
    }
}
```

**Time Complexity**: **O(V + E)**
- V = rows × cols (total cells)
- E ≤ 4V (max 4 edges per cell in grid)
- Overall: O(V)

### 3.5 Adjacency List Structure

**Data Structure:**
```javascript
{
    "0,0": [
        { node: "0,1", weight: 1 },
        { node: "1,0", weight: 1 }
    ],
    "0,1": [
        { node: "0,0", weight: 1 },
        { node: "0,2", weight: 3 },
        { node: "1,1", weight: 1 }
    ],
    // ... more nodes
}
```

**Space Complexity**: **O(V + E)**
- Each vertex stored once: O(V)
- Each edge stored once: O(E)
- Total: O(V + E)

---

## 4. Dijkstra's Algorithm

### 📁 File: [`backend/dsa/Dijkstra.js`](backend/dsa/Dijkstra.js)

### 4.1 Algorithm Overview

**Dijkstra's Algorithm** finds the **shortest path** from a source node to all other nodes in a weighted graph with **non-negative** edge weights.

**Discovered by:** Edsger W. Dijkstra (1956)

**Category:** Greedy Algorithm (makes locally optimal choice at each step)

**Key Principle:** 
Once a node's shortest distance is determined, it never changes (optimality property).

### 4.2 Algorithm Explanation

**Core Idea:**
1. Maintain a set of "visited" nodes with finalized shortest distances
2. Maintain a "frontier" of unvisited nodes with tentative distances
3. Always process the unvisited node with the smallest tentative distance
4. Update distances to neighbors via "relaxation"

**Relaxation:**
```
For edge (u, v) with weight w:
if (distance[u] + w < distance[v]):
    distance[v] = distance[u] + w
    previous[v] = u
```

This asks: "Is going through u a shorter path to v?"

### 4.3 Pseudocode

```
function Dijkstra(Graph, source, target):
    // Initialization
    for each vertex v in Graph:
        distance[v] ← ∞
        previous[v] ← null
    distance[source] ← 0
    
    // Priority Queue (Min-Heap)
    Q ← all vertices with their distances
    
    while Q is not empty:
        u ← vertex in Q with minimum distance
        remove u from Q
        
        if u == target:
            break  // Early exit (optional optimization)
        
        for each neighbor v of u:
            alt ← distance[u] + weight(u, v)
            if alt < distance[v]:
                distance[v] ← alt
                previous[v] ← u
                update v's priority in Q
    
    // Reconstruct path
    path ← []
    current ← target
    while current is not null:
        path.prepend(current)
        current ← previous[current]
    
    return { path, cost: distance[target] }
```

### 4.4 Implementation Code

```javascript
function dijkstra(graph, startNode, endNode) {
    const distances = {};
    const visited = new Set();
    const previous = {};
    
    // Step 1: Initialize all distances to infinity
    for (let node in graph.adjacencyList) {
        distances[node] = Infinity;
    }
    distances[startNode] = 0;
    
    // Step 2: Priority Queue (using sorted array as min-heap)
    let pq = [{ node: startNode, priority: 0 }];
    
    while (pq.length > 0) {
        // Step 3: Extract node with minimum distance
        pq.sort((a, b) => a.priority - b.priority);
        const { node: currentNode, priority: currentDist } = pq.shift();
        
        if (visited.has(currentNode)) continue;
        visited.add(currentNode);
        
        // Step 4: Early exit if we reached target
        if (currentNode === endNode) break;
        
        // Step 5: Relax all neighbors
        const neighbors = graph.adjacencyList[currentNode] || [];
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor.node)) {
                let newDist = currentDist + neighbor.weight;
                
                // Relaxation step
                if (newDist < distances[neighbor.node]) {
                    distances[neighbor.node] = newDist;
                    previous[neighbor.node] = currentNode;
                    pq.push({ node: neighbor.node, priority: newDist });
                }
            }
        }
    }
    
    // Step 6: Reconstruct path using 'previous' pointers
    const path = [];
    let current = endNode;
    while (current) {
        path.unshift(current);
        current = previous[current];
    }
    
    // Validate path
    if (path[0] !== startNode) {
        return { path: [], cost: Infinity };  // No path found
    }
    
    return { path, cost: distances[endNode] };
}
```

### 4.5 Step-by-Step Execution Trace

**Example Graph:**
```
    (1)
A ------- B
|         |
|(3)    (1)
|         |
C ------- D
    (1)
```

**Goal:** Find shortest path from A to D

**Execution:**

| Step | Current | Distance A | Distance B | Distance C | Distance D | Previous | Action |
|------|---------|------------|------------|------------|------------|----------|---------|
| 0 | - | 0 | ∞ | ∞ | ∞ | {} | Initialize |
| 1 | A | 0 | **1** | **3** | ∞ | {B→A, C→A} | Visit A, relax B,C |
| 2 | B | 0 | 1 | 3 | **2** | {B→A, C→A, D→B} | Visit B, relax D |
| 3 | D | 0 | 1 | 3 | 2 | - | Target reached! |

**Path Reconstruction:**
- Start at D, previous[D] = B
- At B, previous[B] = A
- At A, previous[A] = null (source)
- **Path: A → B → D, Cost: 2**

### 4.6 Complexity Analysis

**Time Complexity:**

With **Array-based Priority Queue** (our implementation):
- Extract-Min: O(V) → Must scan entire array
- Decrease-Key: O(1) → Just push to array
- Total: **O(V²)**

With **Binary Heap**:
- Extract-Min: O(log V)
- Decrease-Key: O(log V)
- Total: **O((V + E) log V)**

With **Fibonacci Heap** (theoretical best):
- Extract-Min: O(log V) amortized
- Decrease-Key: O(1) amortized
- Total: **O(E + V log V)**

**Space Complexity:** **O(V)**
- distances array: O(V)
- previous array: O(V)
- visited set: O(V)
- Priority queue: O(V) worst case

### 4.7 Correctness Proof (Sketch)

**Invariant:** When a node u is marked as visited, distance[u] is the true shortest distance.

**Proof by Induction:**

**Base Case:** distance[source] = 0 is correct (distance to itself).

**Inductive Step:**
- Assume all visited nodes have correct shortest distances
- Let u be the next node to visit (minimum distance in PQ)
- **Claim:** distance[u] is the shortest path to u

**Proof by Contradiction:**
- Suppose there's a shorter path P to u
- P must leave the visited set at some node x, enter unvisited nodes
- First unvisited node on P is some y
- distance[y] ≤ distance[x] + weight(x,y) < distance[u]
- But u was chosen as minimum → Contradiction!
- Therefore, distance[u] is optimal ∎

### 4.8 Why Non-Negative Weights?

**Counterexample with Negative Weights:**
```
A --(-5)--> B --(2)--> C
|                      ↑
+-------(3)------------+

Initial: distance[C] = 3 (via direct edge)
But actual shortest: A → B → C = -5 + 2 = -3
```

Dijkstra would finalize C at distance 3 (incorrect).

**Solution:** Use **Bellman-Ford** algorithm for negative weights.

---

## 5. System Integration

### 📁 File: [`backend/server.js`](backend/server.js)

### 5.1 Architecture Overview

```
┌─────────────┐         HTTP POST          ┌──────────────┐
│   Frontend  │ ─────────────────────────→ │   Backend    │
│  (Browser)  │         JSON Data          │  (Node.js)   │
│             │ ←───────────────────────── │              │
└─────────────┘      JSON Response         └──────────────┘
                                                   │
                                                   │ Uses
                                                   ▼
                                           ┌──────────────────┐
                                           │  DSA Components  │
                                           ├──────────────────┤
                                           │ PriorityQueue.js │
                                           │ Graph.js         │
                                           │ Dijkstra.js      │
                                           └──────────────────┘
```

### 5.2 API Endpoints

#### **A. POST `/api/add-call`**

**Purpose:** Add new emergency to priority queue

**Request Body:**
```json
{
    "severity": 3,
    "waitingTime": 5,
    "location": { "r": 2, "c": 4 }
}
```

**Processing:**
```javascript
const callId = `E${Math.floor(Math.random() * 1000)}`;
globalPQ.insert(callId, severity, waitingTime, location);
```

**Response:**
```json
{
    "message": "Call Added",
    "queue": [
        { "callId": "E742", "priority": 35, "severity": 3, "waitingTime": 5 },
        { "callId": "E123", "priority": 28, "severity": 2, "waitingTime": 8 }
    ]
}
```

#### **B. POST `/api/dispatch-next`**

**Purpose:** Dispatch highest priority emergency and find shortest path

**Request Body:**
```json
{
    "grid": [
        [".", "T", "."],
        [".", ".", "X"],
        ["S", ".", "."]
    ],
    "width": 3,
    "height": 3,
    "start": { "r": 2, "c": 0 }
}
```

**Processing Steps:**
1. Extract max priority emergency from queue
2. Build weighted graph from grid
3. Run Dijkstra from ambulance position to emergency location
4. Return path and cost

**Response:**
```json
{
    "path": ["2,0", "2,1", "2,2", "1,2", "0,2"],
    "cost": 5,
    "dispatchedCall": {
        "callId": "E742",
        "priority": 35,
        "location": { "r": 0, "c": 2 }
    },
    "remainingQueue": [...]
}
```

### 5.3 Complete Flow Diagram

```
+------------------+
| User clicks      |
| "Add Emergency"  |
+--------+---------+
         │
         ▼
+------------------+
| Frontend sends   |
| POST to          |
| /api/add-call    |
+--------+---------+
         │
         ▼
+------------------+
| Server calculates|
| priority =       |
| (sev×10) + wait  |
+--------+---------+
         │
         ▼
+------------------+
| PriorityQueue    |
| .insert()        |
| → bubbleUp()     |
+--------+---------+
         │
         ▼
+------------------+
| Return updated   |
| queue to         |
| frontend         |
+------------------+

(Later...)

+------------------+
| User clicks      |
| "Dispatch Next"  |
+--------+---------+
         │
         ▼
+------------------+
| POST to          |
| /api/dispatch    |
| with grid data   |
+--------+---------+
         │
         ▼
+------------------+
| PriorityQueue    |
| .extractMax()    |
| → sinkDown()     |
+--------+---------+
         │
         ▼
+------------------+
| Build Graph from |
| grid (nested     |
| loops, addEdge) |
+--------+---------+
         │
         ▼
+------------------+
| dijkstra(graph,  |
| start, end)      |
| → relaxation     |
| → path building  |
+--------+---------+
         │
         ▼
+------------------+
| Return path,     |
| cost, updated    |
| queue            |
+------------------+
```

### 5.4 Global State Management

```javascript
// Persistent Priority Queue across all requests
const globalPQ = new PriorityQueue();
```

**Why Global?**
- Emergency queue persists across multiple API calls
- Multiple emergencies can be added before dispatching
- Reflects real-world dispatch center (ongoing queue of calls)

**Thread Safety:**
- Node.js is single-threaded (event loop)
- No race conditions in this simple implementation
- Production systems would use database backing

---

## 6. Complexity Analysis Summary

| Operation | Data Structure | Time Complexity | Space Complexity |
|-----------|----------------|-----------------|------------------|
| **Insert Emergency** | Priority Queue (Max-Heap) | O(log n) | O(1) |
| **Extract Max** | Priority Queue (Max-Heap) | O(log n) | O(1) |
| **Build Graph** | Adjacency List | O(V + E) | O(V + E) |
| **Add Edge** | Adjacency List | O(1) | O(1) |
| **Dijkstra** | Graph + Array PQ | O(V²) | O(V) |
| **Dijkstra** | Graph + Binary Heap | O((V+E) log V) | O(V) |

**Where:**
- n = number of emergencies in queue
- V = number of grid cells (rows × cols)
- E = number of edges (≤ 4V in our grid)

### Overall System Complexity

**Per Emergency Dispatch:**
1. Extract Max: O(log n)
2. Build Graph: O(V)
3. Dijkstra: O(V²) with our implementation
4. **Total: O(V²)** (dominated by Dijkstra)

**For Grid Size:**
- 10×10 grid: V = 100 → ~10,000 operations
- 20×20 grid: V = 400 → ~160,000 operations
- Scales quadratically (acceptable for small/medium grids)

---

## 7. Execution Examples

### 7.1 Example 1: Single Emergency

**Scenario:**
- Grid: 3×3, all normal roads
- Emergency: High severity (3), 5 min wait → Priority 35
- Ambulance at (0,0), Emergency at (2,2)

**Step-by-Step:**

**1. Add Emergency:**
```
Priority = (3 × 10) + 5 = 35
Heap: [35]
```

**2. Dispatch:**

**Graph Construction:**
```
"0,0": [{"0,1",1}, {"1,0",1}]
"0,1": [{"0,0",1}, {"0,2",1}, {"1,1",1}]
...
(Total: 9 nodes, ~24 edges)
```

**Dijkstra Execution:**
```
Step 1: Visit 0,0 (dist=0)
  Update: 0,1=1, 1,0=1

Step 2: Visit 0,1 (dist=1)
  Update: 0,2=2, 1,1=2

Step 3: Visit 1,0 (dist=1)
  Update: 2,0=2, 1,1=2 (no change)

Step 4: Visit 0,2 (dist=2)
  Update: 1,2=3

Step 5: Visit 1,1 (dist=2)
  Update: 2,1=3

Step 6: Visit 2,0 (dist=2)
  Update: 2,1=3 (no change)

Step 7: Visit 1,2 (dist=3)
  Update: 2,2=4

Step 8: Visit 2,1 (dist=3)
  Update: 2,2=4 (no change)

Step 9: Visit 2,2 (dist=4) → TARGET!
```

**Result:**
```
Path: 0,0 → 0,1 → 1,1 → 2,1 → 2,2
Cost: 4
```

### 7.2 Example 2: Multiple Emergencies with Priority

**Scenario:**
- Emergency A: Severity 1 (Low), Wait 10 min → Priority 20
- Emergency B: Severity 3 (High), Wait 5 min → Priority 35
- Emergency C: Severity 2 (Medium), Wait 15 min → Priority 35

**Priority Queue After All Insertions:**
```
Heap: [35, 35, 20]
       B/C  C/B  A
```

*Note: Order of 35s depends on insertion order (both have same priority)*

**Dispatch Order:**
1. Extract → Priority 35 (Emergency B or C)
2. Extract → Priority 35 (Emergency C or B)
3. Extract → Priority 20 (Emergency A)

### 7.3 Example 3: Path with Traffic

**Grid:**
```
S . . D
. T T .
. . . .
```

**Without Traffic (Direct):**
```
Path: 0,0 → 0,1 → 0,2 → 0,3
Cost: 3
```

**With Traffic (Optimal):**
```
Dijkstra considers:
- Path 1: 0,0 → 0,1 → 0,2 → 0,3 = 1 + 1 + 1 = 3
- Path 2: 0,0 → 1,0 → 1,1 (traffic=3) → ... = Higher
- Path 3: 0,0 → 1,0 → 2,0 → 2,1 → 2,2 → 2,3 → 1,3 → 0,3 = 7

Optimal: Path 1 (Cost = 3)
```

Even though row 1 has traffic, we don't need to use it.

---

## 8. Key Takeaways for Presentation

### What to Emphasize:

1. **Priority Queue (Max-Heap)**
   - "We use a heap to guarantee O(log n) insertion and extraction"
   - "The priority formula weights severity 10× more than waiting time"
   - "Heap property ensures highest priority is always at root"

2. **Graph (Adjacency List)**
   - "We convert the 2D grid into a graph to enable pathfinding"
   - "Adjacency list is space-efficient: O(V + E) vs O(V²)"
   - "Edge weights model real-world travel times (traffic = 3× slower)"

3. **Dijkstra's Algorithm**
   - "Greedy algorithm that always explores closest unvisited node"
   - "Relaxation checks: 'Is this path shorter than what I know?'"
   - "Guarantees optimal path with non-negative weights"

4. **System Integration**
   - "REST API connects frontend visualization to DSA backend"
   - "All algorithm logic runs server-side with detailed logging"
   - "Demonstrates real-world application of theoretical concepts"

### Expected Questions & Answers:

**Q: Why Max-Heap instead of sorting the array each time?**
**A:** Sorting is O(n log n) every time we add an emergency. Heap insertion is O(log n), and extraction is O(log n). Much more efficient for dynamic data.

**Q: What if two emergencies have the same priority?**
**A:** The heap doesn't guarantee ordering among equal priorities. We could add a timestamp as a tie-breaker: `priority = (severity × 10) + waitingTime + (timestamp × 0.001)`.

**Q: Why not use A* instead of Dijkstra?**
**A:** A* is an optimization of Dijkstra that uses a heuristic (e.g., straight-line distance). For small grids, Dijkstra is simpler and sufficient. A* would be better for very large maps.

**Q: What's the maximum grid size before performance degrades?**
**A:** With O(V²) Dijkstra, grids up to 100×100 (10,000 cells) are fast (<1 second). For larger grids, we'd optimize with a binary heap PQ to get O((V+E) log V).

---

## 9. Further Enhancements (Future Work)

1. **A* Algorithm**: Add heuristic-based pathfinding for better performance
2. **Binary Heap PQ**: Improve Dijkstra to O((V+E) log V)
3. **Multiple Ambulances**: Handle fleet management with resource allocation
4. **Dynamic Weights**: Update traffic in real-time based on time of day
5. **Database Integration**: Persist emergency queue across server restarts
6. **Bidirectional Dijkstra**: Search from both start and end simultaneously
7. **Visualization**: Animate heap operations and Dijkstra exploration

---

## Conclusion

This project demonstrates the practical application of core DSA concepts:
- **Priority Queues** solve real-time task scheduling
- **Graphs** model spatial and network relationships
- **Dijkstra's Algorithm** optimizes resource routing

The implementation showcases algorithm efficiency, correctness proofs, and system integration—skills essential for software engineering and competitive programming.

**Total Lines of DSA Code:** ~200 lines
**Total System LoC:** ~500+ lines (including frontend)
**Concepts Demonstrated:** Heaps, Graphs, Greedy Algorithms, API Design, Full-Stack Integration

---

*For questions or live demonstration, please run the application and observe the terminal logs showing algorithm execution in real-time.*
