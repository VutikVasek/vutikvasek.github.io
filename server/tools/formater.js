import Comment from "../models/Comment.js";

export const formatFeedPost = async (unpost, userId) => {
  const post = {...unpost};
  try {
    if (userId && post.likes) post.liked = post.likes.some(id => id.toString() === userId.toString());

    post.likes = post.likesCount;
    post.comments = (await Comment.find({parent: post._id})).length;

    return {
      ...post,
      author: {username: post.author.username, pfp: post.author._id},
    };
  } catch (err) {
    console.log(err);
  }
}

export const formatPost = async (unpost, userId) => {
  try {
    const post = (await unpost.populate('author', 'username _id')).toObject();
    if (!post.author) 
      post.author = { username: "<deleted>", _id: "<deleted>" };
    else post.author._id = post.author._id.toString();

    if (userId && post.likes) post.liked = post.likes.some(id => id.toString() === userId.toString());

    post.likes = post.likes.length;
    post.comments = (await Comment.find({parent: post._id})).length;

    return {
      ...post,
      author: {username: post.author.username, pfp: post.author._id},
    };
  } catch (err) {
    console.log(err);
  }
}

export const formatPopularComment = async (uncomment, userId) => {
  const comment = {...uncomment};
  try {
    if (userId && comment.likes) comment.liked = comment.likes.some(id => id.toString() === userId.toString());

    comment.likes = comment.likesCount;
    comment.comments = (await Comment.find({parent: comment._id})).length;

    return {
      ...comment,
      author: {username: comment.author.username, pfp: comment.author._id},
    };
  } catch (err) {
    console.log(err);
  }
}

export const formatComment = async (uncomment, userId) => {
  const comment = (await uncomment.populate('author', 'username _id')).toObject();
  if (!comment.author) 
    comment.author = { username: "<deleted>", _id: "<deleted>" };
  else comment.author._id = comment.author._id.toString();

  if (userId) comment.liked = comment.likes.some(id => id.toString() === userId.toString());

  comment.likes = comment.likes.length
  comment.comments = (await Comment.find({parent: comment._id})).length;

  return {
    ...comment,
    author: {username: comment.author.username, pfp: comment.author._id},
  };
}