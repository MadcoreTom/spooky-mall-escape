import { Arr2 } from "./arr2";
import { XY } from "./state";
import { shuffle } from "./util";

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

/**
 * 
 * @param arr Calculates distance from the start
 * @returns the farthest tile
 */
export function calcDistance<T extends { solid: boolean, distance: number }>(arr: Arr2<T>, start:XY) :XY{
    // reset
    const BIG_NUMBER = 999;
    arr.forEach((x, y, v) => v.distance = v.solid ? -1 : BIG_NUMBER);

    const queue = [start];

    let farthest : XY = start;
    let cur:XY | undefined;
    while((cur = queue.shift()) != undefined){
        const neighbours = [
            arr.get(cur[0],cur[1]-1),
            arr.get(cur[0],cur[1]+1),
            arr.get(cur[0]-1,cur[1]),
            arr.get(cur[0]+1,cur[1])
        ]
        // calc distance
        if(cur == start){
            arr.get(cur[0],cur[1]).distance =0;
        } else {
            arr.get(cur[0],cur[1]).distance = 1+ Math.min(...neighbours.map(a=>a.distance).filter(a=>a >= 0));
            console.log("d",arr.get(cur[0],cur[1]).distance)
        }
        // add neighbours without distance
        if(neighbours[0].distance == BIG_NUMBER){
            queue.push([cur[0],cur[1]-1]);
        }
        if(neighbours[1].distance == BIG_NUMBER){
            queue.push([cur[0],cur[1]+1]);
        }
        if(neighbours[2].distance == BIG_NUMBER){
            queue.push([cur[0]-1,cur[1]]);
        }
        if(neighbours[3].distance == BIG_NUMBER){
            queue.push([cur[0]+1,cur[1]]);
        }
        console.log(queue.length);
        farthest = cur;
    }
    return farthest;
}
