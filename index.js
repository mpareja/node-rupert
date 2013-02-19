var createController = require('./lib/controller');

module.exports = function (taskImplementations, planNames, callback) {
  function main() {
    throwIfMissingTasks();

    var c = createController(taskImplementations, planNames, callback || function () {});
    c.start();
    return c.emitter;
  }

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

  return main();
};

