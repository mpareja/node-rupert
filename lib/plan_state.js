function Entry(name) {
  this.name = name;
  this.started = false;
  this.completed = false;
  this.failed = false;
  this.dependencies = [];
}

Entry.prototype.start = function() {
  if (this.ready()) {
    this.started = true;
  } else {
    throw new Error('Unable to start "' + this.name +
      '" because it is waiting for one or more tasks.');
  }
};

Entry.prototype.complete = function() {
  if (this.failed) {
    throw new Error('Unable to complete "' + this.name +
      '" because it already failed.');
  } else if (this.started) {
    this.completed = true;
  } else {
    throw new Error('Unable to complete "' + this.name +
      '" because it has not been started.');
  }
};

Entry.prototype.fail = function() {
  if (this.started) {
    this.failed = true;
  } else {
    throw new Error('Unable to fail "' + this.name +
      '" because it has not been started.');
  }
};

Entry.prototype.isDone = function () {
  return this.completed || this.failed;
};

Entry.prototype.ready = function () {
  return !this.started && !this.isDone() &&
    this.dependencies.every(function (dep) {
      return dep.isDone();
    });
};

function PlanState (planNames) {
  if (!(this instanceof PlanState)) {
    return new PlanState(planNames);
  }
  var entries = this.entries = {};

  // task name => Entry with references to dependant Entries
  Object.keys(planNames).forEach(function (name) {
    entries[name] = new Entry(name);
  });

  Object.keys(planNames).forEach(function (name) {
    entries[name].dependencies = planNames[name].map(function (dep) {
      // if entry wasn't previously added, assume it hasn't dependencies and add it
      return entries[dep] || (entries[dep] = new Entry(dep));
    });
  });

  this.entriesArray = Object.keys(this.entries).map(function (name) {
    return entries[name];
  });
}

PlanState.prototype.next = function () {
  for (var i = 0; i < this.entriesArray.length; i++) {
    var entry = this.entriesArray[i];
    if (entry.ready()) {
      return entry.name;
    }
  }
  return null;
};

PlanState.prototype.start = function(name) {
  this._apply('start', name);
};

PlanState.prototype.complete = function (name) {
  this._apply('complete', name);
};

PlanState.prototype.fail = function (name) {
  this._apply('fail', name);
};

PlanState.prototype.allDone = function () {
  return this.entriesArray.every(function (entry) {
    return entry.isDone();
  });
};

PlanState.prototype._apply = function (functionName, entryName) {
  var entry = this.entries[entryName];
  if (entry) {
    entry[functionName]();
  }
};

module.exports = PlanState;
