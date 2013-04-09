var domain = require('domain');
var expect = require('chai').expect;
var rupert = require('..');
var path = require('path');
var handled = false;
var caught = false;

var tasks = { task: function (cb) { cb(null); } };

process.on('uncaughtException', function (err) {
  caught = true;
  expect(err.message === 'bogus');
});

process.on('exit', function () {
  expect(handled).is.true;
  expect(caught).is.true;
  console.log(path.basename(__filename) + ' done.');
});

rupert(tasks, { task: [] }, function (err) {
  expect(domain.active).is.undefined;
  expect(err).is.null;
  handled = true;
  throw new Error('bogus');
});

