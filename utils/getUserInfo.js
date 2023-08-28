import axios from 'axios';

import baseUrl from '@/utils/baseUrl';
import Cookies from 'js-cookie';

const getUserInfo = async (userToFindId) => {
	try {
		const { data } = await axios.get(
			`${baseUrl}/api/chats/user/${userToFindId}`,
			{ headers: { Authorization: Cookies.get('token') } },
		);
		return { name: data.name, profilePicUrl: data.profilePicUrl };
	} catch (error) {
		alert('Error looking for user');
	}
};

export default getUserInfo;
