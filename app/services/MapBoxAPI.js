import Config from 'react-native-config';
import UUIDGenerator from 'react-native-uuid-generator';
import { GetStoreData, SetStoreData } from '../helpers/General';

const axios = require('axios');

class API {
  constructor() {
    this.instance = axios.create({
      baseURL: 'https://maps.googleapis.com',
      timeout: 5000,
    });

    this.mapboxAPI = axios.create({
      baseURL: 'https://api.mapbox.com',
      timeout: 5000,
    });
  }

  getPlaceDetails(place_id) {
    const params = {
      place_id,
      key: Config.GOOGLE_TOKEN,
    };

    SetStoreData('SessionToken', 'null');

    return this.instance.get(`/maps/api/place/details/json`, {
      params,
    });
  }

  mapboxSearch(text, currentLocation, bbox) {
    const params = {
      autocomplete: 'true',
      proximity:
        currentLocation.longitude !== null
          ? [currentLocation.longitude, currentLocation.latitude] + ''
          : undefined,
      bbox: bbox + '',
      access_token: Config.MAPBOX_ACCESS_TOKEN,
    };
    return this.mapboxAPI.get(`/geocoding/v5/mapbox.places/${text}.json`, {
      params,
    });
  }

  async search(text, currentLocation) {
    const searchCall = sessionToken => {
      const params = {
        input: text,
        location: `${currentLocation.latitude},${currentLocation.longitude}`,
        key: Config.GOOGLE_TOKEN,
        sessiontoken: sessionToken,
      };

      return this.instance.get(`/maps/api/place/autocomplete/json`, {
        params,
      });
    };
    const SessionToken = await GetStoreData('SessionToken');
    if (!SessionToken || SessionToken === 'null') {
      UUIDGenerator.getRandomUUID(uuid => {
        console.log('SETTING SEARCH TOKEN ', uuid);
        SetStoreData('SessionToken', uuid);
        return searchCall(uuid);
      });
    }
    return searchCall(SessionToken);
  }
}

const MapBoxAPI = new API();

export default MapBoxAPI;
