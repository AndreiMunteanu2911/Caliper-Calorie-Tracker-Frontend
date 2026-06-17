import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from 'phosphor-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ModalHeader } from '@/src/components/ui/ModalHeader';
import { ModalWrapper } from '@/src/components/ui/ModalWrapper';
import { localDateString, parseLocalDate } from '@/src/lib/dates';
import { MotionFade, MotionPressable } from '@/src/lib/motion';
import { shadows } from '@/src/lib/shadows';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type CalendarPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  displayValue?: string;
};

export function CalendarPicker({
  value,
  onChange,
  label = 'Select date',
  displayValue,
}: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [monthDirection, setMonthDirection] = useState<1 | -1>(1);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const selected = parseLocalDate(value);
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });

  useEffect(() => {
    if (!isOpen) return;
    const selected = parseLocalDate(value);
    setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [isOpen, value]);

  const weeks = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7;
    const monthLength = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [
      ...Array.from({ length: leadingDays }, () => null),
      ...Array.from({ length: monthLength }, (_, index) => index + 1),
    ];
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return Array.from({ length: days.length / 7 }, (_, index) =>
      days.slice(index * 7, (index + 1) * 7),
    );
  }, [visibleMonth]);

  function selectDay(day: number) {
    onChange(
      localDateString(
        new Date(
          visibleMonth.getFullYear(),
          visibleMonth.getMonth(),
          day,
        ),
      ),
    );
    setIsOpen(false);
  }

  function shiftMonth(offset: number) {
    setMonthDirection(offset > 0 ? 1 : -1);
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  return (
    <>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        className="min-h-10 flex-row items-center justify-between rounded-lg border border-white/10 bg-[#141414] px-3"
        style={shadows.soft}
        onPress={() => setIsOpen(true)}>
        <Text className="text-sm font-bold text-white">
          {displayValue ?? value}
        </Text>
        <CalendarBlankIcon color="#FF5A16" size={17} weight="bold" />
      </Pressable>

      <ModalWrapper isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader
          title="Choose date"
          description="Select a day from the calendar."
          onClose={() => setIsOpen(false)}
        />
        <View className="p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable
              accessibilityLabel="Previous month"
              className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
              onPress={() => shiftMonth(-1)}>
              <CaretLeftIcon color="#FFFFFF" size={18} />
            </Pressable>
            <Text className="font-black text-white">
              {new Intl.DateTimeFormat(undefined, {
                month: 'long',
                year: 'numeric',
              }).format(visibleMonth)}
            </Text>
            <Pressable
              accessibilityLabel="Next month"
              className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
              onPress={() => shiftMonth(1)}>
              <CaretRightIcon color="#FFFFFF" size={18} />
            </Pressable>
          </View>

          <View className="flex-row">
            {WEEKDAYS.map((weekday) => (
              <View className="flex-1 items-center py-2" key={weekday}>
                <Text className="text-xs font-black text-white/35">
                  {weekday}
                </Text>
              </View>
            ))}
          </View>

          <MotionFade
            distance={8}
            horizontal
            key={`${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`}
            reverse={monthDirection < 0}>
            <View className="gap-1">
              {weeks.map((week, weekIndex) => (
                <View className="flex-row" key={`week-${weekIndex}`}>
                {week.map((day, dayIndex) => {
                  if (day === null) {
                    return (
                      <View
                        className="min-h-12 flex-1 p-1"
                        key={`empty-${weekIndex}-${dayIndex}`}
                      />
                    );
                  }
                  const dateValue = localDateString(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth(),
                      day,
                    ),
                  );
                  const selected = dateValue === value;
                  const today = dateValue === localDateString();
                  return (
                    <View className="flex-1 p-1" key={dateValue}>
                      <MotionPressable
                        accessibilityLabel={dateValue}
                        className={`h-12 items-center justify-center rounded-xl border ${
                          selected
                            ? 'border-accent bg-accent'
                            : today
                              ? 'border-accent bg-accent/10'
                              : 'border-transparent bg-white/[0.03]'
                        }`}
                        selected={selected}
                        onPress={() => selectDay(day)}>
                        <Text
                          className={
                            selected
                              ? 'text-base font-black text-white'
                              : today
                                ? 'text-base font-black text-accent'
                                : 'text-base font-bold text-white/70'
                          }>
                          {day}
                        </Text>
                      </MotionPressable>
                    </View>
                  );
                })}
                </View>
              ))}
            </View>
          </MotionFade>

          <Pressable
            className="mt-4 items-center rounded-xl border border-accent py-3"
            onPress={() => {
              onChange(localDateString());
              setIsOpen(false);
            }}>
            <Text className="font-black text-accent">Today</Text>
          </Pressable>
        </View>
      </ModalWrapper>
    </>
  );
}
