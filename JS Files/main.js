/* Global Variables */
let WIN_WIDTH, WIN_HEIGHT;
let context;
let heldKeys = [];
let scoreTxt, healthTxt, highscoreTxt;
let gameOver = false;

let img_loader = new Image();
let keyA_image = new Image();
let keyD_image = new Image();

let _keySprites = [
    "../IMGs/Control Keys/A-Key Released.png",
    "../IMGs/Control Keys/A-Key Pressed.png",
    "../IMGs/Control Keys/D-Key Released.png",
    "../IMGs/Control Keys/D-Key Pressed.png"
];

let _GameOverSprites = [
    "../IMGs/GameOver Assets/GameOverBackground.png",
    "../IMGs/GameOver Assets/Refresh Icon.png"
];

let _MenuSprites = [
    "../IMGs/Menu Assets/Idle Button.png",
    "../IMGs/Menu Assets/Selected Button.png"
];

const FRUIT_WIDTH = 25;
const FRUIT_HEIGHT = 25;
const HIGHSCORE_NAME = "highscore";

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
    defaultSpeed: 3,
    speed: 3,
    score: 0,
    maxScore: 0,
    health: 3,
    
    belly: {
        xLeft: 275, 
        xRight: 300,
        y: -1, 
        widthLeft: 0,
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
                setImageSource(keyD_image, _keySprites[3]);
            }
            else if(held_key === keyLabels.left){
                this.x -= this.speed;
                this.belly.xLeft -= this.speed;
                this.belly.xRight -= this.speed;
                setImageSource(keyA_image, _keySprites[1]);
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
    },

    loseHealth: function(){
        this.health -= 1;

        if(this.health <= 0){
            this.health = 0;
            healthTxt.style.backgroundColor = "#bd3038";
            this.setMaxScore();
            gameOver = true;
            playAnyAudioFile("../SFXs/Game Over Soundtrack.mp3", 0.5);
        }

        healthTxt.innerHTML = `Health: ${this.health}`;
    },
    
    setScore: function(){
        this.score += 1;
        scoreTxt.innerHTML = `Score: ${this.score}`;
        
        // Maximum Bellies' Width Size
        if(this.belly.widthLeft <= -50 && this.belly.widthRight >= 75){
            this.belly.widthLeft = -50;
            this.belly.widthRight = 75;
            this.speed = this.defaultSpeed / 4;
        }
        else if(this.belly.widthLeft > -50 && this.belly.widthRight < 75)
        {
            this.belly.widthLeft -= 1;
            this.belly.widthRight += 1;
            this.speed -= (this.defaultSpeed/25) / 4;
        }
    },

    setMaxScore: function(){
        if(localStorage.getItem(HIGHSCORE_NAME) < this.score){
            this.maxScore = this.score;
            localStorage.setItem(HIGHSCORE_NAME, this.maxScore);  
            highscoreTxt.innerHTML = `Record: ${localStorage.getItem(HIGHSCORE_NAME)}`;
        }   
    }
};

