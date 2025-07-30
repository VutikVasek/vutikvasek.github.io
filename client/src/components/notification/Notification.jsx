import { NotificationType } from "^/shared"
import { Link } from "react-router-dom"

export default function Notification({ notification }) {

  const getContent = () => {
    switch (notification.type) {
      case NotificationType.NEW_FOLLOWER:
        return (
          "You have a new follower"
        )
      case NotificationType.NEW_REPLY:
        return (
          <Link to={`/p/${notification.context[0]}?sort=newest&c=${notification.context[1]}`}>
            {notification.author}{notification.reply ? " has replied to your comment" : " has commented on your post"}
          </Link>
        )
    }
  }

  return (
    <div>
      {getContent()}
    </div>
  )
}