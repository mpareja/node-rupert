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
});
