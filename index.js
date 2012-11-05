var async = require('async');
module.exports = function (taskImplementations, planNames, callback) {
  throwIfMissingTasks();

  async.auto(generateExecutionPlan(), callback);

  function throwIfMissingTasks() {
    var alltaskNames = getAllNamedTasks();
    var missingTaskNames = alltaskNames.filter(function (name) { return typeof taskImplementations[name] !== 'function'; });
    if (missingTaskNames.length > 0) {
      throw new Error('No implementation provided for task(s): ' + missingTaskNames.join(', '));
    }
  }

  // NOTE: may return duplicates, we don't care above...
  function getAllNamedTasks() {
    var planTaskNames = Object.keys(planNames);
    var alltaskNames = [].concat(planTaskNames); // clone it
    planTaskNames.forEach(function (name) {
      alltaskNames = alltaskNames.concat(planNames[name]);
    });
    return alltaskNames;
  }

  function generateExecutionPlan() {
    var p = {}, rootPlanNames = Object.keys(planNames);

    // bind tasks in plan to dependencies and function
    rootPlanNames.forEach(include);

    // find all task names which were not named at the root
    var dependenciesOnly = getAllNamedTasks().filter(function (name) { return !planNames.hasOwnProperty(name); })
    dependenciesOnly.forEach(include);

    function include(name) {
      var depNames = planNames[name];
      if (depNames && depNames.length > 0) {
// include an array with dependencies and the function
        p[name] = depNames.concat(execute);
      } else {
// include only the the function
        p[name] = execute;
      }

      function execute(cb) {
        taskImplementations[name](cb);
      }
    }
    return p;
  }
};
