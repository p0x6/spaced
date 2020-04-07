import React, { useState, memo, useEffect, useCallback } from 'react';
import {
  setHomeLocation,
  setWorkLocation,
  getHomeLocation,
  getWorkLocation,
} from '../../services/LocationService';
import { EventRegister } from 'react-native-event-listeners';
import Modal from '../Modal';
import BlacklistPlacesPanel from '../../components/BlacklistPlacesPanel';
import _ from 'lodash';

const BlacklistModal = ({
  modal,
  setModal,
  search,
  searchedResult,
  setSearchedResult,
}) => {
  const [homeAddress, setHomeAddress] = useState(null);
  const [homeCoords, setHomeCoords] = useState(null);
  const [workAddress, setWorkAddress] = useState(null);
  const [workCoords, setWorkCoords] = useState(null);
  const [inputtingControl, setInputtingControl] = useState(null);

  useEffect(
    useCallback(() => {
      getHomeLocation().then(location => {
        if (location && location !== 'null') {
          const parsedLocation = JSON.parse(location);
          setHomeAddress(_.get(parsedLocation, 'address', null));
        }
      });
      getWorkLocation().then(location => {
        if (location && location !== 'null') {
          const parsedLocation = JSON.parse(location);
          setWorkAddress(_.get(parsedLocation, 'address', null));
        }
      });
    }),
    [],
  );

  if (modal !== 'blacklist') return null;

  const setAddress = (control, text) => {
    if (control === 'Home') {
      setHomeAddress(text);
    } else if (control === 'Work') {
      setWorkAddress(text);
    }
  };

  const setCoords = (control, geometry) => {
    const coords = {
      lat:
        geometry && geometry.coordinates && geometry.coordinates.length
          ? geometry.coordinates[0]
          : null,
      lng:
        geometry && geometry.coordinates && geometry.coordinates.length
          ? geometry.coordinates[1]
          : null,
    };

    if (control === 'Home') {
      setHomeCoords(coords);
    } else if (control === 'Work') {
      setWorkCoords(coords);
    }
  };

  const onChangeText = (control, text) => {
    setAddress(control, text);

    if (text.length > 0) {
      setInputtingControl(control);
    } else {
      setInputtingControl(null);
      return;
    }

    search(text, null, null);
  };

  const onPressClose = control => {
    if (control === 'Home') {
      setHomeLocation({
        address: null,
        coordinates: [],
      });
      EventRegister.emit('setHomeLocation', {
        address: null,
        coordinates: [],
      });
    } else if (control === 'Work') {
      setWorkLocation({
        address: null,
        coordinates: [],
      });
      EventRegister.emit('setWorkLocation', {
        address: null,
        coordinates: [],
      });
    }
    setAddress(control, null);
    setInputtingControl(null);
  };

  const onPressItem = (control, item) => {
    const placeName = _.get(item, 'place_name', '').split(',')[0];
    setAddress(control, placeName);
    setCoords(control, item.geometry);
    if (control === 'Home') {
      setHomeLocation({
        address: placeName,
        coordinates: item.geometry.coordinates,
      });
      EventRegister.emit('setHomeLocation', {
        address: placeName,
        coordinates: item.geometry.coordinates,
      });
    } else if (control === 'Work') {
      setWorkLocation({
        address: placeName,
        coordinates: item.geometry.coordinates,
      });
      EventRegister.emit('setWorkLocation', {
        address: placeName,
        coordinates: item.geometry.coordinates,
      });
    }
    setSearchedResult([]);
  };

  const onSubmitEditing = control => {};

  const closeModal = () => {
    setModal(null);
  };

  return (
    <Modal exitModal={closeModal}>
      <BlacklistPlacesPanel
        home={homeAddress}
        work={workAddress}
        type='All'
        searchedResult={searchedResult}
        inputtingControl={inputtingControl}
        onChangeText={(control, text) => onChangeText(control, text)}
        onPressClose={control => onPressClose(control)}
        onPressItem={(control, item) => onPressItem(control, item)}
        onSubmitEditing={control => onSubmitEditing(control)}
      />
    </Modal>
  );
};

export default memo(BlacklistModal);
