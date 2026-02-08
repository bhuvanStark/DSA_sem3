let grid = [];
let gridSize = 5;
let emergencyCalls = {}; // Map local coords "r,c" to CallID (e.g. "E1") for display

// Initialize on load
window.onload = initGrid;

function initGrid() {
    const sizeInput = document.getElementById('gridSize');
    gridSize = parseInt(sizeInput.value);

    if (gridSize < 3) gridSize = 3;
    if (gridSize > 10) gridSize = 10;
    sizeInput.value = gridSize;

    // Reset grid data
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill('.'));
    emergencyCalls = {};

    // Default Hospital at 0,0
    grid[0][0] = 'S';

    renderGrid();
    document.getElementById('status').innerText = 'Ready to accept calls...';
    document.getElementById('queue-list').innerHTML = '<div class="queue-empty">No Active Calls</div>';
    document.getElementById('output').innerText = '';
}

function renderGrid() {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';

    for (let r = 0; r < gridSize; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        for (let c = 0; c < gridSize; c++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.dataset.r = r;
            cellDiv.dataset.c = c;

            const cellVal = grid[r][c];
            cellDiv.dataset.type = cellVal;

            // Check if it's an emergency location
            const locKey = `${r},${c}`;
            if (emergencyCalls[locKey]) {
                cellDiv.classList.add('emergency');
                cellDiv.innerText = emergencyCalls[locKey]; // Display ID like E105
            } else {
                cellDiv.innerText = cellVal === '.' ? '' : cellVal;
            }

            cellDiv.onclick = () => handleCellClick(r, c);
            rowDiv.appendChild(cellDiv);
        }
        container.appendChild(rowDiv);
    }
}

function handleCellClick(r, c) {
    const mode = document.getElementById('modeSelect').value;

    if (mode === 'CALL') {
        addEmergencyCall(r, c);
        return;
    }

    if (mode === 'S') {
        clearTypeFromGrid('S'); // Ensure only one hospital
    }

    // Update Grid Logic
    // If overwriting an emergency, remove it from local map (visual only)
    const locKey = `${r},${c}`;
    if (emergencyCalls[locKey]) delete emergencyCalls[locKey];

    grid[r][c] = mode;
    renderGrid();
}

function clearTypeFromGrid(type) {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === type) grid[r][c] = '.';
        }
    }
}

async function addEmergencyCall(r, c) {
    const severity = document.getElementById('severity').value;
    const waitingTime = document.getElementById('waitingTime').value;

    try {
        const response = await fetch('/api/add-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                location: { r, c },
                severity,
                waitingTime
            })
        });
        const data = await response.json();

        // Show success
        document.getElementById('status').innerText = `Logged Call at (${r},${c})`;

        // Update local map for visualization (just grab the last added ID logic is weak but sufficient for demo)
        // Better: Backend returns the ID of the new call
        // For now, let's just mark it as "E" + Priority or something?
        // Actually, let's wait for queue update.

        // We need to know WHICH ID was just added to put it on the grid.
        // Let's assume the backend added it. The response has the full queue.
        // We can find the one that matches our coordinates?
        // Or just mark it generically first.
        const locKey = `${r},${c}`;
        // Find the call in the queue that matches this location
        const newCall = data.queue.find(c => c.location.r === r && c.location.c === c);
        if (newCall) {
            emergencyCalls[locKey] = newCall.callId;
        }

        renderQueue(data.queue);
        renderGrid();

    } catch (e) {
        console.error(e);
    }
}

async function processNextCall() {
    const statusDiv = document.getElementById('status');
    statusDiv.innerText = 'Processing next priority...';

    const start = findPos('S');
    if (!start) {
        statusDiv.innerText = 'Error: No Hospital (S) set!';
        return;
    }

    try {
        const response = await fetch('/api/dispatch-next', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grid,
                width: gridSize,
                height: gridSize,
                start
            })
        });

        const data = await response.json();

        if (data.completed) {
            statusDiv.innerText = 'All calls processed!';
            document.getElementById('queue-list').innerHTML = '<div class="queue-empty">No Pending Calls</div>';
            return;
        }

        if (data.path) {
            highlightPath(data.path);
            statusDiv.innerHTML = `Dispatched <strong>${data.dispatchedCall.callId}</strong>. Cost: ${data.cost}`;

            // Remove from local visualization map
            const loc = data.dispatchedCall.location;
            const locKey = `${loc.r},${loc.c}`;
            if (emergencyCalls[locKey]) delete emergencyCalls[locKey];

            renderQueue(data.remainingQueue);

            // Re-render grid to show path and removed E marker
            // Note: highlightPath calls renderGrid inside it, so we need to be careful.
            // highlightPath in previous version called renderGrid. Let's fix that.
        } else {
            statusDiv.innerText = 'Unreachable!';
        }

    } catch (e) {
        console.error(e);
        statusDiv.innerText = 'Error connecting to backend.';
    }
}

function renderQueue(queue) {
    const list = document.getElementById('queue-list');
    list.innerHTML = '';

    if (queue.length === 0) {
        list.innerHTML = '<div class="queue-empty">No Active Calls</div>';
        return;
    }

    queue.forEach(call => {
        const div = document.createElement('div');
        // Simple priority classing
        let pClass = 'low-priority';
        if (call.priority > 80) pClass = 'high-priority';
        else if (call.priority > 50) pClass = 'med-priority';

        div.className = `queue-item ${pClass}`;
        div.innerHTML = `
            <div class="q-header">
                <span>${call.callId}</span>
                <span>Pri: ${call.priority}</span>
            </div>
            <div class="q-details">
                Sev: ${call.severity} | Wait: ${call.waitingTime}m <br>
                Loc: (${call.location.r}, ${call.location.c})
            </div>
        `;
        list.appendChild(div);
    });
}

function highlightPath(pathArray) {
    renderGrid(); // Redraw base state (clears old paths)

    // pathArray is ["row,col", "3,4", ...]
    pathArray.forEach(nodeId => {
        const [r, c] = nodeId.split(',').map(Number);
        const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (cell) cell.classList.add('path');
    });
}

function findPos(type) {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === type) return { r, c };
        }
    }
    return null; // Should not happen if S is enforced
}
