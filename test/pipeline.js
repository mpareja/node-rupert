var expect = require('chai').expect,
  rupert = require('../');

describe('pipeline', function () {
  it('execute functions in order', function (done) {
    var calls = [];
    var tasks = { mytask: function (cb) { calls.push('task'); cb(null); } };
    var r = rupert(tasks, { mytask: [] }, complete);
    r.pipeline.add({
      execute: function (fn, cb) { calls.push('first'); fn(cb); }
    });
    r.pipeline.add({
      execute: function (fn, cb) { calls.push('second'); fn(cb); }
    });

    function complete(err) {
      if (err) { throw err; }
      expect(calls).deep.equals(['first', 'second', 'task']);
      done();
    }
  });
});
