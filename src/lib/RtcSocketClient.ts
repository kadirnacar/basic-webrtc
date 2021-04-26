export class RtcSocketClient {
  constructor(private url: URL, private path?: string, private autoReconnect: boolean = true) {}

  private ws: WebSocket;
  private disconnectCommand: boolean = false;

  public onError: ((socket: WebSocket, ev: Event) => boolean) | null;
  public onClose: ((socket: WebSocket, ev: CloseEvent) => any) | null;
  public onAnswer: ((msg: any) => any) | null;
  public onOffer: ((msg: any) => any) | null;
  public onIceCandidate: ((msg: any) => any) | null;
  public onMessage: ((msg: any) => any) | null;
  public onOpen: ((socket: WebSocket, ev: Event) => any) | null;

  public connect() {
    if (!this.ws) {
      this.disconnectCommand = false;
      this.ws = new WebSocket(`${this.url.protocol == 'https' ? 'wss' : 'ws'}://${this.url.host}/${this.path || ''}`);
      this.setEvents();
    }
  }

  public disconnect() {
    this.disconnectCommand = true;
    try {
      if (this.ws) this.ws.close();
    } catch (err) {
      console.log(err);
    }
    this.ws = undefined;
  }

  public sendMessage(msg: any) {
    if (this.ws && this.ws.readyState == this.ws.OPEN) this.ws.send(msg);
  }

  private reconnect() {
    this.disconnect();
    this.connect();
  }

  private setEvents() {
    this.ws.onopen = (event) => {
      if (this.onOpen) {
        this.onOpen(this.ws, event);
      }
    };

    this.ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      try {
        if (msg.data?.type === 'answer' && this.onAnswer) {
          await this.onAnswer(msg);
        } else if (msg.data?.type === 'offer' && this.onOffer) {
          await this.onOffer(msg);
        } else if (msg.data?.type === 'iceCandidate' && this.onIceCandidate) {
          await this.onIceCandidate(msg.data.candidate);
        } else if (this.onMessage) {
          this.onMessage(msg);
        }
      } catch (err) {
        console.error(err);
      }
    };

    this.ws.onerror = (event) => {
      if (this.onError) {
        if (!this.onError(this.ws, event)) {
          return;
        }
      }
    };

    this.ws.onclose = (event) => {
      if (this.onClose) {
        this.onClose(this.ws, event);
      }
      this.ws = undefined;
      if (this.autoReconnect && !this.disconnectCommand) {
        setTimeout(() => {
          this.reconnect();
        }, 1000);
      }
    };
  }
}
