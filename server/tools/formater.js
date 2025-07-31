import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const formatFeedPost = async (unpost, userId) => {
  const post = {...unpost};
  try {
    return await formatAuthorPost(post, userId);
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

    return await formatAuthorPost(post, userId);
  } catch (err) {
    console.log(err);
  }
}

const formatAuthorPost = async (post, userId) => {
  if (userId && post.likes) post.liked = post.likes.some(id => id.toString() === userId.toString());

  post.likes = post.likes?.length || post.likesCount;
  post.comments = (await Comment.find({parent: post._id})).length;
  post.itsme = post.author._id == userId;

  return {
    ...post,
    author: {username: post.author.username, pfp: post.author._id},
  };
};

export const formatPopularComment = async (uncomment, userId, linkParent) => {
  const comment = {...uncomment};
  if (userId && comment.likes) comment.liked = comment.likes.some(id => id.toString() === userId.toString());

  return formatCommentObject(comment, linkParent, userId)
}

export const formatComment = async (uncomment, userId, linkParent) => {
  const comment = (await uncomment.populate('author', 'username _id')).toObject();
  if (!comment.author) 
    comment.author = { username: "<deleted>", _id: "<deleted>" };
  else comment.author._id = comment.author._id.toString();

  if (userId) comment.liked = comment.likes.some(id => id.toString() === userId.toString());

  return formatCommentObject(comment, linkParent, userId)
}

const formatCommentObject = async (comment, linkParent, userId) => {
  try {
    comment.likes = comment.likes.length
    comment.comments = (await Comment.find({parent: comment._id})).length;
    comment.itsme = comment.author._id == userId;
    
    if (linkParent) {
      let parent = await Post.findById(comment.parent).populate('author', 'username');
      if (!parent) {
        const directParent = await Comment.findById(comment.parent).select('parent').populate('author', 'username');
        if (!directParent || !directParent.parent) parent = {_id: "<deleted>", author: { _id: "<deleted>", username: "<deleted post>"}} 
        else {
          parent = directParent;
          let postParent;
          do {
            if (!parent) {
              parent = {_id: "<deleted>", author: { _id: "<deleted>", username: "<deleted post>"}};
              break;
            };
            postParent = await Post.findById(parent.parent).select('parent').populate('author', 'username');
            if (!postParent) parent = await Comment.findById(parent.parent).select('parent').populate('author', 'username');
            else parent = {...(postParent.toObject()), directParent};
          } while (!postParent)
        } 
      } 
      if (!parent.author) parent.author = { _id: "<deleted>", username: "<deleted user>"};
      comment.parent = parent;
    }

    return {
      ...comment,
      author: {username: comment.author.username, pfp: comment.author._id},
    };
  } catch (err) {
    console.log(err);
  }
}

export const formatDate = (index) => {
  const date = new Date();
  switch (index) {
    case "day":
      date.setDate(date.getDate() - 1);
      break;
    case "week":
      date.setDate(date.getDate() - 7);
      break;
    case "month":
      date.setMonth(date.getMonth() - 1);
      break;
    case "year":
      date.setFullYear(date.getFullYear() - 1);
      break;
  }
  return date;
}