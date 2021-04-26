import { RtcSocketClient } from './RtcSocketClient';

export class RtcClient {
  constructor(url: URL, path?: string, autoReconnect: boolean = true) {
    this.peers = {};
    this.socketClient = new RtcSocketClient(url, path, autoReconnect);
    this.socketClient.onOffer = this.onSocketOffer.bind(this);
    // this.socketClient.onAnswer = this.onSocketAnswer.bind(this);
    this.socketClient.onClose = this.onSocketClose.bind(this);
    // this.socketClient.onError = this.onSocketError.bind(this);
    // this.socketClient.onIceCandidate = this.onSocketIceCandidate.bind(this);
    // this.socketClient.onMessage = this.onSocketMessage.bind(this);
    this.socketClient.onOpen = this.onSocketOpen.bind(this);
  }

  private peers: { [peerId: string]: RTCPeerConnection };
  private socketClient: RtcSocketClient;

  public onStreamConnect: ((ev: RTCTrackEvent) => Promise<any>) | null;
  public onSignallingServerConnected: (() => any) | null;
  public onDisconnect: (() => any) | null;
  public onDisconnectPeer: ((ev) => any) | null;
  public onMessage: ((ev) => any) | null;

  public createStreamerPeer(id) {
    this.peers[id] = this.createPeer(id);
  }

  private async onSocketOpen(socket: WebSocket, ev: Event) {
    if (this.onSignallingServerConnected) {
      this.onSignallingServerConnected();
    }
  }

  private disposePeer() {
    if (this.peers) {
      Object.keys(this.peers).forEach((peerId) => {
        const peer = this.peers[peerId];
        if (peer.connectionState == 'connected' || peer.connectionState == 'connecting') peer.close();
        delete this.peers[peerId];
      });
    }
  }

  private onSocketClose(socket: WebSocket, ev: CloseEvent) {
    this.disposePeer();
    if (this.onDisconnect) {
      this.onDisconnect();
    }
  }

  private createPeer(id) {
    const rtcOptions: any = {
      offerExtmapAllowMixed: false,
    };

    const peer = new RTCPeerConnection(rtcOptions);

    peer.ontrack = async (ev) => {
      if (this.onStreamConnect) {
        await this.onStreamConnect(ev);
      }
    };

    peer.onicecandidate = (ev) => {
      if (ev.candidate && ev.candidate.candidate) {
        this.socketClient.sendMessage(
          JSON.stringify({
            streamerId: id,
            data: { type: 'iceCandidate', candidate: ev.candidate },
          })
        );
      }
    };

    peer.onconnectionstatechange = (ev) => {
      if (this.onDisconnectPeer) {
        this.onDisconnectPeer(ev);
      }
    };
    peer.onsignalingstatechange = (ev) => {
      if (this.onDisconnectPeer) {
        this.onDisconnectPeer(ev);
      }
    };
    return peer;
  }

  public connectToSignalling() {
    this.socketClient.connect();
  }

  public disconnect() {
    this.socketClient.disconnect();
    this.disposePeer();
  }

  public addTrack(peerId, track, stream) {
    this.peers[peerId].addTrack(track, stream);
  }

  public async sendOffer(streamerId) {
    this.peers[streamerId] = this.createPeer(streamerId);
    await this.createOffer(streamerId);
  }

  private async createOffer(streamerId) {
    const offer = await this.peers[streamerId].createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: true,
    });

    await this.peers[streamerId].setLocalDescription(offer);
    this.socketClient.sendMessage(JSON.stringify({ streamerId: streamerId, data: offer }));
  }

  private async onSocketOffer(msg: any) {
    const offer = new RTCSessionDescription(msg.data);
    await this.peers[msg.streamerId].setRemoteDescription(offer);
    // await this.createAnswer(msg);
  }

  // public sendSocketMessage(msg) {
  //   this.socketClient.sendMessage(msg);
  // }

  // public async sendOffer() {
  //   await this.createOffer();
  // }

  // private async createAnswer(msg) {
  //   const answer = await this.peer.createAnswer();

  //   await this.peer.setLocalDescription(answer);
  //   this.socketClient.sendMessage(JSON.stringify({ playerId: msg.playerId, data: answer }));
  // }

  // private async onSocketAnswer(msg: any) {
  //   const answerDesc = new RTCSessionDescription(msg.data);
  //   await this.peer.setRemoteDescription(answerDesc);
  // }

  // private async onSocketOffer(msg: any) {
  //   const offer = new RTCSessionDescription(msg.data);
  //   await this.peer.setRemoteDescription(offer);
  //   await this.createAnswer(msg);
  // }

  // private onSocketError(socket: WebSocket, ev: Event) {
  //   console.error('RtcClient : onSocketError : ', ev);
  //   return true;
  // }

  // private async onSocketIceCandidate(msg: any) {
  //   let candidate = new RTCIceCandidate(msg);
  //   await this.peer.addIceCandidate(candidate);
  // }

  // private onSocketMessage(msg: any) {
  //   if (this.onMessage) {
  //     this.onMessage(msg);
  //   }
  // }
}
