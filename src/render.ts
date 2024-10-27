import { MyImage } from "./image";
import { ControlKey, keyDown } from "./keyboard";
import { State, XY } from "./state";

const tiles = new MyImage("tiles.png", 4,12);
const player = new MyImage("player.png", 1,4);
const scenes = new MyImage("scene.png", 3,1);
const instructions = new MyImage("instructions.png", 3,2);
const sprites = new MyImage("items.png", 20,1);
const SCALE = 400;
const PLAYER_SIZE = 0.2;

let gradient : any;



export function render(state: State, ctx: CanvasRenderingContext2D, [WIDTH,HEIGHT]:XY) {

    if(gradient == null){
        gradient = ctx.createRadialGradient(WIDTH/2,HEIGHT/2,HEIGHT/4,WIDTH/2,HEIGHT/2,HEIGHT/2);

        // Add three color stops
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.4, "rgba(22,8,26,0.3)");
        gradient.addColorStop(1, "rgb(22,8,26)");
    }

    if(state.mode == "walk"){
        renderWalk(state,ctx,[WIDTH,HEIGHT]);
    } else  if(state.mode == "spotlight"){
        renderSpotlight(state,ctx,[WIDTH,HEIGHT]);
    }

    if (state.mode != "dead") {
        instructions.draw(ctx, [0, HEIGHT - 50], state.mode == "walk" ? 0 : 2, 50);
        instructions.draw(ctx, [50, HEIGHT - 50], state.mode == "walk" ? 1 : 3, 50);
    } else {
        ctx.fillStyle = "rgb(22,8,26)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        instructions.draw(ctx, [WIDTH / 2 - 50, HEIGHT /2-50], 4, 100);
        instructions.draw(ctx, [WIDTH / 2 + 50, HEIGHT /2-50], 5, 100);
    }
}

export function renderSpotlight(state: State, ctx: CanvasRenderingContext2D, [WIDTH,HEIGHT]:XY) {

    const light = ctx.createRadialGradient(state.mousePos[0],state.mousePos[1],HEIGHT/8,state.mousePos[0],state.mousePos[1],HEIGHT/4);

    // Add three color stops
    light.addColorStop(0, "rgba(0,0,0,0)");
    light.addColorStop(0.4, "rgba(22,8,26,0.3)");
    light.addColorStop(1, "rgb(22,8,26)");

    scenes.draw(ctx,[0,0],state.spotItem?.scene || 0, WIDTH);

    // Item
    if (state.spotItem) {
        const size = 50;
        sprites.draw(ctx, [WIDTH * state.spotItem.pos[0] - size / 2, HEIGHT * state.spotItem.pos[1] - size / 2], state.spotItem.item, 50);
    }
    
    // light
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

export function renderWalk(state: State, ctx: CanvasRenderingContext2D, [WIDTH,HEIGHT]:XY) {


    // background
    ctx.fillStyle = "red"
    ctx.font = "bold 20px monospace";
    const debug = keyDown(ControlKey.DEBUG);
    const sx = Math.floor(state.pos[0] - 2);
    const sy = Math.floor(state.pos[1] - 2);
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            drawTile(ctx, state, [x + sx, y + sy], [
                Math.floor(state.pos[0] * SCALE - WIDTH / 2),
                Math.floor(state.pos[1] * SCALE - HEIGHT / 2)
            ]);
            if (debug) {
                ctx.fillText(">>" + state.maze.get(x + sx, y + sy).distance + ", " + state.maze.get(x + sx, y + sy).mainPath,
                    WIDTH / 2 + (x + sx - state.pos[0] + 0.5) * SCALE,
                    HEIGHT / 2 + (y + sy - state.pos[1] + 0.5) * SCALE
                );
            }
        }
    }

    // Items
    state.items.forEach(item=>{
        sprites.draw(ctx, [
            WIDTH / 2 - PLAYER_SIZE / 2 * SCALE + (item.pos[0] - state.pos[0])*SCALE, 
            HEIGHT / 2 - PLAYER_SIZE / 2 * SCALE+ (item.pos[1] - state.pos[1])*SCALE
        ], item.sprite, SCALE * PLAYER_SIZE);
    })

    // Player
    player.draw(ctx, [WIDTH / 2 - PLAYER_SIZE / 2 * SCALE, HEIGHT / 2 - PLAYER_SIZE / 2 * SCALE], state.walkFrame, SCALE * PLAYER_SIZE);

    // light
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Hud
    for(let i=0;i<5;i++){
        sprites.draw(ctx,[10+i*50,10],i<state.health ? 4 : 9,50);
    }
    for(let i=0;i<state.keys;i++){
        sprites.draw(ctx,[10+i*50,60],1,50);
    }
    if(state.keys == 0){
        sprites.draw(ctx,[10,60],2,50);
    }
}


function drawTile(ctx: CanvasRenderingContext2D, state: State, [x, y]: XY, offset:XY) {
    const tileset =Math.floor( xyNoise([x,y])*2) * 24;
    tiles.draw(ctx, [x * SCALE - offset[0], y * SCALE- offset[1]], tileOffset(state, x * 2, y * 2) * 2+tileset, SCALE / 2);
    tiles.draw(ctx, [x * SCALE + SCALE / 2 - offset[0], y * SCALE- offset[1]], tileOffset(state, x * 2 + 1, y * 2) * 2 + 1+tileset, SCALE / 2);
    tiles.draw(ctx, [x * SCALE - offset[0], y * SCALE + SCALE / 2- offset[1]], tileOffset(state, x * 2, y * 2 + 1) * 2 + 12+tileset, SCALE / 2);
    tiles.draw(ctx, [x * SCALE + SCALE / 2 - offset[0], y * SCALE + SCALE / 2- offset[1]], tileOffset(state, x * 2 + 1, y * 2 + 1) * 2 + 13+tileset, SCALE / 2);
}

// Witchery... but it works
export function tileOffset(state: State, x: number, y: number): number {
    const cur = !state.maze.get(Math.floor(x / 2), Math.floor(y / 2)).solid;
    const xo = x % 2;
    const yo = y % 2;

    let offset = 0;
    if (cur) {
        offset = 5;
    } else {
        const horiz = !state.maze.get(Math.floor(x / 2 + (xo * 2 - 1)), Math.floor(y / 2)).solid;
        const vert = !state.maze.get(Math.floor(x / 2), Math.floor(y / 2 + (yo * 2 - 1))).solid;
        const diag = !state.maze.get(Math.floor(x / 2 + (xo * 2 - 1)), Math.floor(y / 2 + (yo * 2 - 1))).solid;
        if (vert && horiz && diag) {
            offset = 2;
        } else if (vert && horiz) {
            offset = 0; // This scenario doesn't exst here
        } else if (horiz) {
            offset = 4;
        } else if (vert) {
            offset = 3;
        } else if (diag) {
            offset = 1;
        }
    }

    return offset;
}

function xyNoise([x,y]:XY):number{
    return Math.abs((Math.sin(x * 1.23 + y * 3.54) + Math.tan(x*5654.65 + y*54.654)+x*0.4156854 + y*0.1898))%1
}