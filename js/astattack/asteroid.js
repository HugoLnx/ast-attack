(function(namespace) {
  var SolidPhysicObject = LNXGames.SolidPhysicObject;
  var StateMachine = LNXGames.StateMachine;
  var Callbacks = LNXCommons.CallbackHelper;
  var Config = LNXGames.Config;

  namespace.Asteroid = function(x, y) {
    var callbacks = Callbacks.initializeFor(this);
    var myself = this;
    var healthPoints = 100;
    var X_SPEED = 3;
    var Y_SPEED = 3;
    var physic = new SolidPhysicObject(x, y, 45, 45, "asteroid");
    var directionX = "";
    var directionY = "";
    var statesMachine = new StateMachine({
      start: "standing",
      states: {
        "moving" : {
          action: function() {
            
          },
          transitions: {
            "destroyed": "destroyed",
            "hitByProjectile" : "moving",
            "stop": "standing",
            "stopX": "moving",
            "stopY": "moving",
            "moveLeft": "moving",
            "moveRight": "moving",
            "moveUp": "moving",
            "moveDown": "moving"
          }
        },
        "standing" : {
          action: function() {
            physic.velocityX(0);
            physic.velocityY(0);

            directionY = "";
            directionX = "";
          },
          transitions: {
            "destroyed": "destroyed",
            "hitByProjectile" : "standing",
            "moveLeft": "moving",
            "moveRight": "moving",
            "moveUp": "moving",
            "moveDown": "moving"
          }
        },

        "destroyed" : {
          action: function() {
            console.log("i am dead");
            physic.velocityX(0);
            physic.velocityY(0);
          }
        }
        
      },
          
      passiveTransitions: [
        "stop"
      ],
      
      activeTransitions: {
        "moveRight": function() { directionX = "right"; isOutOfScreenRight() ? physic.velocityX(X_SPEED) : physic.velocityX(0);},
        "moveLeft": function()  { directionX = "left";  isOutOfScreenLeft() ? physic.velocityX(-1*X_SPEED) : physic.velocityX(0); },
        "moveUp": function()    { directionY = "up";    isOutOfScreenTop() ? physic.velocityY(Y_SPEED) : physic.velocityY(0); },
        "moveDown": function()  { directionY = "down";  isOutOfScreenBottom() ? physic.velocityY(-1*Y_SPEED) : physic.velocityY(0); },
        "stopX": function()     { directionX = "";      physic.velocityX(0); },
        "stopY": function()     { directionY = "";      physic.velocityY(0); },
        "hitByProjectile": function() { 
          healthPoints = healthPoints - 1; 
          if(healthPoints <= 0){
            callbacks.emit("lifeOver");
            statesMachine.applyTransition("destroyed");
          }
        }
      }
    });

    function isOutOfScreenRight() {
      return physic.x < Config.screenWidth() - 50;
    }

    function isOutOfScreenLeft() {
      return physic.x > 0;
    }

    function isOutOfScreenTop() {
      return physic.y < 600;
    }

    function isOutOfScreenBottom() {
      return physic.y > 50;
    }

    this.init = function() {
      physic.listen("collision", function(obj) {
        if(obj.type === "shot"){
          statesMachine.applyTransition("hitByProjectile");
        }else if(obj.type === "ship"){
          callbacks.emit("shipDestroyed");
        }
      });

      statesMachine.listen("stateChange", function(newState, transition, previousState) {
        callbacks.emit("stateChange", [newState, directionX, directionY]);
      });
      callbacks.emit("stateChange", [statesMachine.state(), directionX, directionY]);
    }

    this.act = function(action) {
      statesMachine.applyTransition(action);
    };

    this.update = function() {
      statesMachine.executeCurrentState();
    };

    this.physic = function(){ return physic; };

    this.healthPoints = function(){ return healthPoints; };
  };
}(LNXAstAttack = window.LNXAstAttack || {}));
