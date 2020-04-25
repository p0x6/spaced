import * as ActionTypes from './actionTypes';

export function setBlacklistLocation(location, address) {
  return {
    type: ActionTypes.SET_BLACKLIST_ADDRESS,
    location,
    address,
  };
}

export function setLogging(
  enabled,
  callback = () => {
    return;
  },
) {
  return {
    type: ActionTypes.SET_LOGGING,
    enabled,
    callback,
  };
}

export function setBlacklistOnboardingStatus(completed) {
  return {
    type: ActionTypes.SET_BLACKLIST_ONBOARDING_STATUS,
    completed,
  };
}

export function setMapLocation(location) {
  return {
    type: ActionTypes.SET_FOCUS_LOCATION,
    location,
  };
}

export function setPlaceLocation(location) {
  return {
    type: ActionTypes.SET_PLACE_LOCATION,
    location,
  };
}

export function setSearchingState(isSearching) {
  return {
    type: ActionTypes.SET_SEARCHING_STATE,
    isSearching,
  };
}

export function setNavigation(lineString) {
  return {
    type: ActionTypes.SET_NAVIGATION_LINE_STRING,
    lineString: lineString,
  };
}
