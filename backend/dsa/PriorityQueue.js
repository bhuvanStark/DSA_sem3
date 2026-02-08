class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    insert(callId, severity, waitingTime, location) {
        const priority = (severity * 10) + waitingTime;
        const emergencyCall = { callId, severity, waitingTime, location, priority };
        this.heap.push(emergencyCall);
        this.bubbleUp();
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority >= this.heap[index].priority) break;
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    extractMax() {
        if (this.heap.length === 0) return null;
        const max = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown();
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
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIdx < length) {
                leftChild = this.heap[leftChildIdx];
                if (leftChild.priority > element.priority) {
                    swap = leftChildIdx;
                }
            }

            if (rightChildIdx < length) {
                rightChild = this.heap[rightChildIdx];
                if (
                    (swap === null && rightChild.priority > element.priority) ||
                    (swap !== null && rightChild.priority > leftChild.priority)
                ) {
                    swap = rightChildIdx;
                }
            }

            if (swap === null) break;
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }

    printHeap() {
        console.log("\nEMERGENCY CALL HEAP (MAX HEAP)\n");
        console.log("Index | CallID | Severity | Priority");
        console.log("-------------------------------------");
        this.heap.forEach((call, index) => {
            console.log(`${String(index).padEnd(5)} | ${String(call.callId).padEnd(6)} | ${String(call.severity).padEnd(8)} | ${call.priority}`);
        });
        console.log("\n");
    }
}

module.exports = PriorityQueue;
