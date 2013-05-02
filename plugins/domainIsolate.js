module.exports = {
  execute: function (task, callback) {
    var domainit = require('domainit');
    var safeTask = domainit(task);
    safeTask(callback);
  }
};
