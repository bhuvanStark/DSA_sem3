const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const PriorityQueue = require('./dsa/PriorityQueue');
const Graph = require('./dsa/Graph');
const dijkstra = require('./dsa/Dijkstra');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// GLOBAL STATE
const globalPQ = new PriorityQueue();

// 1. ADD CALL
app.post('/api/add-call', (req, res) => {
    const { severity, waitingTime, location } = req.body;

    // Generate a simple ID
    const callId = `E${Math.floor(Math.random() * 1000)}`;

    console.log("--------------------------------------------------");
    console.log(`LOGGING NEW CALL: ${callId} at (${location.r}, ${location.c}) | Sev: ${severity} | Wait: ${waitingTime}`);

    globalPQ.insert(callId, parseInt(severity), parseInt(waitingTime), location);
    globalPQ.printHeap(); // Show updated heap in terminal

    res.json({
        message: "Call Added",
        queue: globalPQ.heap.sort((a, b) => b.priority - a.priority) // Return sorted list for display
    });
});

// 2. DISPATCH NEXT
app.post('/api/dispatch-next', (req, res) => {
    const { grid, width, height, start } = req.body;

    console.log("--------------------------------------------------");
    console.log("PROCESSING NEXT DISPATCH...");

    const emergencyCall = globalPQ.extractMax();

    if (!emergencyCall) {
        console.log("QUEUE EMPTY! No calls to process.");
        return res.json({ message: "No calls in queue", completed: true });
    }

    console.log(`DISPATCHING TO: ${emergencyCall.callId} | Priority: ${emergencyCall.priority}`);

    // Build Graph
    const graph = new Graph();
    const rows = height;
    const cols = width;
    const getNodeId = (r, c) => `${r},${c}`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellType = grid[r][c];
            if (cellType === 'X') continue;

            const nodeId = getNodeId(r, c);

            const neighbors = [
                { dr: -1, dc: 0 },
                { dr: 1, dc: 0 },
                { dr: 0, dc: -1 },
                { dr: 0, dc: 1 }
            ];

            neighbors.forEach(({ dr, dc }) => {
                const nr = r + dr;
                const nc = c + dc;

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    const neighborType = grid[nr][nc];
                    if (neighborType !== 'X') {
                        const weight = getCellCost(neighborType);
                        const neighborId = getNodeId(nr, nc);
                        graph.addEdge(nodeId, neighborId, weight);
                    }
                }
            });
        }
    }

    // Run Dijkstra
    const startNode = getNodeId(start.r, start.c);
    const endNode = getNodeId(emergencyCall.location.r, emergencyCall.location.c);

    const result = dijkstra(graph, startNode, endNode);

    if (result.path.length > 0) {
        console.log("SHORTEST PATH FOUND");
        console.log(`Path: ${result.path.join(" -> ")}`);
        console.log(`Total Cost: ${result.cost}`);
    } else {
        console.log("NO PATH FOUND");
    }

    res.json({
        path: result.path,
        cost: result.cost,
        dispatchedCall: emergencyCall,
        remainingQueue: globalPQ.heap.sort((a, b) => b.priority - a.priority)
    });
});

function getCellCost(type) {
    switch (type) {
        case 'S': return 1;
        case '.': return 1;
        case 'T': return 3;
        case 'D': return 1;
        case 'X': return Infinity;
        default: return 1; // Treat E1, E2 markers as roads
    }
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
