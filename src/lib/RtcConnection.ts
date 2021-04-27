import { RtcClient } from './RtcClient';

export class RtcConnection {
  constructor(private serverUrl: string) {}

  private socket: WebSocket;
  private socketId: string;
  private stream: MediaStream;
  private peers: { [peerId: string]: RtcClient } = {};
  public onReceiveStream: (clientId: string, stream: MediaStream) => void;

  public onMessage: (message: any) => void;

  public getClientId() {
    return this.socketId;
  }

  public async connectServer() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.serverUrl);

      this.socket.addEventListener('close', this.disconnectServer.bind(this));
      this.socket.addEventListener('error', this.disconnectServer.bind(this));

      this.socket.addEventListener(
        'message',
        async (ev) =>
          await this.onSocketMessage(
            ev,
            () => resolve(null),
            (err) => reject(err)
          )
      );
    });
  }

  private async onSocketMessage(ev: MessageEvent, succCallback?, errCallback?) {
    try {
      const data = JSON.parse(ev.data);
      switch (data.type) {
        case 'connection':
          this.socketId = data.clientId;
          if (succCallback) {
            succCallback(null);
          }
          break;
        case 'rtc':
          await this.onRtcEvent(data);
          break;
        default:
          if (this.onMessage) {
            this.onMessage(data);
          }
          break;
      }
    } catch (err) {
      console.error(err);
      if (errCallback) {
        errCallback(err);
      }
    }
  }

  private async onRtcEvent(data) {
    switch (data.data.type) {
      case 'iceCandidate':
        const peerIce = this.peers[data.from];
        if (peerIce) {
          peerIce.addCandidate(data.data.candidate);
        }
        break;
      case 'offer':
        const newPeer = this.createPeer(data.from);
        newPeer.addStream(this.stream);
        const answer = await newPeer.createAnswer(data.data);
        this.socket.send(JSON.stringify({ to: data.from, from: this.socketId, type: 'rtc', data: answer }));
        break;
      case 'answer':
        const peerAnswer = this.peers[data.from];
        if (peerAnswer) {
          await peerAnswer.setAnswer(data.data);
        }
        break;
      default:
        break;
    }
  }

  public disconnectServer() {
    if (this.socket && this.socket.readyState === this.socket.OPEN) {
      this.socket.close();
    }
    this.socketId = '';
    this.peers = {};
  }

  public addMediaStream(strm: MediaStream) {
    this.stream = strm;
  }

  private createPeer(peerId: string) {
    const peer = new RtcClient();

    peer.onCandidate = (ice: RTCIceCandidate) => {
      this.socket.send(JSON.stringify({ to: peerId, from: this.socketId, type: 'rtc', data: { type: 'iceCandidate', candidate: ice } }));
    };

    peer.onReceiveStream = (stream: MediaStream) => {
      if (this.onReceiveStream) {
        this.onReceiveStream(peerId, stream);
      }
    };
    this.peers[peerId] = peer;
    return peer;
  }

  public async connectToPeer(peerId: string) {
    this.createPeer(peerId);
    const peer = this.peers[peerId];
    const offer = await peer.connectPeer();
    this.socket.send(JSON.stringify({ to: peerId, from: this.socketId, type: 'rtc', data: offer }));
  }
}
