import React, { memo, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';

const width = Dimensions.get('window').width;

const Modal = props => {
  const { exitModal } = props;

  const opacity = useRef(new Animated.Value(0)).current;

  const modalOpacity = opacity.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0, 1],
  });

  const modalTranslationY = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const exit = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(exitModal);
  });

  return (
    <Animated.View
      style={{
        opacity: modalOpacity,
        transform: [{ translateY: modalTranslationY }],
        paddingTop: 13,
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: 13,
        position: 'absolute',
        top: 54,
        borderRadius: 10,
        zIndex: 999,
        backgroundColor: 'white',
        width: width * 0.95,
      }}>
      <TouchableOpacity style={styles.exit} onPress={() => exit()}>
        <Image
          source={require('../assets/images/blue_close.png')}
          style={{ width: 12, height: 12, resizeMode: 'cover' }}
        />
      </TouchableOpacity>
      {props.children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {},
  exit: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default memo(Modal);
