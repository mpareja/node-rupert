var rupert = require('../');
var expect = require('chai').expect;

describe('error handling', function () {
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

  function testErrorReported(tasks, done) {
    var errorCalled = false; // ensures error raised before completion callback
    var r = rupert(tasks, {'task': ['failtask']}, function (err) {
      expect(err).not.null;
      expect(err.message).equals('bogus');
      expect(errorCalled).is.true;
      done();
    });
    r.on('error', function (err) {
      expect(err).not.null;
      expect(err.message).equals('bogus');
      expect(errorCalled).is.false;
      errorCalled = true;
    });
  }

  it('emit "error" event for errors in callback');
});

