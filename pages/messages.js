import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import baseUrl from '@/utils/baseUrl';
import { parseCookies } from 'nookies';
import {
	Segment,
	Header,
	Divider,
	Comment,
	Grid,
	Icon,
} from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { NoMessages } from '@/components/Layout/NoData';
import Chat from '@/components/Chats/Chat';
import ChatListSearch from '@/components/Chats/ChatListSearch';
import Banner from '@/components/Chats/Messages/Banner';
import Message from '@/components/Chats/Messages/Message';
import MessageInputField from '@/components/Chats/Messages/MessageInputField';
import getUserInfo from '@/utils/getUserInfo';
import newMsgSound from '@/utils/newMsgSound';
import Cookies from 'js-cookie';
import { sendMessages } from '@/utilsServer/messageActions';

const scrollDivToBottom = (divRef) => {
	divRef.current !== null &&
		divRef.current.scrollIntoView({ behaviour: 'smooth' });
};

const Messages = ({ chatsData, errorLoading, user }) => {
	const [chats, setChats] = useState(chatsData);
	const [connectedUsers, setConnectedUsers] = useState([]);
	const router = useRouter();
	const divRef = useRef();
	const socket = io('http://localhost:4000'); // This will connect to the same host that served the page
	const [messages, setMessages] = useState([]);
	const [bannerData, setBannerData] = useState({ name: '', profilePicUrl: '' });

	//this ref is for persisting the state of query string in url throughout re-render. this ref is query string inside url
	const openChatId = useRef('');

	//CONNECTION useEffect

	useEffect(() => {
		socket.on('connect', () => {
			console.log('Connected to Socket.IO server');
		});
		socket.emit('join', { userId: user._id });

		socket.on('connectedUsers', async ({ users }) => {
			// console.log('Received users:', users);
			if (users) {
				// console.log('Setting connectedUsers state:', users);
				setConnectedUsers(users);
			}
		});

		if (chats.length > 0 && !router.query.message) {
			router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
				shallow: true,
			});
		}

		return () => {
			if (socket) {
				socket.disconnect();
				socket.off();
				console.log('Disconnected');
			}
		};
	}, [chats]); // Add user and chats to the dependency array

	//LOAD MESSAGES
	useEffect(() => {
		const loadMessages = () => {
			socket.emit('loadMessages', {
				userId: user._id,
				messagesWith: router.query.message,
			});
			socket.on('messagesLoaded', ({ chat }) => {
				try {
					setMessages(chat.messages);
					setBannerData({
						name: chat.messagesWith.name,
						profilePicUrl: chat.messagesWith.profilePicUrl,
					});

					openChatId.current = chat.messagesWith._id;
				} catch (error) {
					console.log(error);
				}
			});

			socket.on('noChatFound', async () => {
				try {
					const { name, profilePicUrl } = await getUserInfo(
						router.query.message,
					);

					setBannerData({
						name,
						profilePicUrl,
					});
					setMessages([]);
					openChatId.current = router.query.message;

					divRef.current && scrollDivToBottom(divRef);
				} catch (error) {
					console.log(error);
				}
			});
		};

		if (socket && router.query.message) {
			loadMessages();
		}
	}, [router.query.message]);

	const sendMessage = (message) => {
		if (socket) {
			socket.emit('sendNewMessage', {
				userId: user._id,
				messageSendToUserId: openChatId.current,
				message,
			});
		}
	};

	// CONFIRMING THAR MESSAGE IS SENT AND RECEIVING THE MESSAGE
	useEffect(() => {
		if (socket) {
			socket.on('messageSent', ({ newMessage }) => {
				if (newMessage.receiver === openChatId.current) {
					setMessages((prev) => [...prev, newMessage]);

					setChats((prev) => {
						const previousChat = prev.find((chat) => {
							chat.messagesWith === newMessage.receiver;
						});
						if (previousChat) {
							previousChat.lastMessage = newMessage.msg;
							previousChat.date = newMessage.date;
						}
						return [...prev];
					});
					console.log('chats:', chats);
				}
			});
			socket.on('newMessageReceived', async ({ newMessage }) => {
				let senderName;
				// WHEN CHAT IS OPENED INSIDE YOUR BROWSER
				if (newMessage.sender === openChatId.current) {
					setMessages((prev) => [...prev, newMessage]);
					setChats((prev) => {
						const previousChat = prev.find((chat) => {
							chat.messagesWith === newMessage.sender;
						});
						if (previousChat) {
							previousChat.lastMessage === newMessage.msg;
							previousChat.date = newMessage.date;
							senderName = previousChat.name;
						}
						return [...prev];
					});
				}
				//
				else {
					const ifPreviouslyMessaged =
						chats.filter((chat) => chat.messagesWith === newMessage.sender)
							.length > 0;
					if (ifPreviouslyMessaged) {
						setChats((prev) => {
							const previousChat = prev.find((chat) => {
								chat.messagesWith === newMessage.sender;
							});
							if (previousChat) {
								previousChat.lastMessage === newMessage.msg;
								previousChat.date = newMessage.date;
								senderName = previousChat.name;
							}
							return [...prev];
						});
					}
					//
					else {
						const { name, profilePicUrl } = await getUserInfo(
							newMessage.sender,
						);
						senderName = name;
						const newChat = {
							messagesWith: newMessage.sender,
							name,
							profilePicUrl,
							lastMessage: newMessage.msg,
							date: newMessage.date,
						};
						setChats((prevChats) => [...prevChats, newChat]);
					}
				}

				newMsgSound(senderName);
			});
		}
	}, [chats, socket]);

	useEffect(() => {
		if (messages.length > 0) {
			divRef.current && scrollDivToBottom(divRef);
		}
	}, [messages]);

	const deleteMessage = (messageId) => {
		if (socket) {
			socket.emit('deleteMessage', {
				userId: user._id,
				messagesWith: openChatId.current,
				messageId,
			});

			socket.on('messageDeleted', () => {
				setMessages(messages.filter((message) => message._id !== messageId));
			});
		}
	};
	const deleteChat = async (messagesWith) => {
		try {
			await axios.delete(`${baseUrl}/api/chats/${messagesWith}`, {
				headers: { Authorization: Cookies.get('token') },
			});
			setChats((prev) =>
				prev.filter((chat) => chat.messagesWith !== messagesWith),
			);
			router.push('/messages', undefined, { shallow: true });
		} catch (error) {
			alert('Error deleting chat');
		}
	};

	return (
		<>
			<Segment
				padded
				basic
				size='large'
				style={{ marginTop: '5px' }}
			>
				<Header
					icon='home'
					as='h2'
					content='Go Back!'
					onClick={() => router.push('/')}
					style={{ cursor: 'pointer' }}
				/>
				<Divider hidden />
				<div
					style={{
						marginBottom: '10px',
					}}
				>
					<ChatListSearch
						user={user}
						chats={chats}
						setChats={setChats}
					/>
				</div>
				{chats.length > 0 ? (
					<Grid stackable>
						<Grid.Column width={4}>
							<Comment.Group size='big'>
								<Segment
									raised
									style={{ overflow: 'auto', maxHeight: '32rem' }}
								>
									{chats.map((chat, index) => (
										<Chat
											key={index}
											chat={chat}
											setChats={setChats}
											deleteChat={deleteChat}
											connectedUsers={connectedUsers}
										/>
									))}
								</Segment>
							</Comment.Group>
						</Grid.Column>
						<Grid.Column width={12}>
							{router.query.message && (
								<>
									<div
										style={{
											overflow: 'auto',
											overflowX: 'hidden',
											maxHeight: '35rem',
											height: '35rem',
											backgroundColor: 'whitesmoke',
										}}
									>
										<>
											<div style={{ position: 'sticky', top: '0' }}>
												<Banner bannerData={bannerData} />
											</div>

											{messages.length > 0 && (
												<>
													{messages.map((message, index) => (
														<Message
															divRef={divRef}
															key={index}
															messageBannerProfilePic={bannerData.profilePicUrl}
															message={message}
															user={user}
															deleteMessage={deleteMessage}
														/>
													))}
												</>
											)}
										</>
									</div>
									<MessageInputField sendMessage={sendMessage} />
								</>
							)}
						</Grid.Column>
					</Grid>
				) : (
					<NoMessages />
				)}
			</Segment>
		</>
	);
};

Messages.getInitialProps = async (ctx) => {
	try {
		const { token } = parseCookies(ctx);
		const { data } = await axios.get(`${baseUrl}/api/chats`, {
			headers: {
				Authorization: token,
			},
		});
		console.log('data:', data);
		return { chatsData: data };
	} catch (error) {
		return { errorLoading: true };
	}
};

export default Messages;
