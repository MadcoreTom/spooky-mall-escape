import { XY } from "./state";

export class MyImage {
    public img = new Image();
    private ready: boolean = false;
    public constructor(src: string, private rows: number, private cols: number) {
        this.img.addEventListener("onload", () => this.ready = true)
        this.img.src = src;
    }

    public isReady(): boolean {
        return this.ready;
    }

    public draw(ctx: CanvasRenderingContext2D, pos: XY, idx: number, scale: number) {
        const sw = this.img.width / this.cols;
        const sh = this.img.height / this.rows;
        const sx = sw * (idx % this.cols);
        const sy = sh * Math.floor(idx / this.cols);
        ctx.drawImage(this.img,
            sx, sy, sw, sh,
            pos[0], pos[1], scale, scale);
    }
}