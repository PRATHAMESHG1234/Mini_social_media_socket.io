import React, { useState } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import baseUrl from "@/utils/baseUrl";
import Link from "next/link";
import calculateTime from "../../utils/calculateTime";
import {
  Card,
  Container,
  Divider,
  Icon,
  Image,
  Segment,
} from "semantic-ui-react";
import PostCommnets from "../../components/Post/PostComments";
import CommentInputFeild from "../../components/Post/CommentInputField";
import LikesList from "../../components/Post/LikesList";
import { likePost } from "@/utils/postActions";
import { NoPost, NoPosts } from "@/components/Layout/NoData";

const PostPage = ({ post, errorLoading, user }) => {
  if (errorLoading) {
    <NoPosts />;
  }
  const [likes, setLikes] = useState(post.likes);
  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;
  const [comments, setComments] = useState(post.comments);

  return (
    <Container text>
      <Segment basic>
        <Card color="teal" fluid>
          {post.picUrl && (
            <Image
              src={post.picUrl}
              style={{ cursor: "pointer" }}
              floated="left"
              wrapped
              ui={false}
              alt="PostImage"
              onClick={() => setShowModal(true)}
            />
          )}
          <Card.Content>
            <Image
              floated="left"
              src={post.user.profilePicUrl}
              avatar
              circular
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
                fontSize: "17px",
                letterSpacing: "0.1px",
                wordSpacing: "0.35px",
              }}
            >
              {post.text}
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Icon
              name={isLiked ? "heart" : "heart outline"}
              color="red"
              style={{ cursor: "pointer" }}
              onClick={() =>
                likePost(post._id, user._id, setLikes, isLiked ? false : true)
              }
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
            {comments.length > 0 &&
              comments.map((comment) => (
                <PostCommnets
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  user={user}
                  setComments={setComments}
                />
              ))}

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
    </Container>
  );
};

PostPage.getInitialProps = async (ctx) => {
  try {
    const postId = ctx.query.postId;
    const { token } = parseCookies(ctx);
    const { data } = await axios.get(`${baseUrl}/api/posts/${postId}`, {
      headers: {
        Authorization: token,
      },
    });
    return { post: data };
  } catch (error) {
    return { errorLoading: true };
  }
};
export default PostPage;
