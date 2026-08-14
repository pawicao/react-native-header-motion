import * as React from 'react';
import { generateContent } from '@/components';
import HeaderMotion, {
  RefreshPhase,
  useMotionProgress,
  useRefreshControl,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Exercises the refresh-control edge cases that the regular showcases cannot:
 * programmatic refresh, disabling (including mid-refresh), unmounting the
 * control mid-refresh, and two tabs handing the shared refresh state over.
 * The header renders a live phase/progress readout so the state machine can
 * be asserted from UI tests.
 */
export default function Screen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [enabled, setEnabled] = React.useState(true);
  const [controlMounted, setControlMounted] = React.useState(true);
  const [tab, setTab] = React.useState<'a' | 'b'>('a');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2500);
  }, []);

  const startRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 3000);
  }, []);

  // Disables the control 600ms into a refresh, re-enables at 1800ms while the
  // refresh is still running, and ends the refresh at 3500ms. Expected phases:
  // refreshing -> disabled -> refreshing -> finishing -> idle.
  const disableMidRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setEnabled(false), 600);
    setTimeout(() => setEnabled(true), 1800);
    setTimeout(() => setRefreshing(false), 3500);
  }, []);

  const refreshControl = controlMounted ? (
    <HeaderMotion.RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      enabled={enabled}
    />
  ) : undefined;

  const buttons: [string, string, () => void][] = [
    ['start-refresh', 'Start refresh (3s)', startRefresh],
    [
      'toggle-enabled',
      enabled ? 'Disable' : 'Enable',
      () => setEnabled((e) => !e),
    ],
    ['disable-mid-refresh', 'Disable mid-refresh demo', disableMidRefresh],
    [
      'toggle-control',
      controlMounted ? 'Unmount control' : 'Mount control',
      () => setControlMounted((m) => !m),
    ],
    [
      'switch-tab',
      `Switch to tab ${tab === 'a' ? 'B' : 'A'}`,
      () => setTab((t) => (t === 'a' ? 'b' : 'a')),
    ],
  ];

  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(value) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={value}>
                  <ReadoutHeader
                    enabled={enabled}
                    controlMounted={controlMounted}
                    tab={tab}
                  />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>
      <HeaderMotion.ScrollView key={tab} refreshControl={refreshControl}>
        <View style={styles.buttonColumn}>
          {buttons.map(([testID, label, onPress]) => (
            <Pressable
              key={testID}
              testID={testID}
              accessibilityRole="button"
              onPress={onPress}
              style={styles.button}
            >
              <Text style={styles.buttonLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {generateContent({
          count: 40,
          backgroundColor: tab === 'a' ? '#EEF3FF' : '#FFF3EE',
          textColor: '#1B2733',
          label: `Tab ${tab.toUpperCase()}`,
        })}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function ReadoutHeader({
  enabled,
  controlMounted,
  tab,
}: {
  enabled: boolean;
  controlMounted: boolean;
  tab: 'a' | 'b';
}) {
  const { progress, progressThreshold } = useMotionProgress();
  const refresh = useRefreshControl();
  const insets = useSafeAreaInsets();
  const [phaseLabel, setPhaseLabel] = React.useState<RefreshPhase>(
    RefreshPhase.Idle
  );
  const [progressLabel, setProgressLabel] = React.useState('0');

  useAnimatedReaction(
    () => refresh.phase.get(),
    (phase, previous) => {
      if (phase !== previous) {
        scheduleOnRN(setPhaseLabel, phase);
      }
    }
  );

  useAnimatedReaction(
    () => {
      const value = refresh.progress.get();
      return Math.round(Math.min(Math.max(value, 0), 3) * 20) / 20;
    },
    (value, previous) => {
      if (value !== previous) {
        scheduleOnRN(setProgressLabel, value.toFixed(2));
      }
    }
  );

  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    return {
      transform: [
        {
          translateY: interpolate(
            progress.get(),
            [0, 1],
            [0, -threshold],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(refresh.progress.get(), 1) * 100}%`,
  }));

  return (
    <HeaderMotion.Header
      style={[styles.header, { paddingTop: insets.top + 8 }, containerStyle]}
    >
      <Text style={styles.title}>Refresh Edge Cases</Text>
      <Text style={styles.readout} testID="refresh-phase-readout">
        phase: {phaseLabel}
      </Text>
      <Text style={styles.readout} testID="refresh-progress-readout">
        progress: {progressLabel}
      </Text>
      <Text style={styles.readout} testID="refresh-config-readout">
        enabled: {String(enabled)} | control:{' '}
        {controlMounted ? 'mounted' : 'unmounted'} | tab: {tab.toUpperCase()}
      </Text>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, barStyle]} />
      </View>
    </HeaderMotion.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#101828',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  readout: {
    color: '#B7C4D8',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    marginTop: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2A3648',
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5EDBA6',
  },
  buttonColumn: {
    padding: 12,
    gap: 8,
  },
  button: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
