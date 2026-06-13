import { AuthScreen } from '@/src/components/auth/AuthScreen';
import { PageHead } from '@/src/components/layout/PageHead';

export default function SignUpRoute() {
  return (
    <>
      <PageHead title="Create Account" />
      <AuthScreen mode="sign-up" />
    </>
  );
}
