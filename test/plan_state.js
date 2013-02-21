var PlanState = require('../lib/plan_state');
var expect = require('chai').expect;
describe('PlanState', function () {
  it('knows to execute a single task', function () {
    var r = new PlanState({'first': []});
    expect(r.next()).equals('first');
  });

  it('knows to execute parallel tasks', function () {
    var r = new PlanState({'first': [], 'second': []});
    expect(r.next()).equals('first');
    r.start('first');
    expect(r.next()).equals('second');
  });

  it('knows to execute dependant task first', function () {
    var r = new PlanState({'first': ['second'], 'second': []});
    expect(r.next()).equals('second');
  });

  it('knows not to execute task with unfinished dependencies', function () {
    var r = new PlanState({'first': ['second'], 'second': []});
    expect(r.next()).equals('second');
    r.start('second');
    expect(r.next()).is.null;
  });

  it('knows to execute task when dependencies are met', function () {
    var r = new PlanState({'first': ['second'], 'second': []});
    expect(r.next()).equals('second');
    r.start('second');
    r.complete('second');
    expect(r.next()).equals('first');
  });

  it('knows if all tasks are complete', function () {
    var r = new PlanState({'first': []});
    expect(r.allDone()).is.false;
    r.start('first');
    r.complete('first');
    expect(r.allDone()).is.true;
  });

  it('knows not to execute subsequent tasks after a failure', function () {
    var ps = new PlanState({'first': [], 'second': ['first']});
    ps.start('first');
    ps.fail('first');
    expect(ps.next()).is.null;
    expect(ps.allDone()).is.true;
  });

  // The following tests prevent notifying PlanState of start, completion and failure
  // out of order. This may catch bugs while in development, but I fear enforcing this
  // may hamper our ability to add functionality in the future.

  it('prevents completing task before it is started', function () {
    var r = new PlanState({'first': []});
    expect(function () {
      r.complete('first');
    }).throws('Unable to complete "first" because it has not been started.');
  });

  it('prevents starting task before dependencies are met', function () {
    var r = new PlanState({'first': ['second'], 'second': []});
    expect(function () {
      r.start('first');
    }).throws('Unable to start "first" because it is waiting for one or more tasks.');
  });

  it('prevents completing task after it has failed', function () {
    var r = new PlanState({'first': []});
    expect(function () {
      r.start('first');
      r.fail('first');
      r.complete('first');
    }).throws('Unable to complete "first" because it already failed.');
  });
});
