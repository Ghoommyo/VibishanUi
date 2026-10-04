import { Redirect } from 'expo-router';

import { useSession } from '@/providers/session';

// Anchor route: protected screens fall back here, so it just forwards to the right place.
export default function Index() {
  const { user } = useSession();
  return <Redirect href={user ? '/home' : '/welcome'} />;
}
