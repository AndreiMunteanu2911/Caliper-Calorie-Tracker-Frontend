import {
  forwardRef,
  useState,
} from 'react';
import {
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

type InputBoxProps = TextInputProps & {
  compact?: boolean;
  containerClassName?: string;
  inputClassName?: string;
};

export const InputBox = forwardRef<TextInput, InputBoxProps>(function InputBox(
  {
    compact = false,
    containerClassName = '',
    inputClassName = '',
    onBlur,
    onFocus,
    ...textInputProps
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center overflow-hidden border bg-[#141414] ${
        compact
          ? 'min-h-14 rounded-[18px] px-4 py-1'
          : 'min-h-16 rounded-[24px] p-2 pl-4'
      } ${
        isFocused
          ? 'border-accent shadow-glow'
          : 'border-white/10 shadow-soft'
      } ${containerClassName}`}>
      <TextInput
        {...textInputProps}
        ref={ref}
        className={`caliper-input min-w-0 flex-1 bg-transparent text-base leading-5 text-white ${
          compact ? 'min-h-10 py-2' : 'min-h-12 py-3'
        } ${inputClassName}`}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
      />
    </View>
  );
});
