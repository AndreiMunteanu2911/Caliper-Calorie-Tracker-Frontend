import { DiaryScreen } from '@/src/components/diary/DiaryScreen';
import { PageHead } from '@/src/components/layout/PageHead';

export default function DiaryRoute() {
  return (
    <>
      <PageHead title="Food Diary" />
      <DiaryScreen />
    </>
  );
}
