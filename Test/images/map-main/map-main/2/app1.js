const graph = {
    'Entrance': ['Hallway1','Hallway2','Hallway3'],
    'Exit': ['Entrance'], 
    'Hallway1': ['Entrance','Clinic','Admission'],
    'Hallway2': ['Computer lab'],
    'Hallway3': ['Hallway4'],
    'Hallway4': ['Cr1','Cr2','Maintenance','Hallway3'],
    'Clinic': ['Hallway1'],
    'Admission': ['Hallway1'],
    'Computer lab': ['Hallway2'],
    'Cr1': ['Hallway4'],
    'Cr2': ['Hallway4'],
    'Maintenance': ['Hallway4'],
};

const nodes = Object.keys(graph);  // Array of node names from graph

const connectionPoints = {
    Entrance: { x: 1590, y: 5160 },
    Exit: { x: 4665, y: 5160 },
    Hallway1: { x: 1590, y: 4690 },
    Hallway2: { x: 1590, y: 4250 },
    Hallway3: { x: 1590, y: 3890 },
    Hallway4: { x: 1080, y: 3890 },
    Hallway5: { x: 1590, y: 3330 },
    // Hallway5: { x: 1590, y: 2880 },
    B2up: { x: 5690, y: 2480 },
    B2down: { x: 3450, y: 2480 },
    B4up: { x: 2810, y: 2480 },
    B4down: { x: 570, y: 2480 },
    Clinic: { x: 1190, y: 4690 },
    Maintenance: { x: 700, y: 3890 },
    Cr1: { x: 1200, y: 4220 },
    Cr2: { x: 950, y: 4220 },
    Drugtest: { x: 1190, y: 3330 },
    Admission: { x: 1990, y: 4690},
    'Computer lab': { x: 1990, y: 4250 },
    'School lounge': { x: 1990, y: 3270 },
    'Career development': { x: 4270, y: 4790},
    'Student affair': { x: 4270, y: 4565 },
    'Accounting office': { x: 5070, y: 3320 },
    'Criminology lab1': { x: 4510, y: 2210 },
    'Criminology lab2': { x: 3530, y: 1625 },
    'Engineering lab': { x: 4830, y: 2210 },
    'Healthcare skills lab': { x: 5810, y: 1625 },
    Library: { x: 5810, y: 1060 },
    Fireexit1: { x: 160, y: 100 },
    Fireexit2: { x: 3240, y: 100 },
    Fireexit3: { x: 6100, y: 100 },
};

function findShortestPath(start, end) {
    if (start === end) return [start];
    if (!nodes.includes(start) || !nodes.includes(end)) return null;
    const queue = [[start, [start]]];
    const visited = new Set([start]);
    while (queue.length > 0) {
        const [current, path] = queue.shift();
        for (const neighbor of graph[current] || []) {
            if (neighbor === end) {
                return [...path, neighbor];
            }
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, [...path, neighbor]]);
            }
        }
    }
    return null;
}

function getConnectionPoint(roomId) {
    return connectionPoints[roomId] || getRoomCenter(roomId);
}

