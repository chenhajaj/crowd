import { Parameters } from './parameters.js';
import { Participants } from './participants.js';
import { Utilities } from './util.js';
import { PayoutInfo } from './collections/game_collections.js';
import { Session } from './session.js';
import { Logger } from './logging.js';

export var Payouts = {
    PayoutInfo: PayoutInfo,

    sessionPayouts: {},     //id ==> payout
    potentialPayouts: {},   //id ==> payout
    basePayout: 0.2,
    

    resetTotalPayouts: function(participants) {
        PayoutInfo.remove({});
        for(var i = 0; i < participants.length; i++){
            PayoutInfo.insert({
                id: participants[i],
                totalPayout: 0
            }); 
        }
    },

    initializeSessionPayoutInfo: function(participants) {
        for (var i = 0; i < participants.length; i++) {
            var id = participants[i];
            this.sessionPayouts[id] = 0;
            PayoutInfo.upsert({id: participants[i]}, {$set: {
                sessionPayout: 0
            }});
        }
    }
};


var assignPayout = function(payoutMultiplier, isAdversary) {
    /* TBD */
}