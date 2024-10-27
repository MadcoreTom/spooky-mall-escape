import { Arr2 } from "./arr2"
import { BatItem, Item, StaticItem } from "./item";
import { mazeGenerator } from "./maze";

export type XY = [number, number];


export type State = {
    maze: Arr2<{ solid: boolean, room: number }>,
    generator: Iterator<void, void>,
    pos: XY,
    walkFrame: number,
    walkTimer: number,
    mode: "walk" | "spotlight",
    mousePos: XY,
    items: Item[],
    shopsGenerated:boolean
};

export function initState(): State {
    const maze = new Arr2(25, 7, { solid: true, room: -1 });

    maze.fill(() => ({ solid: true, room: -1 }));
    return {
        maze,
        generator: mazeGenerator(maze),
        pos: [1.5, 1.5],
        walkFrame: 0,
        walkTimer: 0,
        mode: "walk",
        mousePos: [100, 100],
        items: [
            new StaticItem([1.5, 1.5], 1),
            new StaticItem([3.5, 3.5], 4),
            new BatItem([1.5, 3.5], 0.25)
        ],
        shopsGenerated:false
    }
}