function getRoomCenter(roomId) {
    const rect = document.getElementById(roomId);
    if (!rect) return null;
    const bbox = rect.getBBox();
    return { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
}

function drawPathLines(path) {
    let pathLinesGroup = document.getElementById('pathLines');
    if (pathLinesGroup) pathLinesGroup.innerHTML = '';
    else {
        const svg = document.getElementById('1stfloor');  // Updated from 'svg' to '1stfloor'
        if (svg) {
            pathLinesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            pathLinesGroup.setAttribute('id', 'pathLines');
            svg.appendChild(pathLinesGroup);
        }
    }
    if (!path || path.length < 2) return;
    const points = path.map(roomId => {
        const point = getConnectionPoint(roomId);
        return point ? `${point.x},${point.y}` : '';
    }).filter(p => p).join(' ');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.setAttribute('stroke', '#0ea5a4');
    polyline.setAttribute('stroke-width', '4');
    polyline.setAttribute('stroke-dasharray', '6 6');
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('opacity', '0.8');
    polyline.classList.add('path-line');
    if (pathLinesGroup) pathLinesGroup.appendChild(polyline);
    // Arrow at end
    const endPoint = getConnectionPoint(path[path.length - 1]);
    if (endPoint && path.length > 1 && pathLinesGroup) {
        const lastButOne = getConnectionPoint(path[path.length - 2]);
        if (lastButOne) {
            const arrowSize = 10;
            const dx = endPoint.x - lastButOne.x;
            const dy = endPoint.y - lastButOne.y;
            const angle = Math.atan2(dy, dx);
            const pointsArrow = [
                endPoint.x, endPoint.y,
                endPoint.x - arrowSize * Math.cos(angle - Math.PI / 6), endPoint.y - arrowSize * Math.sin(angle - Math.PI / 6),
                endPoint.x - arrowSize * Math.cos(angle + Math.PI / 6), endPoint.y - arrowSize * Math.sin(angle + Math.PI / 6)
            ].join(' ');
            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            arrow.setAttribute('points', pointsArrow);
            arrow.setAttribute('fill', '#0ea5a4');
            arrow.setAttribute('opacity', '0.8');
            pathLinesGroup.appendChild(arrow);
        }
    }
}

function highlightPath(path) {
    document.querySelectorAll('rect[id], path[id]').forEach(element => {
        element.classList.remove('start', 'end', 'highlight');
    });
    drawPathLines([]);
    if (path && path.length > 0) {
        path.forEach((room, index) => {
            const element = document.getElementById(room);
            if (element) {
                if (index === 0) element.classList.add('start');
                else if (index === path.length - 1) element.classList.add('end');
                else element.classList.add('highlight');
            }
        });
        drawPathLines(path);
        document.getElementById('pathInfo').textContent = `Shortest path: ${path.join(' → ')}`;
    } else {
        document.getElementById('pathInfo').textContent = 'No path found.';
    }
}

let selectionMode = 'start';
let selectedStart = null;
let selectedEnd = null;
let scale = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let startTranslateX = 0;
let startTranslateY = 0;
let translateX = 0;
let translateY = 0;

document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('1stfloor');  // Updated from 'svg' to '1stfloor'
    if (!svg) {
        console.error('SVG element with ID "1stfloor" not found.');  // Updated error message
        return;
    }

    const rooms = document.querySelectorAll('rect[id], path[id]');
    rooms.forEach(room => {
        if (nodes.includes(room.id)) {
            room.style.cursor = 'pointer';
            room.addEventListener('click', (e) => {
                const roomId = e.target.id;
                if (selectionMode === 'start') {
                    selectedStart = roomId;
                    selectionMode = 'end';
                    document.querySelector('.info').textContent = `Start: ${roomId}. Now click to choose End.`;
                    highlightPath([roomId]);
                } else if (selectionMode === 'end') {
                    selectedEnd = roomId;
                    selectionMode = 'start';
                    document.querySelector('.info').textContent = 'Click to choose Start, then End.';
                    const path = findShortestPath(selectedStart, selectedEnd);
                    highlightPath(path);
                }
            });
        }
    });

    document.getElementById('reset').addEventListener('click', () => {
        selectedStart = null;
        selectedEnd = null;
        selectionMode = 'start';
        document.querySelector('.info').textContent = 'Click to choose Start, then End.';
        highlightPath([]);
        document.getElementById('fromInput').value = '';
        document.getElementById('toInput').value = '';
        document.getElementById('pathInfo').textContent = '';
        scale = 1;
        translateX = 0;
        translateY = 0;
        svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        svg.style.transformOrigin = 'center';
    });

    document.getElementById('searchBtn').addEventListener('click', () => {
        const from = document.getElementById('fromInput').value.trim();
        const to = document.getElementById('toInput').value.trim();
        if (!from || !to) {
            alert('Please enter both From and To rooms.');
            return;
        }
        const path = findShortestPath(from, to);
        highlightPath(path);
        selectedStart = from;
        selectedEnd = to;
    });

    document.getElementById('toInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('searchBtn').click();
    });

    document.getElementById('zoomIn').addEventListener('click', () => {
        scale += 0.1;
        svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        svg.style.transformOrigin = 'center';
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        if (scale > 0.1) {
            scale -= 0.1;
            svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            svg.style.transformOrigin = 'center';
        }
    });

    svg.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startTranslateX = translateX;
        startTranslateY = translateY;
        e.preventDefault();
    });

    svg.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            translateX = startTranslateX + dx;
            translateY = startTranslateY + dy;
            svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            svg.style.transformOrigin = '0 0';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
});
