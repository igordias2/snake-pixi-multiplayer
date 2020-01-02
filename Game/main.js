const pixiapp = new PIXI.Application();
var socket = io('localhost:3000');

document.body.appendChild(pixiapp.view);
pixiapp.renderer.backgroundColor = 0x26272b;

let users = [];
// let playerSnake;

socket.on('assign player id', (playerid, pos, isPlayer) => {
    var player = new Player(playerid, new Snake(pos, isPlayer));
    users.push(player);
});

function Player(playerid,snake){
    this.id = playerid;
    this.snake = snake;
}

function Snake(pos, isPlayer){
    
    this.name = 'user';
    this.head = new PIXI.Graphics();
    this.body = [];
    this.isPlayer = isPlayer;
    if(this.isPlayer)
    this.head.lineStyle(4,0xFFFFFF,2);
    else{
    this.head.lineStyle(4,0xFF0000,2);

    }

    this.head.x = pos[0];
    this.head.y = pos[1];

    this.head.lineTo(32,0);

    pixiapp.stage.addChild(this.head);

    // for (let index = 0; index < 5; index++) {
    //     let line = new PIXI.Graphics();
    //     line.lineStyle(4,0xFFFFFF, 2); 
    //     line.lineTo(32,0);
    //     pixiapp.stage.addChild(line);
    //     snake.body.push(line);
    // }
}

let wKey = keyboard("w");
let aKey = keyboard("a");
let sKey = keyboard("s");
let dKey = keyboard("d");

let moveDirection = 0;

let framesCount = 0;

PIXI.Ticker.shared.add(this.UpdateGame);

// function InitializeGame(){



// }
// InitializeGame();


function UpdateGame(deltaTime){
    CheckMoveDirection();
}

function moveBody(lastheadpos, lastMoveDirection) {
    const lastBody = playerSnake.body.pop();
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
    playerSnake.body.unshift(lastBody);
}
function moveHeadMP(obj, movepos, movedir, isPlayer){
            obj.clear();

            //if(obj === playerSnake)
            if(isPlayer)
                obj.lineStyle(4,0xFFFFFF,2);
            else
                obj.lineStyle(4,0xFF0000,2);
            // else
            //     obj.lineStyle(4, 0xFFFFFF, 2);

            obj.x = movepos.x;
            obj.y = movepos.y;

            switch (movedir) {
                case 0:
                    obj.lineTo(0, 32);
                    break;
                case 1:
                    obj.lineTo(32, 0);
                    break;
                case 2:
                    obj.lineTo(0, -32);
                    break;
                case 3:
                    obj.lineTo(-32, 0);
                    break;
            }
}
socket.on('moveplayer', (playerid, pos, mov) => {
    var p = GetPlayerByID(playerid);
    moveHeadMP(p.snake.head, pos,mov, p.snake.isPlayer);
    
    //console.log(GetPlayerByID(playerid));
});

function GetPlayerByID(id){
    for (let index = 0; index < users.length; index++)
      if(users[index].id == id)
        return users[index];
      
    return null;
  }

// function moveHead(obj, movedir) {
//     obj.clear();
//     obj.lineStyle(4, 0xFFFFFF, 2);
//     switch (movedir) {
//         case 0:
//             obj.y -= 32;
//             obj.lineTo(0, 32);
//             break;
//         case 1:
//             obj.x -= 32;
//             obj.lineTo(32, 0);
//             break;
//         case 2:
//             obj.y += 32;
//             obj.lineTo(0, -32);
//             break;
//         case 3:
//             obj.x += 32;
//             obj.lineTo(-32, 0);
//             break;
//     }
//     if(obj.x < 0){
//         obj.x = pixiapp.renderer.width;
//     }
//     if(obj.x > pixiapp.renderer.width){
//         obj.x = 0;
//     }
//     if(obj.y < 0){
//         obj.y = pixiapp.renderer.height;
//     }
//     if(obj.y > pixiapp.renderer.height){
//         obj.y = 0;
//     }
// }

function CheckMoveDirection() {
    if (wKey.isDown) {
        moveDirection = 0;
        sendMoveDirectionToServer(moveDirection);
    }
    else if (aKey.isDown) {
        moveDirection = 1;
        sendMoveDirectionToServer(moveDirection);
    }
    else if (sKey.isDown) {
        moveDirection = 2;
        sendMoveDirectionToServer(moveDirection);
    }
    else if (dKey.isDown) {
        moveDirection = 3;
        sendMoveDirectionToServer(moveDirection);
    }
}
function sendMoveDirectionToServer(dir){
    socket.emit('playerChangeDirection', dir);
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

const playerConnected = 'assign player id';
const playerConnectedBroadcast = 'assign network player id';
const playerChangeDirection = 'playerChangeDirection';
const playerMove = 'moveplayer';