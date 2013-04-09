var expect = require('chai').expect;
var rupert = require('..');
var path = require('path');
var handled = false;

var tasks = { task: function (cb) {
  process.nextTick(function () {
    throw new Error('bogus');
  });
}};

process.on('exit', function () {
  expect(handled).is.true;
  console.log(path.basename(__filename) + ' done.');
});

rupert(tasks, { task: [] }, function (err) {
  expect(err).is.not.null;
  expect(err.innerErrors.task.message).equals('bogus');
  handled = true;
});

