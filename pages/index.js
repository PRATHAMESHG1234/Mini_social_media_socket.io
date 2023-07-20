import React, { useEffect, useState } from 'react';
import baseUrl from '@/utils/baseUrl';
import 'semantic-ui-css/semantic.min.css';
import Layout from '@/components/Layout/layout';
import { parseCookies } from 'nookies';
import axios from 'axios';
import { NoPosts } from '@/components/Layout/NoData';
import CreatePost from '@/components/Post/CreatePost';
import CardPost from '@/components/Post/CardPost';
import { Segment } from 'semantic-ui-react';
import { PostDeleteToastr } from '@/components/Layout/Toastr';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  EndMessage,
  PlaceHolderPosts,
} from '@/components/Layout/PlaceHolderGroup';
import Cookies from 'js-cookie';

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
  useEffect(() => {
    document.title = `Welcome, ${user.name.split(' ')[0]}`;
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
        headers: { Authorization: Cookies.get('token') },
        params: { pageNumber },
      });
      if (res.data.length === 0) {
        setHasMore(false);
      }
      setPosts((prev) => [...prev, ...res.data]);
      setPageNumber((prev) => prev + 1);
    } catch (error) {
      alert('Error Fetching Posts');
    }
  };
  return (
    <>
      {showToaster && <PostDeleteToastr />}
      <Segment>
        <CreatePost
          user={user}
          setPosts={setPosts}
        />
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
