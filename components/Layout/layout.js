import React, { createRef, useEffect } from 'react';
import Navbar from './Navbar';
import {
  Container,
  Grid,
  Ref,
  Segment,
  Sticky,
  Visibility,
} from 'semantic-ui-react';
import HeadTags from './HeadTags';
import nprogress from 'nprogress';
import Router from 'next/router';
import SideMenu from './SideMenu';
import Search from './Search';

function Layout({ children, user }) {
  const contextRef = createRef();
  useEffect(() => {
    const handleRouteChangeStart = () => {
      nprogress.start();
    };

    const handleRouteChangeComplete = () => {
      nprogress.done();
    };

    const handleRouteChangeError = () => {
      nprogress.done();
    };

    Router.events.on('routeChangeStart', handleRouteChangeStart);
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);
    Router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChangeStart);
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
      Router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, []);

  return (
    <>
      <HeadTags />
      {user ? (
        <>
          <div style={{ marginLeft: '1rem', marginRight: '1rem' }}>
            <Ref innerRef={contextRef}>
              <Grid>
                <Grid.Column floated='left' width={2}>
                  <Sticky context={contextRef}>
                    <SideMenu user={user} />
                  </Sticky>
                </Grid.Column>
                <Grid.Column width={10}>
                  <Visibility context={contextRef}>{children}</Visibility>
                </Grid.Column>
                <Grid.Column floated='left' width={4}>
                  <Sticky context={contextRef}>
                    <Segment basic>
                      <Search />
                    </Segment>
                  </Sticky>
                </Grid.Column>
              </Grid>
            </Ref>
          </div>
        </>
      ) : (
        <>
          <Navbar />

          <Container style={{ paddingTop: '1rem' }} text>
            {children}
          </Container>
        </>
      )}
    </>
  );
}

export default Layout;
