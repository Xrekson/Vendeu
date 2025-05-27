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
  webSocketFactory() {
      return new SockJS("http://localhost:19090/websoc");
  },

  heartbeatIncoming: 20000, // Typical value 0 - disabled
  heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds

  reconnectDelay: 1000,

  debug: (msg: string): void => {
    console.log(new Date().toISOString(), msg);
  },
  // beforeConnect(client) : Promise<void> {
  //   return new Promise<void>((resolve, reject) => {
  //     const sessionData = localStorage.getItem("session@store");
  //     if(sessionData){
  //       const token = JSON.parse(sessionData).token;
  //       console.log("Tokeeeeeeeeeeeeeeeeeeeeeeeeeeen:",token);
  //       client.configure({ connectHeaders : {
  //         Authorization: 'Bearer ' + token
  //       } })
  //       resolve();
  //     }
  //     reject();
  //   });
  // },
};