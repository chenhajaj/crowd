// import Assets?
import { Participants } from './participants.js';
import { Session } from './session.js';
import { Payouts } from './payouts.js';
import { Logger } from './logging.js';
import { ParametersInfo } from './collections/game_collections.js';

export var Parameters = {
    ParametersInfo: ParametersInfo,

    // top bonusThreshold participants in each batch can get bonus
    bonusThreshold: 2,

    practiceGames: 0, // temp value,
    properGames: 0, // temp value

    testMode: true,        //whether or not to skip description

}
