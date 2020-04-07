import React, { memo } from 'react';
import Modal from '../Modal';
import BlacklistPlacesPanel from '../../components/BlacklistPlacesPanel';

const BlacklistModal = ({ modal, setModal }) => {
  if (modal !== 'blacklist') return null;

  const closeModal = () => {
    setModal(null);
  };

  return (
    <Modal exitModal={closeModal}>
      <BlacklistPlacesPanel isOnboarding={false} />
    </Modal>
  );
};

export default memo(BlacklistModal);
