// eslint-disable-next-line import/extensions
import User from './user.js';
// eslint-disable-next-line import/extensions
import Canvas from './canvas.js';
// eslint-disable-next-line import/extensions
import ServerUI from './serverUI.js';
// eslint-disable-next-line import/extensions
import { mousePointer } from './mousePosition.js';

const canvas = document.querySelector('#user-canvas');
const pencilButton = document.querySelector('#pencil-btn');
const fillButton = document.querySelector('#fill-btn');
const colorButton = document.querySelector('#color-btn');
const colorInput = document.querySelector('#color-input');
const size4Button = document.querySelector('#size-4');
const size16Button = document.querySelector('#size-16');
const size32Button = document.querySelector('#size-32');
const mainPanel = document.querySelector('#main');
const drawPanel = document.querySelector('#draw-panel');
mousePointer.canvas = canvas;
mousePointer.mainPanel = mainPanel;
User.userCanvas = new Canvas(canvas);

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

function highLightSizeButton(size) {
  disableSizes();
  document.getElementById(`size-${size}`).classList.add('tool-btn-chosen');
}

function loadForm() {
  pencilButton.click();
  size4Button.classList.add('tool-btn-chosen');
  document.querySelector('#color-ico').style.backgroundColor = User.userCanvas.currentColor;
  User.init();
}

function changeColor() {
  colorInput.click();
}

window.onbeforeunload = () => {
  User.closeWindowHandler();
};

window.addEventListener('unload', () => {
  User.closeWindowHandler();
});

drawPanel.addEventListener('mousemove', User.mouseCaptureHandler);

pencilButton.addEventListener('click', () => {
  disableTools();
  pencilButton.classList.add('tool-btn-chosen');
});

fillButton.addEventListener('click', () => {
  disableTools();
  fillButton.classList.add('tool-btn-chosen');
});

mainPanel.addEventListener('mouseup', () => {
  canvas.removeEventListener('mousemove', User.mouseDraw);
  canvas.addEventListener('mousemove', User.callMakeLight);
  User.removeHighLight();
});

colorInput.addEventListener('change', () => {
  document.querySelector('#color-ico').style.backgroundColor = colorInput.value;
  User.userCanvas.currentColor = colorInput.value;
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

window.addEventListener('load', loadForm);
canvas.addEventListener('mouseleave', User.removeHighLight);
canvas.addEventListener('mousemove', User.callMakeLight);
canvas.addEventListener('click', (e) => User.mouseDraw(e));
canvas.addEventListener('mousedown', () => User.mousedownHandler());

pencilButton.addEventListener('click', User.choosePencil);
fillButton.addEventListener('click', User.chooseFill);

const changeSizeHandler = (size) => { highLightSizeButton(size); User.choosePencilSize(size); };
size4Button.addEventListener('click', () => changeSizeHandler(4));
size16Button.addEventListener('click', () => changeSizeHandler(16));
size32Button.addEventListener('click', () => changeSizeHandler(32));
colorButton.addEventListener('click', changeColor);

export {
  highLightSizeButton, canvas,
};
