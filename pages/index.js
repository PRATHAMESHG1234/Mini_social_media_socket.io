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

Index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/posts`, {
      headers: { Authorization: token },
    });
    return { postData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};
function Index({ user, postData, errorLoading }) {
  const [posts, setPosts] = useState(postData);
  const [showToaster, setShowToaster] = useState(false);
  useEffect(() => {
    document.title = `Welcome, ${user.name.split(' ')[0]}`;
  }, []);

  useEffect(() => {
    showToaster &&
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
  }, [showToaster]);
  if (posts.length === 0 || errorLoading) {
    return <NoPosts />;
  }
  return (
    <>
      {showToaster && <PostDeleteToastr />}
      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.map((post) => (
          <CardPost
            key={post._id}
            post={post}
            user={user}
            setPosts={setPosts}
            setShowToaster={setShowToaster}
          />
        ))}
      </Segment>
    </>
  );
}

export default Index;
