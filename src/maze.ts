import { Arr2 } from "./arr2";
import { shuffle } from "./util";

type XY = [number, number];

type RoomTile = {
    solid: boolean,
    room: number
}

export function* mazeGenerator<T extends RoomTile>(arr: Arr2<T>): Iterator<void, void> {

    const options: XY[] = [];
    let room = 0;

    // init
    arr.forEach((x, y, v) => {
        if (x == 0 || y == 0 || x == arr.width - 1 || y == arr.height - 1) {
            // border
            v.solid = true;
        } else if (x % 2 == 1 && y % 2 == 1) {
            // open tiles
            v.solid = false;
            v.room = room++;
        } else if (x % 2 == 1 || y % 2 == 1) {
            // joining tiles
            v.solid = true;
            options.push([x, y]);
        }
    });

    yield;

    // shufffe options
    shuffle(options);

    yield;

    let cur: XY | undefined;
    while ((cur = options.pop()) != undefined) {
        if (cur[0] % 2 == 1) {
            // vertical
            const up = arr.get(cur[0], cur[1] - 1);
            const down = arr.get(cur[0], cur[1] + 1);
            if (!up.solid && !down.solid && up.room != down.room) {
                arr.get(cur[0], cur[1]).solid = false;
                const replace = Math.min(up.room, down.room);
                const replaceWith = Math.max(up.room, down.room)
                arr.forEach((x, y, v) => {
                    if (v.room == replace) {
                        v.room = replaceWith;
                    }
                });
            }
        } else if (cur[1] % 2 == 1) {
            // horizontal
            const left = arr.get(cur[0]-1, cur[1] );
            const right = arr.get(cur[0]+1, cur[1] );
            if (!left.solid && !right.solid && left.room != right.room) {
                arr.get(cur[0], cur[1]).solid = false;
                const replace = Math.min(left.room, right.room);
                const replaceWith = Math.max(left.room, right.room)
                arr.forEach((x, y, v) => {
                    if (v.room == replace) {
                        v.room = replaceWith;
                    }
                });
            }
        }
        yield;
    }

    console.log("Done");

}