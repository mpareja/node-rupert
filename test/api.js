var rupert = require('../');
var should = require('should');
var expect = require('chai').expect;
var he = it;
describe('rupert', function () {
  he('executes a single task', function (done) {
    var executed = false;
    var tasks = { mytask: function (cb) { executed = true; cb(null); } };
    rupert(tasks, { mytask: [] }, function (err) {
      if (err) { throw err; }
      executed.should.equal(true);
      done();
    });
  });

  he('executes multiple tasks', function (done) {
    var t1 = false, t2 = false;
    var tasks = {
      task1: function (cb) { t1 = true; cb(null); },
      task2: function (cb) { t2 = true; cb(null); }
    };
    rupert(tasks, { task1: [], task2: [] }, function (err) {
      if (err) { throw err; }
      t1.should.equal(true);
      t2.should.equal(true);
      done();
    });
  });

  he('executes dependant tasks', function (done) {
    var root = false, leaf = false;
    var tasks = {
      root: function (cb) { root = true; cb(null); },
      leaf: function (cb) { leaf = true; cb(null); }
    };
    rupert(tasks, { root: ['leaf'] }, function (err) {
      if (err) { throw err; }
      root.should.equal(true);
      leaf.should.equal(true);
      done();
    });
  });

  he('raises taskStart when starting tasks', function (done) {
    var started = [];
    var tasks = {
      root: function (cb) { cb(null); },
      leaf: function (cb) { cb(null); }
    };
    var r = rupert(tasks, { root: ['leaf'] }, function (err) {
      if (err) { throw err; }
      expect(started.shift()).equals('leaf');
      expect(started.shift()).equals('root');
      done();
    });
    r.on('taskStart', function (task) {
      started.push(task);
    });
  });

  he('raises taskComplete when task completes successfully', function (done) {
    var completed = [];
    var tasks = {
      root: function (cb) { cb(null); },
      leaf: function (cb) { cb(null); }
    };
    var r = rupert(tasks, { root: ['leaf'] }, function (err) {
      if (err) { throw err; }
      expect(completed.shift()).equals('leaf');
      expect(completed.shift()).equals('root');
      done();
    });
    r.on('taskComplete', function (task) {
      completed.push(task);
    });
  });

  he('does not raise taskComplete on task failure', function (done) {
    var completed = [];
    var tasks = {
      root: function (cb) { cb(new Error()); },
      leaf: function (cb) { cb(null); }
    };
    var r = rupert(tasks, { root: ['leaf'] }, function (err) {
      expect(err).is.not.null;
      expect(completed.shift()).equals('leaf');
      expect(completed.shift()).is.undefined;
      done();
    });
    r.on('taskComplete', function (task) {
      completed.push(task);
    });
  });

  he('error on missing task', function () {
    expect(function () {
      rupert({}, { task1: [], task2: [] });
    }).throws('No implementation provided for task(s): task1, task2');
  });

  he('error on missing dependency', function () {
    expect(function () {
      rupert({ task1: function (cb) { cb(null); } }, { task1: ['task2'] });
    }).throws('No implementation provided for task(s): task2');
  });

  he('executes tasks on a later tick', function (done) {
    var taskDone = false;
    var tasks = { task: function (cb) { taskDone = true; cb(null); } };
    rupert(tasks, { task: [] });
    expect(taskDone).is.false;
    done();
  });

  he('ensures callback and events are not raised until future tick to allow listeners to be attached', function (done) {
    var tickHappened = false;
    process.nextTick(function () {
      tickHappened = true;
    });

    var tasks = { task: function (cb) { cb(new Error('enable checking error event')); } };
    var r = rupert(tasks, { task: [] }, function () {
      expect(tickHappened).is.true;
      done();
    });
  });
});
