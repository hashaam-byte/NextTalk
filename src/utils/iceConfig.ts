export const getIceServers = async () => {
  try {
    const response = await fetch('https://global.xirsys.net/_turn/NextTalkweb', {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + btoa(`${process.env.NEXT_PUBLIC_XIRSYS_IDENT}:${process.env.NEXT_PUBLIC_XIRSYS_SECRET}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ format: 'urls' })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ICE servers');
    }

    const data = await response.json();
    return data.v.iceServers;
  } catch (error) {
    console.error('Error fetching ICE servers:', error);
    // Fallback to public STUN servers
    return [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302'
        ]
      }
    ];
  }
};
