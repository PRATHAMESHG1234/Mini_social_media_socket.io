import React, { useState } from 'react';
import { Button, Feed } from 'semantic-ui-react';
import calculateTime from '@/utils/calculateTime';
import { followUser, unFollowUser } from '@/utils/profileActions';

const FollowerNotification = ({
	notification,
	loggedUserFollowStats,
	setLoggedUserFollowStats,
}) => {
	const [disabled, setDisabled] = useState(false);
	const isFollowing =
		loggedUserFollowStats.following.length > 0 &&
		loggedUserFollowStats.following.filter(
			(following) => following.user === notification.user._id,
		).length > 0;

	return (
		<>
			<Feed.Event>
				<Feed.Label image={notification.user.profilePicUrl} />
				<Feed.Content>
					<Feed.Summary>
						<>
							<Feed.User
								as='a'
								href={`/${notification.user.username}`}
							>
								{notification.user.name}
							</Feed.User>{' '}
							Started Following you
							<Feed.Date>{calculateTime(notification.date)}</Feed.Date>
						</>
					</Feed.Summary>
					<div style={{ position: 'absolute', right: '5px' }}>
						<Button
							size='small'
							compact
							icon={isFollowing ? 'check circle' : 'add user'}
							color={isFollowing ? 'instagram' : 'twitter'}
							disabled={disabled}
							onClick={async () => {
								setDisabled(true);
								isFollowing
									? await unFollowUser(
											notification.user._id,
											setLoggedUserFollowStats,
									  )
									: await followUser(
											notification.user._id,
											setLoggedUserFollowStats,
									  );
								setDisabled(false);
							}}
						/>
					</div>
				</Feed.Content>
			</Feed.Event>
		</>
	);
};

export default FollowerNotification;
