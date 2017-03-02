(function () {
    var registeredControllers = {},
        gameState = null,
        publicGameState = null;

    var deepCopy = function (data) {
        return JSON.parse(JSON.stringify(data));
    };

    var moveItem = function (item, newLocation) {
        if (!gameState.grid[newLocation.x][newLocation.y]) {
            gameState.grid[item.location.x][item.location.y] = null;
            gameState.grid[newLocation.x][newLocation.y] = item.id;
        }
    };

    var createGrid = function (x, y) {
        var columns = [];

        _.times(x, function () {
            columns.push([]);
        });
    };

    var startGame = function () {
        gameState = {};
        gameState.grid = createGrid(200, 100);
        gameState.items = {};
        gameState.tanks = [];

        gameState.tickIntervalId = setInterval(gameTick, 1000);
    };

    document.addEventListener('DOMContentLoaded', function (e) {
        var canvas = document.getElementById('main-canvas'),
            context = canvas.getContext('2d');

        window.tanks = {};
    });

    window.tanks.defineBot = function (name) {
        botClasses[name] = botClass;
    };

    var gameTick = function () {
        _.each(_.shuffle(gameState.tanks), function (tank) {
            try {
                processDecision(tank);
            } catch () {}
        });
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

            moveItem(tank, newLocation);
        }
    }; 
})();
