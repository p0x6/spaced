import * as ActionTypes from './actionTypes';
import { combineReducers } from 'redux';

const blacklistLocations = (state = { HOME: null, WORK: null }, action) => {
  switch (action.type) {
    case ActionTypes.SET_BLACKLIST_ADDRESS:
      if (action.location === 'HOME') {
        const { address } = action;
        return { ...state, HOME: address };
      } else if (action.location === 'WORK') {
        const { address } = action;
        return { ...state, WORK: address };
      }
      break;
    default:
      return state;
  }
};

export default combineReducers({ blacklistLocations });
