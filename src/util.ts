export function shuffle<T>(arr: T[]) {
    for (let i = 0; i < arr.length; i++) {
        const j = i + Math.floor(Math.random() * (arr.length - i));
        // swap
        [arr[j], arr[i]] = [arr[i], arr[j]];
    }
}