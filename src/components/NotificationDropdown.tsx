import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: any[];
  onAccept: (notificationId: string) => void;
  onReject: (notificationId: string) => void;
}

export default function NotificationDropdown({ notifications, onAccept, onReject }: NotificationDropdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/10"
    >
      <div className="p-2">
        {notifications.map((notification) => (
          <div key={notification.id} className="p-3 hover:bg-white/5 rounded-lg">
            <p className="text-sm text-white">{notification.content}</p>
            {notification.type === 'CONTACT_REQUEST' && !notification.read && (
              <div className="flex justify-end mt-2 space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onAccept(notification.id)}
                  className="p-1.5 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30"
                >
                  <Check size={14} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReject(notification.id)}
                  className="p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30"
                >
                  <X size={14} />
                </motion.button>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
