var async = require('async');
module.exports = function (tasks, plan, callback) {
  var planTasks = Object.keys(plan);
  var missingTasks = planTasks.filter(function (task) { return typeof tasks[task] !== 'function'; });
  if (missingTasks.length > 0) {
    return callback(new Error('No implementation provided for task(s): ' + missingTasks.join(', ')));
  }

  var fns = Object.keys(plan).map(function (task) {
    return function (cb) {
      tasks[task](cb);
    };
  });
  async.parallel(fns, callback);
};
