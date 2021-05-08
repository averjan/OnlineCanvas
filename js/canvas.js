// eslint-disable-next-line import/extensions
import TOOL from './tool.js';
// eslint-disable-next-line import/extensions
import * as Network from './network.js';

class Canvas {
    colorMatrix = [];

    drawTool = TOOL.pencil;

    drawSize = 4;

    canvasSize = 512;

    currentColor = '#000000';

    ctx;

    canvas;

    currentRect;

    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
    }

    drawPixel(x, y, pxSize, color) {
      this.colorMatrix[x][y] = color;
      const pxOffsetX = x * pxSize;
      const pxOffsetY = y * pxSize;
      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = 1;
      this.ctx.fillRect(pxOffsetX, pxOffsetY, pxSize, pxSize);
    }

    fill(x, y, size, oldColor, fillColor) {
      if (oldColor === fillColor) {
        return;
      }

      const maxPixel = this.colorMatrix.length;
      if ((x < 0) || (x >= maxPixel) || (y < 0) || (y >= maxPixel)) {
        return;
      }

      if ((this.colorMatrix)[x][y] === oldColor) {
        this.drawPixel(x, y, size, fillColor);
        this.fill(x - 1, y, size, oldColor, fillColor);
        this.fill(x + 1, y, size, oldColor, fillColor);
        this.fill(x, y - 1, size, oldColor, fillColor);
        this.fill(x, y + 1, size, oldColor, fillColor);
      }
    }

    draw(x, y, color, tool, e) {
      const pxSize = this.canvasSize / this.drawSize;
      const matrixX = Math.floor(x / pxSize);
      const matrixY = Math.floor(y / pxSize);
      if (tool === TOOL.pencil) {
        this.drawPixel(matrixX, matrixY, pxSize, color);
        // canvas.dispatchEvent(new Event('mousemove'))
        Network.sendDraw(this.colorMatrix);
      } else if (tool === TOOL.fill) {
        this.fill(matrixX, matrixY, pxSize, this.colorMatrix[matrixX][matrixY], color);
        Network.sendDraw(this.colorMatrix);
      } else {
        return;
      }

      this.makeLight(e.offsetX, e.offsetY);
    }

    rebuildMatrix(size, color) {
      this.colorMatrix = [];
      for (let i = 0; i < size; i += 1) {
        this.colorMatrix.push(new Array(size).fill(color));
      }

      this.refresh(color, size);
    }

    clear(size) {
      this.rebuildMatrix(size, '#FFFFFF');
    }

    drawNewMatrix(matrix) {
      this.colorMatrix = matrix;
      this.refresh(this.currentColor, this.drawSize);
    }

    refresh(color, size) {
      const realSize = this.canvasSize / size;
      this.colorMatrix
        .forEach((v, x) => v
          .forEach((val, y) => this.drawPixel(x, y, realSize, val)));
    }

    makeTransparentRect(x, y, pxSize) {
      const pxOffsetX = x * pxSize;
      const pxOffsetY = y * pxSize;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillRect(pxOffsetX, pxOffsetY, pxSize, pxSize);
    }

    makeLight(x, y) {
      const pxSize = this.canvasSize / this.drawSize;
      const matrixX = Math.floor(x / pxSize);
      const matrixY = Math.floor(y / pxSize);
      if (!this.currentRect || this.currentRect.x !== matrixX || this.currentRect.y !== matrixY) {
        this.currentRect = { x: matrixX, y: matrixY };
        this.refresh(this.currentColor, this.drawSize);
        this.makeTransparentRect(matrixX, matrixY, pxSize);
      }
    }

    removeCurrentRect() {
      this.currentRect = false;
      this.refresh(this.currentColor, this.drawSize);
    }

    changePencilSize(size) {
      this.drawSize = size;
      this.clear(size);
    }
}

export default Canvas;
