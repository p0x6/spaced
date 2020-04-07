import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

class CustomText extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { textOptions, styled } = this.props;
    const { text, titleIndex } = textOptions;
    const styles = StyleSheet.create(styled);

    return (
      <View style={styles.textContainer}>
        {text.map((t, i) =>
          titleIndex.includes(i) ? (
            <Text key={`primary-${i}`} style={styles.title}>
              {t}
            </Text>
          ) : (
            <Text key={`primary-${i}`} style={styles.text}>
              {t}
            </Text>
          ),
        )}
      </View>
    );
  }
}
export default CustomText;
