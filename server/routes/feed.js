import express from 'express';
import Post from '../models/Post.js';
import { verifyToken, verifyTokenNotStrict } from '../middleware/auth.js';
import { formatDate, formatFeedPost, formatPost } from '../tools/formater.js';
import Follow from '../models/Follow.js';
import Group from '../models/Group.js';

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

// Get posts from groups user is member of
router.get('/groups', verifyToken, async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).select('_id');
  const groupsIds = groups.map(group => group._id);

  getFeed(req, res, { groups: { $in: groupsIds } }, false);
})

// Get hashtag posts
router.get('/hash/:hashtag', verifyTokenNotStrict, async (req, res) => {
  const hashtag = req.params.hashtag;
  getFeed(req, res, { text: new RegExp(`#${hashtag}(?=\\s|$|[^\\w]|#)`, 'gi') });
})

export const getFeed = async (req, res, filter, groups = true) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const sortByPopularity = req.query.sort == "popular";
  const time = req.query.time;
  if (sortByPopularity && time != "all") filter = {...filter, createdAt: {$gt: formatDate(time)}};
  const sortStage = sortByPopularity ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 };

  if (groups) {
    const publicGroups = (await Group.find({ private: false }).select('_id')).map(group => group._id);
    const myGroups = (await Group.find({ members: req.user?._id }).select('_id')).map(group => group._id);
    const allGroups = [...publicGroups, ...myGroups, null].filter((id, index, arr) => arr.indexOf(id) === index);
    filter = {
      ...filter, 
      $or: [
        { groups: { $in: allGroups } },
        { groups: { $exists: false } },
        { groups: null },
        { groups: [] }
      ]
     }
  }

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

export default router;