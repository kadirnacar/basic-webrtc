import { RtcSocketClient } from './RtcSocketClient';

export class RtcClient {
  constructor(url: URL, private streamerId: string, path?: string, autoReconnect: boolean = true) {
    this.socketClient = new RtcSocketClient(url, path, autoReconnect);
    this.socketClient.onAnswer = this.onSocketAnswer.bind(this);
    this.socketClient.onClose = this.onSocketClose.bind(this);
    this.socketClient.onError = this.onSocketError.bind(this);
    this.socketClient.onIceCandidate = this.onSocketIceCandidate.bind(this);
    this.socketClient.onMessage = this.onSocketMessage.bind(this);
    this.socketClient.onOpen = this.onSocketOpen.bind(this);
  }

  private peer: RTCPeerConnection;
  private socketClient: RtcSocketClient;

  public onStreamConnect: ((ev: RTCTrackEvent) => Promise<any>) | null;
  public onSignallingServerConnected: (() => any) | null;
  public onDisconnect: ((streamerId: string) => any) | null;
  public onDisconnectPeer: ((ev) => any) | null;
  public onMessage: ((ev) => any) | null;

  public setStreamerId(id) {
    this.streamerId = id;
  }

  public sendSocketMessage(msg) {
    this.socketClient.sendMessage(msg);
  }

  public connectToSignalling() {
    this.socketClient.connect();
  }

  public addTrack(track, stream) {
    this.peer.addTrack(track, stream);
  }

  public async sendOffer() {
    await this.createOffer();
  }

  public async sendAnswer() {}

  public disconnect() {
    this.socketClient.disconnect();
    this.disposePeer();
  }

  private async createOffer() {
    const offer = await this.peer.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: true,
    });

    await this.peer.setLocalDescription(offer);
    this.socketClient.sendMessage(JSON.stringify({ streamerId: this.streamerId, data: offer }));
  }

  private disposePeer() {
    if (this.peer) {
      if (this.peer.connectionState == 'connected' || this.peer.connectionState == 'connecting') this.peer.close();
      this.peer = undefined;
    }
  }

  private createPeer() {
    this.disposePeer();

    const rtcOptions: any = {
      offerExtmapAllowMixed: false,
    };

    this.peer = new RTCPeerConnection(rtcOptions);

    this.peer.ontrack = async (ev) => {
      if (this.onStreamConnect) {
        await this.onStreamConnect(ev);
      }
    };

    this.peer.onicecandidate = (ev) => {
      if (ev.candidate && ev.candidate.candidate) {
        this.socketClient.sendMessage(
          JSON.stringify({
            streamerId: this.streamerId,
            data: { type: 'iceCandidate', candidate: ev.candidate },
          })
        );
      }
    };

    this.peer.onconnectionstatechange = (ev) => {
      if (this.onDisconnectPeer) {
        this.onDisconnectPeer(ev);
      }
    };
    this.peer.onsignalingstatechange = (ev) => {
      if (this.onDisconnectPeer) {
        this.onDisconnectPeer(ev);
      }
    };
  }

  private async onSocketOpen(socket: WebSocket, ev: Event) {
    this.createPeer();

    if (this.onSignallingServerConnected) {
      this.onSignallingServerConnected();
    }
  }

  private async onSocketAnswer(msg: any) {
    var answerDesc = new RTCSessionDescription(msg);
    await this.peer.setRemoteDescription(answerDesc);
  }

  private onSocketClose(socket: WebSocket, ev: CloseEvent) {
    this.disposePeer();
    if (this.onDisconnect) {
      this.onDisconnect(this.streamerId);
    }
  }

  private onSocketError(socket: WebSocket, ev: Event) {
    console.error('RtcClient : onSocketError : ', ev);
    return true;
  }

  private async onSocketIceCandidate(msg: any) {
    let candidate = new RTCIceCandidate(msg);
    await this.peer.addIceCandidate(candidate);
  }

  private onSocketMessage(msg: any) {
    if (this.onMessage) {
      this.onMessage(msg);
    }
  }
}
