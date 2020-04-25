import * as ActionTypes from './actionTypes';
import { GetStoreData, SetStoreData } from '../helpers/General';
import { setLogging, setMapLocation, setSearchingState } from './actions';
import LocationServices from '../services/LocationService';
import BroadcastingServices from '../services/BroadcastingService';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const router = () => {
  const middleware = store => next => action => {
    const currState = store.getState();
    const result = next(action);
    const nextState = store.getState();
    const { dispatch } = store;

    if (currState.isLogging === null || currState.isLogging === undefined) {
      GetStoreData('PARTICIPATE').then(isLogging => {
        if (isLogging === 'true') {
          dispatch(setLogging(true));
        } else {
          dispatch(setLogging(false));
        }
      });
    }

    if (
      currState.placeLocation.coordinates !==
      nextState.placeLocation.coordinates
    )
      dispatch(setSearchingState(false));

    if (
      currState.isLogging !== nextState.isLogging &&
      (currState.isLogging !== null || currState.isLogging !== undefined)
    ) {
      SetStoreData('PARTICIPATE', nextState.isLogging);
      if (nextState.isLogging) {
        LocationServices.start(action.callback);
        BroadcastingServices.start();

        BackgroundGeolocation.checkStatus(({ authorization }) => {
          if (authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
            setLogging(false);
          }
        });
      } else {
        LocationServices.stop();
        BroadcastingServices.stop();
      }
    }

    if (
      (currState.mapLocation && currState.mapLocation.length !== 2) ||
      (nextState.mapLocation && nextState.mapLocation.length !== 2)
    ) {
      BackgroundGeolocation.getCurrentLocation(
        location => {
          const { latitude, longitude } = location;
          dispatch(setMapLocation([longitude, latitude]));
        },
        () => {
          try {
            GetStoreData('LOCATION_DATA').then(locationArrayString => {
              const locationArray = JSON.parse(locationArrayString);
              if (locationArray !== null && locationArray.length >= 1) {
                const { latitude, longitude } = locationArray.slice(-1)[0];
                dispatch(setMapLocation([longitude, latitude]));
              } else {
                // default location cannot get current location, and no past location data
                dispatch(setMapLocation([20.39, 36.56]));
              }
            });
          } catch (error) {
            console.log('CANNOT SET MAP LOCATION ===== ', error);
          }
        },
      );
    }

    return result;
  };
  return middleware;
};

export default router;
