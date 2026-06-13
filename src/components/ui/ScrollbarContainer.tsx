import {
  forwardRef,
  type ReactNode,
} from 'react';
import {
  ScrollView,
  type ScrollViewProps,
} from 'react-native';

type ScrollbarContainerProps = Omit<ScrollViewProps, 'children' | 'horizontal'> & {
  children: ReactNode;
  className?: string;
  contentContainerClassName?: string;
  horizontal?: boolean;
};

export const ScrollbarContainer = forwardRef<
  ScrollView,
  ScrollbarContainerProps
>(function ScrollbarContainer(
  {
    children,
    className = '',
    contentContainerClassName,
    horizontal = false,
    ...scrollViewProps
  },
  ref,
) {
  const base = horizontal
    ? 'caliper-scrollbar flex-row'
    : 'caliper-scrollbar min-h-0 flex-1';

  return (
    <ScrollView
      {...scrollViewProps}
      ref={ref}
      className={`${base} ${className}`}
      contentContainerClassName={contentContainerClassName}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={horizontal}
      showsVerticalScrollIndicator={!horizontal}>
      {children}
    </ScrollView>
  );
});
