/**
 * Created by alan on 9/13/2016.
 */

Template.scoreboard.helpers({
    "scores": function () {
        let userid = Meteor.userId();
        let userGroup = userGroups.find({userids: {$in: [userid]}});
        let neighbor_users = [];
        userGroup.forEach(function (e) {
            neighbor_users = neighbor_users.concat(e.userids);
        });

        return scoreCollection.find({userid: {$in: neighbor_users}}, {sort: {score: -1}});
    },
    "myScore": function () {
        return this.userid == Meteor.userId();
    }
});