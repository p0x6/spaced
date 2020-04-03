import React, { Component } from 'react';
import {
  StyleSheet,
  Linking,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  BackHandler,
} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import colors from '../constants/colors';
import LocationServices from '../services/LocationService';
import BroadcastingServices from '../services/BroadcastingService';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import exportImage from './../assets/images/export.png';
import news from './../assets/images/newspaper.png';
import kebabIcon from './../assets/images/kebabIcon.png';
import pkLogo from './../assets/images/PKLogo.png';

import { GetStoreData, SetStoreData } from '../helpers/General';
import languages from './../locales/languages';
import OverlapScreen from './Overlap';
import { TextInput } from 'react-native-gesture-handler';
import SlidingUpPanel from 'rn-sliding-up-panel';
import ToggleSwitch from 'toggle-switch-react-native'

const width = Dimensions.get('window').width;

class LocationTracking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogging: '',
      panelHeight: 180,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    GetStoreData('PARTICIPATE')
      .then(isParticipating => {
        if (isParticipating === 'true') {
          this.setState({
            isLogging: true,
          });
          this.willParticipate();
        } else {
          this.setState({
            isLogging: false,
          });
        }
      })
      .catch(error => console.log(error));
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
    BackHandler.exitApp(); // works best when the goBack is async
    return true;
  };
  export() {
    this.props.navigation.navigate('ExportScreen', {});
  }

  import() {
    this.props.navigation.navigate('ImportScreen', {});
  }

  blacklistPlaces() {
    this.props.navigation.navigate('BlacklistPlaces', {});
  }

  overlap() {
    this.props.navigation.navigate('OverlapScreen', {});
  }

  willParticipate = () => {
    SetStoreData('PARTICIPATE', 'true').then(() => {
      LocationServices.start();
      BroadcastingServices.start();
    });

    // Check and see if they actually authorized in the system dialog.
    // If not, stop services and set the state to !isLogging
    // Fixes tripleblindmarket/private-kit#129
    BackgroundGeolocation.checkStatus(({ authorization }) => {
      if (authorization === BackgroundGeolocation.AUTHORIZED) {
        this.setState({
          isLogging: true,
        });
      } else if (authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
        LocationServices.stop(this.props.navigation);
        BroadcastingServices.stop(this.props.navigation);
        this.setState({
          isLogging: false,
        });
      }
    });
  };

  news() {
    this.props.navigation.navigate('NewsScreen', {});
  }

  licenses() {
    this.props.navigation.navigate('LicensesScreen', {});
  }

  notifications() {
    this.props.navigation.navigate('NotificationScreen', {});
  }

  setOptOut = () => {
    LocationServices.stop(this.props.navigation);
    BroadcastingServices.stop(this.props.navigation);
    this.setState({
      isLogging: false,
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <OverlapScreen />
        <TouchableOpacity
          style={styles.searchInput}
          onPress={() => { this.props.navigation.navigate("SearchAddress", {}) }}>
          <Text style={{ color: "#2E4874" }}>Search location or zip code</Text>
        </TouchableOpacity>
        <SlidingUpPanel
          ref={c => (this._panel = c)}
          draggableRange={{
            top: this.state.panelHeight,
            bottom: 80
          }}
          showBackdrop
          containerStyle={styles.panelContainer}
          backdropOpacity={0.5}
          minimumDistanceThreshold={10}
          friction={50}
        >
          <View style={{ padding: 20, backgroundColor: "#fff", borderRadius: 15, }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
              <Text style={{ fontFamily: 'OpenSans-SemiBold', fontSize: 17, color: "#000" }}>Stop Logging my location</Text>
              <View style={{ paddingRight: 20, height: 40, marginTop: 5 }}>
                <ToggleSwitch
                  isOn={false}
                  onColor="#2E4874"
                  offColor="#2E4874"
                  onToggle={isOn => console.log("changed to : ", isOn)}
                />
              </View>
            </View>
            <Text style={{ fontFamily: 'OpenSans-Regular', fontSize: 13, color: "#2E4874" }}>Your location data is logged on</Text>
            <View style={{ height: 0.3, backgroundColor: 'gray', marginTop: 15 }}></View>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
              <View style={{ justifyContent: "center", alignSelf: "center" }}>
                <View>
                  <Text style={{ fontFamily: 'OpenSans-Regular', fontSize: 13, color: "#2E4874" }}>BlockList</Text>
                  <Text style={{ fontFamily: 'OpenSans-Regular', fontSize: 13, color: "#2E4874" }}>location</Text>
                </View>
              </View>
              <View style={{ justifyContent: "center", alignSelf: "center" }}>
                <Text style={{ fontFamily: 'OpenSans-Regular', fontSize: 13, color: "#2E4874" }}>Activity</Text>
                <Text style={{ fontFamily: 'OpenSans-Regular', fontSize: 13, color: "#2E4874" }}>Log</Text>
              </View>
            </View>
          </View>
        </SlidingUpPanel>
      </View>
      // <SafeAreaView style={styles.container}>
      //   <ScrollView contentContainerStyle={styles.main}>
      //     {/* A modal menu. Currently only used for license info */}
      //     <Menu
      //       style={{
      //         position: 'absolute',
      //         alignSelf: 'flex-end',
      //         zIndex: 10,
      //       }}>
      //       <MenuTrigger style={{ marginTop: 14 }}>
      //         <Image
      //           source={kebabIcon}
      //           style={{
      //             width: 15,
      //             height: 28,
      //             padding: 14,
      //           }}
      //         />
      //       </MenuTrigger>
      //       <MenuOptions>
      //         <MenuOption
      //           onSelect={() => {
      //             this.licenses();
      //           }}>
      //           <Text style={styles.menuOptionText}>Licenses</Text>
      //         </MenuOption>
      //         <MenuOption
      //           onSelect={() => {
      //             this.notifications();
      //           }}>
      //           <Text style={styles.menuOptionText}>Notifications</Text>
      //         </MenuOption>
      //       </MenuOptions>
      //     </Menu>
      //     <Text style={styles.headerTitle}>Spaced</Text>

      //     <View style={styles.buttonsAndLogoView}>
      //       {this.state.isLogging ? (
      //         <>
      //           <Image
      //             source={pkLogo}
      //             style={{
      //               width: 132,
      //               height: 164.4,
      //               alignSelf: 'center',
      //               marginTop: 12,
      //             }}
      //           />
      //           <TouchableOpacity
      //             onPress={() => this.setOptOut()}
      //             style={styles.stopLoggingButtonTouchable}>
      //             <Text style={styles.stopLoggingButtonText}>
      //               {languages.t('label.stop_logging')}
      //             </Text>
      //           </TouchableOpacity>
      //           <TouchableOpacity
      //             onPress={() => this.overlap()}
      //             style={styles.startLoggingButtonTouchable}>
      //             <Text style={styles.startLoggingButtonText}>
      //               SEARCH PLACES
      //             </Text>
      //           </TouchableOpacity>
      //         </>
      //       ) : (
      //         <>
      //           <Image
      //             source={pkLogo}
      //             style={{
      //               width: 132,
      //               height: 164.4,
      //               alignSelf: 'center',
      //               marginTop: 12,
      //               opacity: 0.3,
      //             }}
      //           />
      //           <TouchableOpacity
      //             onPress={() => this.willParticipate()}
      //             style={styles.startLoggingButtonTouchable}>
      //             <Text style={styles.startLoggingButtonText}>
      //               {languages.t('label.start_logging')}
      //             </Text>
      //           </TouchableOpacity>
      //         </>
      //       )}

      //       {this.state.isLogging ? (
      //         <Text style={styles.sectionDescription}>
      //           Data is currently being logged on your phone and shared with
      //           others.
      //         </Text>
      //       ) : (
      //         <Text style={styles.sectionDescription}>
      //           {languages.t('label.not_logging_message')}
      //         </Text>
      //       )}
      //     </View>

      //     <View style={styles.actionButtonsView}>
      //       <TouchableOpacity
      //         onPress={() => this.blacklistPlaces()}
      //         style={styles.actionButtonsTouchable}>
      //         <Image
      //           style={styles.actionButtonImage}
      //           source={exportImage}
      //           resizeMode={'contain'}
      //         />
      //         <Text style={styles.actionButtonText}>
      //           Edit Banned Tracking Areas
      //         </Text>
      //       </TouchableOpacity>

      //       <TouchableOpacity
      //         onPress={() => this.export()}
      //         style={styles.actionButtonsTouchable}>
      //         <Image
      //           style={[
      //             styles.actionButtonImage,
      //             { transform: [{ rotate: '180deg' }] },
      //           ]}
      //           source={exportImage}
      //           resizeMode={'contain'}
      //         />
      //         <Text style={styles.actionButtonText}>
      //           {languages.t('label.export')}
      //         </Text>
      //       </TouchableOpacity>

      //       <TouchableOpacity
      //         onPress={() => this.news()}
      //         style={styles.actionButtonsTouchable}>
      //         <Image
      //           style={styles.actionButtonImage}
      //           source={news}
      //           resizeMode={'contain'}
      //         />
      //         <Text style={styles.actionButtonText}>
      //           {languages.t('label.news')}
      //         </Text>
      //       </TouchableOpacity>
      //     </View>

      //     <View style={styles.footer}>
      //       <Text
      //         style={[
      //           styles.sectionDescription,
      //           { textAlign: 'center', paddingTop: 15 },
      //         ]}>
      //         {languages.t('label.url_info')}{' '}
      //       </Text>
      //       <Text
      //         style={[
      //           styles.sectionDescription,
      //           { color: 'blue', textAlign: 'center', marginTop: 0 },
      //         ]}
      //         onPress={() => Linking.openURL('https://privatekit.mit.edu')}>
      //         {languages.t('label.private_kit_url')}
      //       </Text>
      //     </View>
      //   </ScrollView>
      // </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {
    flex: 1,
    alignItems: "center"
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 38,
    padding: 0,
    fontFamily: 'OpenSans-Bold',
  },
  subHeaderTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 22,
    padding: 5,
  },
  main: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
  },
  buttonsAndLogoView: {
    flex: 6,
    justifyContent: 'space-around',
  },
  actionButtonsView: {
    width: width * 0.7866,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 2,
    alignItems: 'center',
    marginBottom: -10,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingBottom: 10,
    justifyContent: 'flex-end',
  },
  sectionDescription: {
    fontSize: 12,
    lineHeight: 24,
    fontFamily: 'OpenSans-Regular',
    marginLeft: 10,
    marginRight: 10,
  },
  startLoggingButtonTouchable: {
    borderRadius: 12,
    backgroundColor: '#665eff',
    height: 52,
    alignSelf: 'center',
    width: width * 0.7866,
    justifyContent: 'center',
  },
  startLoggingButtonText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  stopLoggingButtonTouchable: {
    borderRadius: 12,
    backgroundColor: '#fd4a4a',
    height: 52,
    alignSelf: 'center',
    width: width * 0.7866,
    justifyContent: 'center',
  },
  stopLoggingButtonText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  actionButtonsTouchable: {
    height: 76,
    borderRadius: 8,
    backgroundColor: '#454f63',
    width: width * 0.23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonImage: {
    height: 21.6,
    width: 32.2,
  },
  actionButtonText: {
    opacity: 0.56,
    fontFamily: 'OpenSans-Bold',
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 6,
  },
  menuOptionText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    padding: 10,
  },
  searchInput: {
    zIndex: 999,
    position: "absolute",
    top: 0,
    backgroundColor: "#fff",
    padding: 20,
    width: "95%",
    borderRadius: 14,
    marginTop: 50,
    shadowColor: "#2E4874",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    elevation: 24,
  },
  panelContainer: {
    zIndex: 9999,
    overflow: "hidden",

    margin: 15,
  },
});

export default LocationTracking;
