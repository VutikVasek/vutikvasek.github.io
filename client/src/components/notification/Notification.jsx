import { NotificationContext, NotificationType } from "^/shared"
import { Link } from "react-router-dom"
import More from "../basic/More"
import ProfilePicture from "../media/ProfilePicture"
const API = import.meta.env.VITE_API_BASE_URL;

export default function Notification({ notification }) {

  const getContent = () => {
    switch (notification.type) {
      case NotificationType.NEW_FOLLOWER:
        return (
          <Link to={`/u/${notification.author}`}>
            {notification.author}{" has started following you"}
          </Link>
        )
      case NotificationType.NEW_REPLY:
        return (
          <Link to={`/p/${notification.context[NotificationContext.POST_ID]}?sort=newest&c=${notification.context[NotificationContext.COMMENT_ID]}`}>
            {notification.author}{notification.reply ? " has replied to your comment" : " has commented on your post"}
          </Link>
        )
      case NotificationType.NEW_POST:
        return (
          <Link to={`/p/${notification.context[NotificationContext.POST_ID]}`}>
            {notification.author}{" has posted"}
          </Link>
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