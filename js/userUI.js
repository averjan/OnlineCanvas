// const { drawTool, TOOL, currentColor, canvasSize, drawSize } = require('constants.js')
let canvas = document.querySelector('#user-canvas')
let ctx = canvas.getContext('2d')
let pencilButton = document.querySelector('#pencil-btn')
let fillButton = document.querySelector('#fill-btn')
let colorButton = document.querySelector('#color-btn')
let colorInput = document.querySelector('#color-input')
let size4Button = document.querySelector('#size-4')
let size16Button = document.querySelector('#size-16')
let size32Button = document.querySelector('#size-32')
let mainPanel = document.querySelector('#main')
let colorMatrix = []

function rebuildMatrix(size, color) {
    //colorMatrix = Array(size).fill(Array(size).fill(color))
    colorMatrix = Array(size).fill(null).map(() => Array(size).fill(color));
    refresh(color, size)
}

function refresh(color, size) {
    const realSize = canvasSize / size
    colorMatrix.forEach((v, y) => v.forEach((val, x) => drawPixel(x, y, realSize, val)))
}

function clear(size) {
    rebuildMatrix(size, '#ffffff')
}

function disableTools() {
    for (let el of document.querySelector('#tool-control').getElementsByClassName('tool-btn')) {
        el.classList.remove('tool-btn-chosen')
    }
}

function disableSizes() {
    for (let el of document.querySelector('#tool-resize').getElementsByClassName('tool-btn')) {
        el.classList.remove('tool-btn-chosen')
    }
}

pencilButton.addEventListener('click', () => {
    disableTools()
    pencilButton.classList.add('tool-btn-chosen')
})

fillButton.addEventListener('click', () => {
    disableTools()
    fillButton.classList.add('tool-btn-chosen')
})

function loadForm() {
    /*
    for (let el of document.querySelector('#tool-resize').getElementsByClassName('tool-btn')) {
        el.addEventListener('click', () => {

            disableSizes()
            el.classList.add('tool-btn-chosen')
        })
    }
    */
    pencilButton.click()
    size4Button.classList.add('tool-btn-chosen')
    document.querySelector('#color-ico').style.backgroundColor = currentColor
    clear(drawSize)
}

canvas.addEventListener('click', (e) => mouseDraw(e))
canvas.addEventListener('mousedown', (e) => {
    if (drawTool === TOOL.pencil) {
        canvas.addEventListener('mousemove', mouseDraw)
    }
})

mainPanel.addEventListener('mouseup', () => canvas.removeEventListener('mousemove', mouseDraw))

pencilButton.addEventListener('click', choosePencil)
fillButton.addEventListener('click', chooseFill)
size4Button.addEventListener('click', (e) => choosePencilSize(size4Button, 4))
size16Button.addEventListener('click', (e) => choosePencilSize(size16Button, 16))
size32Button.addEventListener('click', (e) => choosePencilSize(size32Button, 32))
colorButton.addEventListener('click', changeColor)

function choosePencil(e) {
    drawTool = TOOL.pencil
}

function chooseFill(e) {
    drawTool = TOOL.fill
}

function choosePencilSize(e, size) {
    if (confirm("При изменении размерности поля, холст будет очищен")) {
        disableSizes()
        e.classList.add('tool-btn-chosen')
        drawSize = size
        clear(size)
    }
}

function changeColor() {
    colorInput.click()
}

colorInput.addEventListener('change', (e) => {
    document.querySelector('#color-ico').style.backgroundColor = colorInput.value
    currentColor = colorInput.value
})

function mouseDraw(e) {
    draw(e.offsetX, e.offsetY, currentColor, drawTool)
}

function draw(x, y, color, tool) {
    let pxSize = canvasSize / drawSize
    let matrixX = Math.floor(x / pxSize)
    let matrixY = Math.floor(y / pxSize)
    let pxOffsetX = matrixX * pxSize
    let pxOffsetY = matrixY * pxSize
    if (tool === TOOL.pencil) {
        drawPixel(matrixX, matrixY, pxSize, color)
    }
    else if (tool === TOOL.fill) {
        fill(matrixX, matrixY, pxSize, colorMatrix[matrixX][matrixY], color)
    }
}

function drawPixel(x, y, pxSize, color) {
    colorMatrix[x][y] = color
    let pxOffsetX = x * pxSize
    let pxOffsetY = y * pxSize
    ctx.fillStyle = color
    ctx.fillRect(pxOffsetX, pxOffsetY, pxSize, pxSize)
}

function fill(x, y, size, oldColor, fillColor) {
    const maxPixel = colorMatrix.length
    console.log(x + " " + y + " " + maxPixel)
    if ((x < 0) || (x >= maxPixel) || (y < 0) || (y >= maxPixel)) {
        return;
    }

    console.log("ready" + x + " " + y + " " + colorMatrix[x][y])
    if (colorMatrix[x][y] === oldColor) {
        console.log("draw" + x + " " + y + " " + maxPixel)
        drawPixel(x, y, size, fillColor)
        fill(x - 1, y, size, oldColor, fillColor)
        fill(x + 1, y, size, oldColor, fillColor)
        fill(x, y - 1, size, oldColor, fillColor)
        fill(x, y + 1, size, oldColor, fillColor)
    }
}
