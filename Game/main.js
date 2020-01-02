const pixiapp = new PIXI.Application();
var socket = io('localhost:3000');

document.body.appendChild(pixiapp.view);
pixiapp.renderer.backgroundColor = 0x26272b;

let head;
let body = [];

let wKey = keyboard("w");
let aKey = keyboard("a");
let sKey = keyboard("s");
let dKey = keyboard("d");

let moveDirection = 0;

let framesCount = 0;

PIXI.Ticker.shared.add(this.UpdateGame);

function InitializeGame(){

    head = new PIXI.Graphics();
    head.lineStyle(4,0xFFFFFF,2);
    head.x = 32;
    head.y = 32;
    head.lineTo(32,0);
    pixiapp.stage.addChild(head);

    for (let index = 0; index < 5; index++) {
        let line = new PIXI.Graphics();
        line.lineStyle(4,0xFFFFFF, 2); 
        line.lineTo(32,0);
        pixiapp.stage.addChild(line);
        body.push(line);
    }

}
InitializeGame();


function UpdateGame(deltaTime){
    CheckMoveDirection();
    CheckMove();
}

function CheckMove(){
    framesCount++;
    if(framesCount >= 30)
    {
        Move();
        framesCount = 0;
    }
}
function Move(){

    let lastMoveDirection = moveDirection;
    var lastheadpos = [head.x, head.y];
 
    moveHead(head, moveDirection);
    moveBody(lastheadpos, lastMoveDirection);

    socket.emit('move msg', lastheadpos);
}
function moveBody(lastheadpos, lastMoveDirection) {
    const lastBody = body.pop();
    lastBody.clear();
    lastBody.lineStyle(4, 0xFFFFFF, 2);
    lastBody.x = lastheadpos[0];
    lastBody.y = lastheadpos[1];
    switch (lastMoveDirection) {
        case 0:
            lastBody.lineTo(0, -32);
            break;
        case 1:
            lastBody.lineTo(-32, 0);
            break;
        case 2:
            lastBody.lineTo(0, 32);
            break;
        case 3:
            lastBody.lineTo(32, 0);
            break;
    }
    body.unshift(lastBody);
}

function moveHead(obj, movedir) {
    obj.clear();
    obj.lineStyle(4, 0xFFFFFF, 2);
    switch (movedir) {
        case 0:
            obj.y -= 32;
            obj.lineTo(0, 32);
            break;
        case 1:
            obj.x -= 32;
            obj.lineTo(32, 0);
            break;
        case 2:
            obj.y += 32;
            obj.lineTo(0, -32);
            break;
        case 3:
            obj.x += 32;
            obj.lineTo(-32, 0);
            break;
    }
    if(obj.x < 0){
        obj.x = pixiapp.renderer.width;
    }
    if(obj.x > pixiapp.renderer.width){
        obj.x = 0;
    }
    if(obj.y < 0){
        obj.y = pixiapp.renderer.height;
    }
    if(obj.y > pixiapp.renderer.height){
        obj.y = 0;
    }
}

function CheckMoveDirection() {
    if (wKey.isDown) {
        moveDirection = 0;
    }
    else if (aKey.isDown) {
        moveDirection = 1;
    }
    else if (sKey.isDown) {
        moveDirection = 2;
    }
    else if (dKey.isDown) {
        moveDirection = 3;
    }
}

function keyboard(value){

    let key = {};
    key.value = value;
    key.isUp = true;
    key.isDown = false;
    key.pressed = undefined;
    key.released = undefined;

    key.downHandler = event => {
        if (event.key === value){
            if(key.isUp && key.pressed) key.pressed();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    }
    key.upHandler = event => {
        if(event.key === value){
            if(key.isDown && key.released) key.released();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    }
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);

    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    }

    return key;

}