/* eslint-disable no-undef */
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock')
);

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

require('react-native-reanimated').setUpTests();
