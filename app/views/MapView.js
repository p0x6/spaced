import React, { useEffect, memo, useState } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Dimensions, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SafePathsAPI from '../services/API';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { lineString as makeLineString } from '@turf/helpers';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import _ from 'lodash';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const defaultGeoJSON = require('./defaultGeoJSON.json');

const layerStyles = {
  smileyFace: {
    fillAntialias: true,
    fillColor: 'white',
    fillOutlineColor: 'rgba(255, 255, 255, 0.84)',
  },
  route: {
    lineColor: '#2E4874',
    lineCap: MapboxGL.LineJoin.Round,
    lineWidth: 3,
    lineOpacity: 0.84,
  },
  singlePoint: {
    circleColor: 'green',
    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
    circleRadius: 5,
    circlePitchAlignment: 'map',
  },

  clusteredPoints: {
    circlePitchAlignment: 'map',

    circleColor: [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1',
    ],

    circleRadius: ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],

    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
  },

  clusterCount: {
    textField: '{point_count}',
    textSize: 12,
    textPitchAlignment: 'map',
  },
};

const MapViewComponent = ({
  isLogging,
  mapRef,
  region,
  userMarkers,
  placeMarkers,
  navigateLocation,
  displayRoute,
}) => {
  const { navigate } = useNavigation();
  let [route, setRoute] = useState();

  const fetchRoute = async destinationCoordinates => {
    BackgroundGeolocation.getCurrentLocation(async location => {
      console.log('---- fetch route -----', destinationCoordinates);
      const res = await SafePathsAPI.getPathToDestination(
        [location.longitude, location.latitude],
        destinationCoordinates,
      );
      console.log('routes: ', res.data);
      if (_.get(res, 'data.coordinates', null)) {
        const newRoute = makeLineString(res.data.coordinates);
        setRoute(newRoute);
      }
    });
  };

  // const onUserLocationUpdate = newUserLocation => {
  //   console.log('----- NEW LOCAGION ------', newUserLocation);
  //   setUserLocation([
  //     newUserLocation.coords.longitude,
  //     newUserLocation.coords.latitude,
  //   ]);
  // };

  function handleBackPress() {
    navigate('MainScreen', {});
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    if (navigateLocation && navigateLocation.length === 2 && displayRoute) {
      console.log('------ NAVIGATE LOCATION ------', navigateLocation);
      fetchRoute(navigateLocation);
    } else {
      setRoute(null);
    }
    return function cleanup() {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [region, displayRoute, navigateLocation, userMarkers]);

  const renderAnnotations = () => {
    if (region.name && region.address && region.coordinates) {
      return (
        <MapboxGL.PointAnnotation
          key={region.name}
          id={region.name}
          coordinate={region.coordinates}
          title={region.name}>
          <MapboxGL.Callout title={region.name} />
        </MapboxGL.PointAnnotation>
      );
    }
    return null;
  };

  const renderRoute = () => {
    if (isLogging && route)
      return (
        <MapboxGL.ShapeSource id='routeSource' shape={route}>
          <MapboxGL.LineLayer id='routeFill' style={layerStyles.route} />
        </MapboxGL.ShapeSource>
      );
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL='mapbox://styles/mapbox/light-v10'
        zoomEnabled={isLogging}
        scrollEnabled={isLogging}
        pitchEnabled={isLogging}
        rotateEnabled={isLogging}>
        <MapboxGL.Camera
          zoomLevel={17}
          centerCoordinate={region.coordinates}
          animationMode={'flyTo'}
          followUserLocation={displayRoute}
        />
        <MapboxGL.UserLocation />
        {renderRoute()}

        <MapboxGL.ShapeSource
          id='userLocations'
          cluster
          clusterRadius={50}
          clusterMaxZoom={14}
          // url='https://spaced-app.s3.us-east-2.amazonaws.com/test3.geojson'
          shape={userMarkers || defaultGeoJSON}>
          <MapboxGL.SymbolLayer
            id='pointCount'
            style={layerStyles.clusterCount}
          />

          <MapboxGL.CircleLayer
            id='clusteredPoints'
            belowLayerID='pointCount'
            filter={['has', 'point_count']}
            style={layerStyles.clusteredPoints}
          />

          <MapboxGL.CircleLayer
            id='singlePoint'
            filter={['!', ['has', 'point_count']]}
            style={layerStyles.singlePoint}
          />
        </MapboxGL.ShapeSource>
        {renderAnnotations()}
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container covers the entire screen
  container: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
  },
  map: {
    width: width,
    height: height,
    alignSelf: 'center',
  },
  dropper: {
    width: 24,
    height: 41,
  },
});

const mapStateToProps = state => ({
  isLogging: state.isLogging,
  region: state.mapLocation,
});

export default memo(connect(mapStateToProps, null)(MapViewComponent));
