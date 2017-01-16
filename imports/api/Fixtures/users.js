/**
 * Created by alan on 11/17/2016.
 */

import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';

let users = ["u1", "u2"];
let pswd = 'pswd';

_.each(users, function (user) {
    if (Meteor.users.find({username: user}).count() === 0) {
        Accounts.createUser({
            username: user,
            password: pswd
        })
    } else {

        console.log("User " + user + " has already been added");
    }
});