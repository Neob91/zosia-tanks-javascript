(function () {
    var registeredControllers = {},
        activeControllers = {},
        currentGame = null;

    window.deepCopy = function (data) {
        return JSON.parse(JSON.stringify(data));
    };

    document.addEventListener('DOMContentLoaded', function (e) {
        var $controllers = $('#controllers'),
            $buttons = $('#buttons'),
            renderControllers = function () {
                $controllers.html('');
                _.each(registeredControllers, function (controller, name) {
                    var $controllerItem = (
                            $('<div class="controller-item" />')
                                .attr('data-name', name)
                                .text(name)
                        );

                    if (activeControllers.hasOwnProperty(name)) {
                        $controllerItem.addClass('controller-item--active');
                    }

                    $controllers.append($controllerItem);
                });
            },
            toggleController = function (name) {
                if (activeControllers.hasOwnProperty(name)) {
                    delete activeControllers[name];
                } else {
                    activeControllers[name] = registeredControllers[name];
                }

                renderControllers();
                renderButtons();
            },
            renderButtons = function () {
                $buttons.html('');

                if (currentGame) {
                    if (currentGame.inProgress) {
                        $buttons
                            .append(
                                 $('<button />').text('Pause').addClass('btn-pause')
                            )
                            .append(
                                $('<button />').text('Stop').addClass('btn-stop')
                            );
                    } else {
                        $buttons
                            .append(
                                $('<button />').text('Resume').addClass('btn-resume')
                            );
                    }
                } else if (!_.isEmpty(activeControllers)) {
                    $buttons
                        .append(
                            $('<button />').text('Start').addClass('btn-start')
                        );
                }

                $('body').toggleClass('game-active', !!currentGame);
            };

        $controllers.on('click', '.controller-item', function () {
            if (!currentGame) {
                toggleController($(this).attr('data-name'));
            }
        });

        $buttons.on('click', '.btn-start', function () {
            currentGame = new window.tanks.Game(activeControllers);
            currentGame.start();
            renderButtons();
        });

        $buttons.on('click', '.btn-stop', function () {
            currentGame.stop();
            currentGame = null;
            renderButtons();
        });

        $buttons.on('click', '.btn-pause', function () {
            currentGame.pause();
            renderButtons();
        });

        $buttons.on('click', '.btn-resume', function () {
            currentGame.start();
            renderButtons();
        });

        renderControllers();
        renderButtons();
    });

    window.tanks = {};
    window.tanks.registerController = function (name, controller) {
        registeredControllers[name] = controller;
    };

})();
