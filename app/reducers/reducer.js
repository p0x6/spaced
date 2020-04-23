import * as ActionTypes from './actionTypes';
import { combineReducers } from 'redux';
import { Keyboard } from 'react-native';

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

const mapLocation = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_FOCUS_LOCATION:
      console.log('====== SETTING FOCUST LOCATION =======');
      return action.location;
    default:
      return state;
  }
};

const placeLocation = (
  state = {
    coordinates: [],
    name: '',
    address: '',
    busyHours: {},
  },
  action,
) => {
  switch (action.type) {
    case ActionTypes.SET_PLACE_LOCATION:
      return action.location;
    default:
      return state;
  }
};

const isSearching = (state = false, action) => {
  switch (action.type) {
    case ActionTypes.SET_SEARCHING_STATE:
      if (!action.isSearching) Keyboard.dismiss();
      return action.isSearching;
    default:
      return state;
  }
};

const navigation = (state = null, action) => {
  switch (action.type) {
    case ActionTypes.SET_NAVIGATION_LINE_STRING:
      return action.lineString;
    default:
      return state;
  }
};

export default combineReducers({
  blacklistLocations,
  blacklistOnboardingStatus,
  isLogging,
  mapLocation,
  isSearching,
  navigation,
  placeLocation,
});
