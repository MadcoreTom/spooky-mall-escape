import { DoorItem, StaticItem } from "./item";
import { ControlKey, initKeyboard, keyDown, keyPressed } from "./keyboard";
import { render } from "./render";
import { initState, State, XY } from "./state";
import { update } from "./update";
import { shuffle } from "./util";

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

canvas.addEventListener("mousemove", evt=>{
    state.mousePos[0] = evt.offsetX;
    state.mousePos[1] = evt.offsetY;
})

function tick(time) {
    const delta = Math.min(100, time - lastTime);
    lastTime = time;

    update(state, delta);

    render(state, ctx, [WIDTH, HEIGHT]);

    window.requestAnimationFrame(tick);
}


window.requestAnimationFrame(tick);