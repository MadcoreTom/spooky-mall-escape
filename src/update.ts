import { BatItem, DoorItem, ExitItem, HealthItem, SpiderItem, StaticItem } from "./item";
import { ControlKey, keyDown, keyPressed } from "./keyboard";
import { calcDistance } from "./maze";
import { COLLECT, SFX_DIE, SOUND } from "./sound";
import { initState, State, XY } from "./state";
import { shuffle } from "./util";

const SHOP_COUNT = 8;
const CANDY_COUNT = 5;
const BAT_COUNT = 16;
const WALK_SPEED = 0.002;
export function update(state: State, delta: number) {
    if (state.mode == "walk") {
        updateMaze(state, delta);
    } else if (state.mode == "spotlight") {
        updateSpotlight(state, delta);
    } else {
        if (state.clickPos) {
            state.clickPos = undefined;

            if (state.mode == "dead") {
                state.mode = "start";
            } else if (state.mode == "start") {
                // restart

                const newState = initState();
                Object.entries(newState).forEach(([k, v]) => {
                    state[k] = v;
                })
                state.mode = "walk";

            } else if (state.mode == "end") {
                state.mode = "start";
            }
        }
    }
}

export function updateSpotlight(state: State, delta: number) {
    if(state.clickPos && state.spotItem){
        const dx = state.spotItem.pos[0] - state.clickPos[0];
        const dy = state.spotItem.pos[1] - state.clickPos[1];
        const dsq = dx*dx+dy*dy;

        if(dsq < 0.05*0.05){
            if(state.spotItem.item == 1){
                state.keys ++;
            }
            SOUND.playSound(COLLECT);
            state.mode = "walk";
        }
    }
}

export function updateMaze(state: State, delta: number) {
    let n = state.generator.next();
    if(!n.done){
        n = state.generator.next();
    }

    if(state.health <= 0){
        SOUND.playSound(SFX_DIE);
        state.mode = "dead";
        return;
    }

    if (n.done) {

        if (!state.shopsGenerated) {
            const start = calcDistance(state.maze, [1,1])
            state.pos[0] = start[0] + 0.5;
            state.pos[1] = start[1] + 0.5;
            const farthest = calcDistance(state.maze, start);

            // make the golden path
            // TODO do something with it
            {
                let cur: XY = [farthest[0], farthest[1]];
                let curDist = state.maze.get(cur[0], cur[1]).distance;

                const deltas: XY[] = [[-1, 0], [1, 0], [0, 1], [0, -1]];

                while (curDist != 0) {
                    state.maze.get(cur[0], cur[1]).mainPath = true;
                    const next = deltas.filter(([x, y]) => !state.maze.get(cur[0]+x, cur[1]+y).solid && state.maze.get(cur[0]+x, cur[1]+y).distance < curDist)[0];
                    if (next != undefined) {
                        curDist = state.maze.get(cur[0]+next[0], cur[1]+next[1]).distance;
                        cur[0] += next[0];
                        cur[1] += next[1];
                    } else {
                        curDist = 0;
                    }
                }
            }

            let options: XY[] = [];
            state.maze.forEach((x, y, v) => {
                if (v.solid == false && state.maze.get(x, y - 1).solid == true) {
                    options.push([x, y]);
                }
            });
            shuffle(options);
            for (let i = 0; i < options.length && i < SHOP_COUNT; i++) {
                state.items.push(
                    new DoorItem([options[i][0] + 0.5, options[i][1] + 0.1], i==0)
                )
            }

            // add health
            options= [];
            state.maze.forEach((x, y, v) => {
                if (v.solid == false) {
                    options.push([x, y]);
                }
            });
            shuffle(options);
            for (let i = 0; i < options.length && i < CANDY_COUNT; i++) {
                state.items.push(
                    new HealthItem([options[i][0] + 0.25 + 0.5 * Math.random(), options[i][1] + 0.25 + 0.5 * Math.random()])
                );
            }

            // add bats
            options= [];
            state.maze.forEach((x, y, v) => {
                if (v.solid == false && v.distance > 5) {
                    options.push([x, y]);
                }
            });
            shuffle(options);
            for (let i = 0; i < options.length && i < BAT_COUNT; i++) {
                state.items.push(
                    new BatItem([options[i][0] + 0.25 + 0.5 * Math.random(), options[i][1] + 0.25 + 0.5 * Math.random()], 0.1 + Math.random()*0.2)
                );
            }

            // add decorations
            options= [];
            state.maze.forEach((x, y, v) => {
                if (v.solid == false && v.distance %2==1 || v.distance % 3 == 1) {
                    options.push([x, y]);
                }
            });
            shuffle(options);
            const count = options.length /2;
            for (let i = 0; i < options.length && i < count; i++) {
                state.items.push(
                    new StaticItem([options[i][0] + 0.25 + 0.5 * Math.random(), options[i][1] + 0.25 + 0.5 * Math.random()],Math.floor(Math.random() * 4)+10)
                );
            }

            // add spiders
            options= [];
            state.maze.forEach((x, y, v) => {
                if (v.solid == false) {
                    options.push([x, y]);
                }
            });
            shuffle(options);
            const count2 = options.length /2;
            for (let i = 0; i < options.length && i < count2; i++) {
                state.items.push(
                    new SpiderItem ([options[i][0] + 0.25 + 0.5 * Math.random(), options[i][1] + 0.25 + 0.5 * Math.random()])
                );
            }

            // add something at the end
            state.items.push(
                new ExitItem([farthest[0] + 0.5, farthest[1]+0.5])
            );

            state.shopsGenerated = true;
        }



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
        if (movement[0] != 0 && movement[1] != 0) {
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
        state.items = state.items.filter(i => i.update(state, delta));

    }
}