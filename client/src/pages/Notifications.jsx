import Notification from "@/components/notification/Notification";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

export default function Notifications() {
  const observer = useRef();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadNotifications = async (reload) => {
    const res = await fetch(`${API}/notification/?page=${reload ? 1 : page}&limit=3`, {
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
  useEffect(() => {
    loadNotifications();
  }, [page])
    
  const lastNotificationRef = useCallback((node) => {
    if (!hasMore) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [hasMore]);

  return (
    <div>
      <Link to="/account/notification-settings" className="text-end block m-4">Manage your notifications</Link>
      <div className="flex flex-col gap-4">
        {notifications.map((notif, index) => (
          <div ref={index === notifications.length - 1 ? lastNotificationRef : null} key={notif._id}>
            <Notification notification={notif} />
          </div>
        ))}
      </div>
      {error}
    </div>
  )
}