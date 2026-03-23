import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

describe('Basic Tests', () => {
  it('should render a basic View', () => {
    const { getByTestId } = render(
      <View testID="basic-view" />
    );

    expect(getByTestId('basic-view')).toBeTruthy();
  });

  it('should render Text', () => {
    const { getByText } = render(
      <Text>Hello World</Text>
    );

    expect(getByText('Hello World')).toBeTruthy();
  });
});
