import React, { memo, useCallback } from 'react';
import Modal from '../Modal';
import { Button, Linking, Text, TouchableOpacity, View } from 'react-native';
import { version } from '../../../package.json';

import colors from '../../constants/colors';

const AppInfo = ({ modal, setModal }) => {
  if (modal !== 'info') return null;

  const handleLinkPress = useCallback(async url => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    }
  }, []);

  return (
    <Modal exitModal={() => setModal(null)}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%',
        }}>
        <Text style={{ fontSize: 16, color: colors.BLACK }}>App Info</Text>
      </View>
      <View>
        <Text>Spaced - {version}</Text>
        <TouchableOpacity
          style={{ marginTop: 10 }}
          onPress={() =>
            handleLinkPress('https://www.iubenda.com/privacy-policy/15725052')
          }>
          <Text>View Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 10, marginBottom: 10 }}
          onPress={() =>
            handleLinkPress(
              'https://github.com/p0x6/spaced/blob/develop/LICENSE',
            )
          }>
          <Text>View License</Text>
        </TouchableOpacity>
        <Button
          onPress={() =>
            Linking.openURL('mailto:bobby@yanglabs.co?subject=Spaced')
          }
          title=' Email Me: bobby@yanglabs.co'
        />
      </View>
    </Modal>
  );
};

export default memo(AppInfo);
