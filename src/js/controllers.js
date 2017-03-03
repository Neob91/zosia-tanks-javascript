(function () {
    var exampleController = function () {
        var enemyName = null,
            prevLocation = null,
            moves = ['right', 'left', 'up', 'down'],
            lastMoves = [];

        return {
            getDecision: function (state) {
                var enemy = enemyName && _.find(state.enemies, function (item) {
                        return item.name === enemyName;
                    }) || _.shuffle(state.enemies)[0],
                    enemyOffset = enemy && {
                        x: enemy.location.x - state.me.location.x,
                        y: enemy.location.y - state.me.location.y
                    },
                    enemyDistance = enemy && Math.sqrt(
                        Math.pow(enemyOffset.x, 2) + Math.pow(enemyOffset.y, 2)
                    ),
                    center = {
                        x: state.gridSize.x / 2,
                        y: state.gridSize.y / 2
                    },
                    centerOffset = {
                        x: center.x - state.me.location.x,
                        y: center.y - state.me.location.y
                    },
                    isStuck = (
                        prevLocation &&
                        prevLocation.x === state.me.location.x &&
                        prevLocation.y === state.me.location.y
                    ),
                    shouldMove = enemy && (
                        Math.random() < 0.6 && enemyDistance > 2 ||
                        enemyDistance > 5
                    );

                prevLocation = state.me.location;

                if (!enemyName || enemy.name !== enemyName) {
                    enemyName = enemy.name;
                    console.log('Targeting ' + enemyName);
                }

                if (shouldMove) {
                    if (isStuck) {
                        lastMoves.push(_.difference(moves, lastMoves.slice(-2))[0]);

                        if (lastMoves.length > 3) {
                            lastMoves.shift();
                        }
                    } else {
                        lastMoves.push(
                            Math.random() < 0.2 || Math.random() < 0.9 && enemyOffset.y === 0 ?
                                (enemyOffset.x > 0 ? 'right' : 'left')
                                : (enemyOffset.y > 0 ? 'down' : 'up')
                        );
                    }

                    return {
                        action: 'move',
                        data: {
                            direction: lastMoves.slice(-1)[0]
                        }
                    };
                }

                return {
                    action: 'fire',
                    data: {
                        angle: Math.atan2(enemyOffset.y, enemyOffset.x)
                    }
                };
            }
        };
    };

    window.tanks.registerController('foo', exampleController);
    window.tanks.registerController('bar', exampleController);
    window.tanks.registerController('baz', exampleController);
    window.tanks.registerController('qux', exampleController);
})();
