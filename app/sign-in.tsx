import { AuthScreen } from '@/src/components/auth/AuthScreen';
import { PageHead } from '@/src/components/layout/PageHead';

export default function SignInRoute() {
  return (
    <>
      <PageHead title="Sign In" />
      <AuthScreen mode="sign-in" />
    </>
  );
}
