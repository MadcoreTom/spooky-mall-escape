import { ControlKey, keyDown } from "./keyboard";
import { COLLECT, HURT, MENU_SELECT, SOUND, WIN } from "./sound";
import { State, XY } from "./state";
import { pickRandom } from "./util";

export abstract class Item {
    public pos: XY;
    public sprite: number;
    public abstract update(state: State, delta: number): boolean;

    protected inRangeOfPlayer(state: State, range:number=0.15): boolean {
        const dx = this.pos[0] - state.pos[0];
        const dy = this.pos[1] - state.pos[1];
        const dsq = dx * dx + dy * dy;
        return dsq < range*range;
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
            SOUND.playSound(HURT);
            state.health--;
            return false;
        }
        return true;
    }
}


export class DoorItem extends Item {
    private anim = 0;
    private location: XY = [0.05 + Math.random() * 0.9, 0.05 + Math.random() * 0.9];
    private itemIdx: 1;
    constructor(pos: XY, private readonly isKey) {
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
                pos: this.location,
                id: this.itemIdx,
                scene: Math.floor(Math.random() * 3),
                item: this.isKey ? 1 : pickRandom([3, 19])
            }
            SOUND.playSound(MENU_SELECT);
            return false;
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
            SOUND.playSound(COLLECT);
            return false;
        }
        return true;
    }
}

export class SpiderItem extends Item {
    private run:XY =[0,0];
    private runTimer = -1;

    constructor(pos: XY) {
        super();
        this.pos = pos;
        this.sprite = 14;
    }

    public update(state: State, delta: number) {
        if(this.runTimer >52000){
            return false
        } if (this.runTimer < 0) {
            if (this.inRangeOfPlayer(state, 0.5)) {
                this.runTimer = 0;
                const a =Math.random() * Math.PI * 2;
                this.run = [Math.sin(a),Math.cos(a)];
            }

        } else {
            this.runTimer += delta;
            this.pos[0] += this.run[0] * delta / 1000;
            this.pos[1] += this.run[1] * delta / 1000;
            this.sprite = 14 + Math.floor((this.runTimer / 50)%2);
        }
        return true;
    }
}


export class ExitItem extends Item {
    constructor(pos: XY) {
        super();
        this.pos = pos;
        this.sprite = 0;
    }

    public update(state: State, delta: number) {

        if (this.inRangeOfPlayer(state) && state.keys > 0) {
            SOUND.playSound(WIN);
            state.mode = "end";
            return false;
        }
        return true;
    }
}
