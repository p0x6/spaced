import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

class Logo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { logo } = this.props;

    return (
      <View style={styles.logoContainer}>
        <Text>{logo}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '62%',
  },
});

export default Logo;
