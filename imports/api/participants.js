// import { TurkServer } from 'meteor/mizzao'; ?
import { Session } from './session.js';

/* TBD */
// import { Logger } from './logging.js';

import { ParticipantsInfo } from './collections/game_collections.js';
import { PilotExperiment } from './collections/external_collections.js';
import { Utilities } from './util.js'

export var Participants = {
    ParticipantsInfo: ParticipantsInfo,

    participants: [],
    participantsQueue: [],
    missedGames: {},
    participationRate: {},
    participantsThreshold: 0, // tmp value
    missedGamesThreshold: 1,

    // id_name[someUserId] gives the name assigned to the client (user) with user ID someUserId.
    id_name: {},

    // name_id[someName] gives the user ID of the client that was assigned the name someName.
    name_id: {},

    // id_batch[someUserId] gives the assigned batch for this user
    id_batch: {},

    // record the number of games participated by each participant
    // numGamesParticipated[someUserId] returns how many games someUserId participated
    numGamesParticipated: {},

    // List of available first names. Need to make sure there are at least as many names 
    // available as there are nodes in the full network.
    listOfNames: ["Ben", "Ava", "Dan", "Eve", "Gus", "Ivy", "Ian", "Joy", "Jay", "Kim", 
                    "Lee", "Liz", "Pat", "Mae", "Ray", "Uma", "Sam", "Sky", "Ted", "Sue", 
                    "Bob", "Joe", "Moe", "May", "Tim"],


    // put all online users into participantsQueue
    initializeFullListOfParticipants: function() {
        var queue = this.participantsQueue;
        var readyUsers = Meteor.users.find({"status.online": true, username: {$ne: "admin"}, location: '/experiment'});
        readyUsers.forEach(function(user) {
           queue.push(user._id);
        });

        this.initializeGameParticipants();

        /* Log entry.  TBD */  
        // Logger.recordExperimentParticipants(this.participantsQueue);
    },


    // initialize
    initializeNumGamesParticipated: function() {
        for ( var i = 0; i < this.participantsQueue; i++ ) {
            var _userId = this.participantsQueue[i];
            this.numGamesParticipated[_userId] = 0;
        }
    },


    initializeGameParticipants: function(newSession) {
        // calculate how many participants we need
        // participantsThreshold will make sure that we select exactly batchNumber * batchSize participants
        this.participantsThreshold = Session.batchNumber * Session.batchSize;

        if(this.participantsQueue.length < this.participantsThreshold) {
            // This should not happen, but it would be good if we have some plan B when not enough people show up.
            this.participants = this.participantsQueue;
        }
        else if (newSession) {
            // Kick out inactive participants (even those that are experiencing some issues)
            // removeInactiveParticipants();
            
            this.participants = [];
            ParticipantsInfo.upsert({}, {$set: {
                isParticipant: false
            }});
            var participantsAdded = 0;
            while(participantsAdded < this.participantsThreshold && participantsAdded < this.participantsQueue.length) {
                var nextParticipant = this.participantsQueue.shift();
                this.participants.push(nextParticipant);
                this.participantsQueue.push(nextParticipant);
                ParticipantsInfo.upsert({userId: nextParticipant}, {$set: {
                    isParticipant: true,
                }});

                this.numGamesParticipated[nextParticipant] += 1;
                participantsAdded++;
            }
        }

        console.log('done initializing participation');

        /* Log entry. */ //Logger.recordSessionParticipants(this.participants);
    },

    initializeMissedGames: function() {
        for(var i = 0; i < this.participants.length; i++) {
            this.missedGames[this.participants[i]] = 0;
        }
    },


    assignIdsToNames: function() {
        var nameIndices = new Array(this.listOfNames.length);
        for (var i = 0; i < nameIndices.length; i++) {
            nameIndices[i] = i;
        }
        
        for(var i = 0; i < this.participants.length; i++) {
            var choice = Math.floor(Math.random()*nameIndices.length);
            var j = nameIndices[choice];

            this.name_id[this.listOfNames[j]] = this.participants[i];
            this.id_name[this.participants[i]] = this.listOfNames[j];

            nameIndices.splice(choice, 1);
        }
    }
};



var removeInactiveParticipants = function() {
    for(var i = 0; i < Participants.participants.length; i++) {
        if(Participants.participationRate[Participants.participants[i]] == 0) {
            Participants.missedGames[Participants.participants[i]] += 1;
        
            // If a participant missed too many games (and assuming we have enough participants), remove them from the queue
            if (Participants.missedGames[Participants.participants[i]] > Participants.missedGamesThreshold && 
                Participants.participantsQueue.length > Participants.participantsThreshold) {
                PilotExperiment.update({userId: Participants.participants[i]}, {$set: {'missedTooManyGames': true}});
                
                var index = Participants.participantsQueue.indexOf(Participants.participants[i]);
                Participants.participantsQueue.splice(index, 1);
            
                removeParticipant(Participants.participants[i]);
            }
        }
    }
};

var removeParticipant = function(userId) {
    // Move to survey, but indicate that this happened under exceptional circumstances  
    Meteor.users.update(
        {_id: userId, location: '/experiment'}, 
        {$set: {'location': '/survey'}},
        {multi: true}
    );
};

/* for each game we need to randomly assign participants into batches */
var assignParticipantsIntoBatches = function () {

    //randomly shuffle array
    Utilities.shuffle(Participants.participants);

    var _batchSize = Session.batchSize;

    for ( var i = 0; i < Participants.participants.length; i++) {
        var _id = Participants.participants[i];
        // assign this participant to _batchId
        var _batchId = Math.floor(i / _batchSize);

        // record which batch userId belongs
        Participants.id_batch[_id] = _batchId;

        ParticipantsInfo.upsert({userId: _id}, {$set: {
            batch: _batchId
        }});

        Session.batch_id[_batchId].push(_id);
    }
};
