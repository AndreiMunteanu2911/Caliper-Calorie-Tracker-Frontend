import { PageHead } from '@/src/components/layout/PageHead';
import { ProfileScreen } from '@/src/components/profile/ProfileScreen';

export default function ProfileRoute() {
  return (
    <>
      <PageHead title="Profile" />
      <ProfileScreen />
    </>
  );
}
