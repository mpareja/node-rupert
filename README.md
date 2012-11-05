# Rupert - pain-free async task runner with logging

Hand Rupert a set of tasks including how they depend on each other and he'll take care of parallelizing them where possible. Rupert will stream task output to the console for your immediate viewing pleasure. He'll also stream each task's output to a separate log file so you can view it in isolation.

## Usage

Rupert needs to know how to perform each task, how tasks are related and what tasks to execute. Rupert's a friendly guy, so he accepts tasks in a couple ways. You can give him a set of tasks to be performed together with their dependencies and a function for performing the work, or you can split up the definations for how to perform the tasks from the list of tasks to perform and how they're related.

### Defining tasks and execution plan separately

Separating _how_ a task is performed from _what_ tasks to perform makes reasoning about the process as a whole a lot easier. Rupert appreciates the simplicity that comes from having a list of tasks and their dependencies fit on a single screen. He doesn't take insult to the fact that your task implementations will never `require` him.

rupert(tasks, plan, callback)

First, create an object or a class instance with methods for each task.

		var tasks = {
			clean: function (cb) { console.log('Cleaning.'); },
			updateX: function (cb) { console.log('Updating x.'); },
			updateY: function (cb) { console.log('Updating y.'); }
		};

Next, create an object listing all of the tasks you want Rupert to execute. For each task, specify the task name as the key and an array of other task names that must first be completed as the value.

		var plan = {
			applyBackCompatibleDbChanges: [],
			useTransDbForReporting: [],

			stopSystemJobs: ['applyBackCompatibleDbChanges'],
			deploySystemJobs: ['stopSystemJobs'],

			updateLmsLanguageStrings: ['stopSystemJobs'],
			applyNewDbChanges', ['updateLmsLanguageStrings'],
			deployReports', ['applyNewDbChanges'],

			applyReplicationChanges', ['applyNewDbChanges'],
			applyReportingDbChanges', ['applyReplicationChanges'],
			useReportingDbForReporting', ['applyReportingDbChanges']
		};

Finally, put it all in Rupert's capable hands and he'll let you know when he's done.

		var rupert = require('rupert');
		rupert(tasks, plan, function (err) {
			console.log(err ? 'FAIL!' : 'Done.');
		});

### Defining tasks and execution plan together (not implemented)

