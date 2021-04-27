export class RtcClient {
  constructor() {
    this.preparePeer();
  }

  private peer: RTCPeerConnection;
  public onCandidate: (ice: RTCIceCandidate) => void;
  public onReceiveStream: (stream: MediaStream) => void;

  private rtcOptions: RTCConfiguration | any = {
    offerExtmapAllowMixed: false,
  };

  private offerOptions: RTCOfferOptions = {
    offerToReceiveAudio: false,
    offerToReceiveVideo: true,
  };

  private preparePeer() {
    this.peer = new RTCPeerConnection(this.rtcOptions);
    this.peer.addEventListener('icecandidate', this.onIceCandidate.bind(this));
  }

  private onIceCandidate(ev: RTCPeerConnectionIceEvent) {
    if (ev.candidate && ev.candidate.candidate && this.onCandidate) {
      this.onCandidate(ev.candidate);
    }
  }

  public async connectPeer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peer.createOffer(this.offerOptions);
    this.peer.ontrack = (ev: RTCTrackEvent) => {
      if (this.onReceiveStream) {
        this.onReceiveStream(ev.streams[0]);
      }
    };
    await this.peer.setLocalDescription(offer);
    return offer;
  }

  public async addCandidate(ice) {
    let candidate = new RTCIceCandidate(ice);
    await this.peer.addIceCandidate(candidate);
  }

  public addStream(strm: MediaStream) {
    const videoTracks = strm.getVideoTracks();
    videoTracks.forEach((trck) => this.peer.addTrack(trck, strm));
  }

  public async createAnswer(data): Promise<RTCSessionDescriptionInit> {
    const answerDesc = new RTCSessionDescription(data);
    await this.peer.setRemoteDescription(answerDesc);
    const answer = await this.peer.createAnswer(this.offerOptions);
    await this.peer.setLocalDescription(answer);
    return answer;
  }

  public async setAnswer(data) {
    const answerDesc = new RTCSessionDescription(data);
    await this.peer.setRemoteDescription(answerDesc);
  }
}
