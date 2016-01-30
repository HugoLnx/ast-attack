(function(namespace) {
  var SolidPhysicObject = LNXGames.SolidPhysicObject;
  var StateMachine = LNXGames.StateMachine;
  var Callbacks = LNXCommons.CallbackHelper;

  namespace.SpaceshipSpinnerL2 = function(x, y, shotCont) {
    var callbacks = Callbacks.initializeFor(this);
    var myself = this;
    var shotController = shotCont;
    var X_SPEED = -0.3;
    var Y_SPEED = 0;
    var angle = 180;
    var physic = new SolidPhysicObject(x, y, 45, 45, "ship");
    var statesMachine = new StateMachine({
      start: "moving",

      timedTransitions: {
        "shoot": [{"3s": "shootProjectile"}]
      },

      states: {
        "moving" : {
          action: function() {
            physic.velocityX(X_SPEED);
            physic.velocityY(0);
          },
          transitions: {
            "shootProjectile" : "moving",
            "exploding" : "exploding"
          }
        },
        
        "exploding" : {
          action: function() {
            physic.velocityX(0);
            physic.velocityY(0);
          },
          transitions: {
            "end": "dead"
          }
        },

        "dead" : {
          action: function() {
            callbacks.emit("dead");
          },
          transitions: { }
        }
      },
          
      passiveTransitions: [ ],
      
      activeTransitions: { 
        "shootProjectile" : function(){
          for(var i = 0; i < 5; i++) {
            var shotAngle = angle + i*20;
            var rotVec = angleToVector(shotAngle);
            var shotVec = angleToVector((shotAngle+120)%360);
            shotController.create(physic.x+rotVec.x*20, physic.y+rotVec.y*20, shotVec.x*2, shotVec.y*2);
          }
          angle = (angle + 75) % 360;
        }
      }
    });

    function angleToVector(degrees) {
      return {
        x: Math.cos(degrees*Math.PI/180.0),
        y: Math.sin(degrees*Math.PI/180.0)
      };
    }

    this.init = function() {
      physic.listen("collision", function(obj) {
        if(obj.type === "asteroid")
          statesMachine.applyTransition("exploding");
      });

      statesMachine.listen("stateChange", function(newState) {
        callbacks.emit("stateChange", [newState]);
      });
      callbacks.emit("stateChange", [statesMachine.state()]);
    }

    this.act = function(action) {
      statesMachine.applyTransition(action);
    };

    this.update = function() {
      statesMachine.executeCurrentState();
    };

    this.physic = function(){ return physic; };
  };
}(LNXAstAttack = window.LNXAstAttack || {}));