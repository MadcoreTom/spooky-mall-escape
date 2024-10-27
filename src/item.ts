import { ControlKey, keyDown } from "./keyboard";
import { State, XY } from "./state";

export abstract class Item {
    public pos: XY;
    public sprite: number;
    public abstract update(state: State, delta: number);

    protected inRangeOfPlayer(state: State): boolean {
        const dx = this.pos[0] - state.pos[0];
        const dy = this.pos[1] - state.pos[1];
        const dsq = dx * dx + dy * dy;
        return dsq < 0.15 * 0.15;
    }
};

export class StaticItem extends Item {
    constructor(pos: XY, sprite: number) {
        super();
        this.pos = pos;
        this.sprite = sprite;
    }

    public update(state: State, delta: number) {
        // do nothing
    }
}

export class BatItem extends Item {
    private angle = 0;
    constructor(public centre: XY, public radius: number) {
        super();
        this.pos = [
            centre[0] + radius * Math.sin(this.angle),
            centre[1] + radius * Math.cos(this.angle)
        ];
        this.sprite = 5;
    }

    public update(state: State, delta: number) {
        this.angle += delta / 300;
        this.pos = [
            this.centre[0] + this.radius * Math.sin(this.angle),
            this.centre[1] + this.radius * Math.cos(this.angle)
        ];
        this.sprite = Math.floor((this.angle * 2) % 2 + 5);


        if (this.inRangeOfPlayer(state)) {
            console.log("BIP")
        }
    }
}


export class DoorItem extends Item {
    private anim = 0;
    constructor(pos: XY) {
        super();
        this.pos = pos;
        this.sprite = 7;
    }

    public update(state: State, delta: number) {
        this.anim += delta;
        this.sprite = Math.floor((this.anim / 200)%2)+7;

        if (this.inRangeOfPlayer(state) && keyDown(ControlKey.UP)) {
            state.mode = "spotlight";
        }
    }
}