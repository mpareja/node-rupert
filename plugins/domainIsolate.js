// due to wierd node bug, 'domain' needs to be required outside of nextTicks using them
var domainit = require('domainit');
module.exports = function () {
  return {
    execute: function (task, callback) {
      var safeTask = domainit(task);
      safeTask(callback);
    }
  };
};
