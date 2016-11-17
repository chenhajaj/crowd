// import { TurkServer } from 'meteor/mizzao'; ?
import { Session } from './session.js';
import { Logger } from './logging.js';
import { ParticipantsInfo } from './collections/game_collections.js';
import { Parameters } from './parameters.js';
import { PilotExperiment } from './collections/external_collections.js';
import { TasksInfo } from './collections/game_collections.js'
import { Utilities } from './util.js';


export var Tasks = {
    TasksInfo: TasksInfo,

    // how many tasks for each batch
    numTasksEachBatch: 150,

    // record all tasks' id
    tasksId: [],

    // record each task's annotation
    // tasks_annotation[someTasksId] returns the annotation learned from crowd for this task
    tasks_annotation: {},

    // record tasks in each batch
    // batch_tasks[someBatchId] returns all tasks in it 
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
        var _batchNumber = Session.batchNumber;
        this.initializeTasksId();
        this.initializeTasksAnnotation();
        this.initializeBatchTasks(_batchNumber);
    }
};

var assignTasksToBatches = function() {
    // each batch will have a fixed number of tasks
    for ( var i = 0; i < Session.batchNumber; i++ ) {
        Utilities.shuffle(this.tasksId);
        for ( var j = 0; j < this.numTasksEachBatch; j++ ) {
            this.batch_tasks[i].push(this.tasksId[j]);
        }
    }
};






