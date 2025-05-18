export function NotificationItem({ notification }: { notification: any }) {
  const [isResponding, setIsResponding] = useState(false);

  const handleResponse = async (action: 'ACCEPT' | 'DENY') => {
    try {
      setIsResponding(true);
      const response = await fetch('/api/contacts/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: notification.fromUserId,
          action
        })
      });

      if (!response.ok) throw new Error('Failed to respond');
    } catch (error) {
      console.error('Error responding to request:', error);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="p-4 border-b border-white/10">
      <div className="flex items-start">
        {/* ...existing notification content... */}
        
        {notification.type === 'CONTACT_REQUEST' && !notification.read && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleResponse('ACCEPT')}
              disabled={isResponding}
              className="px-3 py-1 bg-green-600 text-white rounded-full text-sm hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={() => handleResponse('DENY')}
              disabled={isResponding}
              className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700"
            >
              Deny
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
