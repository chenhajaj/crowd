import { Meteor } from 'meteor/meteor';
//import { Accounts } from 'meteor/accounts-base';
// remember meteor add mizzao:user-status

import { Participants } from '../imports/api/participants.js';
import { Time } from '../imports/api/time.js';
import { Parameters } from '../imports/api/parameters.js';
import { Logger } from '../imports/api/logging.js';

import { LobbyStatus } from '../imports/api/collections/external_collections.js';
import { PilotExperiment } from '../imports/api/collections/external_collections.js';
import { Comments } from '../imports/api/collections/external_collections.js';
import { SubmissionCode } from '../imports/api/collections/external_collections.js';

import '../imports/router.js';
import '../imports/api/meteormethods/main.js';
import '../imports/api/meteormethods/admin_methods.js';
import '../imports/api/meteormethods/game_methods.js';

Meteor.startup(function () {
    clearData();
    LobbyStatus.insert({userId: 'global', usersReady: 0});
    UserStatus.events.on('connectionLogin', function(fields) {
        var returning = PilotExperiment.findOne({userId: fields.userId});
        
        if (!returning) {   // If this is the first time the user logs in
            var onTime = !Time.experimentStarted;
            PilotExperiment.upsert({userId: fields.userId}, {$set: {
                onTime: onTime, 
                missedTooManyGames: false
            }});
        }

        var lobbyStatus = LobbyStatus.findOne({userId: fields.userId});
        if(lobbyStatus) {
            LobbyStatus.update({userId: fields.userId}, {$set: {online: true}});
        } else {
            // Change code here if proper lobby screen in test mode is needed
            LobbyStatus.upsert({userId: fields.userId}, {userId: fields.userId, online: true, ready: false, submitted: false});   
        }
        
        return Logger.recordUserLoggingIn(fields.userId, fields.connectionId, fields.ipAddr, fields.userAgent, fields.loginTime);
    });
    
    UserStatus.events.on('connectionLogout', function(fields) {
        var lobbyStatus = LobbyStatus.findOne({userId: fields.userId});
        if(lobbyStatus) {
            LobbyStatus.update({userId: fields.userId}, {$set: {online: false, ready: false}}, function(error, result) {
                var count = LobbyStatus.find({'ready': true}).count();
                LobbyStatus.update({userId: 'global'}, {$set: {
                    usersReady: count
                }});
            });
        } 
        
        return Logger.recordUserLoggingOut(fields.userId, fields.connectionId, fields.lastActivity, fields.logoutTime);
    });

    // ============Accounts Startup==============

    Meteor.users.allow({
        update: function(userId, doc, fields, modifier) {
            if(userId && doc._id === userId)
                return true;
        }
    });
 
    // For testing purposes
    //// Mini test
    
    var users = ["1", "2", "3"];
    var password = "p";
    
    
    //// Medium-scale test
    
    // var users = ['1','2','3','4','5','6','7'];
    // var password = "p";
    
    
    // // Full-scale test
    
    // var users = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25', '26', '27', '28', '29', '30'];
    // var password = "p";
    
    
    //// Full experiment [07.07.2016]
    
    addUserAccounts(users, password);
});

var addUserAccounts = function(arrOfUsers, password) {
    function checkType(variable, type, message) {
        if(typeof(variable) !== type) {
            throw message;
        }
    };

    Meteor.users.remove({});

    Accounts.onCreateUser(function(options, user) {
        if (Parameters.testMode) {
            user.location = "/lobby";
        } else {
            user.location = "/";
        }
        return user;
    });

    for(var idx in arrOfUsers) {
        var user = arrOfUsers[idx];
        // var assigId = arrOfAssignmentId[idx];
        if( Meteor.users.find({username: user}).count() === 0 ) {
            checkType(user, "string", "ERROR: (Adding User) User should be a string");
            // Meteor.users.insert({username: user, password: user, assignmentId: assigId});
            Accounts.createUser({
                username: user,
                password: password
            })
        } else {
            // Meteor.users.update({username: user}, {fields: {password: 1}});
            console.log("User " + user + " has already been added");
        }
    }

    var hasAdminUser = Meteor.users.find({username: "admin"}).count() === 1;
    if (!hasAdminUser) {
        Accounts.createUser({
            username: "admin",
            password: "admin",
        });
        // admin user will be directed to adminScreen
        Meteor.users.update({username: "admin"}, {$set: {'location': '/adminScreen'}});
    }
}

var clearData = function() {
    PilotExperiment.remove({});
    LobbyStatus.remove({});
    Comments.remove({});
    //SubmissionCode.remove({});
};