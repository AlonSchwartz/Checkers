import { Checker } from "./checker";

export class Square {

    readonly playable: boolean;
    private readonly id: string;
    haveChecker: boolean = false;
    checker?: Checker;
    possibleMove: boolean = false;

    constructor(playable: boolean, id: string, haveChecker?: boolean, checker?: Checker) {
        this.playable = playable;
        this.id = id;
        if (haveChecker && checker) {
            this.haveChecker = haveChecker;
            this.checker = checker;
        }
    }
}