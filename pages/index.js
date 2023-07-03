import React, { useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css';
import Layout from '@/components/Layout/layout';

export default function Home({ user, userFollowStats }) {
  console.log(user);
  useEffect(() => {
    document.title = `Welcome, ${user.name.split(' ')[0]}`;
  }, []);
  return <div>This is the Home page</div>;
}
