import React, { useState } from 'react';
import Link from 'next/link';
import { Form, Modal, Segment, List, Icon } from 'semantic-ui-react';
import calculateTime from '@/utils/calculateTime';

const MessageNotificationModal = ({
	user,
	setNewMessageModal,
	newMessageModal,
	newMessageReceived,
	socket,
}) => {
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);

	const formSubmit = async (e) => {
		e.preventDefault();
		if (socket.current) {
			socket.emit('sendMsgFromNotification', {
				message: message,
				userId: user._id,
				messageSendToUserId: newMessageReceived.sender,
			});

			socket.current.on('msgSentFromNotification', () => {
				setNewMessageModal(false);
			});
		}
	};
	return (
		<>
			<Modal
				size='small'
				open={newMessageModal}
				onClose={() => setNewMessageModal(false)}
				closeIcon
				closeOnDimmerClick
			>
				<Modal.Header>{`New message from ${newMessageReceived.senderName}`}</Modal.Header>
				<Modal.Content>
					<div className='bubbleWrapper'>
						<div className='inlineContainer'>
							<img
								className='inlineIcon'
								src={newMessageReceived.senderProfilePic}
								alt=''
							/>
						</div>
						<div className='otherBubble other'>
							{newMessageReceived.message}
						</div>
						<span className='other'>
							{calculateTime(newMessageReceived.date)}
						</span>
					</div>
					<div style={{ position: 'sticky', bottom: '0px' }}>
						<Segment
							secondary
							color='teal'
							attached='bottom'
						>
							<Form
								reply
								onSubmit={formSubmit}
							>
								<Form.Field>
									<Form.Input
										size='large'
										placeholder='Type a message...'
										value={message}
										onChange={(e) => {
											setText(e.target.value);
										}}
										action={{
											color: 'blue',
											icon: 'telegram plane',
											disabled: message === '',
											loading: loading,
										}}
									/>
								</Form.Field>
							</Form>
						</Segment>
					</div>
					<div style={{ marginTop: '5px' }}>
						<Link href={`/messages?message=${newMessageReceived.sender}`}>
							<a href=''>View All Messages</a>
						</Link>
						<br />
						<Instructions username={user.username} />
					</div>
				</Modal.Content>
			</Modal>
		</>
	);
};

const Instructions = ({ username }) => {};

export default MessageNotificationModal;
