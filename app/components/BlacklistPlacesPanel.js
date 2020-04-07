import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from 'react-native';
import colors from '../constants/colors';

interface Props {
  home?: string;
  work?: string;
  type?: string;
  searchedResult?: any;
  inputtingControl?: string;
  onChangeText?: (control, text) => void;
  onPressClose?: control => void;
  onPressItem?: (control, item) => void;
  onSubmitEditing?: control => void;
}

class BlacklistPlacesPanel extends Component<Props> {
  constructor(props) {
    super(props);

    this.control = { Home: null, Work: null };
  }
  renderCloseButton(control) {
    if (
      control === 'Home' &&
      (!this.props.home || this.props.home.length === 0)
    )
      return;
    if (
      control === 'Work' &&
      (!this.props.work || this.props.work.length === 0)
    )
      return;

    return (
      <View style={styles.closeButtonContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => this.props.onPressClose(control)}>
          <Image
            source={require('../assets/images/blue_close.png')}
            style={styles.pinClose}
          />
        </TouchableOpacity>
      </View>
    );
  }

  renderSearchItems(ref, item, index, control) {
    return (
      <TouchableOpacity
        key={index.toString()}
        activeOpacity={0.8}
        style={styles.itemButton}
        onPress={() => ref.props.onPressItem(control, item)}>
        <Text numberOfLines={1} style={styles.locationTitle}>
          {item.place_name}
        </Text>
      </TouchableOpacity>
    );
  }

  renderAddedPanel(control) {
    if (this.props.inputtingControl !== control) return;
    if (
      (this.props.inputtingControl === 'Home' && !this.props.home) ||
      (this.props.inputtingControl === 'Work' && !this.props.work) ||
      this.props.searchedResult.length === 0
    )
      return;

    return (
      <View style={styles.resultsContainer}>
        {/* <FlatList
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          data={this.props.searchedResult}
          renderItem={({ item, index }) =>
            this.renderSearchItems(this, item, index, control)
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        /> */}
        {/* <View style={{flexWrap: 'nowrap'}}> */}
        {this.props.searchedResult.map((item, index) => {
          return (
            <View>
              {this.renderSearchItems(this, item, index, control)}
              <View style={styles.separator} />
            </View>
          );
        })}
        {/* </View> */}
      </View>
    );
  }

  renderContent(control) {
    const value = control === 'Home' ? this.props.home : this.props.work;

    return (
      <View style={styles.addedContainer}>
        <View style={styles.searchBarContainer}>
          <View style={styles.markContainer}>
            <Text style={styles.markText}>{control}</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              ref={ref => (this.control[control] = ref)}
              placeholder='Search Address'
              style={styles.inputText}
              returnKeyLabel='Go'
              returnKeyType='go'
              value={value}
              autoCorrect={false}
              onFocus={() => {
                const lastIndex = (value || '').length;
                this.control[control].setNativeProps({
                  selection: { start: lastIndex, end: lastIndex },
                });
              }}
              onBlur={() =>
                this.control[control].setNativeProps({
                  selection: { start: 0, end: 0 },
                })
              }
              onChangeText={text => this.props.onChangeText(control, text)}
              onSubmitEditing={() => this.props.onSubmitEditing(control)}
            />
          </View>
          {this.renderCloseButton(control)}
        </View>
        {this.renderAddedPanel(control)}
      </View>
    );
  }

  renderHome() {
    if (this.props.type === 'All' || this.props.type === 'Home') {
      return this.renderContent('Home');
    }
    return null;
  }

  renderWork() {
    if (this.props.type === 'All' || this.props.type === 'Work') {
      return this.renderContent('Work');
    }
    return null;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <Image
            source={require('../assets/images/blacklist.png')}
            style={styles.pinImage}
          />
          <Text style={styles.labelText}>Blacklist{'\n'}location</Text>
        </View>
        <View style={styles.commentTextContainer}>
          <Text style={styles.commentText}>
            You can blacklist a location like home or office, so that others
            don't see your location.
          </Text>
        </View>
        {this.renderHome()}
        {this.renderWork()}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    width: '100%',
    // borderWidth: 1,
  },
  pinImage: {
    width: 22,
    height: 30,
    resizeMode: 'stretch',
    marginRight: 16,
  },
  labelText: {
    fontSize: 14,
    color: colors.BLACK,
  },
  commentTextContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  commentText: {
    color: colors.BLUE_TEXT_COLOR,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    letterSpacing: 1,
  },
  addedContainer: {},
  searchBarContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    height: 40,
    marginTop: 16,
  },
  markContainer: {
    backgroundColor: '#e1e1e1',
    borderRadius: 4,
    width: '24%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markText: {
    color: '#5d5d5d',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    justifyContent: 'center',
    flex: 1,
  },
  inputText: {
    color: '#49638e',
    fontSize: 16,
  },
  closeButtonContainer: {
    justifyContent: 'center',
    padding: 4,
  },
  closeButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  pinClose: {
    width: 12,
    height: 12,
    resizeMode: 'cover',
  },
  resultsContainer: {},
  separator: {
    marginHorizontal: 4,
    height: 1,
    backgroundColor: '#ccc',
  },
  itemButton: {
    paddingVertical: 16,
  },
});

export default BlacklistPlacesPanel;
