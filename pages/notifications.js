import React, { useEffect, useState } from 'react';
import baseUrl from '@/utils/baseUrl';
import axios from 'axios';
import { parseCookies } from 'nookies';
import Cookies from 'js-cookie';
import LikeNotification from '@/components/Notifications/LikeNotification';
import CommentNotification from '@/components/Notifications/CommentNotification';
import FollowerNotification from '@/components/Notifications/FollowerNotification';
import { Container, Divider, Feed, Segment } from 'semantic-ui-react';
import { NoMessages } from '@/components/Layout/NoData';

const Notifications = ({
	notifications,
	errorLoading,
	user,
	userFollowStats,
}) => {
	// console.log(notifications);
	const [loggedUserFollowStats, setLoggedUserFollowStats] =
		useState(userFollowStats);

	useEffect(() => {
		const notificationRead = async () => {
			try {
				await axios.post(
					`${baseUrl}/api/notifications`,
					{},
					{ headers: { Authorization: Cookies.get('token') } },
				);
			} catch (error) {
				console.log(error);
			}
		};
		return () => {
			notificationRead();
		};
	}, []);

	return (
		<>
			<Container style={{ marginTop: '1.5rem' }}>
				{notifications.length > 0 ? (
					<Segment
						color='teal'
						raised
					>
						<div
							style={{
								maxHeight: '40rem',
								overflow: 'auto',
								height: '40rem',
								position: 'relative',
								width: '100%',
							}}
						>
							<Feed size='small'>
								{notifications.map((notification) => {
									if (
										notification.type === 'newLike' &&
										notification.post !== null
									) {
										return (
											<LikeNotification
												key={notification._id}
												notification={notification}
											/>
										);
									}

									if (
										notification.type === 'newComment' &&
										notification.post !== null
									) {
										return (
											<CommentNotification
												key={notification._id}
												notification={notification}
											/>
										);
									}

									if (notification.type === 'newFollower') {
										return (
											<FollowerNotification
												key={notification._id}
												user={user}
												notification={notification}
												loggedUserFollowStats={loggedUserFollowStats}
												setLoggedUserFollowStats={setLoggedUserFollowStats}
											/>
										);
									}
								})}
							</Feed>
						</div>
					</Segment>
				) : (
					<NoMessages />
				)}

				<Divider hidden />
			</Container>
		</>
	);
};
Notifications.getInitialProps = async (ctx) => {
	try {
		const { token } = parseCookies(ctx);
		const res = await axios.get(`${baseUrl}/api/notifications`, {
			headers: {
				Authorization: token,
			},
		});
		console.log(res.data);
		return { notifications: res.data };
	} catch (error) {
		return { errorLoading: true };
	}
};

export default Notifications;
