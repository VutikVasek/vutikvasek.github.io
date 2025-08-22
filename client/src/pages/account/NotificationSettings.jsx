import Dropdown from "@/components/basic/Dropdown";
import GroupList from "@/components/profile/GroupList";
import { useAuth } from "@/context/AuthContext";
import { GroupNotification, NotificationType } from "^/shared";
import { useEffect, useState } from "react";
import Switch from "react-switch";
const API = import.meta.env.VITE_API_BASE_URL;

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupsNotifications, setGroupsNotifications] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const notifNames = [];
  notifNames[NotificationType.NEW_FOLLOWER] = "Someone follows you";
  notifNames[NotificationType.NEW_REPLY] = "Someone replies to you";
  notifNames[NotificationType.NEW_POST] = "Someone you follow (and have notifications set to all) posts";
  notifNames[NotificationType.MENTION] = "Someone mentions on a post";
  notifNames[NotificationType.COMMENT_MENTION] = "Someone mentions you in comments";
  // notifNames[NotificationType.GROUP_POST] = "Someone posts to one of your groups";
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
  useEffect(() => {
    setGroupsNotifications(groups.map(group => group.notification));
  }, [groups])

  const updateGroupNotification = async (groupId, notification) => {
    const res = await fetch(`${API}/group/${encodeURIComponent(groupId)}/notification`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ notification })
    });

    const data = await res.json();
    if (!res.ok) setError(data.message);
  }

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
          if (!notifNames[type]) return;
          return (
            <div className="flex gap-2" key={type}>
              {notifNames[type]}
              <Switch checked={val} onChange={(checked) => handleChange(checked, type)} />
            </div>
          )
        })}
        <div>
          Groups:
          <div className="flex">
            <GroupList url={`${API}/profile/user/${encodeURIComponent(user)}/groups`} setGroupsParent={setGroups} />
            <div className="flex flex-col justify-end">
              {groups.map((group, index) => 
                <Dropdown 
                  set={(val) => {
                    if (groupsNotifications[index] !== val) updateGroupNotification(group.gp, val);
                    setGroupsNotifications(prev => prev.map((notif, i) => i !== index ? notif : val));
                  }} 
                  get={getText(groupsNotifications[index], true)}
                  key={index}
                >
                  {[
                  [GroupNotification.ALL, getText(GroupNotification.ALL)],
                  [GroupNotification.ESSENTIAL, getText(GroupNotification.ESSENTIAL)],
                  [GroupNotification.NONE, getText(GroupNotification.NONE)]
                  ]}
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>
      {error}
    </>
  )
}

const textArray = [];
textArray[GroupNotification.ALL] = ["All", "Get notifications to everything that happens (new posts, or new members if you are the owner)"];
textArray[GroupNotification.ESSENTIAL] = ["Essential", "Get notified only for the importand stuff (mainly for admins)"];
textArray[GroupNotification.NONE] = ["None", "You'll get zero notifications from this group"];

const getText = (groupNotif, cut) => {
  if (groupNotif == null) return;
  return (
    <>
      <h3>{textArray[groupNotif][0]}</h3>
      {!cut && <p className="text-sm pl-2 whitespace-normal">{textArray[groupNotif][1]}</p>}
    </>
  )
}