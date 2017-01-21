// import { TurkServer } from 'meteor/mizzao'; ?
import { Session } from './session.js';

/* TBD: logger.js needs to be modified later */
// import { Logger } from './logging.js';

import { ParticipantsInfo } from './collections/game_collections.js';
import { Parameters } from './parameters.js';
import { PilotExperiment } from './collections/external_collections.js';
import { TasksInfo } from './collections/game_collections.js'
import { Utilities } from './util.js';


export var Tasks = {
    TasksInfo: TasksInfo,

    //TODO Training task list needs to be set up
    // record all tasks' id
    tasksId: [],

    // record each task's annotation
    // tasks_annotation[someTasksId] returns the annotation learned from crowd for this task
    tasks_annotation: {},

    // record tasks in each batch
    // batch_tasks[someBatchId] returns all tasks in it (the IDs)
    batch_tasks: {},


    initializeTasksId: function() {
        TasksInfo.find().forEach(function(item) {
            this.tasksId.push(item.id);
        });
    },

    initializeTasksAnnotation: function() {
        // initialize all tasks' annotation as 0
        TasksInfo.find().forEach(function(item) {
            this.tasks_annotation[item.id] = 0;
        });
    },

    initializeBatchTasks: function(batchNumber) {
        for ( var i = 0; i < batchNumber; i++ ) {
            this.batch_tasks[i] = [];
        }
    },

    // this should be run 
    initializeTasks: function() {
        var _batchNumber = Session.numBatches;
        /* how to handle exceptions? */
        this.initializeTasksId();
        this.initializeTasksAnnotation();
        this.initializeBatchTasks(_batchNumber);
    }
};

var assignTasksToBatches = function() {
    // each batch will have a fixed number of tasks
    for (var i = 0; i < Session.numBatches; i++) {
        /* in-place shuffle */
        Utilities.shuffle(this.tasksId);
        for (var j = 0; j < Parameters.numTasksEachBatch; j++) {
            this.batch_tasks[i].push(this.tasksId[j]);
        }
    }
};








