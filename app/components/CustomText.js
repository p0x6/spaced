import React, { Component } from 'react';
import { View, Text } from 'react-native';

class CustomText extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { text, containerStyle, textStyle } = this.props;

    return (
      <View style={containerStyle}>
        {text.map((t, i) => (
          <Text key={`primary-${i}`} style={textStyle}>
            {t}
          </Text>
        ))}
      </View>
    );
  }
}

export default CustomText;
