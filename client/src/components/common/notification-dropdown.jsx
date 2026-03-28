import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCheck,
  CreditCard,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService,
} from "@/services";

const iconMap = {
  BROADCAST: MessageSquareText,
  COURSE_UPDATE: Sparkles,
  NEW_LECTURE: BookOpen,
  COURSE_SCHEDULE: CalendarDays,
  FEEDBACK: MessageSquareText,
  ENROLLMENT: CreditCard,
  PAYMENT: CreditCard,
  GENERAL: Bell,
};

const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const NotificationDropdown = ({ userId, role }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const roomEvent = role === "instructor" ? "join-instructor" : "join-student";

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await getNotificationsService(14);
      if (response?.success) {
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;

    const socketBaseUrl = import.meta.env.DEV
      ? undefined
      : import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || undefined;
    const socket = io(socketBaseUrl);
    socket.emit(roomEvent, userId);
    socket.on("new-notification", (payload) => {
      setNotifications((current) => {
        const deduped = current.filter((item) => item._id !== payload._id);
        return [payload, ...deduped].slice(0, 14);
      });
      setUnreadCount((current) => current + (payload.read ? 0 : 1));
    });

    return () => {
      socket.disconnect();
    };
  }, [roomEvent, userId]);

  const hasUnread = unreadCount > 0;

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationReadService(notification._id);
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, read: true } : item,
          ),
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (!hasUnread) return;

    try {
      setMarkingAll(true);
      const response = await markAllNotificationsReadService();
      if (response?.success) {
        setNotifications((current) =>
          current.map((notification) => ({ ...notification, read: true })),
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const notificationItems = useMemo(() => notifications.slice(0, 8), [notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-11 h-11 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all relative group hover:bg-white/20">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-2.5 right-2.5 min-w-[18px] h-[18px] px-1 bg-[#ff7e5f] rounded-full border-2 border-[#0d694f] text-[9px] font-black text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[360px] bg-white border border-[#0d694f]/10 rounded-[1.75rem] shadow-2xl p-0 overflow-hidden"
      >
        <div className="px-5 py-4 bg-[#fcf8f1] border-b border-[#0d694f]/5 flex items-center justify-between">
          <DropdownMenuLabel className="p-0 text-sm font-headline font-bold text-[#0d694f]">
            Notifications
          </DropdownMenuLabel>
          <button
            onClick={handleMarkAllRead}
            disabled={!hasUnread || markingAll}
            className="text-[10px] font-bold text-[#ff7e5f] disabled:text-slate-300 transition-colors"
          >
            <span className="inline-flex items-center gap-1">
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </span>
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              Loading notifications...
            </div>
          ) : notificationItems.length === 0 ? (
            <div className="px-5 py-12 text-center space-y-2">
              <Bell className="h-8 w-8 text-slate-200 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">No notifications yet</p>
              <p className="text-xs text-slate-400">Updates from your courses and activity will appear here.</p>
            </div>
          ) : (
            notificationItems.map((notification) => {
              const Icon = iconMap[notification.type] || Bell;
              return (
                <DropdownMenuItem
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-5 py-4 cursor-pointer border-b border-[#0d694f]/5 last:border-b-0 focus:bg-[#fcf8f1] ${
                    notification.read ? "bg-white" : "bg-[#0d694f]/[0.03]"
                  }`}
                >
                  <div className="flex gap-3 items-start w-full">
                    <div className="w-10 h-10 rounded-2xl bg-[#0d694f]/10 text-[#0d694f] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#0d694f] leading-tight">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-[#ff7e5f] mt-1.5 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-2">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        {!loading && notifications.length > 8 && (
          <>
            <DropdownMenuSeparator className="m-0 bg-[#0d694f]/5" />
            <div className="px-5 py-3 text-center text-[11px] text-slate-400 font-medium">
              Showing latest 8 notifications
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

NotificationDropdown.propTypes = {
  userId: PropTypes.string,
  role: PropTypes.oneOf(["student", "instructor"]).isRequired,
};

export default NotificationDropdown;
