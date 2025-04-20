import { RxStompConfig } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';

export const myRxStompConfig: RxStompConfig = {
  // Which server?
  brokerURL: 'http://localhost:19090/websoc',

  // Headers
  // Typical keys: login, passcode, host
  // connectHeaders: {
  //   login: 'guest',
  //   passcode: 'guest',
  // },
  webSocketFactory: () => {
    return new SockJS('http://localhost:19090/websoc');
  },

  heartbeatIncoming: 20000, // Typical value 0 - disabled
  heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds

  reconnectDelay: 1000,

  debug: (msg: string): void => {
    console.log(new Date().toISOString(), msg);
  },
};