import calculateTime from '@/utils/calculateTime';
import React, { useState } from 'react';
import { Comment, Icon } from 'semantic-ui-react';

const PostCommnets = ({ comment, user, setComments, postId }) => {
  const [disabled, setDisabled] = useState(false);

  if (!comment || !comment.user) {
    return null; // or render a placeholder or loading state
  }

  return (
    <Comment.Group>
      <Comment>
        <Comment.Avatar src={comment.user.profilePicUrl} />
        <Comment.Content>
          <Comment.Author as='a' href={`${comment.user.username}`}>
            {comment.user.name}
          </Comment.Author>
          <Comment.Metadata>{calculateTime(comment.date)}</Comment.Metadata>
          <Comment.Text>{comment.text}</Comment.Text>
          <Comment.Actions>
            {(user.role === 'root' || comment.user._id === user._id) && (
              <Icon disabled={disabled} color='red' name='trash alternate' />
            )}
          </Comment.Actions>
        </Comment.Content>
      </Comment>
    </Comment.Group>
  );
};

export default PostCommnets;