let fruits = {
    _storage: [],
    _colors: ["#bd3038", "#36802d"], // ['red', 'green']
    gravity: 2,
    initDelay: 200,
    delay: 0,
    timer: 200,

    spawn: function(){
        this._storage.push({
             x: Math.floor(Math.random() * (WIN_WIDTH - FRUIT_WIDTH)),
             y: 0,
             width: FRUIT_WIDTH,
             height: FRUIT_HEIGHT,
             hue: this._colors[Math.floor(Math.random() * 2)]
        });

        this.timer = this.initDelay - (this.delay * 1.5);
        
        if(this.timer <= this.delay){
            this.timer = 40;
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
                this.destroyOnCollision(item);
            }
        }    
    },

    gatheredByPlayer(){
        for(let i=0; i < this._storage.length; i++){
            let item = this._storage[i];

            this.checkPlayerBodyCollision(item);
            this.checkPlayerBellyLeftCollision(item);
            this.checkPlayerBellyRightCollision(item);
        }
    },

    checkPlayerBodyCollision: function(item){
            if( // Main Player Body Collision
                player.x < item.x + item.width && // RIGHT
                player.x + player.width > item.x && // LEFT
                player.y < item.y + item.height && // TOP
                player.y + player.height > item.y // BOTTOM
            ){
                this.destroyOnCollision(item);
                this.gatherGreenCollectible(item);
                this.gatherRedCollectible(item);
                this.setDelay();
            }
    },

    checkPlayerBellyLeftCollision: function(item){
        if( // Left Belly Player Collision
            player.belly.xLeft > item.x + item.width && // LEFT
            player.belly.xLeft + player.belly.widthLeft < item.x && // INSIDE-LEFT
            player.belly.y < item.y + item.height && // TOP
            player.belly.y + player.belly.y > item.y // BOTTOM
        ){
            this.destroyOnCollision(item);
            this.gatherGreenCollectible(item);
            this.gatherRedCollectible(item);
            this.setDelay();
        }
    },

    checkPlayerBellyRightCollision: function(item){
        if( // Right Belly Player Collision
            player.belly.xRight < item.x + item.width && // RIGHT
            player.belly.xRight + player.belly.widthRight > item.x && // INSIDE-RIGHT
            player.belly.y < item.y + item.height && // TOP
            player.belly.y + player.belly.y > item.y // BOTTOM
        ){
            this.destroyOnCollision(item);
            this.gatherGreenCollectible(item);
            this.gatherRedCollectible(item);
            this.setDelay();
        }
    },

    destroyOnCollision: function(item){
        let index = this._storage.indexOf(item);

        if(index > -1){
            this._storage.splice(index, 1);
        }
    },

    gatherGreenCollectible: function(item){
        if(item.hue == "#36802d"){ // 'Green' Colour
            player.setScore();

            if(player.score > localStorage.getItem(HIGHSCORE_NAME)){
                playAnyAudioFile("../SFXs/New Record SFX.wav", 0.2);
            }
            else{
                playAnyAudioFile("../SFXs/Green Collectible SFX.wav", 1);
            }
        }
    },

    gatherRedCollectible: function(item){
        if(item.hue == "#bd3038"){ // 'Red' Colour
            player.loseHealth();
            playAnyAudioFile("../SFXs/Red Collectible SFX.wav", 0.5);
        }
    },

    setDelay: function(){
        this.delay += 3.5;

        if(this.delay >= 100){
            this.delay = 100;
        }
    }
}

let iconBackground = {
    x: 230,
    y: 200,
    width: 150,
    height: 150,
    color: "skyblue",
    strokeWidth: 5,
    strokeColor: "black",

    draw: function(){
        context.clearRect(this.x, this.y, this.width, this.height);

        context.fillStyle = this.color;
        context.strokeStyle = this.strokeColor;
        context.lineWidth = this.strokeWidth;

        context.fillRect(this.x, this.y, this.width, this.height);
        context.strokeRect(this.x, this.y, this.width, this.height); 
    }
}

