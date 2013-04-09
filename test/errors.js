var rupert = require('../');
var expect = require('chai').expect;

describe('error handling', function () {
  it('on task failure, other executing tasks can still complete', function (done) {
    // Once failtask detects that passtask has started, it errors and sets up
    // completion of pass task. The expectation is that passtask will complete
    // rather than hang or process crash.
    var passStarted = false;
    var passDone = false;
    var failStarted = false;
    var failDone = false;
    var tasks = {
      failtask: function (cb) {
        failStarted = true;
        if (passStarted) {
          failDone = true;
          cb(new Error('failtask'));
        } else {
          // wait for passtask to start
          setTimeout(tasks.failtask, 1);
        }
      },
      passtask: function (cb) {
        passStarted = true;
        setTimeout(function () {
          passDone = true;
          cb(null);
        }, 100);
      }
    };

    rupert(tasks, { passtask: [], failtask: [] }, function (err) {
      expect(failStarted);
      expect(passStarted);
      expect(failDone);
      expect(passDone);

      expect(err).is.not.null;
      expect(err.innerErrors.failtask).is.not.null;
      expect(err.innerErrors.failtask.message).equals('failtask');
      done();
    });
  });

  it('on task failure, pass error to completion callback and emit error event', function (done) {
    var tasks = {
      task: function (cb) { cb(null); },
      failtask: function (cb) { cb(new Error('bogus')); }
    };
    testErrorReported(tasks, done);
  });

  it('on task exception, pass error to completion callback and emit error event', function (done) {
    var tasks = {
      task: function (cb) { cb(null); },
      failtask: function (cb) { throw new Error('bogus'); }
    };
    testErrorReported(tasks, done);
  });

  it('on multiple exceptions, aggregate errors into one error object', function (done) {
    var error1 = new Error('error1');
    var error2 = new Error('error2');
    var tasks = {
      failtask: function (cb) { throw error1; },
      failtask2: function (cb) { throw error2; }
    };
    var r = rupert(tasks, { failtask: [], failtask2: [] }, function (err) {
      expect(err).not.null;
      expect(err.message).equals('Task(s) failed - check innerErrors for details.');
      expect(Object.keys(err.innerErrors).length).equals(2);
      expect(err.innerErrors.failtask).equals(error1);
      expect(err.innerErrors.failtask2).equals(error2);
      done();
    });
  });

  function testErrorReported(tasks, done) {
    var callbackCalled = false;
    var errorCalled = false; // ensures error raised before completion callback
    var r = rupert(tasks, {'task': ['failtask']}, function (err) {
      expect(err).not.null;
      expect(err.message).equals('Task(s) failed - check innerErrors for details.');
      expect(callbackCalled).is.false;
      expect(errorCalled).is.true;
      callbackCalled = true;
      done();
    });
    r.on('error', function (err) {
      expect(err).not.null;
      expect(err.message).equals('bogus');
      expect(callbackCalled).is.false;
      expect(errorCalled).is.false;
      errorCalled = true;
    });
  }
});
