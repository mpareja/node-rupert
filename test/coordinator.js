var Coordinator = require('../lib/coordinator');
var expect = require('chai').expect;
describe('coordinator', function a8281d7ec1de53a22da675a7ed5374a8f138aa5d() {
  it('knows to execute a single task', function () {
    var r = Coordinator({'first': []});
    expect(r.next()).equals('first');
  });

  it('knows to execute parallel tasks', function () {
    var r = Coordinator({'first': [], 'second': []});
    expect(r.next()).equals('first');
    r.start('first');
    expect(r.next()).equals('second');
  });

  it('knows to execute dependant task first', function () {
    var r = Coordinator({'first': ['second'], 'second': []});
    expect(r.next()).equals('second');
  });

  it('knows not to execute task with unfinished dependencies', function () {
    var r = Coordinator({'first': ['second'], 'second': []});
    expect(r.next()).equals('second');
    r.start('second');
    expect(r.next()).is.null;
  });

  it('knows to execute task when dependencies are met', function () {
    var r = Coordinator({'first': ['second'], 'second': []});
    expect(r.next()).equals('second');
    r.start('second');
    r.complete('second');
    expect(r.next()).equals('first');
  });

  it('knows if all tasks are complete', function () {
    var r = Coordinator({'first': []});
    expect(r.allDone()).is.false;
    r.start('first');
    r.complete('first');
    expect(r.allDone()).is.true;
  });

  it('prevents completing task before it is started', function () {
    var r = Coordinator({'first': []});
    expect(function () {
      r.complete('first');
    }).throws('Unable to complete "first" because it has not been started.');
  });

  it('prevents starting task before dependencies are met', function () {
    var r = Coordinator({'first': ['second'], 'second': []});
    expect(function () {
      r.start('first');
    }).throws('Unable to start "first" because it is waiting for one or more tasks.');
  });

  it('prevents completing task after it has failed', function () {
    var r = Coordinator({'first': []});
    expect(function () {
      r.start('first');
      r.fail('first');
      r.complete('first');
    }).throws('Unable to complete "first" because it already failed.');
  });
});
