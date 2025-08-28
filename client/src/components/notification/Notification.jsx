import { NotificationContext, NotificationType } from "^/shared"
import More from "../basic/More"
import ProfilePicture from "../media/ProfilePicture"
import SmartLink from "../basic/SmartLink";
const API = import.meta.env.VITE_API_BASE_URL;

export default function Notification({ notification }) {

  const getContent = () => {
    switch (notification.type) {
      case NotificationType.NEW_FOLLOWER:
        return (
          <SmartLink to={`/u/${encodeURIComponent(notification.author)}`}>
            {notification.author}{" has started following you"}
          </SmartLink>
        )
      case NotificationType.NEW_REPLY:
        return (
          <SmartLink to={`/p/${encodeURIComponent(notification.context[NotificationContext.POST_ID])}?sort=newest&c=${encodeURIComponent(notification.context[NotificationContext.COMMENT_ID])}`}>
            {notification.author}{notification.reply ? " has replied to your comment" : " has commented on your post"}
          </SmartLink>
        )
      case NotificationType.NEW_POST:
        return (
          <SmartLink to={`/p/${encodeURIComponent(notification.context[NotificationContext.POST_ID])}`}>
            {notification.author}{" has posted"}
          </SmartLink>
        )
      case NotificationType.MENTION:
        return (
          <SmartLink to={`/p/${encodeURIComponent(notification.context[NotificationContext.POST_ID])}`}>
            {notification.author}{" mentioned you in their post"}
          </SmartLink>
        )
      case NotificationType.COMMENT_MENTION:
        return (
          <SmartLink to={`/p/${encodeURIComponent(notification.context[NotificationContext.POST_ID])}`}>
            {notification.context[NotificationContext.MENTION_NUM]}{" people have mentioned you on a post from "}{notification.author}
          </SmartLink>
        )
      case NotificationType.NEW_MEMBER:
        return (
          <SmartLink to={`/u/${encodeURIComponent(notification.username)}`}>
            {notification.username}{" has joined "}
            <SmartLink to={`/g/${encodeURIComponent(notification.groupname)}`} as="span">{notification.groupname}</SmartLink>
          </SmartLink>
        )
      case NotificationType.GROUP_JOIN_REQUEST:
        return (
          <div>
            <SmartLink to={`/u/${encodeURIComponent(notification.username)}`}>
              {notification.username}{" has requested to join "}{notification.groupname}
            </SmartLink>
            <button onClick={e => handleResultRequest(e, "accept")}>Accept</button>
            <button onClick={e => handleResultRequest(e, "deny")}>Deny</button>
          </div>
        )
      case NotificationType.GROUP_JOIN_ACCEPT:
        return (
          <SmartLink to={`/g/${encodeURIComponent(notification.groupname)}`}>
            {"Your request to join "}{notification.groupname}{" has been accepted"}
          </SmartLink>
        )
      case NotificationType.GROUP_JOIN_DENY:
        return (
          <SmartLink to={`/g/${encodeURIComponent(notification.groupname)}`}>
            {"Your request to join "}{notification.groupname}{" has been dennied"}
          </SmartLink>
        )
      case NotificationType.MADE_ADMIN:
        return (
          <SmartLink to={`/g/${encodeURIComponent(notification.groupname)}`}>
            {"You have been made an admin of "}{notification.groupname}
          </SmartLink>
        )
      case NotificationType.REVOKED_ADMIN:
        return (
          <SmartLink to={`/g/${encodeURIComponent(notification.groupname)}`}>
            {"You are no longer an admin of "}{notification.groupname}
          </SmartLink>
        )
      case NotificationType.GROUP_POST:
        return (
          <SmartLink to={`/p/${encodeURIComponent(notification.context[NotificationContext.POST_ID])}`}>
            {notification.author}{" has posted to "}{notification.groups.join(', ')}
          </SmartLink>
        )
    }
  }

  const handleResultRequest = async (e, result) => {
    e.preventDefault();
    const res = await fetch(`${API}/group/${encodeURIComponent(notification.groupname)}/${encodeURIComponent(result)}/${encodeURIComponent(notification.pfp)}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();
    if (!res.ok) console.log(data.message);
    window.location.reload();
  } 

  const handleDelete = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/notification/${encodeURIComponent(notification._id)}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();
    if (!res.ok) console.log(data.message);
    window.location.reload();
  }

  return (
    <div className={`flex items-center gap-2 hover:bg-slate-900 p-2 rounded-md ${!notification.seen && "font-semibold"}`}>
      <More>
        <button onClick={handleDelete}>Clear Notification</button>
      </More>
      { !notification.gp ? 
        <ProfilePicture pfp={notification.pfp} className="h-10" />
        :
        <ProfilePicture pfp={notification.gp} path="gp" className="h-10" />
      }
      {getContent()}
    </div>
  )
}