/* Main Methods */
function main(){
    // Waiting the HTML File to complete loading to access <div> elements on screen
    document.addEventListener("DOMContentLoaded", () =>{
        scoreTxt = document.getElementById("scoreTxt");
        healthTxt = document.getElementById("healthTxt");
        highscoreTxt = document.getElementById("highscoreTxt");

        // Writing the current HighScore saved on 'Browser's localStorage' 
        highscoreTxt.innerHTML = `Record: ${localStorage.getItem(HIGHSCORE_NAME)}`;
    });

    let canvas = document.createElement("canvas");
    setCanvasSize(canvas);
    canvas.style.border = "solid 10px black";

    context = canvas.getContext('2d');
    document.body.appendChild(canvas);

    /* Checking Player Interaction [Character Movement by Keys] */
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

    /* Checking Player Interaction [Mouse inside Canvas, for Restart Button] */
    canvas.addEventListener("click", (e) => {
        let mousePos = getMousePosition(canvas, e);
        let checkedMousePos = isMouseOnRightPlace(mousePos, iconBackground.x, iconBackground.y, iconBackground.width, iconBackground.height);

        if(gameOver && checkedMousePos){
            document.location.reload();
        }
    });

    canvas.addEventListener("mousemove", (e) =>{
        let mousePos = getMousePosition(canvas, e);
        let checkedMousePos = isMouseOnRightPlace(mousePos, iconBackground.x, iconBackground.y, iconBackground.width, iconBackground.height);
        
        if(gameOver && checkedMousePos){
            iconBackground.color = "goldenrod";
        }
        else if(gameOver && !checkedMousePos){
            iconBackground.color = "skyblue";
        }
    });

    run();
}

function run(){
    if(!gameOver){
        draw();
        update();
    }
    else{ // If 'Game Over' Status is reached by 'Player'
        drawGameOverWindow();
    }

    window.requestAnimationFrame(run);
}

function update(){
    player.control();

    spawnCollectiblesByDelay();
    fruits.applyGravity();
    fruits.gatheredByPlayer();
}

function draw(){ 
    img_loader.onload = () => {
        setCanvasBGColor("#674d69");
        floor.draw();
        fruits.draw();
        player.draw();

        // Drawing Control Keys on Canvas (above floor area)
        context.drawImage(keyA_image, 20, WIN_HEIGHT-65, 50, 50);
        context.drawImage(keyD_image, WIN_WIDTH-80, WIN_HEIGHT-65, 50, 50);
    };
    
    setImageSource(img_loader, "../IMGs/IMG_TransparentLoader.png");
    setImageSource(keyA_image, _keySprites[0]);
    setImageSource(keyD_image, _keySprites[2]); 
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
    }
    else if(fruits.timer > 0){
        fruits.timer--;
    }
}

function drawGameOverWindow(){
    let refresh_icon = new Image();
    let bg_img = new Image();

    refresh_icon.onload = () => {
        context.clearRect(0, 0, WIN_WIDTH, WIN_HEIGHT);
        setCanvasBGColor("#674d69");

        writeText("You had enough", "#bd3038", 3, "black");
        iconBackground.draw();

        context.drawImage(refresh_icon, 230, 200, 150, 150);
        context.drawImage(bg_img, 0, 0)
    }

    refresh_icon.src = _GameOverSprites[1];
    bg_img.src = _GameOverSprites[0];
}

function setImageSource(img, url){
    img.src = url;
}

function writeText(msg, color, strokeWidth, strokeColor){
    context.font = "54px fantasy";
    context.fillStyle = color;
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWidth;

    context.fillText(msg, 140, 150);
    context.strokeText(msg, 140, 150);
}

function getMousePosition(canvas, evt){
    let rect = canvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function isMouseOnRightPlace(mousePos, x, y, w, h){
    return (
        mousePos.x > x && mousePos.x < x + w && 
        mousePos.y < y + h && mousePos.y > y
    );
}

function changeMenuButtonSprite(button_id, isMouseOver){
    let startBtn, exitBtn;

    startBtn = document.getElementById("startBtn");
    exitBtn = document.getElementById("exitBtn");

    if(startBtn.id === button_id && isMouseOver){
        startBtn.setAttribute("src", _MenuSprites[1]);
    }
    else{
        startBtn.setAttribute("src", _MenuSprites[0]);
    }
        
    if(exitBtn.id === button_id && isMouseOver){
        exitBtn.setAttribute("src", _MenuSprites[1]);
    }
    else{
        exitBtn.setAttribute("src", _MenuSprites[0]);
    }
}

function playAnyAudioFile(url, volume){
    let audio = new Audio(url);

    audio.oncanplay = () => {
        audio.volume = volume;
        audio.play();
    }
}