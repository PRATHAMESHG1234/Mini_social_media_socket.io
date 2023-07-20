import React, { useRef, useState } from 'react';
import { Button, Divider, Form, Message } from 'semantic-ui-react';
import ImageDropDiv from '../Common/ImageDropDiv';
import CommonInputs from '../Common/CommonInputs';
import uploadPic from '@/utils/uploadPicToCloudinary';
import { profileUpdate } from '@/utils/profileActions';

const UpdateProfile = ({ Profile }) => {
	const [profile, setProfile] = useState({
		profilePicUrl: Profile.user.profilePicUrl,
		bio: Profile.bio,
		facebook: (Profile.social && Profile.social.facebook) || '',
		instagram: (Profile.social && Profile.social.instagram) || '',
		youtube: (Profile.social && Profile.social.youtube) || '',
		twitter: (Profile.social && Profile.social.twitter) || '',
	});
	const [media, setMedia] = useState(null);
	const [mediaPreview, setMediaPreview] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);
	const [loading, setLoading] = useState(false);
	const [showSocialLinks, setShowSocialLinks] = useState(false);
	const [highlighted, setHighlighted] = useState(false);
	const inputRef = useRef();

	const handleChange = (e) => {
		const { name, value, files } = e.target;
		if (name === 'media') {
			setMedia(files[0]);
			setMediaPreview(URL.createObjectURL(files[0]));
		}
		setProfile((prev) => ({ ...prev, [name]: value }));
	};
	return (
		<>
			<Form
				loading={loading}
				error={errorMsg !== null}
				onSubmit={async (e) => {
					e.preventDefault();
					setLoading(true);
					let profilePicUrl;
					if (media !== null) {
						profilePicUrl = await uploadPic(media);
					}
					if (media !== null && !profilePicUrl) {
						setLoading(false);
						return setErrorMsg('Failed to upload image');
					}

					await profileUpdate(profile, setLoading, setErrorMsg, profilePicUrl);
				}}
			>
				<Message
					error
					onDismiss={() => setErrorMsg(null)}
					content={errorMsg}
					header='Oops!'
					attached
				/>
				<ImageDropDiv
					inputRef={inputRef}
					highlighted={highlighted}
					setHighlighted={setHighlighted}
					handlechange={handleChange}
					mediaPreview={mediaPreview}
					setMediaPreview={setMediaPreview}
					setMedia={setMedia}
					profilePicUrl={profile.profilePicUrl}
				/>
				<CommonInputs
					user={profile}
					handleChange={handleChange}
					showSocialLinks={showSocialLinks}
					setShowSocialLinks={setShowSocialLinks}
				/>
				<Divider hidden />
				<Button
					color='blue'
					disabled={profile.bio === '' || loading}
					icon='pencil alternate'
					content='Submit'
					type='submit'
				/>
			</Form>
		</>
	);
};

export default UpdateProfile;
