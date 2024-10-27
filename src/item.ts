import { ControlKey, keyDown } from "./keyboard";
import { State, XY } from "./state";

export abstract class Item {
    public pos: XY;
    public sprite: number;
    public abstract update(state: State, delta: number): boolean;

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
        return true;
    }
}

export class BatItem extends Item {
    private angle = Math.PI * 2 * Math.random();
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
            console.log("BIP");
            state.health--;
            return false;
        }
        return true;
    }
}


export class DoorItem extends Item {
    private anim = 0;
    private location:XY = [Math.random(),Math.random()];
    private itemIdx: 1;
    constructor(pos: XY) {
        super();
        this.pos = pos;
        this.sprite = 7;
    }

    public update(state: State, delta: number) {
        this.anim += delta;
        this.sprite = Math.floor((this.anim / 200) % 2) + 7;

        if (this.inRangeOfPlayer(state) && keyDown(ControlKey.UP)) {
            state.mode = "spotlight";
            state.spotItem = {
                pos:this.location,
                id:this.itemIdx
            }
        }
        return true;
    }
}
export class HealthItem extends Item {
    constructor(pos: XY) {
        super();
        this.pos = pos;
        this.sprite = 4;
    }

    public update(state: State, delta: number) {

        if (this.inRangeOfPlayer(state) && state.health < 5) {
            state.health++;
            return false;
        }
        return true;
    }
}