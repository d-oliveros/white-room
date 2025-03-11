import type { GetAuthMe200 } from '@namespace/api-client';

export default function getUserLandingPage(user?: GetAuthMe200): string {
  let landingPage = '/';

  if (!user) {
    landingPage = '/login';
  }

  return landingPage;
}
