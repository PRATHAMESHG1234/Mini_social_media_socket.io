import React, { useEffect, useState } from 'react';
import baseUrl from '@/utils/baseUrl';
import axios from 'axios';
import Cookies from 'js-cookie';
import Spinner from '../Layout/Spinner';
import { Button, Image, List } from 'semantic-ui-react';
import { NoFollowData } from '../Layout/NoData';
import { followUser, unFollowUser } from '@/utils/profileActions';
const Following = ({
	user,
	loggedUserFollowStats,
	setLoggedUserFollowStats,
	profileUserId,
}) => {
	const [following, setFollowing] = useState([]);
	const [loading, setLoading] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);
	useEffect(() => {
		const getFollowing = async () => {
			setLoading(true);
			try {
				const res = await axios.get(
					`${baseUrl}/api/profile/following/${profileUserId}`,
					{ headers: { Authorization: Cookies.get('token') } },
				);
				// console.log('data', res.data);
				setFollowing(res.data);
			} catch (error) {
				alert('Error Loading Followings');
			}
			setLoading(false);
		};
		getFollowing();
	}, []);
	return (
		<>
			{loading ? (
				<Spinner />
			) : following.length > 0 ? (
				following.map((profileFollowing) => {
					const isFollowing =
						loggedUserFollowStats.following.length > 0 &&
						loggedUserFollowStats.following.filter(
							(following) => following.user === profileFollowing.user._id,
						).length > 0;
					return (
						<>
							<List
								key={profileFollowing.user._id}
								divided
								verticalAlign='middle'
							>
								<List.Item>
									<List.Content floated='right'>
										{profileFollowing.user._id !== user._id && (
											<Button
												color={isFollowing ? 'instagram' : 'twitter'}
												content={isFollowing ? 'Following' : 'Follow'}
												icon={isFollowing ? 'check' : 'add user'}
												disabled={followLoading}
												onClick={async () => {
													setFollowLoading(true);
													isFollowing
														? await unFollowUser(
																profileFollowing.user._id,
																setLoggedUserFollowStats,
														  )
														: await followUser(
																profileFollowing.user._id,
																setLoggedUserFollowStats,
														  );
													setFollowLoading(false);
												}}
											/>
										)}
									</List.Content>
									<Image
										avatar
										src={profileFollowing.user.profilePicUrl}
									/>
									<List.Content
										as='a'
										href={`/${profileFollowing.user.username}`}
									>
										{profileFollowing.user.name}
									</List.Content>
								</List.Item>
							</List>
						</>
					);
				})
			) : (
				<NoFollowData followingComponent={true} />
			)}
		</>
	);
};

export default Following;
