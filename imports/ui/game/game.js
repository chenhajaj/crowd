/**
 * Created by alan on 9/13/2016.
 */
import './game.html'
//TODO restructure this template for new game

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
        clickOption(1);
    },

    "click #option2"(event) {
        clickOption(2);
    }
});

let clickOption = function (option) {
    let user = Meteor.userId();
    console.log('clicked on option ' + option);
    Meteor.call('recordUserResponse', user, option);
};

