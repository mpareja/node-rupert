var domain = require('domain');
var seq = 0;

module.exports = function () {
  return {
    execute: function (task, callback) {
      if (domain.active) {
        domain.active.domainStreamOutTask = seq++;
      }
    }
  };
};
// HERE: implement baby

/* Usage:
	r.executionPipeline.add(rupert.domainStreamOut());

	rupert.domainStreamOut.on('start', function (task) {
		console.log('Starting ' + task.name);
		var out = outstreams[task.name] = fs.openWriteStream(task.name + '.log');
		task.stdout.pipe(out);
		task.stderr.pipe(out);
	});
*/
