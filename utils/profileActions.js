import axios from 'axios';
import baseUrl from './baseUrl';
import catchErrors from './catchErrors';
import Cookies from 'js-cookie';
import Router from 'next/router';

const Axios = axios.create({
	baseURL: `${baseUrl}/api/profile`,
	headers: { Authorization: Cookies.get('token') },
});

export const followUser = async (userToFollowId, setLoggedUserFollowStats) => {
	try {
		await Axios.post(`/follow/${userToFollowId}`);
		setLoggedUserFollowStats((prev) => ({
			...prev,
			following: [...prev.following, { user: userToFollowId }],
		}));
	} catch (error) {
		alert(catchErrors(error));
	}
};

export const unFollowUser = async (
	userToUnFollowId,
	setLoggedUserFollowStats,
) => {
	try {
		await Axios.put(`/unfollow/${userToUnFollowId}`);
		setLoggedUserFollowStats((prev) => ({
			...prev,
			following: prev.following.filter(
				(following) => following.user !== userToUnFollowId,
			),
		}));
	} catch (error) {
		alert(catchErrors(error));
	}
};

export const profileUpdate = async (
	profile,
	setLoading,
	setError,
	profilePicUrl,
) => {
	try {
		const { bio, facebook, youtube, twitter, instagram } = profile;
		await Axios.post(`/update`, {
			bio,
			facebook,
			youtube,
			twitter,
			instagram,
			profilePicUrl,
		});
		setLoading(false);
		Router.reload();
	} catch (error) {
		setError(catchErrors(error));
		setLoading(false);
	}
};

export const passwordUpdate = async (setSuccess, userPasswords) => {
	try {
		const { currentPassword, newPassword } = userPasswords;
		await Axios.post(`/settings/password`, { currentPassword, newPassword });
		setSuccess(true);
		Router.reload();
	} catch (error) {
		alert(catchErrors(error));
	}
};

export const toggleMessagePopup = async (
	popupSetting,
	setPopupSetting,
	setSuccess,
) => {
	try {
		await Axios.post(`/settings/messagePopup`);
		setPopupSetting(!popupSetting);
		setSuccess(true);
	} catch (error) {
		alert(catchErrors(error));
	}
};
