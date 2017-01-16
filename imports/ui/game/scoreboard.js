/**
 * Created by alan on 9/13/2016.
 */

import {Session} from '../../api/session';
import {Participants} from '../../api/participants'
import './scoreboard.html'


Template.scoreboard.helpers({
    "scores": function () {
        let myBatchId = Participants.id_batch[Meteor.userId()];
        let myNeighbors = Session.batch_id[myBatchId];
        let scores = _.map(myNeighbors, function (uid) {
            return {
                score: Session.trueWeights[uid],
                userid: uid
            }
        });
        return scores;
    },
    "myScore": function () {
        return this.userid == Meteor.userId();
    }
});