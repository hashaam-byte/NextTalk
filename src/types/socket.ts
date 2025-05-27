export interface CallEvents {
  'call:start': {
    callId: string;
    type: 'audio' | 'video';
    recipientId: string;
    offer: RTCSessionDescriptionInit;
  };
  'call:received': {
    callId: string;
    type: 'audio' | 'video';
    caller: {
      id: string;
      name: string;
      image?: string;
    };
    offer: RTCSessionDescriptionInit;
  };
  'call:answer': {
    callId: string;
    answer: RTCSessionDescriptionInit;
  };
  'call:ice-candidate': {
    callId: string;
    candidate: RTCIceCandidate;
  };
  'call:end': {
    callId: string;
  };
}
