/**
 * Created by alan on 9/13/2016.
 */

Template.game.helpers({
    getImg1Src: function () {
        console.log('getting img 1 src');
        return '/images/steam.jpg';
    },
    getImg2Src: function () {
        console.log('getting img 2 src');
        return '/images/tgv.jpg';
    }
});

Template.game.events({
    "click #option1"(event) {
        let user = Meteor.userId();
        let score = scoreCollection.findOne({userid: user});
        console.log(score._id);
        let newScore = {
            score: score.score+1
        };
        scoreCollection.update(score._id, {$set: newScore}, function (error) {
            if (error) {
                alert(error.reason);
            } else {
                console.log("updated");
            }
        });
    }

});

