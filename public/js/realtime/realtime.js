import Ably from './ably';
import Socket from './socket';
export default {
  init(){
    this.platForm = window.isAbly ? Ably : Socket;
    this.platForm.init();
  }
};