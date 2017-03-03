(function () {
    var blockSize = 20,
        idCount = 1,
        actionPriority = [
            'move',
            'fire'
        ],
        levelInfo = {
            gridSize: {
                x: 40,
                y: 20
            },
            startPoints: [
                {x: 7, y: 5},
                {x: 7, y: 15},
                {x: 15, y: 10}
            ],
            blocks: [
                {x: 9, y: 5, h: 10, w: 2},
                {x: 29, y: 5, h: 10, w: 2}
            ]
        };

    var Item = function (opts) {
        opts = opts || {};

        this.id = idCount++;
        this.immovable = opts.immovable || false;
    };

    var Game = function (controllers) {
        var that = this;

        if (controllers.length < levelInfo.startPoints.length) {
            throw new Error('There are not enough start points!');
        }

        this.state = {};
        this.state.items = {};
        this.state.roundNumber = 0;

        this.state.gridSize = deepCopy(levelInfo.gridSize);
        this.state.grid = [];
        _.times(this.state.gridSize.x, function () {
            that.state.grid.push([]);
        });

        this.blockItem = new Item();
        this.addItem(this.blockItem);

        _.each(levelInfo.blocks, function (block) {
            _.times(block.w, function (n) {
                _.times(block.h, function (m) {
                    that.state.grid[block.x + n][block.y + m] = that.blockItem.id;
                });
            });
        });

        this.state.startPoints = deepCopy(levelInfo.startPoints);
        this.state.players = _.map(_.shuffle(controllers), function (controller, name) {
            var startPoint = that.state.startPoints.shift(),
                item = new Item();

            item.controller = controller();
            item.name = name;
            item.health = 100;
            item.ammo = 20;

            that.addItem(item);

            if (!that.setLocation(item, startPoint.x, startPoint.y)) {
                throw new Error('Cannot create player at location ' + x + 'x' + y + '!');
            }

            return item;
        });
        this.state.effects = [];
    };

    Game.prototype.start = function () {
        var that = this;

        this.setupCanvas();
        this.renderBackground();
        this.inProgress = true;

        if (!this.tickIntervalId) {
            this.tick();
            this.tickIntervalId = setInterval(function () {
                that.tick();
            }, 750);
        }

        if (!this.effectsIntervalId) {
            this.effectsIntervalId = setInterval(function () {
                that.renderEffects();
            }, 20);
        }
    };

    Game.prototype.pause = function () {
        this.inProgress = false;

        if (this.tickIntervalId) {
            clearInterval(this.tickIntervalId);
            this.tickIntervalId = null;
        }

        if (this.effectsIntervalId) {
            clearInterval(this.effectsIntervalId);
            this.effectsIntervalId = null;
        }
    };

    Game.prototype.stop = function () {
        this.pause();
        this.setupCanvas();
    };

    Game.prototype.tick = function () {
        this.processDecisions();
        this.renderMain();

        this.state.roundNumber += 1;
    };

    Game.prototype.processDecisions = function () {
        var that = this,
            decisions = [];

        _.each(_.shuffle(this.state.players), function (player) {
            var decision,
                priority;

            if (!player.health) {
                return;
            }

            if (that.state.roundNumber % 4 === 0) {
                player.ammo += 1;
            }

            //try {
                decision = that.processDecision(player);
            //} catch (e) {}

            priority = actionPriority.indexOf(decision.action);
            if (priority === -1) {
                throw new Error('No priority set for action "' + decision.action + '"');
            }

            decisions[priority] = decisions[priority] || [];
            decisions[priority].push(decision);

            //console.log(player.controller.name + ': ' + JSON.stringify(player.location));
        });

        _.chain(decisions).flatten().compact().each(function (decision) {
            if (window.tanks.actions.hasOwnProperty(decision.action)) {
                //try {
                    window.tanks.actions[decision.action](that, decision.player, decision.data);
                //} catch (e) {}
            }
        });
    };

    Game.prototype.processDecision = function (player) {
        var s =this.getPublicState(player),
            decision = deepCopy(player.controller.getDecision(s));

        decision.player = player;
        return decision;
    };

    Game.prototype.getPublicState = function (player) {
        var s = {
            enemies: []
        };

        _.each(this.state.players, function (enemy) {
            if (enemy.id !== player.id) {
                s.enemies.push({
                    location: deepCopy(enemy.location)
                })
            }
        });

        return s;
    };

    Game.prototype.addItem = function (item) {
        this.state.items[item.id] = item;
    };

    Game.prototype.setLocation = function (item, x, y) {
        if (this.isLocationFree(x, y) && !item.immovable) {
            if (item.location) {
                delete this.state.grid[item.location.x][item.location.y];
            }

            this.state.grid[x][y] = item.id;
            item.location = {
                x: x,
                y: y
            };

            return true;
        }

        return false;
    };

    Game.prototype.isLocationValid = function (x, y) {
        return (
            x >= 0 &&
            y >= 0 &&
            x < this.state.gridSize.x &&
            y < this.state.gridSize.y
        );
    };

    Game.prototype.isLocationFree = function (x, y) {
        return this.isLocationValid(x, y) && !this.state.grid[x][y];
    };

    Game.prototype.getItemAtLocation = function (x, y) {
        var id = this.state.grid[x][y];
        return id ? this.state.items[id] : null;
    };

    Game.prototype.addEffect = function (name, data, lifespan) {
        var ts = new Date().getTime();

        this.state.effects.push({
            name: name,
            data: data,
            created: ts,
            expire: ts + lifespan
        });
    };

    Game.prototype.setupCanvas = function () {
        var that = this,
            ids = ['canvas-bg', 'canvas-main', 'canvas-effects'];

        _.each(ids, function (id) {
            var canvas = document.getElementById(id);

            canvas.width = that.state.gridSize.x * blockSize;
            canvas.height = that.state.gridSize.y * blockSize;
        });
    };

    Game.prototype.renderBackground = function () {
        var that = this,
            canvas = document.getElementById('canvas-bg'),
            ctx = canvas.getContext('2d');

        ctx.clearRect(
            0, 0, this.state.gridSize.x * blockSize, this.state.gridSize.y * blockSize
        );
        ctx.fillStyle = '#2096f3';

        _.times(this.state.gridSize.x, function (n) {
            _.times(that.state.gridSize.y, function (m) {
                if (that.state.grid[n][m] === that.blockItem.id) {
                    ctx.fillRect(
                        n * blockSize + 1,
                        m * blockSize + 1,
                        blockSize - 2,
                        blockSize - 2
                    );
                }
            });
        });
    };

    Game.prototype.renderMain = function () {
        var canvas = document.getElementById('canvas-main'),
            ctx = canvas.getContext('2d');

        ctx.clearRect(
            0, 0, this.state.gridSize.x * blockSize, this.state.gridSize.y * blockSize
        );

        _.each(this.state.items, function (item, id) {
            if (item.location) {
                ctx.fillStyle = item.health ? '#adf' : '#ddd';
                ctx.fillRect(
                    item.location.x * blockSize + 1,
                    item.location.y * blockSize + 1,
                    blockSize - 2,
                    blockSize - 2
                );
            }
        });
    };

    Game.prototype.renderEffects = function () {
        var canvas = document.getElementById('canvas-effects'),
            ctx = canvas.getContext('2d'),
            ts = new Date().getTime();

        ctx.clearRect(
            0, 0, this.state.gridSize.x * blockSize, this.state.gridSize.y * blockSize
        );

        this.state.effects = _.filter(this.state.effects, function (effect) {
            var lifespan = (effect.expire - ts) / (effect.expire - effect.created);

            if (lifespan <= 0) {
                return false;
            }

            ctx.restore();
            ctx.save();

            switch (effect.name) {
                case 'shot':
                    ctx.beginPath();
                    ctx.moveTo(
                        Math.floor(effect.data.start.x * blockSize),
                        Math.floor(effect.data.start.y * blockSize)
                    );
                    ctx.lineTo(
                        Math.floor(effect.data.end.x * blockSize),
                        Math.floor(effect.data.end.y * blockSize)
                    );
                    ctx.strokeStyle = 'rgba(255, 165, 0, ' + Math.floor(lifespan * 100) / 100 + ')';
                    ctx.stroke();
                    break;
                case 'hit':
                    ctx.beginPath();
                    ctx.arc(
                        Math.floor(effect.data.x * blockSize),
                        Math.floor(effect.data.y * blockSize),
                        (1.2 - lifespan) * blockSize * 0.5,
                        0, 2 * Math.PI, false
                    );
                    ctx.fillStyle = 'rgba(255, 165, 0, ' + Math.floor(lifespan * 100) / 100 + ')';
                    ctx.fill();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = '#f22613';
                    ctx.stroke();
                    break;
                default:
                    return false;
            }

            return true;
        });
    };

    window.tanks.Game = Game;
})();
