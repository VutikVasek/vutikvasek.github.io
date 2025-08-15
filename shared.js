let i = 0;
export const NotificationType = {
  NEW_FOLLOWER: i++,
  NEW_REPLY: i++,
  NEW_POST: i++,
  MENTION: i++,
  COMMENT_MENTION: i++,
  GROUP_POST: i++,
  GROUP_JOIN_REQUEST: i++,
  GROUP_JOIN_DENY: i++,
  GROUP_JOIN_ACCEPT: i++,
  NEW_MEMBER: i++,
  MADE_ADMIN: i++,
  REVOKED_ADMIN: i++,
  NEW_MESSAGE: i++,
}

export const NotificationContext = {
  POST_ID: 0,
  COMMENT_ID: 1,
  FOLLOWER_ID: 0,
  FOLLOWING_ID: 1,
  MENTION_NUM: 1,
  MENTIONER_ID: 1,
  POST_AUTHOR_ID: 2,
  GROUP_ID: 0,
  MEMBER_ID: 1,
}

export const GroupNotification = {
  ALL: 0,
  ESSENTIAL: 1,
  NONE: 2
}