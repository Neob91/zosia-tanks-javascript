(function () {
    var registeredControllers = {},
        registeredLevels = {},
        activeControllers = {},
        activeLevelName = null,
        currentGame = null;

    window.deepCopy = function (data) {
        return JSON.parse(JSON.stringify(data));
    };

    document.addEventListener('DOMContentLoaded', function (e) {
        var $controllers = $('#controllers'),
            $levels = $('#levels'),
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
            renderLevels = function () {
                $levels.html('');
                _.each(registeredLevels, function (levelInfo, name) {
                    var $levelItem = (
                            $('<div class="level-item" />')
                                .attr('data-name', name)
                                .text(name)
                        );

                    if (activeLevelName === name) {
                        $levelItem.addClass('level-item--active');
                    }

                    $levels.append($levelItem);
                });
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
                } else if (!_.isEmpty(activeControllers) && activeLevelName) {
                    $buttons
                        .append(
                            $('<button />').text('Start').addClass('btn-start')
                        );
                }

                $('body').toggleClass('game-active', !!currentGame);
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
            switchLevel = function (name) {
                activeLevelName = name;

                renderLevels();
                renderButtons();
            };

        $controllers.on('click', '.controller-item', function () {
            if (!currentGame) {
                toggleController($(this).attr('data-name'));
            }
        });

        $levels.on('click', '.level-item', function () {
            if (!currentGame) {
                switchLevel($(this).attr('data-name'));
                renderButtons();
            }
        });

        $buttons.on('click', '.btn-start', function () {
            currentGame = new window.tanks.Game(
                registeredLevels[activeLevelName], activeControllers
            );
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
        renderLevels();
        renderButtons();
    });

    window.tanks = {};
    window.tanks.registerController = function (name, controller) {
        registeredControllers[name] = controller;
    };
    window.tanks.registerLevel = function (name, levelInfo) {
        registeredLevels[name] = levelInfo;
    };

})();
