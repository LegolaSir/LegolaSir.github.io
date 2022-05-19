/* Global Variables */
let WIN_WIDTH, WIN_HEIGHT;
let context;
let heldKeys = [];

let directionMap = {
    left: "left", 
    right: "right"
};

let keyMap = {
    65: directionMap.left, // Tecla 'A'
    68: directionMap.right // Tecla 'D'
};

/* Game Objects */
let floor = {
    x: 0,
    y: -1,
    width: -1,
    height: 80,
    color: "#2e292e",

    draw: function(){
        this.y = WIN_HEIGHT - this.height;
        this.width = WIN_WIDTH;

        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    },
}

let player = {
    x: 275, //this.x = (WIN_WIDTH - this.width) / 2;
    y: -1,
    width: 50,
    height: 50,
    color: "#ff7c70",
    speed: 8,

    draw: function(){
        this.y = floor.y - this.height;

        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    },

    control: function(){
        let held_key = heldKeys[0];

        if(held_key){
            if(held_key === directionMap.right){
                this.x += this.speed;
            }
            else if(held_key === directionMap.left){
                this.x -= this.speed;
            }
        }

        this.restrainMovement();
    },

    restrainMovement: function(){
        if(this.x <= 0){
            this.x = 0;
        }

        if(this.x >= WIN_WIDTH - this.width){
            this.x = WIN_WIDTH - this.width;
        }
    }
}

/* Main Methods */
function main(){
    let canvas = document.createElement("canvas");
    setCanvasSize(canvas);
    canvas.style.border = "solid 10px black";

    context = canvas.getContext('2d');
    document.body.appendChild(canvas);

    document.addEventListener("keydown", (e) => {
        let dir = keyMap[e.which];
        if(dir && heldKeys.indexOf(dir) == -1){
            heldKeys.unshift(dir);
        };
    });

    document.addEventListener("keyup", (e) => {
        let dir = keyMap[e.which];
        let index = heldKeys.indexOf(dir);
        if(index > -1){
            heldKeys.splice(index, 1);
        }
    });

    run();
}

function run(){
    update();
    draw();

    window.requestAnimationFrame(run);
}

function update(){
    player.control();
}

function draw(){
    setCanvasBGColor("#674d69");

    floor.draw();
    player.draw();
}

/* Custom | Auxiliar Methods */
function setCanvasSize(canvas){
    WIN_WIDTH = window.innerWidth;
    WIN_HEIGHT = window.innerHeight;

    // Limiting Canvas Frame Size
    if(WIN_WIDTH >= 600){
        WIN_WIDTH = 600;
        WIN_HEIGHT = 450;
    }

    canvas.width = WIN_WIDTH;
    canvas.height = WIN_HEIGHT;
}

function setCanvasBGColor(color){
    context.fillStyle = color;
    context.fillRect(0, 0, WIN_WIDTH, WIN_HEIGHT);
}