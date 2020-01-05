    // @ts-ignore
const pixiapp = new PIXI.Application();


    // @ts-ignore
var socket = io('localhost:3000');

document.body.appendChild(pixiapp.view);
pixiapp.renderer.backgroundColor = 0x26272b;


    // @ts-ignore
const style = new PIXI.TextStyle();
// @ts-ignore
const highestScore = new PIXI.Text('Score: 0', style);

void function setupScore () {
    highestScore.x = pixiapp.renderer.width - highestScore.width;
    pixiapp.stage.addChild(highestScore);
}();

let users = [];

let wKey = keyboard("w");
let aKey = keyboard("a");
let sKey = keyboard("s");
let dKey = keyboard("d");

let moveDirection = 0;

let framesCount = 0;

    // @ts-ignore
PIXI.Ticker.shared.add(this.UpdateGame);

function Player(playerid,snake){
    this.id = playerid;
    this.snake = snake;
    this.score = 0;

    function setScore(score){
        this.score = score;
    }
}

function Snake(pos, isPlayer){
    this.name = 'user';
    // @ts-ignore
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
}

function UpdateGame(deltaTime){
    CheckMoveDirection();
}
function moveHeadMP(obj, movepos, movedir, isPlayer){
            obj.clear();
            if(isPlayer)
                obj.lineStyle(4,0xFFFFFF,2);
            else
                obj.lineStyle(4,0xFF0000,2);
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

socket.on('assign player id', (playerid, pos, isPlayer) => {
    var player = new Player(playerid, new Snake(pos, isPlayer));
    users.push(player);
});

socket.on('moveplayer', (playerid, pos, mov) => {
    var p = GetPlayerByID(playerid);
    moveHeadMP(p.snake.head, pos,mov, p.snake.isPlayer);
});
socket.on('scorechange', (playerid, score) => {
    var p = GetPlayerByID(playerid);
    p.setScore(score);
});
socket.on('destroyplayer', (playerid) => {
    removePlayer(GetPlayerByID(playerid));
});
socket.on('spawnfood', (food) => {
    console.log(food);
});

function removePlayer(player){
    player.snake.head.destroy();
    pixiapp.stage.removeChild(player.snake.head);
    users.splice(users.indexOf(player),1);
}

function GetPlayerByID(id){
    for (let index = 0; index < users.length; index++)
      if(users[index].id == id)
        return users[index];
      
    return null;
}
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