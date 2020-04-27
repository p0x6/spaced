import React, { memo } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
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
  place,
  userMarkers,
  navigation,
}) => {
  const renderAnnotations = () => {
    console.log('===== PLACE =====', place);
    if (place.name && place.address && place.coordinates) {
      return (
        <MapboxGL.PointAnnotation
          key={place.name}
          id={place.name}
          coordinate={place.coordinates}
          title={place.name}>
          <MapboxGL.Callout title={place.name} />
        </MapboxGL.PointAnnotation>
      );
    }
    return null;
  };

  const renderRoute = () => {
    if (isLogging && navigation) {
      console.log('====== HAS NAVIGATION ======', region, place);
      return (
        <MapboxGL.ShapeSource id='routeSource' shape={navigation}>
          <MapboxGL.LineLayer id='routeFill' style={layerStyles.route} />
        </MapboxGL.ShapeSource>
      );
    }
  };

  // if (region.coordinates !== 2) return null;

  console.log('====== MAP REGION ======', region);

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
          centerCoordinate={region}
          animationMode={'flyTo'}
          followUserLocation={!!navigation}
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
  place: state.placeLocation,
  navigation: state.navigation,
});

export default memo(connect(mapStateToProps, null)(MapViewComponent));
