import * as ActionTypes from './actionTypes';
import { GetStoreData, SetStoreData } from '../helpers/General';
import { setLogging } from './actions';
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

    return result;
  };
  return middleware;
};

export default router;
