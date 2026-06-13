import { AdvisorScreen } from '@/src/components/advisor/AdvisorScreen';
import { PageHead } from '@/src/components/layout/PageHead';

export default function ChatRoute() {
  return (
    <>
      <PageHead title="AI Advisor" />
      <AdvisorScreen />
    </>
  );
}
