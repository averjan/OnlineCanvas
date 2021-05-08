// eslint-disable-next-line import/extensions
import * as Network from './network.js';
// eslint-disable-next-line import/extensions
import User from './user.js';
// eslint-disable-next-line import/extensions
import * as userUI from './userUI.js';
// eslint-disable-next-line import/extensions
import { mousePointer } from "./mousePosition.js";

Network.socket.onopen = () => {
  ServerUI(Network.socket);
  Network.sendUserJoin();
};

function ServerUI(socket) {
  // eslint-disable-next-line no-param-reassign
  socket.onmessage = ((e) => {
    const data = JSON.parse(e.data);
    switch (data.type) {
      case 'draw': {
        User.userCanvas.drawNewMatrix(JSON.parse(data.matrix));
        break;
      }
      case 'mouse-move': {
        mousePointer.setUserMousePosition(data.x, data.y, data.id);
        break;
      }
      case 'change-pencil-size': {
        userUI.highLightSizeButton(data.size);
        User.userCanvas.changePencilSize(data.size);
        break;
      }
      case 'set-id': {
        Network.socket.userId = data.id;
        break;
      }
      case 'user-join': {
        Network.sendInfo(User.userCanvas.colorMatrix, User.pointer);
        break;
      }
      case 'info': {
        const newMatrix = JSON.parse(data.matrix);
        const newPxSize = newMatrix.length;
        userUI.highLightSizeButton(newPxSize);
        User.userCanvas.changePencilSize(newPxSize);
        User.userCanvas.drawNewMatrix(newMatrix);
        const usersPointer = JSON.parse(data.mousePos);
        mousePointer.setUserMousePosition(
          usersPointer.x,
          usersPointer.y,
          usersPointer.id,
        );
        break;
      }
      case 'user-disconnect': {
        mousePointer.deleteUserMousePointer(data.id);
        break;
      }
      default: {
        // eslint-disable-next-line no-empty
      }
    }
  });
}

export default ServerUI;
