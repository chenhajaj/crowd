import { Meteor } from 'meteor/meteor';

import { Progress } from '../progress.js';
import { Parameters } from '../parameters.js';
import { Participants } from '../participants.js';
import { Session } from '../session.js';
import { Logger } from '../logging.js';
import { Payouts } from '../payouts.js';
import {Tasks} from '../tasks';

let bar = {};

Meteor.methods({
    /* update participant's annotation */
    updateAnnotation: function(newAnnotation) {
        //TODO this is a dead end, session doesn't have an updateAnnotation
        Session.updateAnnotation(Meteor.userId(), newAnnotation);
    },

    recordUserResponse: function (taskID, userID, response) {
        //get WeightTracker for the given task.
        let task = Tasks.TasksInfo.findOne(taskID);
        if (!task) {
            task = bar;
        }

        //assuming task has a WeightTracker
        if (!task.weightTracker) {
            task.weightTracker = new Session.WeightTracker(taskID);
        }
        let wt = task.weightTracker;
        wt.addResponse(userID, response);
        //TODO Users per task?
        if (wt.doneUsersCount === 10) {
            //woo we done
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
    }
});

