import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import Layout from '@/components/Layout/layout';
import { destroyCookie, parseCookies } from 'nookies';
import axios from 'axios';
import baseUrl from '@/utils/baseUrl';
import { redirectUser } from '@/utils/authUser';

MyApp.getInitialProps = async ({ Component, ctx }) => {
  const { token } = parseCookies(ctx);
  let pageProps = {};

  const protectedRouts = ctx.pathname === '/';

  if (!token) {
    protectedRouts && redirectUser(ctx, '/login');
  } else {
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    try {
      const res = await axios.get(`${baseUrl}/api/auth`, {
        headers: { Authorization: token },
      });

      const { user, userFollowStats } = res.data;

      if (user) !protectedRouts && redirectUser(ctx, '/');

      pageProps.user = user;
      pageProps.userFollowStats = userFollowStats;
    } catch (error) {
      destroyCookie(ctx, 'token');
      redirectUser(ctx, '/login');
    }
  }

  return { pageProps };
};

function MyApp({ Component, pageProps }) {
  return (
    <Layout {...pageProps}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
