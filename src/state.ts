import { Arr2 } from "./arr2"

export type State = {
    maze: Arr2<boolean>
};

export function initState(): State {
    const maze = new Arr2(25, 7, false);
    maze.fill(() => Math.random() > 0.5);
    return {
        maze
    }
}