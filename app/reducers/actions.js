import * as ActionTypes from './actionTypes';

export function setBlacklistLocation(location, address) {
  return {
    type: ActionTypes.SET_BLACKLIST_ADDRESS,
    location,
    address,
  };
}
