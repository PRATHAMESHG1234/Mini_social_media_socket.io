import { useRouter } from 'next/router';
import React from 'react';

const PostPage = () => {
  const router = useRouter();

  return <div>{router.query.postId}</div>;
};

export default PostPage;
