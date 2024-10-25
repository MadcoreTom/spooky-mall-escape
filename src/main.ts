const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;


let lastTime = 0;

function tick(time) {
    const delta = Math.min(100, time - lastTime);
    lastTime = time;

    update(delta);

    render(ctx);

    window.requestAnimationFrame(tick);
}

function update(delta: number) {

}

function render(cxtx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
    ctx.fillText("Spooky", 100 + Math.random() * 100, 100 + Math.random() * 100);
}

window.requestAnimationFrame(tick);