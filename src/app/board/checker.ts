export class Checker {
    position: {
        row: number,
        col: number
    };
    ownedBy: string;

    constructor(position: { row: number, col: number }, ownedBy: string) {
        this.position = position;
        this.ownedBy = ownedBy;

    }
}