import Comment from "../models/Comment.js";

export const formatPost = async (unpost, userId) => {
  const post = (await unpost.populate('author', 'username _id')).toObject();
  if (!post.author) 
    post.author = { username: "<deleted>", _id: "<deleted>" };
  else post.author._id = post.author._id.toString();

  // if (post.author.username == username) post.liked = post.likes.some(id => id.toString() === post.author._id.toString());
  if (userId) post.liked = post.likes.some(id => id.toString() === userId.toString());

  post.likes = post.likes.length;
  post.comments = (await Comment.find({parent: post._id})).length;

  return {
    ...post,
    author: {username: post.author.username, pfp: post.author._id},
  };
}

export const formatPostWithUser = async (unpost, user) => {
  const post = unpost.toObject();

  if (user) post.liked = post.likes.some(id => id.toString() === user._id.toString());

  post.likes = post.likes.length;
  post.comments = (await Comment.find({parent: post._id})).length;

  return {
    ...post,
    author: {username: user.username, pfp: user._id},
  };
}

export const formatComment = async (uncomment, userId) => {
  const comment = (await uncomment.populate('author', 'username _id')).toObject();
  if (!comment.author) 
    comment.author = { username: "<deleted>", _id: "<deleted>" };
  else comment.author._id = comment.author._id.toString();

  // if (comment.author.username == username) comment.liked = comment.likes.some(id => id.toString() === comment.author._id.toString());
  if (userId) comment.liked = comment.likes.some(id => id.toString() === userId.toString());

  comment.likes = comment.likes.length
  comment.comments = (await Comment.find({parent: comment._id})).length;

  return {
    ...comment,
    author: {username: comment.author.username, pfp: comment.author._id},
  };
}