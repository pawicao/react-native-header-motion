import { useCallback, useMemo, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { ActiveScrollIdValues, SetActiveScrollId } from '../types';

/**
 * Hook to manage active scroll ID for multi-scroll scenarios (e.g. tabs with different scroll views).
 * Returns both a state value and a shared value, along with a setter function.
 *
 * Use this when you have multiple scroll views (like in a tabbed interface) and need to
 * track which one is currently active. Pass the shared value to `HeaderMotion`'s `activeScrollId` prop.
 *
 * @template T - The type of the scroll ID string
 * @param initialActiveScrollId - The initial active scroll ID
 * @returns A tuple containing:
 * - `[0]`: Object with `state` (React state) and `sv` (shared value) for the active scroll ID
 * - `[1]`: Function to set the active scroll ID
 *
 * @example
 * ```tsx
 * function TabbedScrollView() {
 *   const [activeScroll, setActiveScroll] = useActiveScrollId('tab1');
 *
 *   return (
 *     <HeaderMotion activeScrollId={activeScroll.sv}>
 *       <Tabs onTabChange={setActiveScroll}>
 *         <Tab id="tab1" />
 *         <Tab id="tab2" />
 *       </Tabs>
 *     </HeaderMotion>
 *   );
 * }
 * ```
 */
export function useActiveScrollId<T extends string>(
  initialActiveScrollId: T
): [ActiveScrollIdValues<T>, SetActiveScrollId<T>] {
  const [activeScrollIdState, setActiveScrollIdState] = useState<T>(
    initialActiveScrollId
  );
  const activeScrollIdSv = useSharedValue<T>(initialActiveScrollId);

  const setActiveScrollId = useCallback<SetActiveScrollId<T>>(
    (newId) => {
      setActiveScrollIdState(newId);
      activeScrollIdSv.set(newId);
    },
    [setActiveScrollIdState, activeScrollIdSv]
  );

  const values = useMemo<ActiveScrollIdValues<T>>(
    () => ({
      state: activeScrollIdState,
      sv: activeScrollIdSv,
    }),
    [activeScrollIdState, activeScrollIdSv]
  );

  return [values, setActiveScrollId];
}
