import { Participants } from './participants.js';
import { Payouts } from './payouts.js';
import { Time } from './time.js';
import { Progress } from './progress.js';
import { Session } from './session.js';
import { Parameters } from './parameters.js';
import { Logger } from './logging.js';

export const startGames = function(isProperGames, numberOfGames, numberOfBatches, batchSize) {
	/* in each game participants are divided into numberOfBatches */

    proper = isProperGames;
    games = numberOfGames;
    batches = numberOfBatches;
    batchSize = batchSiuze;

    // Wait until all TurkServer collections data has been loaded.
    Meteor.setTimeout(function() {
            runGames();
    }, 2000);
};

var sessionTimeout, preSessionCountdown, sessionCountdown, preSessionTimeout, postSessionTimeout;
var proper, games, batches;, batchSize;


var runGames = function() {
    clearPastPilotExperimentsData();

    /* Log entry. */ Logger.recordExperimentInitializationStart();

    /* L */ Participants.initializeFullListOfParticipants();

    initializeCollections(); 

    Payouts.resetTotalPayouts(Participants.participantsQueue);

    Time.updateTimeInfo('start experiment');

    /* Log entry. */ Logger.recordExperimentInitializationCompletion();
    /* L */ Progress.setProgress('experiment', true);

    // run pre game
    runPreGame();
};


var runPreGame = function() {
    // If this is not the last game, ...
    if (Session.sessionNumber < games) {
        Progress.setProgress('preSession', true);

        // ... countdown to next session.
        preSessionCountdown = setInterval(Meteor.bindEnvironment(function() {
            Time.updateTimeInfo('current time')
        }), Time.timeUpdateRate);

        preSessionTimeout = setTimeout(Meteor.bindEnvironment(function() {
            clearInterval(preSessionCountdown);
            Progress.setProgress('preSession', false);

            // Start next game.
            runGame();  
        }), Time.preSessionLength * Time.timeUpdateRate);

    } else { // If this is the last game, end the sequence of games.
        /* Log entry. */ Logger.recordExperimentPayouts();

        /* L */ Progress.setProgress('experiment', false);

        // If the sequence consisted of proper games, set the acquired bonus payments, and terminate the instance.
        if(proper) {            
            // Terminate experiment and move participating players to exit survey
            movePlayersToSurvey();
        }
        // If not, start the sequence of proper games.
        else {
            startGames(true, Parameters.properGames, Parameters.properBatches, Parameters.batchSize);
        }
    }
    
};


var runGame = function() {
    initializeGame();

    /* L */ Progress.setProgress('session', true);

    /* assign participants into different batches */
    assignParticipantsIntoBatches();

    /* move idle participants into waiting room */
	moveToWaitingRoom();    

	/* assign tasks to batches */
	assignTasksToBatches();

    // Timer that counts seconds during the session
    sessionCountdown = setInterval(Meteor.bindEnvironment(function() { Time.updateTimeInfo('current time') }), Time.timeUpdateRate);

    // Terminates the session once the full length of the session is up
    sessionTimeout = setTimeout(Meteor.bindEnvironment(function(){ terminateGame(false); }), Time.sessionLength * Time.timeUpdateRate);
};


var initializeGame = function() {
	/* TBD */

	Participants.initializeGameParticipants();
    Session.incrementSessionNumber();
    /* Log entry. */ Logger.recordSessionInitializationCompletion(Session.sessionNumber);
};


export const terminateGame = function(outcome) {
    /* L */ Progress.setProgress('session', false);

    clearTimeout(sessionTimeout);
    clearInterval(sessionCountdown);

    /* L */ Session.getRankInfo(); /* Only top n participants can get bonus */
    /* L */ Payouts.applyBonusToParticipant(); /* give bonus to top n participants */

    Progress.setProgress('postSession', true);

    postSessionTimeout = setTimeout(Meteor.bindEnvironment(function() {
            Progress.setProgress('postSession', false);
            runPreGame();
    }), Time.postSessionLength * Time.timeUpdateRate);
};


var clearPastPilotExperimentsData = function() {
    clearTimeout(sessionTimeout);
    clearTimeout(preSessionTimeout);
    clearTimeout(postSessionTimeout);
    clearInterval(sessionCountdown);
    clearInterval(preSessionCountdown);
    
    //TODO: implement masterClear()
    //masterClear();
};


/* This method is called upon experiment termination */
var movePlayersToSurvey = function() {
    Meteor.users.update(
        {"status.online": true, username: {$ne: "admin"}, location: '/experiment'}, 
        {$set: {'location': '/survey'}},
        {multi: true}
    );
};


var initializeCollections = function() {
    Progress.initializeProgress();
    Session.initializeSessionInfo();
}



var assignParticipantsIntoBatches: function() {
	Participants.assignParticipantsIntoBatches();
	/* Log entry */ Logger.recordParticipantsBatchId();
}


