import { BatItem, DoorItem, HealthItem } from "./item";
import { ControlKey, keyDown, keyPressed } from "./keyboard";
import { State, XY } from "./state";
import { shuffle } from "./util";

const SHOP_COUNT = 8;
const CANDY_COUNT = 5;
const BAT_COUNT = 15;
const WALK_SPEED = 0.002;
export function update(state: State, delta: number) {
    if (state.mode == "walk") {
        updateMaze(state, delta);
    } else {
        updateSpotlight(state, delta);
    }
}

export function updateSpotlight(state: State, delta: number) {
}

export function updateMaze(state: State, delta: number) {
    const n = state.generator.next();

    if (n.done) {

        if (!state.shopsGenerated) {
            let options: XY[] = [];
            state.maze.forEach((x, y, v) => {
                if (v.solid == false && state.maze.get(x, y - 1).solid == true) {
                    options.push([x, y]);
                }
            });
            shuffle(options);
            for (let i = 0; i < options.length && i < SHOP_COUNT; i++) {
                state.items.push(
                    new DoorItem([options[i][0] + 0.5, options[i][1] + 0.1])
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
                if (v.solid == false) {
                    options.push([x, y]);
                }
            });
            shuffle(options);
            for (let i = 0; i < options.length && i < BAT_COUNT; i++) {
                state.items.push(
                    new BatItem([options[i][0] + 0.25 + 0.5 * Math.random(), options[i][1] + 0.25 + 0.5 * Math.random()], 0.1 + Math.random()*0.2)
                );
            }

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


    if (keyPressed(ControlKey.DEBUG)) {
        state.mode = state.mode == "spotlight" ? "walk" : "spotlight";
    }

}