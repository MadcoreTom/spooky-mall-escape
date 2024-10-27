import { Arr2 } from "./arr2"
import { BatItem, Item, StaticItem } from "./item";
import { mazeGenerator } from "./maze";

export type XY = [number, number];


export type State = {
    maze: Arr2<{ solid: boolean, room: number, distance: number, mainPath:boolean }>,
    generator: Iterator<void, void>,
    pos: XY,
    walkFrame: number,
    walkTimer: number,
    mode: "walk" | "spotlight" | "dead",
    mousePos: XY,
    items: Item[],
    shopsGenerated: boolean,
    health: number,
    spotItem?: {
        pos: XY,
        id: number,
        scene: number,
        item:number
    },
    clickPos?: XY
    keys:number
};

export function initState(): State {
    const maze = new Arr2(25, 7, { solid: true, room: -1, distance: -1, mainPath:false });

    maze.fill(() => ({ solid: true, room: -1, distance: -1, mainPath:false }));
    return {
        maze,
        generator: mazeGenerator(maze),
        pos: [-10,-10],
        walkFrame: 0,
        walkTimer: 0,
        mode: "walk",
        mousePos: [100, 100],
        items: [],
        shopsGenerated: false,
        health: 3,
        keys: 0
    }
}