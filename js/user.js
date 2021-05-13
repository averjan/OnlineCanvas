// eslint-disable-next-line import/extensions
import TOOL from './tool.js';
// eslint-disable-next-line import/extensions
import * as Network from './network.js';

class User {
    static userCanvas;

    static pointer;

    static init() {
      User.userCanvas.clear(this.userCanvas.drawSize);
      User.userCanvas.initialPicture()
      // Network.sendUserJoin()
    }

    static choosePencil() {
      User.userCanvas.drawTool = TOOL.pencil;
    }

    static chooseFill() {
      User.userCanvas.drawTool = TOOL.fill;
    }

    static choosePencilSize(size) {
      // eslint-disable-next-line no-alert
      if (window.confirm('При изменении размерности поля, холст будет очищен')) {
        User.userCanvas.changePencilSize(size);
        Network.sendChangePencilSize(size);
      }
    }

    static callMakeLight(e) {
      const x = e.offsetX;
      const y = e.offsetY;
      User.userCanvas.makeLight(x, y);
    }

    static removeHighLight() {
      User.userCanvas.removeCurrentRect();
    }

    static closeWindowHandler() {
      Network.sendUserDisconnect(Network.socket.userId);
    }

    static mouseCaptureHandler(e) {
      const canvRect = User.userCanvas.canvas.getBoundingClientRect();
      const x = e.pageX - canvRect.left;
      const y = e.pageY - canvRect.top;
      User.pointer = { x, y, id: Network.socket.userId };
      Network.sendMouseMove(x, y);
    }

    static mouseDraw(e) {
      User.userCanvas.draw(
        e.offsetX,
        e.offsetY,
        User.userCanvas.currentColor,
        User.userCanvas.drawTool,
        e,
      );
    }

    static mousedownHandler() {
      if (this.userCanvas.drawTool === TOOL.pencil) {
        User.userCanvas.canvas.removeEventListener('mousemove', this.callMakeLight);
        this.removeHighLight();
        User.userCanvas.canvas.addEventListener('mousemove', this.mouseDraw);
      }
    }
}

// eslint-disable-next-line import/extensions
export default User;
