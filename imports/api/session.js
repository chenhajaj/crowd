import {Parameters} from './parameters.js';
import {Participants} from './participants.js';

/* To be modified, uncomment later */
// import { Logger } from './logging.js';


import {SessionInfo} from './collections/game_collections.js';
import {Time} from './time.js';
import {Progress} from './progress.js';
import {terminateGame} from './experiment_control.js';
import {Tasks} from './tasks';


class WeightTrackerClass {
    //takes in a taskID, just in case we need it, this isn't necessary
    constructor(taskID) {
        //user responses is keyed on userID, values are responses
        this.userResponses = {};
        //responseUsers is keyed on responses, values are arrays of userIDs
        this.responseUsers = {};
        this.taskID = taskID;
    }

    //adds the response of user userID to this object
    addResponse(userID, response) {
        if (!_.includes(this.doneUsers, userID)) {
            //don't want to add a user twice
            if (this.responseUsers[response]) {
                this.responseUsers[response].push(userID);
            } else {
                this.responseUsers[response] = [userID];
            }
        }
        this.userResponses[userID] = response;
    }

    //array of users who have responded
    get doneUsers() {
        return _.keys(this.userResponses)
    }

    //how many users have responded
    get doneUsersCount() {
        return this.doneUsers.length;
    }

    //returns an object with 2 attributes, 'right' and 'wrong'.
    // Right users answered 'correctly', wrong users answered 'incorrectly'
    //this is determined by _determineCorrectResponse method
    getSortedUsers() {
        let res = {};
        let correct = this._determineCorrectResponse();
        //res.correct is all the users in the correct response array
        res.correct = this.responseUsers[correct];
        let self = this;
        //filter all doneUsers that didn't have correct as their response
        res.incorrect = _.filter(this.doneUsers, (user) => {
            return self.userResponses[user] != correct;
        });

        return res;
    }

    //determines the correct response for this task.
    _determineCorrectResponse() {
        let self = this;
        //returns the response with weighted majority vote
        //does so by calculating sum of user weights for each response
        return _.maxBy(_.keys(this.responseUsers), (response) => {
            return _.sumBy(self.responseUsers[response], (userID) => {
                return Session.trueWeights[userID];
            });
        })
    }
}

class TrainingWeightTrackerClass extends WeightTrackerClass {
    constructor(taskID, correctResponse) {
        super(taskID);
        this.correctResponse = correctResponse;
    }


    //determines the correct response for this task.
    _determineCorrectResponse() {
        //returns the response with the most users
        return this.correctResponse;
    }
}

// includes Communcation Management
export var Session = {
    SessionInfo: SessionInfo,

    sessionNumber: 0,   // current Session
    numBatches: 0,  // number of batches
    batchSize: 5,   // tmp value


    batch_rank: {}, // batch_rank[batchId][userId] returns userId's rank
    trueWeights: {}, // participants' trueWeights
    upperWeights: {}, //upper bound on participants' weigts
    batch_id: {}, // batch_id[batchId] returns userIds of participants in it

    userTasks: {}, // userTasks[userId] gives the index of the task in the batch this user is working on
    //ex: if uT[uid]=4, the user is working on the 4th task in that batch

    bonusThreshold: 3,  // top bonusThreshold participants can obtain bonus

    requestToBeAssignedNext: 1,
    requestToBeProcessedNext: 1,


    stdWeightUpdate: 1,
    /* TBD */
    checkResetBatch: function (isProperGames) {
        //
    },

    initializeWeights: function () {
        for (var i = 0; i < Participants.participantsQueue.length; i++) {
            /* participantsQueue should already be initialized */
            var _userId = Participants.participantsQueue[i];
            this.trueWeights[_userId] = 0;
            this.upperWeights[_userId] = 0;
        }
    },

    initializeBatch_Id: function () {
        for (var i = 0; i < this.numBatches; i++) {
            this.batch_id[i] = [];
        }
    },

    initializeSessionInfo: function () {
        this.sessionNumber = 0;
        // calculate how many batches we will have
        //TODO change this so its always 1!
        this.numBatches = Math.floor(Participants.participantsQueue.length / this.batchSize);

        SessionInfo.upsert({id: 'global'}, {
            $set: {
                sessionNumber: 0,
                numBatches: this.numBatches
            }
        });

        this.initializeWeights();
        this.initializeBatch_Id();
    },

    incrementSessionNumber: function () {
        this.sessionNumber++;

        SessionInfo.update({id: 'global'}, {
            $set: {
                sessionNumber: this.sessionNumber
            }
        });
    },


    updateWeight: function (userId, weightInc) {
        /* we currently don't need this */
        var requestNo = this.requestToBeAssignedNext;
        this.requestToBeAssignedNext++;

        this.trueWeights[userId] += weightInc;
        // userId's weight needs to be averaged ovr all games he/she participated
        this.trueWeights[userId] /= Participants.numGamesParticipated[userId];
        this.upperWeights[userId] = this.trueWeights[userId];
        /* Log entry. TBD */
        // Logger.recordRequestMade(userId, weightInc, requestNo);
    },

    updateUpperWeight: function (userID) {
        this.upperWeights[userId] += this.stdWeightUpdate;
        // userId's weight needs to be averaged ovr all games he/she participated
        /* async weight updating goes here! */
        this.upperWeights[userId] /= Participants.numGamesParticipated[userId];
    },

    // we need to update participants' rankings after each image
    // this function should be run only after updating all participants' weights
    updateRanking: function () {
        for (var i = 0; i < this.numBatches; i++) {
            var _batchId = i;
            var _userInBatch = this.batch_id[_batchId];

            _userInBatch.sort(function (item) {
                return this.trueWeights[item];
            });

            // reverse the order
            _userInBatch.reverse();
            this.batch_rank[_batchId] = _userInBatch;

            /* Log entry. TBD */
            // Logger.updateBatchRanking(_batchId, _userInBatch);
        }
    },

    advanceUserToNextTask: function (userID) {
        //TODO fill this out (increment the index)
    },

    getUserTaskID: function (userID) {
        //TODO This process can probably be streamlined, unknown if needed
        let batchid = Participants.id_batch[userID], taskIndex = this.userTasks[userID];
        return Tasks.batch_tasks[batchid][taskIndex];
    },

    WeightTracker: WeightTrackerClass,
    TrainingWeightTracker: TrainingWeightTrackerClass
};

/*
 Class that is used to keep track of weights for a given task
 */
