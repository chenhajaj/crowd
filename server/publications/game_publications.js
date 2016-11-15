import { Meteor } from 'meteor/meteor';

import { PayoutInfo } from '../../imports/api/collections/game_collections.js';
import { ParametersInfo } from '../../imports/api/collections/game_collections.js';
import { ParticipantsInfo } from '../../imports/api/collections/game_collections.js';
import { ProgressInfo } from '../../imports/api/collections/game_collections.js';
import { SessionInfo } from '../../imports/api/collections/game_collections.js';
import { TimeInfo } from '../../imports/api/collections/game_collections.js';

import { Participants } from '../../imports/api/participants.js';
import { Parameters } from '../../imports/api/parameters.js';



Meteor.publishComposite('payoutInfo', {
    find: function () {
        return PayoutInfo.find({ id: this.userId });
    }
});

// Only the admin user will be subscribed to this publication.
Meteor.publishComposite('adminPayoutInfo', {
    find: function() {
        if(this.userId) {    
            var adminId = Meteor.users.findOne({username: "admin"})._id;
                              
            if(this.userId === adminId)
                return PayoutInfo.find({});
        }
        
        return [];
    }
});

Meteor.publishComposite('progressInfo', {
    find: function() {
        return ProgressInfo.find({});
    }
});

Meteor.publishComposite('participantsInfo', {
    find: function() {
        return ParticipantsInfo.find({userId: this.userId});
    }
});

Meteor.publishComposite('sessionInfo', {
    find: function() {
        return SessionInfo.find({$or: [
            {id: 'global'},
            {id: this.userId}
        ]});
    }
});

Meteor.publishComposite('parametersInfo', {
    find: function() {
        return ParametersInfo.find({userId: this.userId});
    }
});

Meteor.publishComposite('timeInfo', {
    find: function() {
        return TimeInfo.find({});
    }
});

