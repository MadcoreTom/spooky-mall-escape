import { MyImage } from "./image";
import { ControlKey, initKeyboard, keyDown } from "./keyboard";
import { initState, State, XY } from "./state";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
initKeyboard();

const state = initState();
let lastTime = 0;

function tick(time) {
    const delta = Math.min(100, time - lastTime);
    lastTime = time;

    update(state, delta);

    render(state, ctx);

    window.requestAnimationFrame(tick);
}

const PLAYER_SIZE = 0.2;

const WALK_SPEED = 0.002;
function update(state: State, delta: number) {
    const n = state.generator.next();

    if (n.done) {
        const movement: XY = [0, 0];
        if (keyDown(ControlKey.UP)) {
            movement[1] = -delta * WALK_SPEED;
        }
        if (keyDown(ControlKey.DOWN)) {
            movement[1] = + delta * WALK_SPEED;
        }
        if (keyDown(ControlKey.LEFT)) {
            movement[0] = - delta * WALK_SPEED;
        }
        if (keyDown(ControlKey.RIGHT)) {
            movement[0] = + delta * WALK_SPEED;
        }

        // multiplier for diagonal
        if(movement[0] != 0 && movement[1] != 0){
            movement[0] /= Math.SQRT2;
            movement[1] /= Math.SQRT2;
        }

        // test collision here
        const future = [state.pos[0] + movement[0], state.pos[1] + movement[1]];
        if(!state.maze.get(Math.floor(future[0]),Math.floor(future[1])).solid){
            state.pos[0] += movement[0];
            state.pos[1] += movement[1];
        }
    }

}

const tiles = new MyImage("tiles.png", 2,12);
const SCALE = 50;
function render(state: State, ctx: CanvasRenderingContext2D) {

    state.maze.forEach((x, y, v) => {
        drawTile(ctx,state,[x,y])
    });

    ctx.fillStyle = "yellow";
    ctx.fillRect((state.pos[0] - PLAYER_SIZE / 2) * SCALE, (state.pos[1] - PLAYER_SIZE / 2) * SCALE, SCALE * PLAYER_SIZE, SCALE * PLAYER_SIZE);
}

window.requestAnimationFrame(tick);

function drawTile(ctx: CanvasRenderingContext2D, state: State, [x, y]: XY) {
    tiles.draw(ctx, [x * SCALE, y * SCALE], tileOffset(state, x * 2, y * 2) * 2, SCALE / 2);
    tiles.draw(ctx, [x * SCALE + SCALE / 2, y * SCALE], tileOffset(state, x * 2 + 1, y * 2) * 2 + 1, SCALE / 2);
    tiles.draw(ctx, [x * SCALE, y * SCALE + SCALE / 2], tileOffset(state, x * 2, y * 2 + 1) * 2 + 12, SCALE / 2);
    tiles.draw(ctx, [x * SCALE + SCALE / 2, y * SCALE + SCALE / 2], tileOffset(state, x * 2 + 1, y * 2 + 1) * 2 + 13, SCALE / 2);
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