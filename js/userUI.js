// const { drawTool, TOOL, currentColor, canvasSize, drawSize } = require('constants.js')
let canvas = document.querySelector('#user-canvas')
let ctx = canvas.getContext('2d')
let pencilButton = document.querySelector('#pencil-btn')
let fillButton = document.querySelector('#fill-btn')
let mainPanel = document.querySelector('#main')

canvas.addEventListener('click', (e) => mouseDraw(e))
canvas.addEventListener('mousedown', (e) => {
    if (drawTool === TOOL.pencil) {
        canvas.addEventListener('mousemove', mouseDraw)
    }
})

mainPanel.addEventListener('mouseup', () => canvas.removeEventListener('mousemove', mouseDraw))

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
