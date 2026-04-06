import type { CreateHeaderMotionScrollableOptions } from '../components/createHeaderMotionScrollable';

export const ScrollablePresets = {
  FlashList: {
    displayName: 'HeaderMotionFlashList',
    isComponentAnimated: false,
    contentContainerMode: 'renderScrollComponent',
    managedRefTarget: 'inner',
  } as const satisfies CreateHeaderMotionScrollableOptions<false>,
  AnimatedLegendList: {
    displayName: 'HeaderMotionLegendList',
    isComponentAnimated: true,
    contentContainerMode: 'renderScrollComponent',
    managedRefTarget: 'inner',
  } as const satisfies CreateHeaderMotionScrollableOptions<true>,
};
