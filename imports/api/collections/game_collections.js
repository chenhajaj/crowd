import { Mongo } from 'meteor/mongo';

/* Mongo collections. */


export const ExperimentLog = new Mongo.Collection('experimentLog');

export const PayoutInfo = new Mongo.Collection('payoutInfo');

export const ParametersInfo = new Mongo.Collection('parameters');

export const ParticipantsInfo = new Mongo.Collection('participants');

export const ProgressInfo = new Mongo.Collection('progress');

export const SessionInfo = new Mongo.Collection('session');

export const TimeInfo = new Mongo.Collection('time');

//TODO Load in tasks info if needed
export const TasksInfo = new Mongo.Collection('tasks');

