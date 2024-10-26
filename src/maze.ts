import { Arr2 } from "./arr2";

type XY = [number, number];

export function* mazeGenerator<T>(arr: Arr2<T>, isSolid: (val: T) => boolean, setValue: (solid:boolean,val: T) => T): Iterator<void, void> {

    const options: XY[] = [];

    arr.forEach((x, y, v) => {
        if (x % 2 == 1 && y % 2 == 1) {
            arr.set(x,y,setValue(true,v));
            options.push([x,y]);
        }
    });

    console.log(options)

    yield;

console.log("Done");

}