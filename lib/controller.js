var events = require('events'),
  PlanState = require('./plan_state');

module.exports = function (taskImplementations, planNames, callback) {
  var emitter = new events.EventEmitter();
  var ps = new PlanState(planNames);
  var errors = {};
  var done = false;

  function queueReadyTasks() {
    if (ps.allDone()) {
      if (!done) {
        done = true;
        var errorCount = Object.keys(errors).length;
        /*jslint white: true */
        callback(
          errorCount === 0 ? null :
          errorCount === 1 ? errors[Object.keys(errors)[0]]
                           : errors);
      }
      return;
    }

    var next;
    while ((next = ps.next())) {
      ps.start(next);
      queueTask(next); // use separate function, so 'next' isn't captured in closure
    }
  }

  function queueTask(next) {
    process.nextTick(function () {
      invokeTask(next, function (err) {
        if (!err) {
          ps.complete(next);
        } else {
          ps.fail(next);
          errors[next] = err;
        }
        process.nextTick(queueReadyTasks);
      });
    });
  }

  // Executes a task in a consistent manner.
  // + Raises error on exception or error in callback.
  // + Ensures callback always happens on a separate tick.
  function invokeTask(name, cb) {
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

  return {
    start: function () {
      process.nextTick(queueReadyTasks);
    },
    emitter: emitter
  };
};

function safeEmitError(emitter, err) {
  if (emitter.listeners('error').length > 0) {
    // don't require all users to listen for error event
    // they may only care about final result through callback
    emitter.emit('error', err);
  }
}
