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

const blacklistOnboardingStatus = (state = null, action) => {
  switch (action.type) {
    case ActionTypes.SET_BLACKLIST_ONBOARDING_STATUS:
      return action.completed;
    default:
      return state;
  }
};

const isLogging = (state = null, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOGGING:
      return action.enabled;
    default:
      return state;
  }
};

const mapLocation = (
  state = {
    coordinates: [],
    name: '',
    address: '',
    busyHours: {},
  },
  action,
) => {
  switch (action.type) {
    case ActionTypes.SET_FOCUS_LOCATION:
      return action.location;
    default:
      return state;
  }
};

export default combineReducers({
  blacklistLocations,
  blacklistOnboardingStatus,
  isLogging,
  mapLocation,
});
