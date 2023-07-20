import { passwordUpdate, toggleMessagePopup } from '@/utils/profileActions';
import React, { useEffect, useRef, useState } from 'react';
import {
	Button,
	Checkbox,
	Divider,
	Form,
	List,
	Message,
} from 'semantic-ui-react';

const Settings = ({ newMessagePopup }) => {
	const [showUpdatePassword, setShowUpdatePassword] = useState(false);
	const [success, setSuccess] = useState(false);
	const [showMessageSettings, setShowMessageSettings] = useState(false);
	const [popupSetting, setPopupSetting] = useState(newMessagePopup);
	const isFirstRun = useRef(true);

	useEffect(() => {
		success &&
			setTimeout(() => {
				setSuccess(false);
			}, 3000);
	}, [success]);
	useEffect(() => {
		if (isFirstRun.current) {
			isFirstRun.current = false;
			return;
		}
	}, [popupSetting]);
	return (
		<>
			{success && (
				<>
					<Message
						icon='check circle'
						header='Updated Successfuly'
						success
					/>
					<Divider hidden />
				</>
			)}
			<List
				size='huge'
				animated
			>
				<List.Item>
					<List.Icon
						name='user secret'
						size='large'
						verticalAlign='middle'
					/>
					<List.Content>
						<List.Header
							as='a'
							onClick={() => setShowUpdatePassword(!showUpdatePassword)}
						>
							Update Password
						</List.Header>
					</List.Content>
					{showUpdatePassword && (
						<UpdatePassword
							setSuccess={setSuccess}
							setShowUpdatePassword={setShowUpdatePassword}
						/>
					)}
				</List.Item>
				<Divider />
				<List.Item>
					<List.Icon
						name='paper plane outline'
						size='large'
						verticalAlign='middle'
					/>
					<List.Content>
						<List.Header
							onClick={() => setShowMessageSettings(!showMessageSettings)}
							as='a'
							content='Show New Message Popup'
						/>
					</List.Content>
					{showMessageSettings && (
						<div style={{ marginTop: '10px' }}>
							Contrle whether a Popup should appear when new Message ?
							<br />
							<Checkbox
								checked={popupSetting}
								toggle
								onChange={() =>
									toggleMessagePopup(popupSetting, setPopupSetting, setSuccess)
								}
							/>
						</div>
					)}
				</List.Item>
			</List>
		</>
	);
};

const UpdatePassword = ({ setSuccess, setShowUpdatePassword }) => {
	const [userPasswords, setUserPasswords] = useState({
		currentPassword: '',
		newPassword: '',
	});
	const [showTypedpassword, setShowTypedPassword] = useState({
		feild1: false,
		feild2: false,
	});
	const [errorMsg, setErrorMsg] = useState(null);
	const [loading, setLoading] = useState(false);
	const { currentPassword, newPassword } = userPasswords;
	const { feild1, feild2 } = showTypedpassword;

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUserPasswords((prev) => ({ ...prev, [name]: value }));
	};
	useEffect(() => {
		errorMsg !== null &&
			setTimeout(() => {
				setErrorMsg(null);
			}, 5000);
	}, [errorMsg]);
	return (
		<>
			<Form
				error={errorMsg !== null}
				loading={loading}
				onSubmit={async (e) => {
					e.preventDefault();
					setLoading(true);
					await passwordUpdate(setSuccess, userPasswords);
					setLoading(false);
					setShowUpdatePassword(false);
				}}
			>
				<List.List>
					<List.Item>
						<Form.Input
							fluid
							icon={{
								name: 'eye',
								circular: true,
								link: true,
								onClick: () =>
									setShowTypedPassword((prev) => ({
										...prev,
										feild1: !feild1,
									})),
							}}
							type={feild1 ? 'text' : 'password'}
							iconPosition='left'
							label='Current Password'
							placeholder='Enter Current Password'
							name='currentPassword'
							onChange={handleChange}
							value={currentPassword}
						/>
						<Form.Input
							fluid
							icon={{
								name: 'eye',
								circular: true,
								link: true,
								onClick: () =>
									setShowTypedPassword((prev) => ({
										...prev,
										feild2: !feild2,
									})),
							}}
							type={feild2 ? 'text' : 'password'}
							iconPosition='left'
							label='New Password'
							placeholder='Enter New Password'
							name='newPassword'
							onChange={handleChange}
							value={newPassword}
						/>
						<Button
							disabled={loading || newPassword === '' || currentPassword === ''}
							compact
							icon='configure'
							type='submit'
							color='teal'
							content='Confirm'
						/>
						<Button
							disabled={loading}
							compact
							icon='cancel'
							content='Cancel'
							onClick={() => setShowUpdatePassword(false)}
						/>
						<Message
							error
							icon='meh'
							header='Oops!'
							content={errorMsg}
						/>
					</List.Item>
				</List.List>
			</Form>
			<Divider hidden />
		</>
	);
};

export default Settings;
