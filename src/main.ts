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


const SCALE = 24;
function render(state: State, ctx: CanvasRenderingContext2D) {

    state.maze.forEach((x, y, v) => {
        ctx.fillStyle = v.solid ? "red" : "blue";
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    });

    ctx.fillStyle = "yellow";
    ctx.fillRect((state.pos[0] - PLAYER_SIZE/2) * SCALE, (state.pos[1] -PLAYER_SIZE/2) * SCALE, SCALE * PLAYER_SIZE, SCALE * PLAYER_SIZE);
}

window.requestAnimationFrame(tick);