var rupert = require('../');
var expect = require('chai').expect;

describe('error handling', function () {
  it('pass task exceptions to completion callback', function (done) {
    var tasks = { failtask: function (cb) { throw new Error('bogus'); } };
    var r = rupert(tasks, {'failtask': []}, function (err) {
      expect(err).not.null;
      expect(err.message).not.null;
      done();
    });
  });

  it('emit "error" event for exceptions', function (done) {
    var called = false, errorCalled = false;
    var tasks = {
      task: function (cb) { called = true; cb(null); },
      failtask: function (cb) { throw new Error('bogus'); }
    };
    var r = rupert(tasks, {'task': ['failtask']}, function () {
      expect(errorCalled).is.true;
      done();
    });
    r.on('error', function (err) {
      expect(err).not.null;
      expect(err.message).equals('bogus');
      expect(errorCalled).is.false;
      errorCalled = true;
    });
  });

  it('emit "error" event for errors in callback');
});

