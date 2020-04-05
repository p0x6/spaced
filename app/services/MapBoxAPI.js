// import Config from 'react-native-config';
import Config from '../constants/config';
const axios = require('axios');

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
        access_token: Config.MAPBOX_ACCESS_TOKEN,
      },
    });
  }
}

const MapBoxAPI = new API();

export default MapBoxAPI;
