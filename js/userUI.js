// const { drawTool, TOOL, currentColor, canvasSize, drawSize } = require('constants.js')
let currentRectangle = { x: -1, y: -1 }
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

socket.onmessage = ((e) => {
    let data = JSON.parse(e.data)
    switch (data.type) {
        case 'draw' : {
            colorMatrix = JSON.parse(data.matrix)
            refresh(currentColor, drawSize)
            break
        }
        case 'mouse-move' : {
            setUserMousePosition(data.x, data.y, data.screenWidth, data.screenHeight, data.id)
            break;
        }
        case 'change-pencil-size' : {
            changePencilSize(document.getElementById('size-' + data.size), data.size)
            break;
        }
        case 'set-id' : {
            socket.userId = data.id
            break;
        }
        case 'user-join' : {
            socket.send(JSON.stringify({
                type: 'info',
                matrix: JSON.stringify(colorMatrix),
                mousePos: null,
            }))
            break;
        }
        case 'info' : {
            let newMatrix = JSON.parse(data.matrix)
            let newPxSize = newMatrix.length
            changePencilSize(document.getElementById('size-' + newPxSize), newPxSize)
            colorMatrix = newMatrix
            refresh(currentColor, drawSize)
            break;
        }
        case 'user-disconnect' : {
            deleteUserMousePointer(data.id)
            break;
        }
    }
})

function copyMatrix(matrix) {
    colorMatrix = []
    for (let i = 0; i < drawSize; i++) {
        colorMatrix.push(new Array(drawSize))
        for (let j = 0; j < drawSize; j++) {
            colorMatrix[i][j] = matrix[i][j]
        }
    }
}

function rebuildMatrix(size, color) {
    //colorMatrix = Array(size).fill(Array(size).fill(color))
    //colorMatrix = Array(size).fill(null).map(() => Array(size).fill(null).map(() => color));
    colorMatrix = []
    for (let i = 0; i < size; i++) {
        colorMatrix.push(new Array(size).fill(color))
    }

    refresh(color, size)
}

function refresh(color, size) {
    const realSize = canvasSize / size
    colorMatrix.forEach((v, x) => v.forEach((val, y) => drawPixel(x, y, realSize, val)))
}

function clear(size) {
    rebuildMatrix(size, '#FFFFFF')
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

window.addEventListener('unload', (e) => {
    socket.send(JSON.stringify({
        type: 'user-disconnect',
        id: socket.userId,
    }))
})

mainPanel.addEventListener('mousemove', (e) => {
    socket.send(JSON.stringify({
        type: 'mouse-move',
        id: socket.userId,
        x: e.pageX,
        y: e.pageY,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
    }))
})

pencilButton.addEventListener('click', () => {
    disableTools()
    pencilButton.classList.add('tool-btn-chosen')
})

fillButton.addEventListener('click', () => {
    disableTools()
    fillButton.classList.add('tool-btn-chosen')
})

function loadForm() {
    pencilButton.click()
    size4Button.classList.add('tool-btn-chosen')
    document.querySelector('#color-ico').style.backgroundColor = currentColor
    clear(drawSize)
    socket.send(JSON.stringify({
        type: 'user-join'
    }))
}

function makeTransparentRect(x, y, pxSize) {
    let color = colorMatrix[x][y]
    let pxOffsetX = x * pxSize
    let pxOffsetY = y * pxSize
    ctx.fillStyle = color
    ctx.globalAlpha = 0.8
    ctx.fillRect(pxOffsetX, pxOffsetY, pxSize, pxSize)
}

function makeLight(e) {
    const x = e.offsetX
    const y = e.offsetY
    let pxSize = canvasSize / drawSize
    let matrixX = Math.floor(x / pxSize)
    let matrixY = Math.floor(y / pxSize)
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

function changePencilSize(e, size) {
    disableSizes()
    e.classList.add('tool-btn-chosen')
    drawSize = size
    clear(size)
}

function choosePencilSize(e, size) {
    if (confirm("При изменении размерности поля, холст будет очищен")) {
        changePencilSize(e, size)
        socket.send(JSON.stringify({
            type: 'change-pencil-size',
            size: size,
        }))
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
        socket.send(JSON.stringify({
            type: 'draw',
            matrix: JSON.stringify(colorMatrix),
        }))
    }
    else if (tool === TOOL.fill) {
        fill(matrixX, matrixY, pxSize, colorMatrix[matrixX][matrixY], color)
        console.dir(colorMatrix)
        socket.send(JSON.stringify({
            type: 'draw',
            matrix: JSON.stringify(colorMatrix),
        }))
    }
    else {
        return;
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
    if ((x < 0) || (x >= maxPixel) || (y < 0) || (y >= maxPixel)) {
        return;
    }

    if (colorMatrix[x][y] === oldColor) {
        drawPixel(x, y, size, fillColor)
        fill(x - 1, y, size, oldColor, fillColor)
        fill(x + 1, y, size, oldColor, fillColor)
        fill(x, y - 1, size, oldColor, fillColor)
        fill(x, y + 1, size, oldColor, fillColor)
    }
}

document.addEventListener('keypress', (e) => {
    if (e.code === 'KeyB') {
        fillButton.click()
    }
    else if (e.code === 'KeyP') {
        pencilButton.click()
    }
    else if (e.code === 'KeyC') {
        colorButton.click()
    }
})

function createMousePointer(x, y, id) {
    let m = document.createElement('img')
    m.style.position = 'absolute'
    m.style.zIndex = '2'
    m.style.width = '20px'
    m.style.height = '20px'
    m.setAttribute('src', '/img/pointer/pointer.svg')
    m.setAttribute('id', id)
    mainPanel.appendChild(m)
    return m
}

function setUserMousePosition(x, y, scrWidth, scrHeight, id) {
    let m = document.getElementById(id)
    if (!m) {
        m = createMousePointer(x, y, id)
    }

    console.log(scrWidth)
    //let realX = Math.round(x / scrWidth * window.innerWidth)
    //let realY = Math.round(y / scrHeight * window.innerHeight)
    m.style.top = y + 'px'
    m.style.left = x + 'px'
}

function deleteUserMousePointer(id) {
    let e = document.getElementById(id)
    e.remove()
}
