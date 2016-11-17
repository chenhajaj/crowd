/**
 * Created by alan on 9/13/2016.
 */
import './game.html'
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
        console.log('clicked on option 1');
        /*
         ok this clearly needs to be tied to where image 1 and 2 come from
         should call method indicating image 1 was clicked, from there score can be updated
         if need to randomize which side the image is on, pass id of image or something
         with method
         */
    }

});

