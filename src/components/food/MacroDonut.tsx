import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const STROKE_WIDTH = 18;
const RADIUS = 60;
const VIEWBOX = (RADIUS + STROKE_WIDTH) * 2;
const CENTER = VIEWBOX / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const COLORS: Record<string, string> = {
    protein: '#45C588',
    carbs: '#F5F378',
    fats: '#DDC0FF',
};

type MacroDonutProps = {
    protein: number;
    carbs: number;
    fats: number;
    size?: number;
};

export function MacroDonut({ protein, carbs, fats, size = VIEWBOX }: MacroDonutProps) {
    const total = protein + carbs + fats;
    const segments =
        total > 0
            ? [
                { key: 'protein', value: protein / total, color: COLORS.protein },
                { key: 'carbs', value: carbs / total, color: COLORS.carbs },
                { key: 'fats', value: fats / total, color: COLORS.fats },
            ]
            : [{ key: 'empty', value: 1, color: '#2A2A2A' }];

    let offset = 0;
    const scale = total > 0 ? 1 : 0;

    return (
        <View className="items-center justify-center" style={{ width: size, height: size }}>
            <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
                {segments.map((seg) => {
                    const dashLength = seg.value * scale * CIRCUMFERENCE;
                    const dashGap = CIRCUMFERENCE - dashLength;
                    const strokeDasharray =
                        dashLength > 0 ? `${dashLength} ${dashGap}` : undefined;
                    const rotation = offset * 360;
                    offset += seg.value;

                    return (
                        <Circle
                            cx={CENTER}
                            cy={CENTER}
                            fill="none"
                            key={seg.key}
                            r={RADIUS}
                            stroke={seg.color}
                            strokeDasharray={strokeDasharray}
                            strokeLinecap="butt"
                            strokeWidth={STROKE_WIDTH}
                            transform={`rotate(${-90 + rotation} ${CENTER} ${CENTER})`}
                        />
                    );
                })}
            </Svg>
            <Text className="absolute text-[22px] text-white font-black tracking-wider">
                {total > 0 ? `${Math.round(total)}g` : '-'}
            </Text>
        </View>
    );
}