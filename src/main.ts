import { initState, State } from "./state";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const state = initState();
let lastTime = 0;

function tick(time) {
    const delta = Math.min(100, time - lastTime);
    lastTime = time;

    update(state, delta);

    render(state, ctx);

    window.requestAnimationFrame(tick);
}

function update(state: State, delta: number) {
   state.generator.next();
}


const SCALE = 12;
function render(state:State, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
    ctx.fillText("Spooky", 100 + Math.random() * 100, 100 + Math.random() * 100);

    state.maze.forEach((x, y, v) => {
        ctx.fillStyle = v.solid ? "red" : "blue";
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    })
}

window.requestAnimationFrame(tick);