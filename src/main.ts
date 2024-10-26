import { ControlKey, initKeyboard, keyDown } from "./keyboard";
import { render } from "./render";
import { initState, State, XY } from "./state";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// turn of smoothing for image scaling
ctx['webkitImageSmoothingEnabled'] = false;
ctx['mozImageSmoothingEnabled'] = false;
ctx.imageSmoothingEnabled = false; /// future

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
initKeyboard();

const state = initState();
let lastTime = 0;

function tick(time) {
    const delta = Math.min(100, time - lastTime);
    lastTime = time;

    update(state, delta);

    render(state, ctx, [WIDTH, HEIGHT]);

    window.requestAnimationFrame(tick);
}

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
        if (movement[0] != 0 || movement[1] != 0) {
            const future = [state.pos[0] + movement[0], state.pos[1] + movement[1]];
            if (!state.maze.get(Math.floor(future[0]), Math.floor(future[1])).solid) {
                state.pos[0] += movement[0];
                state.pos[1] += movement[1];
                // walk animation
                state.walkTimer += delta;
                if (state.walkTimer > 100) {
                    state.walkTimer -= 100;
                    state.walkFrame = (state.walkFrame + 1) % 4;
                }
            }
        }
    }

}

window.requestAnimationFrame(tick);