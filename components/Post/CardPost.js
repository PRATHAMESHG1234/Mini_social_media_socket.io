import Link from "next/link";
import React, { useState } from "react";
import calculateTime from "../../utils/calculateTime";
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
} from "semantic-ui-react";
import PostComments from "./PostComments";
import CommentInputField from "./CommentInputField";
import { deletePost, likePost } from "@/utils/postActions";
import LikesList from "./LikesList";
import ImageModal from "./ImageModal";
import NOImageModal from "./NOImageModal";
import Avatar from "./Avatar";
const CardPost = ({ socket, post, user, setPosts, setShowToaster }) => {
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
        <Card color="teal" fluid>
          {post.picUrl && (
            <img
              loading="lazy"
              src={post.picUrl}
              style={{
                cursor: "pointer",
                maxWidth: "100%",
                height: "30%",
              }}
              alt="PostImage"
              onClick={() => setShowModal(true)}
            />
          )}

          <Card.Content className="relative">
            {(user.role === "root" || post.user._id === user._id) && (
              <div style={{ position: "absolute", right: "10px" }}>
                <Popup
                  on="click"
                  position="top right"
                  trigger={
                    <img
                      alt="deleteIcon"
                      loading="lazy"
                      style={{ cursor: "pointer" }}
                      src="/deleteIcon.svg"
                      height={35}
                      width={35}
                    />
                  }
                >
                  <Header as="h4" content="Are you sure?" />
                  <p>This action is irreversible!</p>

                  <Button
                    color="red"
                    icon="trash"
                    content="Delete"
                    onClick={() => deletePost(post._id, setPosts)}
                  />
                </Popup>
              </div>
            )}

            <div className="flex" style={{ gap: "1rem" }}>
              <Avatar alt={post.user.name} src={post.user.profilePicUrl} />

              <div>
                <h4 style={{ marginBottom: "2px" }}>
                  <Link href={`/${post.user.username}`}>{post.user.name}</Link>
                </h4>
                <Card.Meta>{calculateTime(post.createdAt)}</Card.Meta>

                {post.location && <Card.Meta content={post.location} />}
              </div>
            </div>

            <Card.Description className="cardDescription">
              {post.text}
            </Card.Description>
          </Card.Content>

          <Card.Content extra>
            <Icon
              name={isLiked ? "heart" : "heart outline"}
              color="red"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (socket.connected) {
                  socket.emit("likePost", {
                    postId: post._id,
                    userId: user._id,
                    like: isLiked ? false : true,
                  });

                  socket.on("postLiked", postLiked);
                } else {
                  likePost(
                    post._id,
                    user._id,
                    setLikes,
                    isLiked ? false : true,
                  );
                }
              }}
            />

            <LikesList
              postId={post._id}
              trigger={
                likes.length > 0 && (
                  <span className="spanLikesList">
                    {`${likes.length} ${likes.length === 1 ? "like" : "likes"}`}
                  </span>
                )
              }
            />

            <Icon
              name="comment outline"
              style={{ marginLeft: "7px" }}
              color="blue"
            />

            {comments.map(
              (comment, i) =>
                i < 3 && (
                  <PostComments
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
                content="View More"
                color="teal"
                basic
                circular
                onClick={() => setShowModal(true)}
              />
            )}

            <Divider hidden />

            <CommentInputField
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
