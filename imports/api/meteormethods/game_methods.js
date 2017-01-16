import { Meteor } from 'meteor/meteor';

import { Progress } from '../progress.js';
import { Parameters } from '../parameters.js';
import { Participants } from '../participants.js';
import { Session } from '../session.js';
import { Logger } from '../logging.js';
import { Payouts } from '../payouts.js';
import {Tasks} from '../tasks';

let bar = {
    correctResponse: 1
};

Meteor.methods({
    /* update participant's annotation */
    updateAnnotation: function(newAnnotation) {
        //TODO this is a dead end, session doesn't have an updateAnnotation
        Session.updateAnnotation(Meteor.userId(), newAnnotation);
    },

    recordUserResponse: function (userID, response) {
        //get WeightTracker for the given task.
        let taskID = Session.getUserTaskID(userID);
        let task = Tasks.TasksInfo.findOne(taskID);
        //TODO testing code, remove when not needed
        if (!task) {
            task = bar;
        }

        //assuming task has a WeightTracker
        if (!task.weightTracker) {
            if (Progress.trainingInProgress) {
                //TODO How do we get the correct response?
                task.weightTracker = new Session.TrainingWeightTracker(taskID, task.correctResponse)
            } else {
                task.weightTracker = new Session.WeightTracker(taskID);
            }
        }
        let wt = task.weightTracker;
        wt.addResponse(userID, response);
        Session.updateUpperWeight(userID);
        //assuming that after batchSize answers have come in, we're good
        if (wt.doneUsersCount === Session.batchSize) {

            let sortedUsers = wt.getSortedUsers();
            _.forEach(sortedUsers.correct, (userID) => {
                Session.updateWeight(userID, Session.stdWeightUpdate);
            });
            _.forEach(sortedUsers.incorrect, (userID) => {
                Session.updateWeight(userID, -1 * Session.stdWeightUpdate);
            });
            Session.updateRanking();
        }

        //TODO update task in db (uncomment this code)
        //Tasks.TasksInfo.update(taskID, task);
    },

    fetchTaskImageForUser: function (userID) {
        //TODO have this return the image for the task this user is on
    },

    advanceUser: function (userID) {
        //TODO flesh this out
        /*
         get the next task
         if there isnt one, send them somewhere to wait
         return the task image if there is
         */
    }
});


