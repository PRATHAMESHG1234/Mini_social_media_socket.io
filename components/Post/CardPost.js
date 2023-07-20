import Link from 'next/link';
import React, { useState } from 'react';
import calculateTime from '../../utils/calculateTime';
import {
  Button,
  Card,
  Divider,
  Header,
  Icon,
  Image,
  Modal,
  Popup,
  Segment,
} from 'semantic-ui-react';
import PostCommnets from './PostCommnets';
import CommentInputFeild from './CommentInputFeild';
import { deletePost, likePost } from '@/utils/postActions';
import LikesList from './LikesList';
import ImageModal from './ImageModal';
import NOImageModal from './NOImageModal';

const CardPost = ({ post, user, setPosts, setShowToaster }) => {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;
  const addPropsToModal = () => ({
    post,
    user,
    setLikes,
    likes,
    isLiked,
    comments,
    setComments,
  });

  return (
    <>
      {showModal && (
        <Modal
          open={showModal}
          closeIcon
          closeOnDimmerClick
          onClose={() => setShowModal(false)}
        >
          <Modal.Content>
            {post.picUrl ? (
              <ImageModal {...addPropsToModal()} />
            ) : (
              <NOImageModal {...addPropsToModal()} />
            )}
          </Modal.Content>
        </Modal>
      )}
      <Segment basic>
        <Card
          color='teal'
          fluid
        >
          {post.picUrl && (
            <Image
              src={post.picUrl}
              style={{ cursor: 'pointer' }}
              floated='left'
              wrapped
              ui={false}
              alt='PostImage'
              onClick={() => setShowModal(true)}
            />
          )}
          <Card.Content>
            <Image
              floated='left'
              src={post.user.profilePicUrl}
              avatar
              circular
            />

            {(user.role === 'root' || post.user._id === user._id) && (
              <>
                <Popup
                  on='click'
                  position='top right'
                  trigger={
                    <Image
                      src='/deleteIcon.svg'
                      style={{ cursor: 'pointer' }}
                      size='mini'
                      floated='right'
                    />
                  }
                >
                  <Header
                    as='h4'
                    content='Are u sure'
                  />
                  <p>This action is irreversible</p>
                  <Button
                    color='red'
                    icon='trash alternate'
                    content='Delete'
                    onClick={() =>
                      deletePost(post._id, setPosts, setShowToaster)
                    }
                  />
                </Popup>
              </>
            )}

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
            <Icon
              name='comment outline'
              style={{ marginLeft: '7px' }}
              color='blue'
            />
            {comments.length > 0 &&
              comments.map(
                (comment, i) =>
                  i < 3 && (
                    <PostCommnets
                      key={comment._id}
                      comment={comment}
                      postId={post._id}
                      user={user}
                      setComments={setComments}
                    />
                  ),
              )}
            {comments.length > 3 && (
              <Button
                content='View More'
                color='teal'
                onClick={() => setShowModal(true)}
                basic
                circular
              />
            )}

            <Divider hidden />
            <CommentInputFeild
              user={user}
              postId={post._id}
              setComments={setComments}
            />
          </Card.Content>
        </Card>
      </Segment>
      <Divider hidden />
    </>
  );
};

export default CardPost;
