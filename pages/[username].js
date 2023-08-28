import axios from 'axios';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import baseUrl from '@/utils/baseUrl';
import React, { useEffect, useState } from 'react';
import { NoProfile, NoProfilePosts } from '@/components/Layout/NoData';
import Cookies from 'js-cookie';
import { Grid } from 'semantic-ui-react';
import ProfileMenuTabs from '@/components/profile/ProfileMenuTabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { PlaceHolderPosts } from '@/components/Layout/PlaceHolderGroup';
import CardPost from '@/components/Post/CardPost';
import { PostDeleteToastr } from '@/components/Layout/Toastr';
import Followers from '@/components/profile/Followers';
import Following from '@/components/profile/Following';
import UpdateProfile from '@/components/profile/UpdateProfile';
import Settings from '@/components/profile/Settings';

const ProfilePage = ({
	profile,
	followersLength,
	followingLength,
	errorLoading,
	user,
	userFollowStats,
}) => {
	const router = useRouter();
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [activeItem, setActiveItem] = useState('profile');
	const [loggedUserFollowStats, setLoggedUserFollowStats] =
		useState(userFollowStats);
	const [showToaster, setShowToaster] = useState(false);
	const ownAccount = profile?.user?._id === user?._id;

	const handleItemClick = (item) => {
		setActiveItem(item);
	};
	useEffect(() => {
		const getposts = async () => {
			setLoading(true);
			try {
				const { username } = router.query;
				const token = Cookies.get('token');
				const res = await axios.get(
					`${baseUrl}/api/profile/posts/${username}`,
					{
						headers: { Authorization: token },
					},
				);
				setPosts(res.data);
			} catch (error) {
				alert('Error loading posts');
			}
			setLoading(false);
		};
		getposts();
	}, [router.query.username]);

	useEffect(() => {
		showToaster && setTimeout(() => setShowToaster(false), 3000);
	}, [showToaster]);

	if (errorLoading) {
		return <NoProfile />;
	}
	return (
		<>
			{showToaster && <PostDeleteToastr />}
			<Grid stackable>
				<Grid.Row>
					<Grid.Column>
						<ProfileMenuTabs
							activeItem={activeItem}
							handleItemClick={handleItemClick}
							followersLength={followersLength}
							followingLength={followingLength}
							ownAccount={ownAccount}
							loggedUserFollowStats={loggedUserFollowStats}
						/>
					</Grid.Column>
				</Grid.Row>
				<Grid.Row>
					<Grid.Column>
						{activeItem === 'profile' && (
							<>
								<ProfileHeader
									profile={profile}
									ownAccount={ownAccount}
									loggedUserFollowStats={loggedUserFollowStats}
									setUserFollowStats={setLoggedUserFollowStats}
								/>
								{loading ? (
									<PlaceHolderPosts />
								) : posts.length > 0 ? (
									posts.map((post) => (
										<CardPost
											key={post._id}
											post={post}
											user={user}
											setPosts={setPosts}
											setShowToaster={setShowToaster}
										/>
									))
								) : (
									<NoProfilePosts />
								)}
							</>
						)}
						{activeItem === 'followers' && (
							<Followers
								user={user}
								loggedUserFollowStats={loggedUserFollowStats}
								setLoggedUserFollowStats={setLoggedUserFollowStats}
								profileUserId={profile.user._id}
							/>
						)}
						{activeItem === 'following' && (
							<Following
								user={user}
								loggedUserFollowStats={loggedUserFollowStats}
								setLoggedUserFollowStats={setLoggedUserFollowStats}
								profileUserId={profile.user._id}
							/>
						)}
						{activeItem === 'updateProfile' && (
							<UpdateProfile Profile={profile} />
						)}

						{activeItem === 'settings' && (
							<Settings newMessagePopup={user.newMessagePopUp} />
						)}
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</>
	);
};

ProfilePage.getInitialProps = async (ctx) => {
	try {
		const { username } = ctx.query;
		if (username === 'socket.io') {
			throw new Error('Invalid username'); // You should throw an instance of Error class
		}
		const { token } = parseCookies(ctx);
		console.log('username name', username);
		const res = await axios.get(`${baseUrl}/api/profile/${username}`, {
			headers: { Authorization: token },
		});
		const { profile, followersLength, followingLength } = res.data;
		return { profile, followersLength, followingLength };
	} catch (error) {
		return { errorLoading: true };
	}
};

export default ProfilePage;
