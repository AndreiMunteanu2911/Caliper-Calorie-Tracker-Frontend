import { DashboardScreen } from '@/src/components/dashboard/DashboardScreen';
import { PageHead } from '@/src/components/layout/PageHead';

export default function DashboardRoute() {
  return (
    <>
      <PageHead title="Today" />
      <DashboardScreen />
    </>
  );
}
