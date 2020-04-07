import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

class Button2 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { handlePress, text, styled } = this.props;
    const styles = StyleSheet.create(styled);

    return (
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
    );
  }
}

export default Button2;
