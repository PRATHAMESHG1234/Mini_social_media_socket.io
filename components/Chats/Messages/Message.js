import React, { useState } from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import calculateTime from '@/utils/calculateTime';

const Message = ({
	divRef,
	message,
	user,
	deleteMessage,
	messageBannerProfilePic,
}) => {
	const [showDeleteIcon, setShowDeleteIcon] = useState(false);
	const ifYouSender = message.sender === user._id;
	return (
		<div
			className='bubbleWrapper'
			ref={divRef}
		>
			<div
				className={ifYouSender ? 'inlineContainer own' : 'inlineContainer'}
				onClick={() => ifYouSender && setShowDeleteIcon(!showDeleteIcon)}
			>
				<img
					className='inlineIcon'
					src={ifYouSender ? user.profilePicUrl : messageBannerProfilePic}
				/>
				<div className={ifYouSender ? 'ownBubble own' : 'otherBubble other'}>
					{message.msg}
				</div>
				{showDeleteIcon && (
					<Popup
						trigger={
							<Icon
								name='trash'
								color='red'
								style={{ cursor: 'pointer' }}
								onClick={() => deleteMessage(message._id)}
							/>
						}
						content='this will only delete message from your inbox'
						position='top right'
					/>
				)}
			</div>
			<span className={ifYouSender ? 'own' : 'other'}>
				{calculateTime(message.date)}
			</span>
		</div>
	);
};

export default Message;
