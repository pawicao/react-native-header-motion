import { useContext } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { HeaderMotionContext } from '../../context';
import { HeaderMotionContextProvider } from '../HeaderMotion';

it('uses finite motion values before the dynamic header is measured', () => {
  const { result } = renderHook(() => useContext(HeaderMotionContext)!, {
    wrapper: ({ children }) => (
      <HeaderMotionContextProvider>{children}</HeaderMotionContextProvider>
    ),
  });

  expect(result.current.progressThreshold.get()).toBe(0);
  expect(result.current.progress.get()).toBe(0);
  expect(
    Number.isFinite(
      result.current.progress.get() * result.current.progressThreshold.get()
    )
  ).toBe(true);

  act(() => {
    result.current.measureDynamic({
      nativeEvent: { layout: { height: 120, width: 300, x: 0, y: 0 } },
    } as any);
  });
  expect(result.current.progressThreshold.get()).toBe(120);
});

it('keeps a fixed header at zero progress', () => {
  const { result } = renderHook(() => useContext(HeaderMotionContext)!, {
    wrapper: ({ children }) => (
      <HeaderMotionContextProvider progressThreshold={0}>
        {children}
      </HeaderMotionContextProvider>
    ),
  });

  expect(result.current.progress.get()).toBe(0);
  expect(result.current.progressThreshold.get()).toBe(0);
});
