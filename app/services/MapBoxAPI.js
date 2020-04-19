import Config from 'react-native-config';
const axios = require('axios');

class API {
  constructor() {
    this.instance = axios.create({
      baseURL: 'https://api.openrouteservice.org',
      timeout: 5000,
    });
  }

  search(text, currentLocation) {
    const params = {
      text,
      'focus.point.lon':
        currentLocation.longitude !== null
          ? currentLocation.longitude + ''
          : undefined,
      'focus.point.lat':
        currentLocation.longitude !== null
          ? currentLocation.latitude + ''
          : undefined,
      api_key: Config.OPEN_TOKEN,
    };
    return this.instance.get(`/geocode/autocomplete`, {
      params,
    });
  }
}

const MapBoxAPI = new API();

export default MapBoxAPI;
