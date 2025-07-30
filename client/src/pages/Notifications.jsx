import Notification from "@/components/notification/Notification";
import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

export default function Notifications() {
  const observer = useRef();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadNotifications = async (reload) => {
    const res = await fetch(`${API}/notification/?page=${reload ? 1 : page}&limit=7`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();

    if (res.ok) {
      if (reload) {
        setNotifications(data.notifications);
        setPage(1);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications].filter(
            (post, index, self) => index === self.findIndex(p => p._id === post._id)
        ));
      }

      setHasMore(data.hasMore);
    } else {
      setError('An error has occured while loading');
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [])

  return (
    <div>
      {notifications.map(notif => (
        <Notification notification={notif} />
      ))}
    </div>
  )
}