import { useCallback, useMemo, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { ActiveScrollIdValues, SetActiveScrollId } from '../types';

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
