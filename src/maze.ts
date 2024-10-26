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
    let a: T;
    let b: T
    while ((cur = options.pop()) != undefined) {
        if (cur[0] % 2 == 1) {
            // vertical
            a = arr.get(cur[0], cur[1] - 1);
            b = arr.get(cur[0], cur[1] + 1);
        } else {
            // horizontal
            a = arr.get(cur[0] - 1, cur[1]);
            b = arr.get(cur[0] + 1, cur[1]);
        }

        if (!a.solid && !b.solid && a.room != b.room) {
            arr.get(cur[0], cur[1]).solid = false;
            const replace = Math.min(a.room, b.room);
            const replaceWith = Math.max(a.room, b.room)
            arr.forEach((x, y, v) => {
                if (v.room == replace) {
                    v.room = replaceWith;
                }
            });
        }

        yield;
    }

    console.log("Done");

}