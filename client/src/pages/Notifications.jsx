import ManageNotificationsButton from "@/components/notification/ManageNotificationsButton";
import Notification from "@/components/notification/Notification";
import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";

const API = import.meta.env.VITE_API_BASE_URL;

export default function Notifications() {
  const observer = useRef();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadNotifications = async (reload) => {
    const res = await fetch(`${API}/notification/?page=${reload ? 1 : encodeURIComponent(page)}&limit=6`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();
    const notifications = data.notifications.filter(notif => notif != null);

    if (res.ok) {
      if (reload) {
        setNotifications(notifications);
        setPage(1);
      } else {
        setNotifications((prev) => [...prev, ...notifications].filter(
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
    <>
      <Helmet>
        <title>Notifications ({notifications.filter(notif => !notif.seen).length.toString()}) - Vutink</title>
      </Helmet>
      <div>
        <h1 className="title">Notifications</h1>
        <div className="flex justify-end my-4">
          <ManageNotificationsButton />
        </div>
        <div className="flex flex-col gap-4">
          {notifications.map((notif, index) => (
            <div ref={index === notifications.length - 1 ? lastNotificationRef : null} key={notif._id}>
              <Notification notification={notif} />
            </div>
          ))}
        </div>
        {error}
      </div>
    </>
  )
}