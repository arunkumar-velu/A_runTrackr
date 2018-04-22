import Ably from './ably';
import Socket from './socket';
export default {
  init(){
    this.platForm = window.isAbly ? Ably : Socket;
    this.platForm.init();
  },
  getUserChannel(){
    return 'gps:users';
  },
  currentUserChannel(user){
    return 'gps:'+user;
  },
  getPrivateChannel(user){
    return 'priavte:'+user;
  }
};