
import { myRxStompConfig } from '../../rx-stomp.config';
import { WebsocketService } from './websocket.service';

export function rxStompClientFactory() {
  const rxStomp = new WebsocketService();
  rxStomp.configure(myRxStompConfig);
  rxStomp.activate();
  return rxStomp;
}
