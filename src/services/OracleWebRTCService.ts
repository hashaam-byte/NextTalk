class OracleWebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(private socket: any) {
    const iceServers = JSON.parse(process.env.NEXT_PUBLIC_ICE_SERVERS || '[]');
    
    this.peerConnection = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceTransportPolicy: 'all'
    });

    this.setupPeerConnectionHandlers();
  }

  private setupPeerConnectionHandlers() {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };

    this.peerConnection.onconnectionstatechange = () => {
      // Handle connection state changes
      console.log('Connection state:', this.peerConnection?.connectionState);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      // Handle ICE connection state changes
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
    };
  }

  // ... rest of the WebRTC service implementation
}

export default OracleWebRTCService;
