const { default: axios } = require('axios');
import Cookies from 'js-cookie';
import baseUrl from './baseUrl';
import catchErrors from './catchErrors';
const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  headers: { Authorization: Cookies.get('token') },
});

export const submitNewPost = async (
  user,
  text,
  location,
  picUrl,
  setPosts,
  setnewPosts,
  setError
) => {
  try {
    const res = await Axios.post('/', { text, location, picUrl });
    const newPost = {
      _id: res.data,
      user,
      text,
      location,
      picUrl,
      likes: [],
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setnewPosts({ text: '', location: '' });
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
};

export const deletePost = async (postId, setPosts, setShowToaster) => {
  try {
    await Axios.delete(`/${postId}`);
    setPosts((prev) => prev.filter((post) => post._id !== postId));
    setShowToaster(true);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const likePost = async (postId, userId, setLikes, like = true) => {
  try {
    if (like) {
      await Axios.post(`/like/${postId}`);
      setLikes((prev) => [...prev, { user: userId }]);
    } else if (!like) {
      await Axios.put(`/unlike/${postId}`);
      setLikes((prev) => prev.filter((like) => like.user !== userId));
    }
  } catch (error) {
    alert(catchErrors(error));
  }
};
export const postComment = async (postId,user,setComments,text,setText) => {
    try {
        

        const res = await Axios.post(`/comment/${postId}`,{text})

        const newComment={
            _id:res.data,
            user,
            text,
            date:Date.now()

        }
        setComments(prev=>[newComment,...prev])
        setText("")
    } catch (error) {
        alert(catchErrors(error));  
    }
};

export const deleteComment =async(postId,commentId,setComments)=>{
try {
    await Axios.delete(`/${postId}/${commentId}`)
    setComments(prev=>prev.filter(comment=>comment._id!==commentId))
} catch (error) {
alert(catchErrors(error));
}
}
