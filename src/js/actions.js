(function () {
    window.tanks.actions = {};
    window.tanks.actions.move = function (game, player, data) {
        var x = player.location.x,
            y = player.location.y;

        switch (data.direction) {
            case 'up':
                y -= 1;
                break;
            case 'down':
                y += 1;
                break;
            case 'left':
                x -= 1;
                break;
            case 'right':
                x += 1;
                break;
            default:
                throw new Error('Invalid "direction" for action "move"');
        }

        game.setLocation(player, x, y);
    };
    window.tanks.actions.fire = function (game, player, data) {
        var angle = data.angle + (Math.random() * 0.6 - 0.3) * Math.random(),
            shotVector = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            },
            shotLocation = {
                x: player.location.x,
                y: player.location.y
            },
            shot = {};

        if (player.ammo <= 0) {
            return;
        }

        player.ammo--;

        shotLocation.x += 0.5;
        shotLocation.y += 0.5;

        while (true) {
            var xFract = shotLocation.x - Math.floor(shotLocation.x),
                yFract = shotLocation.y - Math.floor(shotLocation.y),
                xStep,
                yStep,
                step,
                step2,
                x,
                y,
                target;

            if (shotVector.x > 0) {
                xFract = 1 - xFract;
            }

            if (shotVector.y > 0) {
                yFract = 1 - yFract;
            }

            xStep = xFract / Math.abs(shotVector.x);
            yStep = yFract / Math.abs(shotVector.y);

            step = Math.min(xStep, yStep);
            step2 = Math.max(xStep, yStep) - step;

            step = step + (step2 > 0.3 ? 0.2 : step2 * 0.5);

            shotLocation.x += shotVector.x * step;
            shotLocation.y += shotVector.y * step;

            if (!shot.start) {
                shot.start = deepCopy(shotLocation);
            }

            x = Math.floor(shotLocation.x);
            y = Math.floor(shotLocation.y);

            if (!game.isLocationValid(x, y)) {
                break;
            }

            target = game.getItemAtLocation(x, y);

            if (target) {
                if (target.health) {
                    target.health = Math.max(target.health - 5 - Math.floor(20 * Math.random()), 0);

                    if (!target.health) {
                        player.kills++;
                    }
                }

                break;
            }
        }

        shot.end = deepCopy(shotLocation);
        game.addEffect('shot', shot, 150);
        game.addEffect('hit', shot.end, 300);
    };

})();
