import calculateTime from "@/utils/calculateTime";
import { useRouter } from "next/router";
import React from "react";
import { Divider, Comment, Icon, List } from "semantic-ui-react";
const Chat = ({ chat, setChats, connectedUsers, deleteChat, user }) => {
  const router = useRouter();
  const isOnline =
    connectedUsers &&
    connectedUsers.length > 0 &&
    connectedUsers.filter((user) => user.userId === chat.messagesWith).length >
      0;
  console.log(
    "length",
    connectedUsers.filter((user) => user.userId === chat.messagesWith).length,
  );

  return (
    <>
      <List selection>
        <List.Item
          active={router.query.message === chat.messagesWith}
          onClick={() =>
            router.push(`/messages?message=${chat.messagesWith}`, undefined, {
              shallow: true,
            })
          }
        >
          <Comment>
            <Comment.Avatar as="a" src={chat.profilePicUrl} />
            <Comment.Content>
              <Comment.Author as="a">
                {chat.name}
                {"   "}
                {isOnline && (
                  <Icon name="circle" size="small" className="animated-icon" />
                )}{" "}
              </Comment.Author>
              <Comment.Metadata>
                <span>{calculateTime(chat.date)}</span>
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    name="trash alternate"
                    color="red"
                    onClick={() => deleteChat(chat.messagesWith)}
                  />
                  {chat.likes}
                </div>
              </Comment.Metadata>
              <Comment.Text>
                {chat && chat.lastMessage.length > 20
                  ? `${chat.lastMessage.substring(0, 20)}...`
                  : chat.lastMessage}
              </Comment.Text>
            </Comment.Content>
          </Comment>
        </List.Item>
      </List>

      <Divider />
    </>
  );
};

export default Chat;
