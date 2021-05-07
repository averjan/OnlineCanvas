// const { drawTool, TOOL, currentColor, canvasSize, drawSize } = require('constants.js')
let canvas = document.querySelector('#user-canvas')
let ctx = canvas.getContext('2d')
let pencilButton = document.querySelector('#pencil-btn')
let fillButton = document.querySelector('#fill-btn')
let colorButton = document.querySelector('#color-btn')
let size4Button = document.querySelector('#size-4')
let size16Button = document.querySelector('#size-16')
let size32Button = document.querySelector('#size-32')
let mainPanel = document.querySelector('#main')

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
    for (let el of document.querySelector('#tool-resize').getElementsByClassName('tool-btn')) {
        el.addEventListener('click', () => {
            disableSizes()
            el.classList.add('tool-btn-chosen')
        })
    }
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
size4Button.addEventListener('click', (e) => choosePencilSize(4))
size16Button.addEventListener('click', (e) => choosePencilSize(16))
size32Button.addEventListener('click', (e) => choosePencilSize(32))

function choosePencil(e) {
    drawTool = TOOL.pencil
}

function chooseFill(e) {
    drawTool = TOOL.fill
}

function choosePencilSize(size) {
    drawSize = size
}

function mouseDraw(e) {
    draw(e.offsetX, e.offsetY, currentColor, drawTool)
}

function draw(x, y, color, tool) {
    let pxSize = canvasSize / drawSize
    let pxOffsetX = Math.floor(x / pxSize) * pxSize
    let pxOffsetY = Math.floor(y / pxSize) * pxSize
    if (tool === TOOL.pencil) {
        drawPixel(pxOffsetX, pxOffsetY, pxSize, color)
    }
}

function drawPixel(x, y, size, color) {
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)
}

function fill(x, y, color) {

}
