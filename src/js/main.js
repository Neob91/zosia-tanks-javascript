(function () {
    var BLOCK_SIZE = 20;

    var registeredControllers = {},
        gameState = null,
        publicGameState = null,
        idCount = 1;

    var deepCopy = function (data) {
        return JSON.parse(JSON.stringify(data));
    };

    var createItem = function (x, y) {
        var item = {};

        item.id = idCount++;

        if (!setItemLocation(item, x, y)) {
            throw new Error('Could not place item at ' + x + 'x' + y + '!');
        }

        gameState.items[item.id] = item;

        return item;
    };

    var isLocationFree = function (x, y) {
        return (
            x >= 0 &&
            y >= 0 &&
            x < gameState.gridSize.x &&
            y < gameState.gridSize.y &&
            !gameState.grid[x][y]
        );
    };

    var setItemLocation = function (item, x, y) {
        if (isLocationFree(x, y)) {
            if (item.location) {
                delete gameState.grid[item.location.x][item.location.y];
            }

            gameState.grid[x][y] = item.id;
            item.location = {
                x: x,
                y: y
            };

            return true;
        }

        return false;
    };

    var createGrid = function (x, y) {
        var columns = [];

        _.times(x, function () {
            columns.push([]);
        });

        return columns;
    };

    document.addEventListener('DOMContentLoaded', function (e) {
    });


    window.tanks = {};
    window.tanks.registerController = function (name, controller) {
        registeredControllers[name] = controller;
    };
    window.tanks.startGame = function () {
        gameState = {};
        gameState.gridSize = {
            x: 40,
            y: 20
        };
        gameState.grid = createGrid(gameState.gridSize.x, gameState.gridSize.y);
        gameState.startPoints = [
            {x: 10, y: 05},
            {x: 10, y: 15},
            {x: 15, y: 10}
        ];
        gameState.items = {};
        gameState.tanks = _.map(registeredControllers, function (controller, name) {
            var startPoint = gameState.startPoints.shift(),
                item = createItem(startPoint.x, startPoint.y);

            item.controller = controller();
            item.controller.name = name;

            return item;
        });

        gameState.tickIntervalId = setInterval(gameTick, 750);
    };

    var gameTick = function () {
        _.each(_.shuffle(gameState.tanks), function (tank) {
            try {
                processDecision(tank);
            } catch (e) {
            }

            console.log(tank.controller.name + ': ' + JSON.stringify(tank.location));
        });

        render();
    };

    var processDecision = function (tank) {
        var s = deepCopy(publicGameState),
            decision = deepCopy(tank.controller.getDecision(s)),
            newLocation = deepCopy(tank.location);

        if (decision.action === 'move') {
            switch (decision.data.direction) {
                case 'up':
                    newLocation.y -= 1;
                    break;
                case 'down':
                    newLocation.y += 1;
                    break;
                case 'left':
                    newLocation.x -= 1;
                    break;
                case 'right':
                    newLocation.x += 1;
                    break;
                default:
                    throw new Error('Invalid "direction" for action "move"');
            }

            setItemLocation(tank, newLocation.x, newLocation.y);
        }
    }; 

    var render = function () {
        var canvas = document.getElementById('main-canvas'),
            ctx = canvas.getContext('2d');

        ctx.clearRect(
            0,
            0,
            gameState.gridSize.x * BLOCK_SIZE,
            gameState.gridSize.y * BLOCK_SIZE
        );

        _.each(gameState.items, function (item, id) {
            ctx.fillStyle = '#adf';
            ctx.fillRect(
                item.location.x * BLOCK_SIZE,
                item.location.y * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        });
    };
})();

window.tanks.registerController('foo', function () {
    return {
        getDecision: function (state) {
            return {
                action: 'move',
                data: {
                    direction: 'down'
                }
            };
        }
    };
});

window.tanks.registerController('bar', function () {
    return {
        getDecision: function (state) {
            return {
                action: 'move',
                data: {
                    direction: 'up'
                }
            };
        }
    };
});

window.tanks.registerController('baz', function () {
    return {
        getDecision: function (state) {
            return {
                action: 'move',
                data: {
                    direction: 'down'
                }
            };
        }
    };
});
