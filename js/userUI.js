const TOOL = {
  pencil: 0,
  fill: 1,
};

let drawTool = TOOL.pencil;
let drawSize = 4;
const canvasSize = 512;
let currentColor = '#000000';
const socket = new WebSocket('ws://localhost:4000');

let currentRect;
const canvas = document.querySelector('#user-canvas');
const ctx = canvas.getContext('2d');
const pencilButton = document.querySelector('#pencil-btn');
const fillButton = document.querySelector('#fill-btn');
const colorButton = document.querySelector('#color-btn');
const colorInput = document.querySelector('#color-input');
const size4Button = document.querySelector('#size-4');
const size16Button = document.querySelector('#size-16');
const size32Button = document.querySelector('#size-32');
const mainPanel = document.querySelector('#main');
const drawPanel = document.querySelector('#draw-panel');
let colorMatrix = [];

function drawPixel(x, y, pxSize, color) {
  colorMatrix[x][y] = color;
  const pxOffsetX = x * pxSize;
  const pxOffsetY = y * pxSize;
  ctx.fillStyle = color;
  ctx.globalAlpha = 1;
  ctx.fillRect(pxOffsetX, pxOffsetY, pxSize, pxSize);
}

function fill(x, y, size, oldColor, fillColor) {
  if (oldColor === fillColor) {
    return;
  }

  const maxPixel = colorMatrix.length;
  if ((x < 0) || (x >= maxPixel) || (y < 0) || (y >= maxPixel)) {
    return;
  }

  if (colorMatrix[x][y] === oldColor) {
    drawPixel(x, y, size, fillColor);
    fill(x - 1, y, size, oldColor, fillColor);
    fill(x + 1, y, size, oldColor, fillColor);
    fill(x, y - 1, size, oldColor, fillColor);
    fill(x, y + 1, size, oldColor, fillColor);
  }
}

function refresh(color, size) {
  const realSize = canvasSize / size;
  colorMatrix.forEach((v, x) => v.forEach((val, y) => drawPixel(x, y, realSize, val)));
}

function makeTransparentRect(x, y, pxSize) {
  const pxOffsetX = x * pxSize;
  const pxOffsetY = y * pxSize;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.2;
  ctx.fillRect(pxOffsetX, pxOffsetY, pxSize, pxSize);
}

function makeLight(x, y) {
  const pxSize = canvasSize / drawSize;
  const matrixX = Math.floor(x / pxSize);
  const matrixY = Math.floor(y / pxSize);
  if (!currentRect || currentRect.x !== matrixX || currentRect.y !== matrixY) {
    currentRect = { x: matrixX, y: matrixY };
    refresh(currentColor, drawSize);
    makeTransparentRect(matrixX, matrixY, pxSize);
  }
}

function callMakeLight(e) {
  const x = e.offsetX;
  const y = e.offsetY;
  makeLight(x, y);
}

function removeCurrentRect() {
  currentRect = false;
  refresh(currentColor, drawSize);
}

function draw(x, y, color, tool, e) {
  const pxSize = canvasSize / drawSize;
  const matrixX = Math.floor(x / pxSize);
  const matrixY = Math.floor(y / pxSize);
  if (tool === TOOL.pencil) {
    drawPixel(matrixX, matrixY, pxSize, color);
    // canvas.dispatchEvent(new Event('mousemove'))
    socket.send(JSON.stringify({
      type: 'draw',
      matrix: JSON.stringify(colorMatrix),
    }));
  } else if (tool === TOOL.fill) {
    fill(matrixX, matrixY, pxSize, colorMatrix[matrixX][matrixY], color);
    socket.send(JSON.stringify({
      type: 'draw',
      matrix: JSON.stringify(colorMatrix),
    }));
  } else {
    return;
  }

  callMakeLight(e);
}

function rebuildMatrix(size, color) {
  colorMatrix = [];
  for (let i = 0; i < size; i += 1) {
    colorMatrix.push(new Array(size).fill(color));
  }

  refresh(color, size);
}

function clear(size) {
  rebuildMatrix(size, '#FFFFFF');
}

function disableTools() {
  const toolButtons = Array.from(document.querySelector('#tool-control')
    .getElementsByClassName('tool-btn'));
  toolButtons.forEach((v) => {
    v.classList.remove('tool-btn-chosen');
  });
}

function disableSizes() {
  const sizeButtons = Array.from(document.querySelector('#tool-resize')
    .getElementsByClassName('tool-btn'));
  sizeButtons.forEach((v) => {
    v.classList.remove('tool-btn-chosen');
  });
}

window.addEventListener('unload', () => {
  socket.send(JSON.stringify({
    type: 'user-disconnect',
    id: socket.userId,
  }));
});

drawPanel.addEventListener('mousemove', (e) => {
  const canvRect = canvas.getBoundingClientRect();
  socket.send(JSON.stringify({
    type: 'mouse-move',
    id: socket.userId,
    x: e.pageX - canvRect.left,
    y: e.pageY - canvRect.top,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  }));
});

