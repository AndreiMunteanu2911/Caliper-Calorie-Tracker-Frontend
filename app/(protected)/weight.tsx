import { PageHead } from '@/src/components/layout/PageHead';
import { WeightTrackerScreen } from '@/src/components/weight/WeightTrackerScreen';

export default function WeightRoute() {
  return (
    <>
      <PageHead title="Weight Tracker" />
      <WeightTrackerScreen />
    </>
  );
}
