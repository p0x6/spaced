const axios = require('axios');
import { GetStoreData, SetStoreData } from '../helpers/General';
import UUIDGenerator from 'react-native-uuid-generator';

class API {
  constructor() {
    this.instance = axios.create({
      baseURL: 'https://safe-path.herokuapp.com/api/v0',
      timeout: 1000,
    });
    this.isReady = false;
    this.uuid = null;
    this.getUUID();
  }

  getUUID() {
    try {
      GetStoreData('uuid').then(myUUID => {
        if (!myUUID) {
          UUIDGenerator.getRandomUUID(uuid => {
            this.uuid = uuid;
            this.isReady = true;
            SetStoreData('uuid', uuid);
          });
          return;
        }
        this.isReady = true;
        this.uuid = myUUID;
      });
    } catch (e) {
      console.log(e, 'did not get UUID');
    }
  }

  getPositions(searchLocation) {
    if (this.isReady && this.uuid) {
      return this.instance.get('/get-user-positions', {
        params: {
          radius: 2000,
          latitude: searchLocation.latitude,
          longitude: searchLocation.longitude,
          uuid: this.uuid,
        },
      });
    }
    this.getUUID();
  }

  getIntersections() {
    if (this.isReady && this.uuid) {
      return this.instance.get('/get-intersection', {
        params: {
          uuid: this.uuid,
        },
      });
    }
    this.getUUID();
  }

  saveMyLocation(location) {
    console.log('SAVE MY LOCATION');
    if (this.isReady && this.uuid) {
      const body = {
        uuid: this.uuid,
        coordinates: {
          longitude: location.longitude,
          latitude: location.latitude,
        },
      };
      console.log('UPLOADING LOCATION', body);
      this.instance.post('/save-my-location', body);
    } else {
      this.getUUID();
    }
  }
}

const SafePathsAPI = new API();

export default SafePathsAPI;
