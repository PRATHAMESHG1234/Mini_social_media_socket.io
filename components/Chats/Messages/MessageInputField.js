import React, { useState } from 'react';
import { Form, Segment } from 'semantic-ui-react';

const MessageInputField = ({ sendMessage }) => {
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	return (
		<>
			<div style={{ position: 'sticky', bottom: '0' }}>
				<Segment
					secondary
					color='teal'
					attached='bottom'
				>
					<Form
						reply
						onSubmit={(e) => {
							e.preventDefault();
							sendMessage(text);

							setText('');
						}}
					>
						<Form.Field>
							<Form.Input
								size='large'
								placeholder='Type a message...'
								value={text}
								onChange={(e) => {
									setText(e.target.value);
								}}
								action={{
									color: 'blue',
									icon: 'telegram plane',
									disabled: text === '',
									loading: loading,
								}}
							/>
						</Form.Field>
					</Form>
				</Segment>
			</div>
		</>
	);
};

export default MessageInputField;
