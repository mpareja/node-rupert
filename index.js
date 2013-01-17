var async = require('async'),
  events = require('events'),
  generateExecutionPlan = require('./lib/plan_builder');

module.exports = function (taskImplementations, planNames, callback) {
  var emitter = new events.EventEmitter();
  var plan = generateExecutionPlan(taskImplementations, planNames, performTask, callback);
  process.nextTick(function () {
    async.auto(plan, callback);
  });
  
  return emitter;

  function performTask(name, cb) {
    try {
      // if task completes immediately, execute callback on next tick for consistency
      var invoked = false;
      taskImplementations[name](function (err) {
        if (invoked) {
          taskDone(err);
        } else {
          process.nextTick(function () {
            taskDone(err);
          });
        }
      });
      invoked = true;
    } catch (e) {
      process.nextTick(function () {
          taskDone(e);
      });
    }

    function taskDone(err) {
      if (err) {
        safeEmitError(emitter, err);
        cb(err);
      } else {
        cb(null);
      }
    }
  }
};

function safeEmitError(emitter, err) {
  if (emitter.listeners('error').length > 0) {
    // don't require all users to listen for error event
    // they may only care about final result through callback
    emitter.emit('error', err);
  }
}

