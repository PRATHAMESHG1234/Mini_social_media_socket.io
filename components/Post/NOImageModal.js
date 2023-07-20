import React from 'react';
import { Card, Divider, Grid, Icon, Image, Modal } from 'semantic-ui-react';
import CommentInputFeild from './CommentInputFeild';
import calculateTime from '@/utils/calculateTime';
import PostCommnets from './PostCommnets';
import { likePost } from '@/utils/postActions';
import Link from 'next/link';
import LikesList from './LikesList';
const NOImageModal = ({
  post,
  user,
  setLikes,
  likes,
  isLiked,
  comments,
  setComments,
}) => {
  return (
    <>
      <Card fluid>
        <Card.Content>
          <Image
            floated='left'
            avatar
            src={post.user.profilePicUrl}
          />
          <Card.Header>
            <Link href={`/${post.user.username}`}>
              <p> {post.user.name}</p>
            </Link>
          </Card.Header>
          <Card.Meta>{calculateTime(post.createdAt)}</Card.Meta>
          {post.location && <Card.Meta content={post.location} />}
          <Card.Description
            style={{
              fontSize: '17px',
              letterSpacing: '0.1px',
              wordSpacing: '0.35px',
            }}
          >
            {post.text}
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon
            name={isLiked ? 'heart' : 'heart outline'}
            color='red'
            style={{ cursor: 'pointer' }}
            onClick={() =>
              likePost(post._id, user._id, setLikes, isLiked ? false : true)
            }
          />
          <LikesList
            postId={post._id}
            trigger={
              likes.length > 0 && (
                <span className='spanLikesList'>
                  {`${likes.length} ${likes.length === 1 ? 'like' : 'likes'}`}
                </span>
              )
            }
          />

          <Divider hidden />

          <div
            style={{
              overflow: 'auto',
              height: comments.length > 2 ? '200px' : '60px',
              marginBottom: '8px',
            }}
          >
            {comments.length > 0 &&
              comments.map((comment, i) => (
                <PostCommnets
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  user={user}
                  setComments={setComments}
                />
              ))}
          </div>
          <CommentInputFeild
            postId={post._id}
            user={user}
            setComments={setComments}
          />
        </Card.Content>
      </Card>
    </>
  );
};

export default NOImageModal;
