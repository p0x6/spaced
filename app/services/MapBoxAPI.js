import { MAPBOX_ACCESS_TOKEN } from 'react-native-dotenv';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import LocationService from './LocationService';
import BroadcastingServices from './BroadcastingService';
const axios = require('axios');
const qs = require('qs');

class API {
  constructor() {
    this.instance = axios.create({
      baseURL: 'https://api.mapbox.com',
      timeout: 1000,
    });
  }

  search(text, currentLocation, bbox) {
    return this.instance.get(`/geocoding/v5/mapbox.places/${text}.json`, {
      params: {
        autocomplete: 'true',
        proximity: [currentLocation.longitude, currentLocation.latitude] + '',
        bbox: bbox + '',
        access_token: MAPBOX_ACCESS_TOKEN,
      },
    });
  }
}

const MapBoxAPI = new API();

export default MapBoxAPI;
