import express from 'express';
import Post from '../models/Post.js';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import { formatFeedPost, formatPost } from '../tools/formater.js';
import Follow from '../models/Follow.js';

const router = express.Router();


// Get posts
router.get('/', verifyTokenNotStrict, async (req, res) => {
  getFeed(req, res, {});
});

// Get following posts
router.get('/following', verifyToken, async (req, res) => {
  const following = await Follow.find({follower: req.user._id});
  const followingList = following.map(obj => obj.following);
  getFeed(req, res, {author: { $in: followingList }});
});

export const getFeed = async (req, res, filter) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const sortByPopularity = req.query.sort == "popular";
  const time = req.query.time;
  if (sortByPopularity && time != "all") filter = {...filter, createdAt: {$gt: getDate(time)}};
  const sortStage = sortByPopularity ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 };

  try {
    const posts = await Post.aggregate([
      { $match: filter },
      { $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } }
        }
      },
      { $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $addFields: {
          author: {
            $cond: {
              if: { $gt: [{ $size: "$author" }, 0] },
              then: {
                _id: { $arrayElemAt: ["$author._id", 0] },
                username: { $arrayElemAt: ["$author.username", 0] }
              },
              else: {
                _id: "<deleted>",
                username: "<deleted>"
              }
            }
          }
        }
      },
      { $unwind: "$author" },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Post.countDocuments(filter);
    
    const postsWithAuthors = await Promise.all(
      posts.map(async (unpost) => await formatFeedPost(unpost, req.user?._id))
    );

    res.json({
      posts: postsWithAuthors,
      hasMore: skip + posts.length < total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
    console.log(err);
  }
}

export const getDate = (index) => {
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

export default router;