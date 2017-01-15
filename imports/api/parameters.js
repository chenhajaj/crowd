// import Assets?
import { Participants } from './participants.js';
import { Session } from './session.js';
import { Payouts } from './payouts.js';

/* TBD */
// import { Logger } from './logging.js';


import { ParametersInfo } from './collections/game_collections.js';

//TODO Load these values in from a file or soemthing, don't leave them hardcoded
//TODO Sync up with mongoDB

export var Parameters = {
    ParametersInfo: ParametersInfo,

    // top bonusThreshold participants in each batch can get bonus
    bonusThreshold: 2,

    practiceGames: 0, // temp value,
    properGames: 0, // temp value
    practiceBatches: 1,
    properBatches: 1,
    testMode: true,        //whether or not to skip description
    numTasksEachBatch: 150
    //TODO Add training games/batches values

};
