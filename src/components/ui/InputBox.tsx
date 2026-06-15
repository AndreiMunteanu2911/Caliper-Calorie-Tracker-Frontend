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
          ? 'min-h-9 rounded-lg px-2'
          : compact
          ? 'min-h-10 rounded-lg px-3 py-1'
          : 'min-h-11 rounded-lg p-1 pl-3'
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
        className={`caliper-input min-w-0 flex-1 border-0 rounded-none bg-[#141414] text-sm leading-5 text-white ${
          dense
            ? 'min-h-5 py-1.5'
            : compact
            ? 'min-h-7 py-1'
              : 'min-h-8 py-1.5'
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
