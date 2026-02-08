function dijkstra(graph, startNode, endNode) {
    console.log("\nDIJKSTRA EXECUTION\n");

    const distances = {};
    const visited = new Set();
    const previous = {};
    const nodes = new Set();

    // Initialize distances
    for (let node in graph.adjacencyList) {
        distances[node] = Infinity;
        nodes.add(node);
    }
    // Handle case where startNode might not have outgoing edges but exists in grid
    // In a grid, it should exist if we passed it correctly, but let's be safe
    if (!distances[startNode]) distances[startNode] = Infinity;

    distances[startNode] = 0;

  
    let stepCount = 1;

    // Priority Queue: [ { node, priority } ]
    let pq = [{ node: startNode, priority: 0 }];

    while (pq.length > 0) {
        // Sort by priority (asc) to simulate MinHeap extraction
        pq.sort((a, b) => a.priority - b.priority);
        const { node: currentNode, priority: currentDist } = pq.shift();

        if (visited.has(currentNode)) continue;

        console.log(`Step ${stepCount}:`);
        console.log(`Visited: ${currentNode}`);
        visited.add(currentNode);

        if (currentNode === endNode) {
            console.log("Target reached!");
            break;
        }

        const neighbors = graph.adjacencyList[currentNode] || [];
        let updates = [];

        for (let neighbor of neighbors) {
            if (!visited.has(neighbor.node)) {
                let newDist = currentDist + neighbor.weight;
                if (newDist < distances[neighbor.node]) {
                    distances[neighbor.node] = newDist;
                    previous[neighbor.node] = currentNode;
                    pq.push({ node: neighbor.node, priority: newDist });
                    updates.push(`${neighbor.node}=${newDist}`);
                }
            }
        }

        if (updates.length > 0) {
            console.log("Distances updated:");
            console.log(updates.join("  "));
        } else {
            console.log("No distances updated.");
        }
        console.log(""); // newline
        stepCount++;
    }

    // Reconstruct path
    const path = [];
    let current = endNode;
    while (current) {
        path.unshift(current);
        current = previous[current];
    }

    // Check if path is valid
    if (path[0] !== startNode) {
        return { path: [], cost: Infinity };
    }

    return { path, cost: distances[endNode] };
}

module.exports = dijkstra;
