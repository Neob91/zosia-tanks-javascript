(function() {
    window.tanks.registerController('TeamWB', function() {
        var enemyName = null,
            closestEnymy = null,
            prevLocation = null,
            meNOW = null,
            isSafe = false,
            winState = 0,
            moves = ['right', 'up', 'left', 'down'],
            lastMoves = [];

        return {
            getDecision: function(state) {
                meNOW = state.me;

                if (state.enemies.length == 0) {
                    var move = moves[winState];

                    winState += 1;
                    winState %= 4;

                    return {
                        action: 'move',
                        data: {
                            direction: move
                        }
                    };

                }


                function raycast(enemy) {
                    var dx = Math.abs(enemy.location.x - state.me.location.x);
                    var dy = Math.abs(enemy.location.y - state.me.location.y);
                    var x = state.me.location.x;
                    var y = state.me.location.y;
                    var n = 1 + dx + dy;
                    var x_inc = (enemy.location.x > state.me.location.x) ? 1 : -1;
                    var y_inc = (enemy.location.y > state.me.location.y) ? 1 : -1;
                    var error = dx - dy;
                    dx *= 2;
                    dy *= 2;
                    for (; n > 0; n--) {
                        if (state.blocks.find(function(elem) {
                                return elem.x == x && elem.y == y
                            })) {
                            return false;
                        }
                        if (error > 0) {
                            x += x_inc;
                            error -= dy;
                        } else {
                            y += y_inc;
                            error += dx;
                        }
                    }
                    return true;
                };

                var allEnemins = _.map(state.enemies,
                    function(enemy) {
                        var x = enemy.location.x - meNOW.location.x;
                        var y = enemy.location.y - meNOW.location.y;

                        return { len: Math.sqrt(x * x + y * y), enem: enemy, acces: raycast(enemy) }
                    }
                );


                var closestEnymy = allEnemins[0];
                allEnemins.forEach(function(element) {
                    if (element.acces) {
                        if (closestEnymy.len > element.len) {
                            closestEnymy = element;
                        }
                    }
                }, this);

                console.log(closestEnymy);

                if (meNOW.ammo > 0 && closestEnymy.acces == true) {
                    if (closestEnymy.len <= 10) {
                        console.log("Enemy in range!");
                        var ee = closestEnymy.enem;
                        return {
                            action: 'fire',
                            data: {
                                angle: Math.atan2(ee.location.y - meNOW.location.y, ee.location.x - meNOW.location.x)
                            }
                        };
                    }
                }


                var walls = [0, 0, state.gridSize.x - 1, state.gridSize.y - 1];
                var closestWall = [meNOW.location.x, meNOW.location.y, walls[2] - meNOW.location.x, walls[3] - meNOW.location.y];

                if (!isSafe) {
                    var move = null;
                    var min = 10000;
                    var mini = null;
                    for (var i = 0; i < closestWall.length; i++) {
                        if (closestWall[i] < min) {
                            min = closestWall[i];
                            mini = i;
                        }
                    }

                    if (min == 0) {
                        console.log("We are safe!");
                    } else {
                        switch (mini) {
                            case 0:
                                move = "left";
                                break;

                            case 1:
                                move = "up";
                                break;

                            case 2:
                                move = "right";
                                break;

                            case 3:
                                move = "down";
                                break;

                            default:
                                console.log("No i chuj");
                                break;
                        }

                        return {
                            action: 'move',
                            data: {
                                direction: move
                            }
                        };
                    }


                }
                // console.log(allEnemins);

                // state.enemies.forEach(function(element) {
                //     console.log(element.location)
                // }, this);

                return {
                    action: 'move',
                    data: {
                        direction: moves[state.roundNumber % 4]
                    }
                };
            }
        }
    });
    var dybiecController = function() {
        var enemyName = null,
            prevLocation = null,
            moves = ['right', 'left', 'up', 'down'],
            lastMoves = [],
            lastEnemyName = null


        return {
            getDecision: function(state) {
                if (Math.random() < 0.92) {
                    var enemies = _.shuffle(state.enemies)
                        // console.log(state.enemies[0])
                    if (lastEnemyName != null) {
                        enemies.push(enemies[0])
                        enemies[0] = _.find(state.enemies, function(item) {
                            return item.name === lastEnemyName;
                        }) || _.shuffle(state.enemies)[0]
                    }
                    var ok = function(enemyOffset) {
                        for (var block of state.blocks) {
                            var a = state.me.location
                            var n = {
                                x: enemyOffset.x,
                                y: enemyOffset.y
                            }
                            var norm = Math.sqrt(n.x * n.x + n.y * n.y)
                            if (norm > 0.0) {
                                n.y /= norm
                                n.x /= norm
                            }
                            var p = block
                                // console.log("###########################################")
                                // console.log(a)
                                // console.log(n)
                                // console.log(p)
                            var ap = {
                                x: a.x - p.x,
                                y: a.y - p.y
                            }
                            var mult = ap.x * n.x + ap.y * n.y
                            var last = {
                                x: ap.x - mult * n.x,
                                y: ap.y - mult * n.y
                            }
                            var dist = Math.sqrt(last.x * last.x + last.y * last.y)
                                // console.log(dist)
                            if (dist < 1.0) return false
                        }
                        return true

                    }
                    for (var enemy of enemies) {
                        enemyOffset = {
                            x: enemy.location.x - state.me.location.x,
                            y: enemy.location.y - state.me.location.y
                        }
                        if (!ok(enemyOffset)) {
                            continue;
                        }
                        lastEnemy = enemy.name
                        return {
                            action: 'fire',
                            data: {
                                angle: Math.atan2(enemyOffset.y, enemyOffset.x)
                            }
                        };
                    }
                }
                var enemy = enemyName && _.find(state.enemies, function(item) {
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
                    shouldMove = enemy ? (
                        Math.random() < 0.6 && enemyDistance > 3 ||
                        Math.random() < 0.2 && enemyDistance > 2 ||
                        enemyDistance > 5
                    ) : Math.abs(centerOffset.x) > 1 || Math.abs(centerOffset.y) > 1,
                    moveOffset = enemyOffset || centerOffset;

                prevLocation = state.me.location;

                if (enemy && (!enemyName || enemy.name !== enemyName)) {
                    enemyName = enemy.name;
                    // console.log('Targeting ' + enemyName);
                }

                if (shouldMove) {
                    if (isStuck) {
                        lastMoves.push(_.difference(moves, lastMoves.slice(-2))[0]);

                        if (lastMoves.length > 3) {
                            lastMoves.shift();
                        }
                    } else {
                        lastMoves.push(
                            Math.random() < 0.2 || Math.random() < 0.9 && moveOffset.y === 0 ?
                            (moveOffset.x > 0 ? 'right' : 'left') :
                            (moveOffset.y > 0 ? 'down' : 'up')
                        );
                    }

                    return {
                        action: 'move',
                        data: {
                            direction: lastMoves.slice(-1)[0]
                        }
                    };
                }

                if (enemyOffset) {
                    return {
                        action: 'fire',
                        data: {
                            angle: Math.atan2(enemyOffset.y, enemyOffset.x)
                        }
                    };
                }

                return {
                    action: 'move',
                    data: {
                        direction: moves[state.roundNumber % 4]
                    }
                };
            }
        };
    };

    window.tanks.registerController('dybiec', dybiecController);
    window.tanks.registerController('Wojakor', function() {
        var moves = ['right', 'left', 'up', 'down'],
            actions = ['move', 'fire'];

        return {
            getDecision: function(state) {
                console.log(state);
                var rmove = Math.floor(4 * Math.random()),
                    raction = Math.floor(2 * Math.random()),
                    data;

                if (state.me.ammo === 0) {
                    rmove = 0;
                }

                if (raction === 0) {
                    data = {
                        direction: moves[rmove]
                    };
                } else {
                    var enemies = state.enemies.map(ob => {
                        return Math.sqrt(ob.location.x * ob.location.x + ob.location.y * ob.location.y)
                    });

                    var minval = 100000;
                    enemies.forEach(en => {
                        if (en < minval)
                            minval = en;
                    });

                    var idx = enemies.indexOf(minval);
                    console.log(enemies, minval, idx);

                    var enemy = state.enemies[Math.floor(state.enemies.length * Math.random())];
                    console.log(enemy);
                    var enemyOffset = {
                        x: enemy.location.x - state.me.location.x,
                        y: enemy.location.y - state.me.location.y
                    };

                    console.log(enemyOffset);
                    data = {
                        angle: Math.atan2(enemyOffset.y, enemyOffset.x)
                    }
                }

                return {
                    action: actions[raction],
                    data: data
                };
            }
        };
    });

    (function () {

    function shootEnemy(enemy) {
        d = Math.sqrt(dist(enemy.enemyOffset, { x: 0, y: 0 }));
        return {
            action: 'fire',
            data: {
                angle: Math.atan2(enemy.enemyOffset.y + (d > 10 ? 0 : (Math.random() < 0.5 ? -1 : 1) * (-0.25)), enemy.enemyOffset.x + (d > 10 ? 0 : (Math.random() < 0.5 ? -1 : 1) * (-0.25)))
            }
        }
    }

    function iloczyn_wekt(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    function canShootTo(enemy, my_position, board) {
        var mv = { x: my_position.location.x - enemy.location.x, y: my_position.location.y - enemy.location.y };
        for (var i = 0; i < board.length; i++) {
            il1 = iloczyn_wekt({ x: board[i].x - enemy.location.x - 0.5, y: board[i].y - enemy.location.y - 0.5 }, mv);
            il2 = iloczyn_wekt({ x: board[i].x - enemy.location.x + 0.5, y: board[i].y - enemy.location.y + 0.5 }, mv);
            if (il1 * il2 < 0) {
                console.log("Blokuje");
                return false;
            }
        }
        return true;
    }

    function randomMove() {
        var moves = ['right', 'left', 'up', 'down'];
        var rnd = Math.min(3, Math.floor(Math.random() * 4));
        obj = {
            action: 'move',
            data: {
                direction: moves[rnd]
            }
        }
        return obj;
    }

    function dist(a, b) {
        return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    }

    function closestEnemy(enemies, me, boards) {
        var id = 0,
            best = 1e9;
        for (var i = 0; i < enemies.length; i++)
            if (dist(enemies[i].location, me.location) < best ) {
                id = i;
                best = dist(enemies[i].location, me.location);
            }
        obj = {
            enemyOffset: { x: enemies[id].location.x - me.location.x, y: enemies[id].location.y - me.location.y },
            location: enemies[id].location
        }
        return obj;
    }
    var myContr = function() {
        var enemyName = null,
            prevLocation = null,
            lastMoves = [];
        return {
            getDecision: function(state) {
                if (state.enemies && state.enemies.length > 0 && state.me.ammo > 0) {
                    d = dist(closestEnemy(state.enemies, state.me, state.blocks).location, state.me.location);
                    if (state.enemies && canShootTo(closestEnemy(state.enemies, state.me, state.blocks), state.me, state.blocks)) {
                        chance = Math.min(0.7, Math.max(0.1, -Math.sqrt(Math.max(0, d - 15 * 15)) * 0.4 / 3 + 0.7 - (state.me.health < 30 ? 0.2 : 0)));
                        console.log("chance " + chance);
                        if (Math.random() < chance)
                            return shootEnemy(closestEnemy(state.enemies, state.me));
                    }
                }
                return randomMove();
            }
        }
    };

    window.tanks.registerController('bartek', myContr);

    })();

    var sushiController = function() {
        var moves = ['left', 'right', 'up', 'down'];
        var enemies = [];
        var distance = function(tank1, tank2) {
            return Math.sqrt(((function(x) { return x * x; })(tank1.location.x - tank2.location.x) +
                (function(x) { return x * x; })(tank1.location.y - tank2.location.y)));
        };

        var angleToDir = function(angle) {
            if (angle > Math.atan2(1, 1) && angle <= Math.atan2(1, -1)) {
                return 'up';
            }
            if (angle > Math.atan2(1, -1) && angle <= Math.atan2(-1, -1)) {
                return 'left';
            }
            if (angle > Math.atan2(-1, -1) && angle <= Math.atan(-1, 1)) {
                return 'down';
            }
            return 'right';
        };

        var offsetBetween = function(tank1, tank2) {
            return {
                x: tank2.location.x - tank1.location.x,
                y: tank2.location.y - tank1.location.y
            };
        };

        var vectorToAngle = function(vector) {
            return Math.atan2(vector.y, vector.x);
        };

        return {
            getDecision: function(state) {
                enemies = state.enemies.sort(
                    function(enemy1, enemy2) { return distance(state.me, enemy1) - distance(state.me, enemy2); });



                var closeEnemies = enemies.filter(enemy => distance(state.me, enemy) < 7)

                if (closeEnemies.length > 1) {
                    var meanVector =
                        _.reduce(
                            closeEnemies.map(
                                function(enemy) { return offsetBetween(state.me, enemy); }).map(
                                function(vector) {
                                    return { x: vector.x / closeEnemies.length, y: vector.y / closeEnemies.length };
                                }),
                            function(acc, el) { return { x: acc.x + el.x, y: acc.y + el.y }; });

                    return {
                        action: 'move',
                        data: {
                            direction: angleToDir(vectorToAngle({ x: -meanVector.x, y: -meanVector.y }))
                        }
                    };
                }


                if (enemies[0] && state.me.ammo > 0 && distance(state.me, enemies[0]) < 6) {
                    return {
                        action: 'fire',
                        data: {
                            angle: vectorToAngle(offsetBetween(state.me, enemies[0]))
                        }
                    };
                }

                return {
                    action: 'move',
                    data: {
                        direction: moves[Math.min(3, Math.floor(4 * Math.random()))]
                    }
                };
            }
        };
    };

    window.tanks.registerController('SushiTank', sushiController);
    // paste your boots here ------------------------------------------------------------

    window.tanks.registerController('Tereferekuku', function() {
        var lastPlace = null;
        var lastDir = null;

        return {
            getDecision: function(state) {
                var myTank = state.me;
                var enemiesPlaces = _.map(state.enemies, function(e) {
                    var diffX = e.location.x - myTank.location.x;
                    var diffY = myTank.location.y - e.location.y;

                    return {
                        r: Math.sqrt(diffX * diffX + diffY * diffY),
                        fi: Math.atan2(diffY, diffX)
                    };
                });

                var opfer = _.find(enemiesPlaces, function(plc) { return plc.r <= 6; });

                if (opfer != undefined && myTank.ammo > 3) {
                    return {
                        action: 'fire',
                        data: {
                            angle: -opfer.fi
                        }
                    };
                }

                var nearest = _.reduce(enemiesPlaces, function(memo, plc) { if (memo.r === 0 || plc.r < memo.r) { return plc; } else { return memo; } }, { r: 0, fi: 0 });

                if (nearest.r > 0 && lastPlace != null && (lastPlace.x !== myTank.location.x || lastPlace.y !== myTank.location.y)) {
                    if (nearest.fi >= -Math.PI / 4 && nearest.fi < Math.PI / 4) {
                        lastDir = 'right';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'right'
                            }
                        };
                    } else if (nearest.fi >= Math.PI / 4 && nearest.fi < 3 * Math.PI / 4) {
                        lastDir = 'up';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'up'
                            }
                        };
                    } else if (nearest.fi < -Math.PI / 4 && nearest.fi >= -3 * Math.PI / 4) {
                        lastDir = 'down';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'down'
                            }
                        };
                    } else {
                        lastDir = 'left';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'left'
                            }
                        };
                    }
                }

                var rnd = Math.random();

                if (rnd < 0.25) {
                    if (lastDir != null && lastDir !== 'down') {
                        lastDir = 'up';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'up'
                            }
                        };
                    } else {
                        lastDir = 'right';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'right'
                            }
                        };
                    }
                } else if (rnd < 0.5) {
                    if (lastDir != null && lastDir !== 'up') {
                        lastDir = 'down';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'down'
                            }
                        };
                    } else {
                        lastDir = 'left';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'left'
                            }
                        };
                    }
                } else if (rnd < 0.75) {
                    if (lastDir != null && lastDir !== 'right') {
                        lastDir = 'left';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'left'
                            }
                        };
                    } else {
                        lastDir = 'up';
                        lastPlace = myTank.location;

                        return {
                            action: 'move',
                            data: {
                                direction: 'up'
                            }
                        };
                    }
                } else if (lastDir != null && lastDir !== 'left') {
                    lastDir = 'right';
                    lastPlace = myTank.location;

                    return {
                        action: 'move',
                        data: {
                            direction: 'right'
                        }
                    };
                } else {
                    lastDir = 'down';
                    lastPlace = myTank.location;

                    return {
                        action: 'move',
                        data: {
                            direction: 'down'
                        }
                    };
                }
            }
        };
    });

    var NYCOPController = function () {
        var enemyName = null,
            prevLocation = null,
            moves = ['right', 'left', 'up', 'down'],
            lastMoves = [];
    
    
        function czyNiePrzecina(x1,y1,x2,y2, state) {
            var sredniaX = (x1 + x2) /2;
            var sredniaY = (y1 + y2) /2;
            for (var i = 0; i < state.blocks.length; i++) {
               if (state.blocks[i].x == sredniaX
                       && state.blocks[i].y == sredniaY){
                   return false;
               }
            }
            return true;
        }
    

        return {
            getDecision: function (state) {
                
                var minDistance = 1000000;
                var distance;
                var distname;
                var see;            
                var myX = state.me.location.x;
                var myY = state.me.location.y;
                
                for (var i=0; i <state.enemies.length; i++){
                    var enemyX = state.enemies[i].location.x - state.me.location.x;
                    var enemyY = state.enemies[i].location.y - state.me.location.y;
                    distance = Math.sqrt(
                        Math.pow(enemyX, 2) + Math.pow(enemyY, 2)
                    );
            

                    see = czyNiePrzecina(enemyX, enemyY, myX, myY, state);
                    
                    if (see && distance < minDistance){
                        minDistance = distance;                    
                        distname = state.enemies[i];                        
                    };
                };
                
                var myX = state.me.location.x;
                var myY = state.me.location.y;
                
                               
                var enemy = distname,
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
                    shouldMove = enemy ? (
                    ( state.me.ammo == 0 ) || 
                       ( enemyDistance > 9 )
                       || !czyNiePrzecina(enemy.location.x, enemy.location.y,
               myX, myY, state)
                    ) : Math.abs(centerOffset.x) > 1 || Math.abs(centerOffset.y) > 1,
                    moveOffset = enemyOffset || centerOffset;

                prevLocation = state.me.location;

                if (enemy && (!enemyName || enemy.name !== enemyName)) {
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
                            Math.random() < 0.2 || Math.random() < 0.9 && moveOffset.y === 0 ?
                                (moveOffset.x > 0 ? 'right' : 'left')
                                : (moveOffset.y > 0 ? 'down' : 'up')
                        );
                    }

                    return {
                        action: 'move',
                        data: {
                            direction: lastMoves.slice(-1)[0]
                        }
                    };
                }

                if (enemyOffset) {
                    return {
                        action: 'fire',
                        data: {
                            angle: Math.atan2(enemyOffset.y, enemyOffset.x)
                        }
                    };
                }

                return {
                    action: 'move',
                    data: {
                        direction: moves[state.roundNumber % 4]
                    }
                };
            }
        };
    };


    window.tanks.registerController('NYPDCop', NYCOPController);

    window.tanks.registerController('XDDDDDD', function()
    {
        var enemyName = null,
        prevLocation = null,
        lastMoves = [],
        currentState = 0;
        function can_shot(enemy)
        {
            for (var i = currentState.blocks.length - 1; i >= 0; i--) {
                if(collides_with_block(enemy, currentState.blocks[i]))
                    return false;
            }
            return true;
        }
        function collides_with_block(enemy, block)
        {
            var my_location = currentState.me.location;
            var block_loc = block;
            var enemy_loc = enemy.location;
            var step = 
            {
                x: Math.abs(enemy_loc.x - my_location.x)/1000,
                y: Math.abs(enemy_loc.y - my_location.y)/1000
            } 
            for(var i = 0; i < 1000; i++)
            {
                var point = 
                {
                    x: my_location.x + step.x * i,
                    y: my_location.y + step.y * i
                }
                if(inside_circle(point, block_loc.x, block_loc.y, 0.5))
                    return true;
            }
            return false;
        }
        function inside_circle(point, cx, cy, radius)
        {
            if(cx + radius > point.x && cx - radius < point.x &&
               cy + radius > point.y && cy - radius < point.y)
                return true;
            return false;
        }
        function has_good_shot()
        {
            var enemy = find_closest_enemy();
            if(can_shot(enemy))
            { 
                var distance = distance_to_enemy(enemy);
                console.log(distance);
                if(distance < 10)
                    return true;
            }
            return false;
        }
        function is_low_on_ammo()
        {
            return currentState.me.ammo < 2;
        }
        function find_closest_enemy()
        {
            var min = 10000000;
            var index = -1;
            for (var i = currentState.enemies.length - 1; i >= 0; i--) {
                var distance = distance_to_enemy(currentState.enemies[i]);
                if(min > distance)
                {
                    min = distance;
                    index = i;
                }
            }
            return currentState.enemies[index];
        }
        function distance_to_enemy(enemy)
        {
            var my_location = currentState.me.location;
            return    Math.abs(enemy.location.y - my_location.y) 
                    + Math.abs(enemy.location.x - my_location.x);
        }
        function is_able_to_move(direction)
        {
            var location = currentState.me.location;
            if(direction === 'right')
                location.x++;
            if(direction === 'left')
                location.x--;
            if(direction === 'up')
                location.y--;
            if(direction === 'down')
                location.y++;
            if(location.x < 0)
                return false;
            if(location.x > currentState.gridSize.x)
                return false;
            if(location.y < 0)
                return false;
            if(location.y > currentState.gridSize.y)
                return false;
            for (var i = currentState.blocks.length - 1; i >= 0; i--) {
                if( currentState.blocks[i].x === location.x &&
                    currentState.blocks[i].y === location.y)
                {
                    console.log("XDD");
                    return false;
                }
            }
            return true;
        }
        function direction_away_enemy(enemy)
        {
            var xd = direction_towards_enemy(enemy)
            if(xd === 'down')
                return 'up';
            if(xd === 'up')
                return 'down';
            if(xd === 'right')
                return 'left';
            if(xd === 'left')
                return 'right';
        }
        function direction_towards_enemy(enemy)
        {
            var my_location = currentState.me.location;
            var enemy_location = enemy.location;
            var x_delta = my_location.x - enemy_location.x;
            var y_delta = my_location.y - enemy_location.y;
            if(Math.abs(x_delta) > Math.abs(y_delta))
            {
                if(x_delta < 0)
                {
                    return 'right';
                }
                else
                {
                    return 'left';
                }
            }
            else
            {
                if(y_delta < 0)
                {
                    return 'down';
                }
                else
                {
                    return 'up';
                }
            }
        }
        function get_other_moves(move)
        {
            if(move === "right")
                return ["right", "up", "down", "left"];
            if(move === "left")
                return ["left", "up", "down", "right"];
            if(move === "down")
                return ["down", "left", "right", "up"];
            if(move === "up")
                return ["up", "left", "right", "down"];
        }
        function move_away()
        {
            var closest_enemy = find_closest_enemy();
            var move = direction_away_enemy(closest_enemy);
            var moves = get_other_moves();
            console.log(moves);
            for (var i = 0; i < moves.length; i++) {
                if(is_able_to_move(moves[i]))
                {
                    console.log(moves[i]);
                    return {
                        action: 'move',
                        data: {
                            direction: moves[i]
                        }
                    };
                }
            }
            return {
                action: 'move',
                data: {
                    direction: 'up'
                }
            };
        }
        function move_towards()
        {
            var closest_enemy = find_closest_enemy();
            var moves = [direction_towards_enemy(closest_enemy), 'down', 'right', 'up', 'left'];
            console.log(moves);
            for (var i = 0; i < moves.length; i++) {
                if(is_able_to_move(moves[i]))
                {
                    console.log(moves[i]);
                    return {
                        action: 'move',
                        data: {
                            direction: moves[i]
                        }
                    };
                }
            }
            return {
                action: 'move',
                data: {
                    direction: 'up'
                }
            };
        }
        return{
            getDecision: function (state)
            {
                currentState = state;

                if (has_good_shot()) {
                    var enemy = find_closest_enemy();
                    enemyOffset = enemy && {
                        x: enemy.location.x - state.me.location.x,
                        y: enemy.location.y - state.me.location.y
                    }
                    return {
                        action: 'fire',
                        data: {
                            angle: Math.atan2(enemyOffset.y, enemyOffset.x)
                        }
                    };
                }
                else{
                    if(is_low_on_ammo())
                    {
                        return move_away();
                    }
                    else 
                    {
                        return move_towards();
                    }
                }
            }
        }
    });
})();
