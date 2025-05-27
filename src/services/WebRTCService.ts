import { getIceServers } from '@/utils/iceConfig';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(private socket: any) {
    this.initialize();
  }

  private async initialize() {
    try {
      // Get ICE servers from XirSys
      const response = await fetch('https://global.xirsys.net/_turn/NextTalkweb', {
        method: 'PUT',
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.NEXT_PUBLIC_XIRSYS_IDENT}:${process.env.NEXT_PUBLIC_XIRSYS_SECRET}`),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format: 'urls' })
      });

      const data = await response.json();
      
      this.peerConnection = new RTCPeerConnection({
        iceServers: data.v.iceServers,
        iceCandidatePoolSize: 10
      });

      this.setupPeerConnectionHandlers();
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      // Fallback to public STUN servers
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
        ]
      });
    }
  }

  private setupPeerConnectionHandlers() {
    // Handle ICE candidates
    this.peerConnection!.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', event.candidate);
      }
    };

    // Handle remote stream
    this.peerConnection!.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };
  }

  async startCall(isVideo: boolean): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo
      });
      
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    await this.peerConnection.setRemoteDescription(answer);
  }

  async handleIceCandidate(candidate: RTCIceCandidate) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    await this.peerConnection.addIceCandidate(candidate);
  }

  endCall() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.peerConnection?.close();
    this.localStream = null;
    this.remoteStream = null;
  }
}

export default WebRTCService;
