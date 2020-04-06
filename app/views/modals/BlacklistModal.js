import React, { useState, memo } from 'react';
import {
  setHomeLocation,
  setWorkLocation,
} from '../../services/LocationService';
import Modal from '../Modal';
import BlacklistPlacesPanel from '../../components/BlacklistPlacesPanel';

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
    setAddress(control, null);
    setInputtingControl(null);
  };

  const onPressItem = (control, item) => {
    setAddress(control, item.place_name);
    setCoords(control, item.geometry);
    setSearchedResult([]);
  };

  const onSubmitEditing = control => {};

  const closeModal = () => {
    if (homeCoords && homeCoords.lat && homeCoords.lng)
      setHomeLocation({ address: homeAddress, coordinates: homeCoords });
    if (workCoords && workCoords.lat && workCoords.lng)
      setWorkLocation({ address: workAddress, coordinates: workCoords });
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
