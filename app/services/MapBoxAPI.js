// import Config from 'react-native-config';
import Config from '../constants/config';
const axios = require('axios');

class API {
  constructor() {
    this.instance = axios.create({
      baseURL: 'https://api.mapbox.com',
      timeout: 5000,
    });
  }

  search(text, currentLocation, bbox) {
    const params = {
      autocomplete: 'true',
      proximity:
        currentLocation.longitude !== null
          ? [currentLocation.longitude, currentLocation.latitude] + ''
          : undefined,
      bbox: bbox + '',
      access_token: Config.MAPBOX_ACCESS_TOKEN,
    };
    return this.instance.get(`/geocoding/v5/mapbox.places/${text}.json`, {
      params,
    });
  }
}

const MapBoxAPI = new API();

export default MapBoxAPI;
