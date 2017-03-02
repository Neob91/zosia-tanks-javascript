(function () {
    var registeredControllers = {};

    window.deepCopy = function (data) {
        return JSON.parse(JSON.stringify(data));
    };

    document.addEventListener('DOMContentLoaded', function (e) {
    });

    window.tanks = {};
    window.tanks.registerController = function (name, controller) {
        registeredControllers[name] = controller;
    };
    window.tanks.startGame = function () {
        var game = new window.tanks.Game(registeredControllers);
        game.start();
    };

})();

window.tanks.registerController('foo', function () {
    return {
        getDecision: function (state) {
            return {
                action: 'fire',
                data: {
                    angle: Math.PI * 0.5
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
