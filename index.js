var async = require('async');
module.exports = function (tasks, plan, callback) {
  throwIfMissingTasks();

  var fns = Object.keys(plan).map(function (task) {
    return function (cb) {
      tasks[task](cb);
    };
  });
  async.parallel(fns, callback);

  function throwIfMissingTasks() {
    var alltasks = getAllNamedTasks();
    var missingTasks = alltasks.filter(function (task) { return typeof tasks[task] !== 'function'; });
    if (missingTasks.length > 0) {
      throw new Error('No implementation provided for task(s): ' + missingTasks.join(', '));
    }
  }

  // NOTE: may return duplicates, we don't care above...
  function getAllNamedTasks() {
    var planTasks = Object.keys(plan);
    var alltasks = [].concat(planTasks); // clone it
    planTasks.forEach(function (task) {
      alltasks = alltasks.concat(plan[task]);
    });
    return alltasks;
  }
};
