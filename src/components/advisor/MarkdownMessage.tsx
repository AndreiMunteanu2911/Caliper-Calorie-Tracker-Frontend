import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';

type MarkdownMessageProps = {
  content: string;
};

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'divider' };

function inlineText(value: string): ReactNode[] {
  return value
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text className="font-black text-white" key={`${part}-${index}`}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <Text
            className="rounded bg-white/10 font-semibold text-carbs"
            key={`${part}-${index}`}>
            {part.slice(1, -1)}
          </Text>
        );
      }
      return part;
    });
}

function tableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  return /^\s*\|?[\s:-]+(?:\|[\s:-]+)+\|?\s*$/.test(line);
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }
    if (/^---+$/.test(line)) {
      blocks.push({ type: 'divider' });
      index += 1;
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        text: heading[2],
      });
      index += 1;
      continue;
    }
    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push({ type: 'quote', text: quote.join(' ') });
      continue;
    }
    if (
      line.includes('|') &&
      index + 1 < lines.length &&
      isTableDivider(lines[index + 1])
    ) {
      const rows = [tableRow(lines[index])];
      index += 2;
      while (index < lines.length && lines[index].includes('|')) {
        rows.push(tableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: 'table', rows });
      continue;
    }
    const listMatch = /^(\d+\.\s+|[-*]\s+)(.+)$/.exec(line);
    if (listMatch) {
      const ordered = /^\d+\./.test(listMatch[1]);
      const items: string[] = [];
      while (index < lines.length) {
        const match = /^(\d+\.\s+|[-*]\s+)(.+)$/.exec(lines[index].trim());
        if (!match || /^\d+\./.test(match[1]) !== ordered) break;
        items.push(match[2]);
        index += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim();
      if (
        /^(#{1,3})\s+/.test(next) ||
        /^(\d+\.\s+|[-*]\s+)/.test(next) ||
        next.startsWith('>') ||
        /^---+$/.test(next) ||
        (next.includes('|') &&
          index + 1 < lines.length &&
          isTableDivider(lines[index + 1]))
      ) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return blocks;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <View className="gap-3">
      {parseBlocks(content).map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === 'heading') {
          const size =
            block.level === 1
              ? 'text-2xl leading-8'
              : block.level === 2
                ? 'text-xl leading-7'
                : 'text-lg leading-6';
          return (
            <Text className={`${size} font-black text-white`} key={key}>
              {inlineText(block.text)}
            </Text>
          );
        }
        if (block.type === 'quote') {
          return (
            <View className="rounded-r-2xl border-l-4 border-accent bg-accent/10 px-4 py-3" key={key}>
              <Text className="text-sm leading-6 text-white/75">
                {inlineText(block.text)}
              </Text>
            </View>
          );
        }
        if (block.type === 'list') {
          return (
            <View className="gap-2" key={key}>
              {block.items.map((item, itemIndex) => (
                <View className="flex-row gap-3" key={`${item}-${itemIndex}`}>
                  <Text className="w-5 font-black text-accent">
                    {block.ordered ? `${itemIndex + 1}.` : '-'}
                  </Text>
                  <Text className="min-w-0 flex-1 text-[15px] leading-6 text-white/85">
                    {inlineText(item)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        if (block.type === 'table') {
          return (
            <ScrollbarContainer
              className="max-w-full rounded-2xl border border-white/10 bg-black/20"
              contentContainerClassName="p-2"
              horizontal
              key={key}>
              <View>
                {block.rows.map((row, rowIndex) => (
                  <View
                    className={`flex-row ${
                      rowIndex === 0 ? 'bg-white/10' : 'border-t border-white/10'
                    }`}
                    key={`${row.join('-')}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <Text
                        className={`w-32 px-3 py-2 text-xs leading-5 ${
                          rowIndex === 0
                            ? 'font-black text-white'
                            : 'text-white/70'
                        }`}
                        key={`${cell}-${cellIndex}`}>
                        {inlineText(cell)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollbarContainer>
          );
        }
        if (block.type === 'divider') {
          return <View className="h-px bg-white/10" key={key} />;
        }
        return (
          <Text className="text-[15px] leading-6 text-white/85" key={key}>
            {inlineText(block.text)}
          </Text>
        );
      })}
    </View>
  );
}
