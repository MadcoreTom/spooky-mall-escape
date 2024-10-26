import { Arr2 } from "./arr2"
import { mazeGenerator } from "./maze";

export type State = {
    maze: Arr2<boolean>,
    generator: Iterator<void, void>,
};

export function initState(): State {
    const maze = new Arr2(25, 7, false);
    // maze.fill(() => Math.random() > 0.5);
    return {
        maze,
        generator: mazeGenerator(maze, v => v, v => v)
    }
}