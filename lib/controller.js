var events = require('events'),
  PlanState = require('./plan_state');

module.exports = function (taskImplementations, planNames, callback) {
  var emitter = new events.EventEmitter();
  var ps = new PlanState(planNames);
  var errors = {};
  var callerNotified = false;
  var pipeline = [ require('../plugins/domainIsolate')() ];

  emitter.pipeline = {
    add: function (middleware) { pipeline.push(middleware); }
  };

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
    process.nextTick(function () {
      var i = 0;
      var cont = function (cb) {
        if (i < pipeline.length) {
          pipeline[i++].execute(cont, cb);
        } else {
          invokeTask(next, cb);
        }
      };

      cont(function (err) {
        if (!err) {
          ps.complete(next);
          emitter.emit('taskComplete', next);
        } else {
          ps.fail(next);
          errors[next] = err;
          emitter.emit('taskFail', next, err);
        }
        queueReadyTasks();
      });
    });
  }

  // Ensures callback always happens on a separate tick.
  function invokeTask(name, cb) {
    var invoked = false;
    emitter.emit('taskStart', name);
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
