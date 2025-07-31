import { NotificationType } from "^/shared";
import { useEffect, useState } from "react";
import Switch from "react-switch";
const API = import.meta.env.VITE_API_BASE_URL;

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  const notifNames = [];
  notifNames[NotificationType.NEW_FOLLOWER] = "Someone follows you";
  notifNames[NotificationType.NEW_REPLY] = "Someone replies to you";
  notifNames[NotificationType.NEW_POST] = "Someone you follow (and have notifications set to all) posts";
  notifNames[NotificationType.MENTION] = "Someone mentions on a post";
  notifNames[NotificationType.COMMENT_MENTION] = "Someone mentions you in comments";
  notifNames[NotificationType.GROUP_POST] = "Someone posts to one of your groups";
  notifNames[NotificationType.NEW_MEMBER] = "Someone joins your group";

  const loadNotifications = async () => {
    const res = await fetch(`${API}/account/notifications`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!res.ok) setError('Loading error');

    const data = await res.json();
    setNotifications(data.notifications);
  }

  useEffect(() => {
    loadNotifications()
  }, []);

  const handleChange = async (checked, type) => {
    const newSettings = [...notifications];
    newSettings[type] = checked;
    setNotifications(newSettings)
    const res = await fetch(`${API}/account/notifications`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ newSettings })
    });

    const data = await res.json();
    if (!res.ok) setError(data.message);
  }

  return (
    <>
      Notify when:
      <div>
        {notifications.map((val, type) => {
          if (type === NotificationType.NEW_MESSAGE) return;
          return (
            <div className="flex gap-2" key={type}>
              {notifNames[type]}
              <Switch checked={val} onChange={(checked) => handleChange(checked, type)} />
            </div>
          )
        })}
      </div>
      {error}
    </>
  )
}