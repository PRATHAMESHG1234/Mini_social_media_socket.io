import { logoutUser } from '@/utils/authUser';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Icon, List } from 'semantic-ui-react';

const SideMenu = ({
  user: { unreadNotification, unreadMessage, email, username },
}) => {
  const router = useRouter();

  const isActive = (route) => router.pathname === route;

  return (
    <>
      <List
        style={{ paddingTop: '1rem' }}
        size='big'
        verticalAlign='middle'
        selection
      >
        <List.Item active={isActive('/')}>
          <Link href='/' style={{ display: 'flex', alignItems: 'center' }}>
            <Icon
              name='home'
              size='large'
              color={isActive('/') ? 'teal' : undefined}
            />
            <List.Content floated='right'>
              <List.Header content='Home' />
            </List.Content>
          </Link>
        </List.Item>
        <br />
        <List.Item active={isActive('/messages')}>
          <Link
            href='/messages'
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Icon
              name={unreadMessage ? 'hand point right' : 'mail'}
              size='large'
              color={
                isActive('/messages')
                  ? 'teal'
                  : unreadMessage
                  ? 'orange'
                  : undefined
              }
            />
            <List.Content floated='right'>
              <List.Header content='Messages' />
            </List.Content>
          </Link>
        </List.Item>
        <br />
        <List.Item active={isActive('/notifications')}>
          <Link
            href='/notifications'
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Icon
              name={unreadNotification ? 'hand point right' : 'bell'}
              size='large'
              color={
                isActive('/notifications')
                  ? 'teal'
                  : unreadNotification
                  ? 'orange'
                  : undefined
              }
            />
            <List.Content floated='right'>
              <List.Header content='Notifications' />
            </List.Content>
          </Link>
        </List.Item>
        <br />
        <List.Item active={router.query.username === username}>
          <Link
            href={`/${username}`}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Icon
              name='user'
              size='large'
              color={router.query.username === username ? 'teal' : undefined}
            />
            <List.Content floated='right'>
              <List.Header content='Account' />
            </List.Content>
          </Link>
        </List.Item>
        <br />
        <List.Item onClick={() => logoutUser(email)}>
          <Icon name='log out' size='large' />
          <List.Content>
            <List.Header content='Logout' />
          </List.Content>
        </List.Item>
      </List>
    </>
  );
};

export default SideMenu;
