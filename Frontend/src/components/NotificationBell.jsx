import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdNotifications, MdCheck } from "react-icons/md";
import useWebSocket, { ReadyState } from "react-use-websocket";
import axios from "../utils/AxiosInstance";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("pms_access_token");
  const navigate = useNavigate();

  // Fetch initial unread count & initial list
  useEffect(() => {
    if (token) {
      axios.get("/notifications/")
        .then((res) => {
          setNotifications(res.data.results || res.data || []);
        })
        .catch(console.error);
    }
  }, [token]);


  const WS_URL = token ? `ws://localhost:8000/ws/notifications/?token=${token}` : null;
  const { lastJsonMessage, readyState } = useWebSocket(WS_URL, {
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.type === "notification") {
        setNotifications((prev) => [lastJsonMessage.message, ...prev]);
        
        // Optional: Play a sound
        // const audio = new Audio("/notify.mp3");
        // audio.play().catch(e => {});
      }
    }
  }, [lastJsonMessage]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await axios.post(`/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (_) {}
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  if (!token) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MdNotifications className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 transition-colors hover:bg-gray-50 ${!n.read ? "bg-emerald-50/30" : ""} group`}
                    onClick={() => {
                        if(n.link) {
                            navigate(n.link);
                            setOpen(false);
                            if(!n.read) markAsRead(n.id);
                        }
                    }}
                    style={{ cursor: n.link ? 'pointer' : 'default' }}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider font-medium">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="shrink-0 flex items-start">
                          <button 
                            onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                            className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Mark as read"
                          >
                            <MdCheck className="text-sm" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
