# 🚑 Emergency Response Simulation System

A hybrid emergency response simulation system that demonstrates the practical application of **Data Structures and Algorithms (DSA)** to solve real-world problems. This project efficiently manages emergency calls and dispatches ambulances using advanced pathfinding algorithms.

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [DSA Concepts Implemented](#dsa-concepts-implemented)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Technical Details](#technical-details)
- [Screenshots](#screenshots)

---

## 🎯 Overview

This system simulates an emergency response dispatcher that:
1. **Prioritizes** incoming emergency calls based on severity and waiting time
2. **Finds** the optimal (shortest/fastest) path for ambulance dispatch
3. **Accounts** for real-world factors like traffic congestion and obstacles

The project uses a **Node.js backend** for DSA logic and a **vanilla JavaScript frontend** for visualization and user interaction.

---

## ✨ Key Features

- **Real-time Emergency Prioritization**: Uses a Max-Heap Priority Queue to ensure critical cases are handled first
- **Intelligent Pathfinding**: Dijkstra's Algorithm calculates the optimal route considering traffic
- **Interactive Grid**: Visual representation of city blocks with ambulances, emergencies, and obstacles
- **Detailed Logging**: Backend terminal displays step-by-step DSA operations for educational purposes
- **Responsive UI**: Clean, modern interface built with HTML5, CSS3, and vanilla JavaScript

---

## 🧠 DSA Concepts Implemented

### 1. **Priority Queue (Max-Heap)**
**File**: [`backend/dsa/PriorityQueue.js`](backend/dsa/PriorityQueue.js)

- **Purpose**: Manages emergency calls and ensures the most critical cases are dispatched first
- **Priority Formula**: `(severity × 10) + waitingTime`
- **Key Operations**:
  - `insert()`: O(log n) - Adds new emergency with bubble-up
  - `extractMax()`: O(log n) - Removes highest priority emergency with sink-down

### 2. **Graph (Adjacency List)**
**File**: [`backend/dsa/Graph.js`](backend/dsa/Graph.js)

- **Purpose**: Represents the city grid as a weighted graph
- **Structure**: Each grid cell is a node; edges represent traversable paths
- **Weights**:
  - Normal road: 1
  - Traffic zone: 3
  - Obstacle: No edge (impassable)

### 3. **Dijkstra's Algorithm**
**File**: [`backend/dsa/Dijkstra.js`](backend/dsa/Dijkstra.js)

- **Purpose**: Finds the shortest path from ambulance to emergency
- **Complexity**: O((V + E) log V) where V = vertices, E = edges
- **Features**:
  - Distance initialization
  - Edge relaxation
  - Path reconstruction
  - Considers weighted edges (traffic impact)

---

## 📁 Project Structure

```
DSA_EL/
├── backend/
│   ├── dsa/
│   │   ├── PriorityQueue.js    # Max-Heap implementation
│   │   ├── Graph.js            # Graph with adjacency list
│   │   └── Dijkstra.js         # Shortest path algorithm
│   └── server.js               # Express server & API endpoints
├── frontend/
│   ├── index.html              # Main UI structure
│   ├── script.js               # Frontend logic & API calls
│   └── style.css               # Styling & animations
├── package.json                # Dependencies
├── Walkthrough_For_Teacher.md  # Detailed educational guide
└── README.md                   # This file
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bhuvanStark/DSA_sem3.git
   cd DSA_sem3
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open the frontend**:
   - Navigate to `frontend/index.html` in your browser
   - Or use a local server:
     ```bash
     # If you have Python installed
     cd frontend
     python3 -m http.server 8000
     ```
   - Open `http://localhost:8000` in your browser

---

## 💻 Usage

### Adding an Emergency

1. Select an **emergency location** on the grid (click a cell)
2. Choose **severity** (Low/Medium/High)
3. Set **waiting time** (in minutes)
4. Click **"Add Emergency"**

The emergency will be added to the priority queue and visualized on the grid.

### Dispatching an Ambulance

1. Click **"Dispatch Next Emergency"**
2. The system will:
   - Extract the highest priority emergency
   - Build a graph from the current grid state
   - Calculate the optimal path using Dijkstra's Algorithm
   - Display the path on the grid (highlighted in blue)
   - Show the total travel cost

### Grid Customization

- **Traffic**: Click cells and set type to "Traffic" (yellow, weight = 3)
- **Obstacles**: Set type to "Obstacle" (black, impassable)
- **Ambulance**: Set the ambulance starting position (green)

---

## 🔧 Technical Details

### API Endpoints

**Backend Server** runs on `http://localhost:3000`

#### `POST /add-emergency`
Adds an emergency to the priority queue.

**Request Body**:
```json
{
  "callId": "unique-id",
  "severity": 3,
  "waitingTime": 5,
  "location": { "row": 2, "col": 4 }
}
```

**Response**:
```json
{
  "message": "Emergency added successfully",
  "priority": 35
}
```

#### `POST /dispatch`
Finds the shortest path and dispatches the highest priority emergency.

**Request Body**:
```json
{
  "grid": [[...], [...], ...],
  "ambulancePos": { "row": 0, "col": 0 }
}
```

**Response**:
```json
{
  "emergency": { "callId": "...", "location": {...} },
  "path": ["0,0", "0,1", "1,1", "2,1"],
  "cost": 4
}
```

### How It All Works Together

1. **Frontend** sends emergency data to `/add-emergency`
2. **Backend** inserts into Priority Queue with calculated priority
3. **Priority Queue** maintains Max-Heap property (highest priority at top)
4. When user clicks "Dispatch":
   - Backend extracts max priority emergency
   - Builds weighted Graph from grid data
   - Runs Dijkstra's Algorithm to find shortest path
   - Returns path to frontend
5. **Frontend** visualizes the path on the grid

### Terminal Logging

The backend provides detailed educational logs:
- ✅ Priority Queue operations (insert, bubble-up, extract, sink-down)
- 🗺️ Graph construction (nodes and edges)
- 🔍 Dijkstra's step-by-step execution (distance updates, path reconstruction)

---

## 📸 Screenshots

> **Note**: The application features a modern, clean UI with:
> - Interactive grid with color-coded cells
> - Real-time emergency management panel
> - Path visualization with cost display
> - Responsive design for all screen sizes

---

## 📚 Educational Value

This project demonstrates:
- **Priority Queue**: Real-world application in task scheduling
- **Graph Theory**: Modeling spatial relationships and connections
- **Dijkstra's Algorithm**: Practical shortest-path problem-solving
- **Full-Stack Integration**: Connecting DSA logic with user interfaces
- **API Design**: RESTful patterns for client-server communication

For a detailed explanation of each DSA concept and function, see [`Walkthrough_For_Teacher.md`](Walkthrough_For_Teacher.md).

---

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Communication**: REST API with CORS
- **Data Structures**: Custom implementations (no external DSA libraries)

---

## 👨‍💻 Author

**Bhuvan**  
DSA Mini Project - Semester 3

---

## 📝 License

This project is open source and available for educational purposes.

---

## 🎓 Academic Context

This project was developed as part of the Data Structures and Algorithms course to demonstrate:
- Understanding of fundamental DSA concepts
- Ability to apply theoretical knowledge to practical problems
- Full-stack development skills
- Problem-solving and algorithmic thinking

For questions or demonstrations, please refer to the walkthrough document or contact the author.
