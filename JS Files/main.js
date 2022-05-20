/* Global Variables */
let WIN_WIDTH, WIN_HEIGHT;
let context;
let heldKeys = [];

const FRUIT_WIDTH = 25;
const FRUIT_HEIGHT = 25;

let keyLabels = {
    left: "left", 
    right: "right"
};

let keyMap = {
    65: keyLabels.left, // Tecla 'A'
    68: keyLabels.right, // Tecla 'D'
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
};

let player = {
    x: 275, //this.x = (WIN_WIDTH - this.width) / 2;
    y: -1,
    width: 50,
    height: 50,
    color: "#ff7c70",
    speed: 8,
    belly: {
        xLeft: 275, 
        xRight: 300,
        y: -1, 
        widthLeft: 25,
        widthRight: 25,
        height: 25, 
        color: "#ff7c70",

        draw: function(){
            this.y = floor.y - this.height;

            context.fillStyle = this.color;
            context.fillRect(this.xLeft, this.y, this.widthLeft, this.height);
            context.fillRect(this.xRight, this.y, this.widthRight, this.height);
        }
    },

    draw: function(){
        this.y = floor.y - this.height;

        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
        this.belly.draw();
    },

    control: function(){
        let held_key = heldKeys[0];

        if(held_key){
            if(held_key === keyLabels.right){
                this.x += this.speed;
                this.belly.xLeft += this.speed;
                this.belly.xRight += this.speed;
            }
            else if(held_key === keyLabels.left){
                this.x -= this.speed;
                this.belly.xLeft -= this.speed;
                this.belly.xRight -= this.speed;
            }
        }

        this.restrainMovement();
    },

    restrainMovement: function(){
        let wL = this.belly.widthLeft;
        let wR = this.belly.widthRight;

        /* Player Collision towards the Canvas Border [left side] */
        if(this.belly.xLeft <= -wL && wL < 0){
            // Fat Belly Collision
            this.x = -wL;
            this.belly.xLeft = -wL;
            this.belly.xRight = -wL + 25;
        }
        else if (this.x <= 0){ 
            // Default Collision
            this.x = 0;
            this.belly.xLeft = 0;
            this.belly.xRight = 25;
        }

        /* Player Collision towards the Canvas Border [right side] */
        if(this.belly.xRight >= WIN_WIDTH - wR){
            this.x = WIN_WIDTH - (this.width + wR - 25);
            this.belly.xRight = WIN_WIDTH - wR;
            this.belly.xLeft = WIN_WIDTH - (wR + 25);
        }
        else if(this.x >= WIN_WIDTH - this.width){
            // Default Collision
            this.x = WIN_WIDTH - this.width;
            this.belly.xRight = WIN_WIDTH - wR;
            this.belly.xLeft = WIN_WIDTH - 50;
        }
    }
};

let fruits = {
    _storage: [],
    _colors: ["#bd3038", "#36802d"],
    gravity: 2,
    initDelay: 200,
    delay: 0,
    timer: 0,

    spawn: function(){
        this._storage.push({
             x: Math.floor(Math.random() * (WIN_WIDTH - FRUIT_WIDTH)),
             y: 0,
             width: FRUIT_WIDTH,
             height: FRUIT_HEIGHT,
             hue: this._colors[Math.floor(Math.random() * 2)]
        });

        this.timer = this.initDelay - this.delay;

        if(this.timer <= this.delay){
            this.timer = 30;
        }
    },

    draw: function(){
        for(let i=0; i < this._storage.length; i++){
            let item = this._storage[i];

            context.fillStyle = item.hue;
            context.fillRect(item.x, item.y, item.width, item.height);
        }
    },

    applyGravity: function(){
        for(let i=0; i < this._storage.length; i++){
            let item = this._storage[i];

            item.y += this.gravity;
            
            if(item.y >= floor.y - item.height){
                this.destroyOnGround(item);
            }
        }    
    },

    destroyOnGround: function(item){
        let index = this._storage.indexOf(item);

        if(index > -1){
            this._storage.splice(index, 1);
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
    // Calling Player Movement Function
    player.control();
    
    spawnCollectiblesByDelay();
    fruits.applyGravity();
}

function draw(){
    setCanvasBGColor("#674d69");

    // Calling Draw Functions of Game Elements
    floor.draw();
    player.draw();
    fruits.draw();
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

function spawnCollectiblesByDelay(){
    if(fruits.timer <= 0){
        fruits.spawn();

        //console.log(fruits.timer)
    }
    else if(fruits.timer > 0){
        fruits.timer--;
    }
}