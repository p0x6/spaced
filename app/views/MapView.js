import React, { useEffect, memo } from 'react';
import { StyleSheet, View, Dimensions, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapboxGL from '@react-native-mapbox-gl/maps';

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

  // const renderAnnotations = () => {
  //   const items = [];
  //
  //   const places = _.get(placeMarkers, 'features', []);
  //
  //   for (let i = 0; i < places.length; i++) {
  //     const coordinate = _.get(places[i], 'geometry.coordinates', null);
  //     const details = _.get(places[i], 'properties', null);
  //
  //     if (!coordinate) continue;
  //
  //     const title = `Lon: ${coordinate[0]} Lat: ${coordinate[1]}`;
  //     const id = `pointAnnotation${i}`;
  //
  //     items.push(
  //       <MapboxGL.PointAnnotation
  //         key={id}
  //         id={id}
  //         coordinate={coordinate}
  //         title={title}>
  //         <View style={styles.annotationContainer} />
  //         <MapboxGL.Callout title={`${details.name}`}>
  //           {/*<View>*/}
  //           {/*  <Text>*/}
  //           {/*    {details.address}*/}
  //           {/*  </Text>*/}
  //           {/*</View>*/}
  //         </MapboxGL.Callout>
  //       </MapboxGL.PointAnnotation>,
  //     );
  //   }
  //
  //   return items;
  // };

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
        {/*{renderAnnotations()}*/}
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

  // annotationContainer: {
  //   width: ANNOTATION_SIZE,
  //   height: ANNOTATION_SIZE,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   backgroundColor: '#2E4874',
  //   borderRadius: ANNOTATION_SIZE / 2,
  //   borderWidth: StyleSheet.hairlineWidth,
  //   borderColor: '#2E4874',
  //   overflow: 'hidden',
  // },
});

export default memo(MapViewComponent);
