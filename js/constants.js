//const { TOOL } = require('global.js')
let drawTool = TOOL.pencil
let drawSize = 4
let canvasSize = 512
let currentColor = '#000000'
let user
let socket = new WebSocket('ws://localhost:4000')

/*
module.exports = {
    drawTool: drawTool,
    drawSize: drawSize,
    canvasSize: canvasSize,
    currentColor: currentColor,
    user: user,
    TOOL: TOOL
}
*/
