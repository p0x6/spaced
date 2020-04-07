import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import LocationTracking from '../MainScreen';

it('renders correctly', async () => {
  const tree = renderer
    .create(<LocationTracking />)
    .toJSON();
  await expect(tree).toMatchSnapshot();
});
