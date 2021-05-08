const socket = new WebSocket('ws://localhost:4000');

/*
let sendDraw;
let sendUserJoin;
let sendUserDisconnect;
let sendInfo;
let sendChangePencilSize;
let sendMouseMove;
*/

const sendDraw = (colorMatrix) => {
  socket.send(JSON.stringify({
    type: 'draw',
    matrix: JSON.stringify(colorMatrix),

  }));
};

const sendUserJoin = () => {
  socket.send(JSON.stringify({
    type: 'user-join',
  }));
};

const sendUserDisconnect = () => {
  socket.send(JSON.stringify({
    type: 'user-disconnect',
    id: socket.userId,
  }));
};

const sendInfo = (colorMatrix, pointer) => {
  socket.send(JSON.stringify({
    type: 'info',
    matrix: JSON.stringify(colorMatrix),
    mousePos: JSON.stringify(pointer),
  }));
};

const sendChangePencilSize = (size) => {
  socket.send(JSON.stringify({
    type: 'change-pencil-size',
    size,
  }));
};

const sendMouseMove = (x, y) => {
  socket.send(JSON.stringify({
    type: 'mouse-move',
    id: socket.userId,
    x,
    y,
  }));
};

export {
  sendInfo, sendDraw, sendMouseMove, sendUserDisconnect, sendUserJoin, sendChangePencilSize, socket,
};
