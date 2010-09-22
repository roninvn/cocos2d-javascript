var sys = require('sys'),
    Obj = require('object').Object,
    ccp = require('geometry').ccp,
    Scheduler = require('./Scheduler').Scheduler,
    TouchDispatcher = require('./TouchDispatcher').TouchDispatcher,
    KeyboardDispatcher = require('./KeyboardDispatcher').KeyboardDispatcher,
    Scene = require('./Scene').Scene;

/** @member cocos
 * @class
 *
 * Creates and handles the main view and manages how and when to execute the
 * Scenes.
 *
 * This class is a singleton so don't instantiate it yourself, instead use
 * cocos.Director.get('sharedDirector') to return the instance.
 */
var Director = Obj.extend(/** @scope cocos.Director# */{
    canvas: null,
    context: null,
    sceneStack: null,
    winSize: null,
    isPaused: false,

    // Time delta
    dt: 0,
    nextDeltaTimeZero: false,
    lastUpdate: 0,

    _nextScene:null,

    init: function() {
        this.set('sceneStack', []);
    },

    /**
     * Append to a HTML element. It will create a canvas tag
     */
    attachInView: function(view) {
        if (!view.tagName) {
            throw "Director.attachInView must be given a HTML DOM Node";
        }

        while (view.firstChild) {
            view.removeChild(view.firstChild);
        }

        var canvas = this.set('canvas', document.createElement('canvas'));
        canvas.setAttribute('width', view.clientWidth);
        canvas.setAttribute('height', view.clientHeight);

        var context = this.set('context', canvas.getContext('2d'));

        view.appendChild(canvas);

        this.set('winSize', {width: view.clientWidth, height: view.clientHeight});


        // Setup event handling

        // Mouse events
        var touchDispatcher = TouchDispatcher.get('sharedDispatcher');
        function mouseDown(evt) {
            var touch = {location: ccp(evt.offsetX, evt.offsetY)};

            function mouseMove(evt) {
                touch.location = ccp(evt.offsetX, evt.offsetY);

                touchDispatcher.touchesMoved({touches: [touch], event:evt});
            };
            function mouseUp(evt) {
                touch.location = ccp(evt.offsetX, evt.offsetY);

                document.body.removeEventListener('mousemove', mouseMove, false);
                document.body.removeEventListener('mouseup',   mouseUp,   false);


                touchDispatcher.touchesEnded({touches: [touch], event:evt});
            };

            document.body.addEventListener('mousemove', mouseMove, false);
            document.body.addEventListener('mouseup',   mouseUp,   false);

            touchDispatcher.touchesBegan({touches: [touch], event:evt});
        };
        canvas.addEventListener('mousedown', mouseDown, false);

        // Keyboard events
        var keyboardDispatcher = KeyboardDispatcher.get('sharedDispatcher');
        function keyDown(evt) {
            keyboardDispatcher.keyDown({event: evt})
        }
        function keyUp(evt) {
            keyboardDispatcher.keyUp({event: evt})
        }
        function keyPress(evt) {
            keyboardDispatcher.keyPress({event: evt})
        }
        document.documentElement.addEventListener('keydown', keyDown, false);
        document.documentElement.addEventListener('keyup', keyUp, false);
        document.documentElement.addEventListener('keypress', keyPress, false);
    },

    /**
     * Enters the Director's main loop with the given Scene. Call it to run
     * only your FIRST scene. Don't call it if there is already a running
     * scene.
     *
     * @param {cocos.Scene} scene The scene to start
     */
    runWithScene: function(scene) {
        if (!(scene instanceof Scene)) {
            throw "Director.runWithScene must be given an instance of Scene";
        }

        this.pushScene(scene);
        this.startAnimation();
    },

    /**
     * Replaces the running scene with a new one. The running scene is
     * terminated. ONLY call it if there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to replace with
     */
    replaceScene: function(scene) {
    },

    /**
     * Pops out a scene from the queue. This scene will replace the running
     * one. The running scene will be deleted. If there are no more scenes in
     * the stack the execution is terminated. ONLY call it if there is a
     * running scene.
     */
    popScene: function() {
    },

    /**
     * Suspends the execution of the running scene, pushing it on the stack of
     * suspended scenes. The new scene will be executed. Try to avoid big
     * stacks of pushed scenes to reduce memory allocation. ONLY call it if
     * there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to add to the stack
     */
    pushScene: function(scene) {
        this._nextScene = scene;
    },

    /**
     * The main loop is triggered again. Call this function only if
     * cocos.Directory#stopAnimation was called earlier.
     */
    startAnimation: function() {
        animationInterval = 1.0/30;
        this._animationTimer = setInterval(sys.callback(this, 'mainLoop'), animationInterval * 1000);
    },

    /**
     * Stops the animation. Nothing will be drawn. The main loop won't be
     * triggered anymore. If you want to pause your animation call
     * cocos.Directory#pause instead.
     */
    stopAnimation: function() {
    },

    /**
     * Calculate time since last call
     * @private
     */
    calculateDeltaTime: function() {
        var now = (new Date).getTime() /1000;

        if (this.nextDeltaTimeZero) {
            this.dt = 0;
            this.nextDeltaTimeZero = false;
        }

        this.dt = Math.max(0, now - this.lastUpdate);

        this.lastUpdate = now;
    },

    /**
     * The main run loop
     * @private
     */
    mainLoop: function() {
        this.calculateDeltaTime();

        if (!this.isPaused) {
            Scheduler.get('sharedScheduler').tick(this.dt);
        }


        var context = this.get('context');
        context.fillStyle = 'rgb(0, 0, 0)';
        context.fillRect(0, 0, this.winSize.width, this.winSize.height);

        if (this._nextScene) {
            this.setNextScene();
        }

        this._runningScene.visit(context);

        this.displayFPS();
    },

    /**
     * Initialises the next scene
     * @private
     */
    setNextScene: function() {
        // TODO transitions

        this._runningScene = this._nextScene;

        this._nextScene = null;

        this._runningScene.onEnter();
    },

    /** @field
     * Whether or not to display the FPS on the bottom-left corner
     * @type Boolean
     */
    displayFPS: function() {
    }.property()

});

/**
 * Class methods
 */
sys.extend(Director, /** @scope cocos.Director */{
    /** @field
     * A shared singleton instance of cocos.Director
     * @type cocos.Director
     */
    sharedDirector: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.Director = Director;