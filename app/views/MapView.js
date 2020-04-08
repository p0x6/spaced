import React, { useEffect, memo } from 'react';
import { StyleSheet, View, Dimensions, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import _ from 'lodash';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const layerStyles = {
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

const ANNOTATION_SIZE = 15;

const MapViewComponent = ({
  isLogging,
  mapRef,
  region,
  userMarkers,
  placeMarkers,
}) => {
  const { navigate } = useNavigation();

  function handleBackPress() {
    navigate('MainScreen', {});
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return function cleanup() {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [region]);

  const renderAnnotations = () => {
    const items = [];

    const places = _.get(placeMarkers, 'features', []);

    console.log('====== PLACES ======', places, placeMarkers);

    for (let i = 0; i < places.length; i++) {
      const coordinate = _.get(places[i], 'geometry.coordinates', null);
      const details = _.get(places[i], 'properties', null);
      const text = _.get(places[i], 'text', null);

      if (!coordinate) continue;

      const title = details.address || details.name;
      const id = `pointAnnotation${i}`;

      items.push(
        <MapboxGL.PointAnnotation
          key={id}
          id={id}
          coordinate={coordinate}
          title={title}>
          <View
            style={[
              styles.annotationContainer,
              { transform: [{ rotate: '45deg' }] },
            ]}
          />
          <MapboxGL.Callout title={`${text || details.name}`}>
            {/*<View>*/}
            {/*  <Text>*/}
            {/*    {details.address}*/}
            {/*  </Text>*/}
            {/*</View>*/}
          </MapboxGL.Callout>
        </MapboxGL.PointAnnotation>,
      );
    }

    return items;
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
          zoomLevel={15}
          centerCoordinate={[region.longitude, region.latitude]}
          animationMode={'flyTo'}
        />
        <MapboxGL.UserLocation />

        <MapboxGL.ShapeSource
          id='userLocations'
          cluster
          clusterRadius={50}
          clusterMaxZoom={14}
          url='https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'>
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

  annotationContainer: {
    width: 20,
    height: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 0,
    backgroundColor: '#89849b',
    transform: [{ rotate: '45deg' }],
  },
});

export default memo(MapViewComponent);
