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
  dense?: boolean;
  containerClassName?: string;
  inputClassName?: string;
};

export const InputBox = forwardRef<TextInput, InputBoxProps>(function InputBox(
  {
    compact = false,
    dense = false,
    containerClassName = '',
    inputClassName = '',
    onBlur,
    onFocus,
    style,
    ...textInputProps
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center border bg-[#141414] ${
        dense
          ? 'min-h-11 rounded-2xl px-3'
          : compact
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
        style={[{ textAlignVertical: 'center' }, style]}
        underlineColorAndroid="transparent"
        className={`caliper-input min-w-0 flex-1 border-0 rounded-none bg-[#141414] text-base leading-5 text-white ${
          dense
            ? 'min-h-9 mt-2 ml-1'
            : compact
              ? 'min-h-10 py-2'
              : 'min-h-12 py-3'
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
