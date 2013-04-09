var domainit = require('domainit'),
  events = require('events'),
  PlanState = require('./plan_state');

module.exports = function (taskImplementations, planNames, callback) {
  var emitter = new events.EventEmitter();
  var ps = new PlanState(planNames);
  var errors = {};
  var callerNotified = false;

  function queueReadyTasks() {
    if (ps.allDone()) {
      if (!callerNotified) {
        callerNotified = true;
        var errorCount = Object.keys(errors).length;
        callback(errorCount === 0 ? null : getAggregateError());
      }
      return;
    }

    var next;
    for (next = ps.next(); next; next = ps.next()) {
      ps.start(next);
      queueTask(next); // use separate function, so 'next' isn't captured in closure
    }
  }

  function queueTask(next) {
    var safeTask = domainit(function (cb) {
      process.nextTick(function () {
        invokeTask(next, cb);
      });
    });

    safeTask(function (err) {
      if (!err) {
        ps.complete(next);
      } else {
        ps.fail(next);
        errors[next] = err;
        emitErrorIfListeners(emitter, err);
      }
      queueReadyTasks();
    });
  }

  // Ensures callback always happens on a separate tick.
  function invokeTask(name, cb) {
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

    function taskDone(err) {
      if (err) {
        cb(err);
      } else {
        cb(null);
      }
    }
  }

  function getAggregateError() {
    var error = new Error('Task(s) failed - check innerErrors for details.');
    error.innerErrors = errors;
    return error;
  }

  return {
    start: function () {
      process.nextTick(queueReadyTasks);
    },
    emitter: emitter
  };
};

function emitErrorIfListeners(emitter, err) {
  if (emitter.listeners('error').length > 0) {
    // don't require all users to listen for error event
    // they may only care about final result through callback
    emitter.emit('error', err);
  }
}
