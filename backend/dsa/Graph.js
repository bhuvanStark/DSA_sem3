class Graph {
    constructor() {
        this.adjacencyList = {};
    }

    addNode(node) {
        if (!this.adjacencyList[node]) {
            this.adjacencyList[node] = [];
        }
    }

    addEdge(node1, node2, weight) {
        if (!this.adjacencyList[node1]) this.addNode(node1);
        this.adjacencyList[node1].push({ node: node2, weight });
    }

    printGraph() {
        console.log("\nGRAPH (Adjacency List)\n");
        for (let node in this.adjacencyList) {
            console.log(`Node ${node}:`);
            this.adjacencyList[node].forEach(neighbor => {
                console.log(` -> ${neighbor.node} cost=${neighbor.weight}`);
            });
            console.log("");
        }
    }
}

module.exports = Graph;
