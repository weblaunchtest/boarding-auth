import { createAuth0Client } from '@auth0/auth0-spa-js';

import { handleTODOsForm, loadTODOS } from './todos';

const init = async () => {
  const client = await createAuth0Client({
    clientId: 'DJlKHrTvogfx7g6bhiPpskriHIgWzkjJ',
    domain: 'cfw-stream.us.auth0.com',
    authorizationParams: {
      redirect_uri: 'https://stream-cloudflare-workers.webflow.io/',
      audience: 'https://stream.finsweet.com',
    },
  });

  const url = new URLSearchParams(window.location.search);
  const code = url.get('code');
  if (code) {
    await client.handleRedirectCallback();
    history.replaceState({}, document.title, window.location.origin + window.location.pathname);
  }

  const isLoggedIn = await client.isAuthenticated();

  console.log({ isLoggedIn });

  window.Webflow ||= [];
  window.Webflow.push(async () => {
    const loginElement = document.querySelector('[data-element="login"]');
    const logoutElement = document.querySelector('[data-element="logout"]');
    if (!loginElement || !logoutElement) return;

    loginElement.addEventListener('click', async () => {
      await client.loginWithRedirect();
    });

    logoutElement.addEventListener('click', async () => {
      await client.logout();
    });

    if (!isLoggedIn) return;

    const access_token = await client.getTokenSilently();
    const user = await client.getUser();
    console.log({ user, access_token });

    handleTODOsForm(access_token);

    const todos = await loadTODOS(access_token);
    console.log({ todos });
  });
};

init();
