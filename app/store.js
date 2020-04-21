import AsyncStorage from '@react-native-community/async-storage';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import reducers from './reducers/reducer';

const persistConfig = {
  key: 'Spaced',
  storage: AsyncStorage,
  whitelist: ['blacklistLocations'],
  blacklist: [],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = createStore(persistedReducer, applyMiddleware(createLogger()));

const persistor = persistStore(store);

export { store, persistor };
