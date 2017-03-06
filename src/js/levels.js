(function () {
    window.tanks.registerLevel('1', {
        gridSize: {
            x: 40,
            y: 20
        },
        startPoints: [
            {x: 7, y: 5},
            {x: 7, y: 15},
            {x: 14, y: 5},
            {x: 16, y: 15},
            {x: 20, y: 17},
            {x: 23, y: 13},
            {x: 32, y: 5},
            {x: 32, y: 15}
        ],
        blocks: [
            {x: 9, y: 5, h: 4, w: 2},
            {x: 9, y: 11, h: 4, w: 2},
            {x: 29, y: 5, h: 4, w: 2},
            {x: 29, y: 11, h: 4, w: 2}
        ]
    });

    window.tanks.registerLevel('2', {
        gridSize: {
            x: 40,
            y: 20
        },
        startPoints: [
            {x: 7, y: 5},
            {x: 7, y: 15},
            {x: 14, y: 5},
            {x: 16, y: 16},
            {x: 20, y: 16},
            {x: 24, y: 16},
            {x: 32, y: 5},
            {x: 32, y: 15}
        ],
        blocks: [
            {x: 2, y: 3, h: 1, w: 4},
            {x: 10, y: 3, h: 1, w: 4},
            {x: 18, y: 3, h: 1, w: 4},
            {x: 26, y: 3, h: 1, w: 4},
            {x: 34, y: 3, h: 1, w: 4},
            {x: 6, y: 7, h: 1, w: 4},
            {x: 14, y: 7, h: 1, w: 4},
            {x: 22, y: 7, h: 1, w: 4},
            {x: 30, y: 7, h: 1, w: 4},
            {x: 6, y: 11, h: 1, w: 4},
            {x: 14, y: 11, h: 1, w: 4},
            {x: 22, y: 11, h: 1, w: 4},
            {x: 30, y: 11, h: 1, w: 4},
            {x: 2, y: 15, h: 1, w: 4},
            {x: 10, y: 15, h: 1, w: 4},
            {x: 18, y: 15, h: 1, w: 4},
            {x: 26, y: 15, h: 1, w: 4},
            {x: 34, y: 15, h: 1, w: 4}
        ]
    });

    window.tanks.registerLevel('3', {
        gridSize: {
            x: 40,
            y: 20
        },
        startPoints: [
            {x: 7, y: 10},
            {x: 32, y: 10}
        ],
        blocks: [
            {x: 20, y: 3, h: 14, w: 2},
            {x: 15, y: 0, h: 6, w: 2},
            {x: 25, y: 0, h: 6, w: 2},
            {x: 15, y: 14, h: 6, w: 2},
            {x: 25, y: 14, h: 6, w: 2}
        ]
    });
})();
