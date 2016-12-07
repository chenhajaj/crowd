import { Parameters } from './parameters.js';
import { Participants } from './participants.js';

/* To be modified, uncomment later */
// import { Logger } from './logging.js';


import { SessionInfo } from './collections/game_collections.js';
import { Time } from './time.js';
import { Progress } from './progress.js';
import { terminateGame } from './experiment_control.js';

// includes Communcation Management
export var Session = {
    SessionInfo: SessionInfo,

    sessionNumber: 0,   // current Session
    batchNumber: 0,  // number of batches
    batchSize: 5,   // tmp value
    

    batch_rank, {}, // batch_rank[batchId][userId] returns userId's rank
    weights: {}, // participants' weights
    batch_id: {}, // batch_id[batchId] returns userIds of participants in it
   
    bonusThreshold: 3,  // top bonusThreshold participants can obtain bonus

    requestToBeAssignedNext: 1,
    requestToBeProcessedNext: 1,

    /* TBD */
    checkResetBatch: function(isProperGames) {
    	//
    },

    initializeWeights: function() {
    	for ( var i = 0; i < Participants.participantsQueue.length; i++ ) {
            /* participantsQueue should already be initialized */
    		var _userId = Participants.participantsQueue[i];
    		this.weights[_userId] = 0;
    	}
    },

	initializeBatch_Id: function() {
		for ( var i = 0; i < this.batchNumber; i++ ) {
			this.batch_id[i] = [];
		}
	},

    initializeSessionInfo: function() {
        this.sessionNumber = 0;
        // calculate how many batches we will have
        this.batchNumber = Math.floor(Participants.participantsQueue.length / this.batchSize);

        SessionInfo.upsert({id: 'global'}, { $set: {
            sessionNumber: 0,
            batchNumber: this.batchNumber
        }});
       
        this.initializeWeights();
        this.initializeBatch_Id();
    },

    incrementSessionNumber: function() {
        this.sessionNumber++;

        SessionInfo.update({id: 'global'}, {$set: {
            sessionNumber: this.sessionNumber
        }});
    },


    updateWeight: function(userId, weightInc) {
        /* we currently don't need this */ 
        var requestNo = this.requestToBeAssignedNext;
        this.requestToBeAssignedNext++;
      
        this.weights[userId] += weightInc;
        // userId's weight needs to be averaged ovr all games he/she participated
        /* async weight updating goes here! */
        this.weights[userId] /= Participants.numGamesParticipated[userId];

        /* Log entry. TBD */ 
        // Logger.recordRequestMade(userId, weightInc, requestNo);
    },


    // we need to update participants' rankings after each image
    // this function should be run only after updating all participants' weights
    updateRanking: function() {
        for ( var i = 0; i < this.batchNumber; i++ ) {
        	var _batchId = i;
        	var _userInBatch = this.batch_id[_batchId];
        	_userInBatch.sort(function(item){
        		return this.weights[item];
        	});

        	// reverse the order
        	_userInBatch.reverse();
        	this.batch_rank[_batchId] = _userInBatch;

        	/* Log entry. TBD */ 
            // Logger.updateBatchRanking(_batchId, _userInBatch);
        }
    }
};