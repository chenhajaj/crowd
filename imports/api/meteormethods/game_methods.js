import { Meteor } from 'meteor/meteor';

import { Progress } from '../progress.js';
import { Parameters } from '../parameters.js';
import { Participants } from '../participants.js';
import { Session } from '../session.js';
import { Logger } from '../logging.js';
import { Payouts } from '../payouts.js';

Meteor.methods({
    /* update participant's annotation */
    updateAnnotation: function(newAnnotation) {
        Session.updateAnnotation(Meteor.userId(), newAnnotation);
    }
});

