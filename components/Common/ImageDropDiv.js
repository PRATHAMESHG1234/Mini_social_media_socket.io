import { useRouter } from 'next/router';
import React from 'react';
import { Form, Header, Icon, Image, Segment } from 'semantic-ui-react';

const ImageDropDiv = ({
	highlighted,
	setHighlighted,
	inputRef,
	handlechange,
	mediaPreview,
	setMediaPreview,
	setMedia,
	profilePicUrl,
}) => {
	const router = useRouter();
	const signupRoute = router.pathname === '/signup';
	return (
		<>
			<Form.Field
				placeholder='true'
				basic='true'
				secondary='true'
			>
				<input
					style={{ display: 'none' }}
					type='file'
					accept='image/*'
					onChange={handlechange}
					name='media'
					ref={inputRef}
				/>

				<div
					onDragOver={(e) => {
						e.preventDefault();
						setHighlighted(true);
					}}
					onDragLeave={(e) => {
						e.preventDefault();
						setHighlighted(true);
					}}
					onDrop={(e) => {
						e.preventDefault();
						setHighlighted(true);

						const droppedFile = Array.from(e.dataTransfer.files);
						setMedia(droppedFile[0]);
						setMediaPreview(URL.createObjectURL(droppedFile[0]));
					}}
				>
					{mediaPreview === null ? (
						<>
							<Segment
								color={highlighted ? 'green' : null}
								placeholder
								basic
							>
								{signupRoute ? (
									<Header icon>
										<Icon
											name='file image outline'
											style={{ cursor: 'pointer' }}
											onClick={() => inputRef.current.click()}
										/>
										Drag & Drop or Click To Upload Image
									</Header>
								) : (
									<>
										<span style={{ textAlign: 'center' }}>
											<Image
												src={profilePicUrl}
												style={{ cursor: 'pointer' }}
												onClick={() => inputRef.current.click()}
												size='large'
												centered
											/>
										</span>
									</>
								)}
							</Segment>
						</>
					) : (
						<>
							<Segment
								color='green'
								placeholder={true}
								basic={true}
							>
								<Image
									src={mediaPreview}
									size='media'
									centered
									style={{ cursor: 'pointer' }}
									onClick={() => inputRef.current.click()}
								/>
							</Segment>
						</>
					)}
				</div>
			</Form.Field>
		</>
	);
};

export default ImageDropDiv;
