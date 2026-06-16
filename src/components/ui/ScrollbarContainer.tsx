import { Platform } from 'react-native';
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
  const { style: incomingStyle, ...otherScrollViewProps } = scrollViewProps;
  const base = horizontal
    ? 'caliper-scrollbar flex-row'
    : 'caliper-scrollbar min-h-0';
  const contentStyle = scrollViewProps.contentContainerStyle;

  return (
    <ScrollView
      {...otherScrollViewProps}
      ref={ref}
      className={`${base} ${className}`}
      contentContainerClassName={contentContainerClassName}
      contentContainerStyle={[
        !horizontal ? { flexGrow: 1, alignSelf: 'stretch' } : null,
        contentStyle,
      ]}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={horizontal}
      showsVerticalScrollIndicator={!horizontal}
      style={
        Platform.OS === 'web'
          ? [
              {
                scrollbarWidth: 'thin' as const,
                scrollbarColor: '#FF5A16 rgba(16, 16, 16, 0.4)' as const,
              } as never,
              incomingStyle,
            ]
          : [
              !horizontal
                ? {
                    alignSelf: 'stretch',
                    flexGrow: 0,
                    flexShrink: 1,
                    width: '100%',
                  }
                : null,
              incomingStyle,
            ]
      }>
      {children}
    </ScrollView>
  );
});
