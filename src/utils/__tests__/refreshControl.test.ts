import React from 'react';
import { RefreshControl, type RefreshControlProps } from 'react-native';
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

function createHeadlessRefreshControl() {
  // Stand-in for HeaderMotion.RefreshControl carrying the same static marker.
  const HeadlessRefreshControl = (_props: RefreshControlProps) => null;
  HeadlessRefreshControl.isHeaderMotionRefreshControl = true;
  return HeadlessRefreshControl;
}

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

  it('injects numeric progressViewOffset into HeaderMotion.RefreshControl without replacing it', () => {
    const HeadlessRefreshControl = createHeadlessRefreshControl();
    const refreshControl = React.createElement(HeadlessRefreshControl, {
      refreshing: false,
      onRefresh: jest.fn(),
    });

    const resolved = resolveRefreshControl({
      refreshControl,
      progressViewOffset: 72,
    });

    expect(resolved?.type).toBe(HeadlessRefreshControl);
    expect(resolved?.props.progressViewOffset).toBe(72);
  });

  it('preserves HeaderMotion.RefreshControl when progressViewOffset is a SharedValue', () => {
    const HeadlessRefreshControl = createHeadlessRefreshControl();
    const refreshControl = React.createElement(HeadlessRefreshControl, {
      refreshing: false,
      onRefresh: jest.fn(),
    });

    const resolved = resolveRefreshControl({
      refreshControl,
      progressViewOffset: { value: 72 } as any,
    });

    expect(resolved?.type).toBe(HeadlessRefreshControl);
  });

  it('marks the exported RefreshControl component as headless', () => {
    const {
      RefreshControl: HeaderMotionRefreshControl,
    } = require('../../components/RefreshControl');

    expect(HeaderMotionRefreshControl.isHeaderMotionRefreshControl).toBe(true);
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
