import catchErrors from '@/utils/catchErrors';
import axios from 'axios';
import React, { useState } from 'react';
import baseUrl from '@/utils/baseUrl';
import { Image, List, Popup } from 'semantic-ui-react';
import { LikesPlaceHolder } from '../Layout/PlaceHolderGroup';
import Link from 'next/link';
import Cookies from 'js-cookie';
const LikesList = ({ postId, trigger }) => {
  const [likesList, setLikesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getLikesList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/posts/like/${postId}`, {
        headers: { Authorization: Cookies.get('token') },
      });
      setLikesList(res.data);
    } catch (error) {
      alert(catchErrors(error));
    }
    setLoading(false);
  };
  return (
    <Popup
      on='click'
      onClose={() => setLikesList([])}
      onOpen={getLikesList}
      popperDependencies={[likesList]}
      trigger={trigger}
      wide
    >
      {' '}
      {loading ? (
        <LikesPlaceHolder />
      ) : (
        <>
          {likesList.length > 0 && (
            <div
              style={{
                overflow: 'auto',
                maxHeight: '15rem',
                height: '15rem',
                minWidth: '210px',
              }}
            >
              <List
                selection
                size='large'
              >
                {likesList.map((like) => (
                  <List.Item key={like._id}>
                    <Image
                      avatar
                      src={like.user.profilePicUrl}
                    />
                    <List.Content>
                      <Link href={`/${like.user.username}`}>
                        <List.Header
                          as='a'
                          content={like.user.name}
                        ></List.Header>
                      </Link>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </div>
          )}
        </>
      )}
    </Popup>
  );
};

export default LikesList;
