import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import baseUrl from "@/utils/baseUrl";
import "semantic-ui-css/semantic.min.css";
import Layout from "@/components/Layout/Layout";
import { parseCookies } from "nookies";
import axios from "axios";
import { NoPosts } from "@/components/Layout/NoData";
import CreatePost from "@/components/Post/CreatePost";
import CardPost from "@/components/Post/CardPost";
import { Segment } from "semantic-ui-react";
import { PostDeleteToastr } from "@/components/Layout/Toastr";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  EndMessage,
  PlaceHolderPosts,
} from "@/components/Layout/PlaceHolderGroup";
import Cookies from "js-cookie";
import getUserInfo from "@/utils/getUserInfo";
import MessageNotificationModal from "@/components/Home/MessageNotificationModal";
import newMsgSound from "@/utils/newMsgSound";
Index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/posts`, {
      headers: { Authorization: token },
      params: { pageNumber: 1 },
    });
    return { postData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};
function Index({ user, postData, errorLoading }) {
  const [posts, setPosts] = useState(postData);
  const [showToaster, setShowToaster] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(2);

  const socket = useRef();

  const [newMessageReceived, setNewMessageReceived] = useState(null);
  const [newMessageModal, setNewMessageModal] = useState(false);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io("http://localhost:4000");
    }
    if (socket.current) {
      socket.current.emit("join", { userId: user._id });

      socket.current.on("newMessageReceived", async ({ newMessage }) => {
        const { name, profilePicUrl } = await getUserInfo(newMessage.sender);
        if (user.newMessagePopup) {
          setNewMessageModal(true);
          setNewMessageReceived({
            ...newMessage,
            senderName: name,
            senderProfilePicUrl: profilePicUrl,
          });
          newMsgSound(name);
        }
      });
    }

    document.title = `Welcome, ${user.name.split(" ")[0]}`;
  }, []);

  useEffect(() => {
    showToaster &&
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
  }, [showToaster]);

  const fetchDateOnScroll = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/posts`, {
        headers: { Authorization: Cookies.get("token") },
        params: { pageNumber },
      });
      if (res.data.length === 0) {
        setHasMore(false);
      }
      setPosts((prev) => [...prev, ...res.data]);
      setPageNumber((prev) => prev + 1);
    } catch (error) {
      alert("Error Fetching Posts");
    }
  };
  return (
    <>
      {showToaster && <PostDeleteToastr />}
      {newMessageModal && newMessageModal !== null && (
        <MessageNotificationModal
          socket={socket}
          newMessageReceived={newMessageReceived}
          newMessageModal={newMessageModal}
          setNewMessageModal={setNewMessageModal}
          user={user}
        />
      )}

      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.length === 0 || errorLoading ? (
          <NoPosts />
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            next={fetchDateOnScroll}
            loader={<PlaceHolderPosts />}
            endMessage={<EndMessage />}
            dataLength={posts.length}
          >
            {posts.map((post) => (
              <CardPost
                key={post._id}
                post={post}
                user={user}
                setPosts={setPosts}
                setShowToaster={setShowToaster}
              />
            ))}
          </InfiniteScroll>
        )}
      </Segment>
    </>
  );
}

export default Index;
