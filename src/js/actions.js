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
        var angle = data.angle + Math.random() * 0.1 - 0.05,
            shotVector = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            },
            shotLocation = {
                x: player.location.x,
                y: player.location.y
            },
            shot = {};

        if (Math.abs(shotVector.x) > Math.abs(shotVector.y)) {
            shotVector.y *= (1 / shotVector.x);
            shotVector.x = 1;
        } else {
            shotVector.x *= (1 / shotVector.y);
            shotVector.y = 1;
        }

        shotLocation.x += 0.5 + shotVector.x * 0.5;
        shotLocation.y += 0.5 + shotVector.y * 0.5;

        shot.start = deepCopy(shotLocation);

        while (true) {
            var x = Math.floor(shotLocation.x),
                y = Math.floor(shotLocation.y),
                target;

            console.log('Fire: ' + x + ', ' + y);

            if (!game.isLocationValid(x, y)) {
                break;
            }

            target = game.getItemAtLocation(x, y);

            if (target) {
                if (target.health) {
                    target.health = Math.max(target.health - 30, 0);
                }

                break;
            }

            shotLocation.x += shotVector.x;
            shotLocation.y += shotVector.y;
        }

        shot.end = deepCopy(shotLocation);
        game.addEffect('shot', shot, 100);
    };

})();
