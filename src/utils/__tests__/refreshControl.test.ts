import React from 'react';
import { RefreshControl } from 'react-native';
import { resolveRefreshControl } from '../refreshControl';

jest.mock('react-native-reanimated', () => {
  const ReactActual = require('react');

  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (Component: any) =>
        function MockAnimatedComponent(props: any) {
          return ReactActual.createElement(Component, props);
        },
    },
    useAnimatedProps: (factory: () => object) => factory(),
  };
});

describe('resolveRefreshControl', () => {
  it('injects progressViewOffset into explicit refreshControl when missing', () => {
    const onRefresh = jest.fn();
    const refreshControl = React.createElement(RefreshControl, {
      refreshing: false,
      onRefresh,
    });

    const resolved = resolveRefreshControl({
      refreshControl,
      progressViewOffset: 72,
    });

    expect(resolved).toBeDefined();
    expect(resolved).not.toBe(refreshControl);
    expect(resolved?.props.progressViewOffset).toBe(72);
  });

  it('keeps explicit progressViewOffset from refreshControl', () => {
    const onRefresh = jest.fn();
    const refreshControl = React.createElement(RefreshControl, {
      refreshing: false,
      onRefresh,
      progressViewOffset: 24,
    });

    const resolved = resolveRefreshControl({
      refreshControl,
      progressViewOffset: 72,
    });

    expect(resolved).toBeDefined();
    expect(resolved?.type).toBe(refreshControl.type);
    expect(resolved?.props.refreshing).toBe(false);
    expect(resolved?.props.onRefresh).toBe(onRefresh);
    expect(resolved?.props.progressViewOffset).toBe(24);
  });

  it('creates refreshControl from refreshing/onRefresh', () => {
    const onRefresh = jest.fn();

    const resolved = resolveRefreshControl({
      refreshing: true,
      onRefresh,
      progressViewOffset: 64,
    });

    expect(resolved).toBeDefined();
    expect(typeof resolved?.type).toBe('function');
    expect(resolved?.props.refreshing).toBe(true);
    expect(resolved?.props.onRefresh).toBe(onRefresh);
    expect(resolved?.props.progressViewOffset).toBe(64);
  });

  it('prefers explicit refreshControl over refreshing/onRefresh inputs', () => {
    const explicitOnRefresh = jest.fn();
    const fallbackOnRefresh = jest.fn();
    const refreshControl = React.createElement(RefreshControl, {
      refreshing: false,
      onRefresh: explicitOnRefresh,
      progressViewOffset: 24,
    });

    const resolved = resolveRefreshControl({
      refreshControl,
      refreshing: true,
      onRefresh: fallbackOnRefresh,
      progressViewOffset: 72,
    });

    expect(resolved).toBeDefined();
    expect(resolved?.type).toBe(refreshControl.type);
    expect(resolved?.props.refreshing).toBe(false);
    expect(resolved?.props.onRefresh).toBe(explicitOnRefresh);
    expect(resolved?.props.progressViewOffset).toBe(24);
  });

  it('returns undefined for invalid refreshControl values', () => {
    const resolved = resolveRefreshControl({
      refreshControl: 'invalid' as any,
      onRefresh: jest.fn(),
      progressViewOffset: 64,
    });

    expect(resolved).toBeUndefined();
  });

  it('returns undefined when refresh handling is not configured', () => {
    expect(
      resolveRefreshControl({
        progressViewOffset: 64,
      })
    ).toBeUndefined();
  });
});
