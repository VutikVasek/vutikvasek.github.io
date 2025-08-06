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
          <SmartLink to={`/u/${notification.author}`}>
            {notification.author}{" has started following you"}
          </SmartLink>
        )
      case NotificationType.NEW_REPLY:
        return (
          <SmartLink to={`/p/${notification.context[NotificationContext.POST_ID]}?sort=newest&c=${notification.context[NotificationContext.COMMENT_ID]}`}>
            {notification.author}{notification.reply ? " has replied to your comment" : " has commented on your post"}
          </SmartLink>
        )
      case NotificationType.NEW_POST:
        return (
          <SmartLink to={`/p/${notification.context[NotificationContext.POST_ID]}`}>
            {notification.author}{" has posted"}
          </SmartLink>
        )
      case NotificationType.MENTION:
        return (
          <SmartLink to={`/p/${notification.context[NotificationContext.POST_ID]}`}>
            {notification.author}{" mentioned you in their post"}
          </SmartLink>
        )
      case NotificationType.COMMENT_MENTION:
        return (
          <SmartLink to={`/p/${notification.context[NotificationContext.POST_ID]}`}>
            {notification.context[NotificationContext.MENTION_NUM]}{" people have mentioned you on a post from "}{notification.author}
          </SmartLink>
        )
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/notification/${notification._id}`, {
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
    <div className={`flex items-center gap-2 ${!notification.seen && "font-semibold"}`}>
      <More>
        <button onClick={handleDelete}>Clear Notification</button>
      </More>
      <ProfilePicture pfp={notification.pfp} className="h-10" />
      {getContent()}
    </div>
  )
}