pencilButton.addEventListener('click', () => {
  disableTools();
  pencilButton.classList.add('tool-btn-chosen');
});

fillButton.addEventListener('click', () => {
  disableTools();
  fillButton.classList.add('tool-btn-chosen');
});

function loadForm() {
  pencilButton.click();
  size4Button.classList.add('tool-btn-chosen');
  document.querySelector('#color-ico').style.backgroundColor = currentColor;
  clear(drawSize);
  socket.send(JSON.stringify({
    type: 'user-join',
  }));
}

function mouseDraw(e) {
  draw(e.offsetX, e.offsetY, currentColor, drawTool, e);
}

document.querySelector('body').addEventListener('onload', loadForm);
canvas.addEventListener('mouseleave', removeCurrentRect);
canvas.addEventListener('mousemove', callMakeLight);
canvas.addEventListener('click', (e) => mouseDraw(e));
canvas.addEventListener('mousedown', (e) => {
  if (drawTool === TOOL.pencil) {
    canvas.removeEventListener('mousemove', callMakeLight);
    removeCurrentRect(e);
    canvas.addEventListener('mousemove', mouseDraw);
  }
});

function choosePencil() {
  drawTool = TOOL.pencil;
}

function chooseFill() {
  drawTool = TOOL.fill;
}

function changePencilSize(e, size) {
  disableSizes();
  e.classList.add('tool-btn-chosen');
  drawSize = size;
  clear(size);
}

function choosePencilSize(e, size) {
  // eslint-disable-next-line no-alert
  if (window.confirm('При изменении размерности поля, холст будет очищен')) {
    changePencilSize(e, size);
    socket.send(JSON.stringify({
      type: 'change-pencil-size',
      size,
    }));
  }
}

function changeColor() {
  colorInput.click();
}

colorInput.addEventListener('change', () => {
  document.querySelector('#color-ico').style.backgroundColor = colorInput.value;
  currentColor = colorInput.value;
});

document.addEventListener('keypress', (e) => {
  if (e.code === 'KeyB') {
    fillButton.click();
  } else if (e.code === 'KeyP') {
    pencilButton.click();
  } else if (e.code === 'KeyC') {
    colorButton.click();
  }
});

function createMousePointer(x, y, id) {
  const m = document.createElement('img');
  m.style.position = 'absolute';
  m.style.zIndex = '2';
  m.style.width = '20px';
  m.style.height = '20px';
  m.setAttribute('src', '/img/pointer/pointer.svg');
  m.setAttribute('id', id);
  mainPanel.appendChild(m);
  return m;
}

function setUserMousePosition(x, y, scrWidth, scrHeight, id) {
  let m = document.getElementById(id);
  if (!m) {
    m = createMousePointer(x, y, id);
  }

  const canvRect = canvas.getBoundingClientRect();
  // let realX = Math.round(x / scrWidth * window.innerWidth)
  // let realY = Math.round(y / scrHeight * window.innerHeight)
  m.style.top = `${canvRect.top + y}px`;
  m.style.left = `${canvRect.left + x}px`;
}

function deleteUserMousePointer(id) {
  const e = document.getElementById(id);
  e.remove();
}

mainPanel.addEventListener('mouseup', (e) => {
  canvas.removeEventListener('mousemove', mouseDraw);
  canvas.addEventListener('mousemove', callMakeLight);
  removeCurrentRect(e);
});

pencilButton.addEventListener('click', choosePencil);
fillButton.addEventListener('click', chooseFill);
size4Button.addEventListener('click', () => choosePencilSize(size4Button, 4));
size16Button.addEventListener('click', () => choosePencilSize(size16Button, 16));
size32Button.addEventListener('click', () => choosePencilSize(size32Button, 32));
colorButton.addEventListener('click', changeColor);

socket.onmessage = ((e) => {
  const data = JSON.parse(e.data);
  switch (data.type) {
    case 'draw': {
      colorMatrix = JSON.parse(data.matrix);
      refresh(currentColor, drawSize);
      break;
    }
    case 'mouse-move': {
      setUserMousePosition(data.x, data.y, data.screenWidth, data.screenHeight, data.id);
      break;
    }
    case 'change-pencil-size': {
      changePencilSize(document.getElementById(`size-${data.size}`), data.size);
      break;
    }
    case 'set-id': {
      socket.userId = data.id;
      break;
    }
    case 'user-join': {
      socket.send(JSON.stringify({
        type: 'info',
        matrix: JSON.stringify(colorMatrix),
        mousePos: null,
      }));
      break;
    }
    case 'info': {
      const newMatrix = JSON.parse(data.matrix);
      const newPxSize = newMatrix.length;
      changePencilSize(document.getElementById(`size-${newPxSize}`), newPxSize);
      colorMatrix = newMatrix;
      refresh(currentColor, drawSize);
      break;
    }
    case 'user-disconnect': {
      deleteUserMousePointer(data.id);
      break;
    }
    default: {
      // eslint-disable-next-line no-empty
    }
  }
});
