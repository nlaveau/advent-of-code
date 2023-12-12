import * as fs from "fs";
import { uniqBy } from "lodash";
import { dayRunner } from "../../dayRunner";
import { Array2D, Pos2D } from "../../array2d";

const testFilesPart1 = ["./test.txt", "./test2.txt"];
const testFilesPart2 = [
    "./test.txt",
    "./test3.txt",
    "./test4.txt",
    "./test5.txt",
    "./test6.txt",
];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = Array2D<string>;

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n");
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return new Array2D(input.map((line) => line.split("")));
}

const UP = new Pos2D(0, -1);
const DOWN = new Pos2D(0, 1);
const RIGHT = new Pos2D(1, 0);
const LEFT = new Pos2D(-1, 0);

const DIRS_BY_SYMBOLS = new Map([
    ["J", [UP, LEFT]],
    ["L", [UP, RIGHT]],
    ["7", [DOWN, LEFT]],
    ["F", [DOWN, RIGHT]],
    ["|", [UP, DOWN]],
    ["-", [LEFT, RIGHT]],
]);

const EMPTY_SPACE = " ";

function getNeighbours(input: PbInput, p: Pos2D) {
    let dirs = DIRS_BY_SYMBOLS.get(input.get(p));
    if (dirs === undefined) return [];
    return dirs.map((d) => p.plus(d)).filter((pp) => input.isInside(pp));
}

function getLoop(input: PbInput) {
    let start = input.findIndex((x) => x === "S") ?? new Pos2D(0, 0);
    let loop = [start];
    let dirs = [UP, DOWN, RIGHT, LEFT];

    let goodDirs = dirs.filter((dir) => {
        let n = start.plus(dir);
        if (!input.isInside(n)) return false;
        let nn = getNeighbours(input, n);
        return nn.some((p) => p.equals(start));
    });
    let next = goodDirs.map((dir) => dir.plus(start))[0];

    while (!next.equals(start)) {
        loop.push(next);
        let neighbours = getNeighbours(input, next);
        next = neighbours.filter((n) => !loop[loop.length - 2].equals(n))[0];
    }
    return loop;
}

function cleanNotLoop(input: PbInput, loop: Pos2D[]) {
    return input.map((v, p) =>
        loop.some((l) => l.equals(p)) ? v : EMPTY_SPACE,
    );
}

// we assume here (see later) that the inside of the loop is our on right
function getInsiders(
    input: PbInput,
    previous: Pos2D,
    current: Pos2D,
    next: Pos2D,
) {
    switch (input.get(current)) {
        case "|":
            return [
                current.plus(next.minus(current).equals(UP) ? RIGHT : LEFT),
            ];
        case "-":
            return [
                current.plus(next.minus(current).equals(RIGHT) ? DOWN : UP),
            ];
        case "F":
            return next.minus(current).equals(RIGHT)
                ? []
                : [current.plus(UP), current.plus(LEFT)];
        case "7":
            return next.minus(current).equals(LEFT)
                ? [current.plus(UP), current.plus(RIGHT)]
                : [];
        case "J":
            return next.minus(current).equals(LEFT)
                ? []
                : [current.plus(DOWN), current.plus(RIGHT)];
        case "L":
            return next.minus(current).equals(RIGHT)
                ? [current.plus(DOWN), current.plus(LEFT)]
                : [];
        case "S": {
            if (next.minus(current).equals(RIGHT)) {
                if (previous.minus(next).equals(UP))
                    return [current.plus(DOWN), current.plus(LEFT)]; // L
                else return []; // F
            } else if (next.minus(current).equals(LEFT)) {
                if (previous.minus(current).equals(DOWN))
                    return [current.plus(UP), current.plus(RIGHT)]; // 7
                else return []; // J
            } else if (next.minus(current).equals(UP)) {
                if (previous.minus(current).equals(LEFT))
                    return [current.plus(DOWN), current.plus(RIGHT)]; // J
                else return []; // L
            } else {
                if (previous.minus(current).equals(RIGHT))
                    return [current.plus(UP), current.plus(LEFT)]; // F
                else return []; // 7
            }
        }
        default:
            throw "Invalid loop point " + current;
    }
}

function part1Solver(input: PbInput): number {
    return getLoop(input).length / 2;
}

function part2Solver(input: PbInput): any {
    let loop = getLoop(input);
    let cleanInput = cleanNotLoop(input, loop);
    //cleanInput.asLoggable().forEach((l) => console.log(l));
    let tlCorner =
        cleanInput.findIndex((x) => x !== EMPTY_SPACE) || new Pos2D(-1, -1);
    let tlCornerIndexInLoop = loop.findIndex((p) => p.equals(tlCorner));
    let nextTLCornerIndexInLoop =
        tlCornerIndexInLoop === loop.length - 1 ? 0 : tlCornerIndexInLoop + 1;

    // this is to make sure that we have the inside on our right when traveling the pipe
    if (loop[nextTLCornerIndexInLoop].minus(tlCorner).equals(DOWN)) {
        loop = loop.reverse();
    }
    let insiders = uniqBy(
        loop
            .flatMap((p, i, l) => {
                let ins = getInsiders(
                    cleanInput,
                    l[i > 0 ? i - 1 : l.length - 1],
                    p,
                    l[i < l.length - 1 ? i + 1 : 0],
                );
                return ins;
            })
            .filter((q) => cleanInput.get(q) === EMPTY_SPACE),
        (p) => p.toString(),
    );
    //console.log(insiders);
    let res: Pos2D[] = [];
    while (insiders.length > 0) {
        let p = insiders.pop();
        if (p !== undefined) {
            insiders = insiders.concat(
                cleanInput
                    .neighbourhood4(p)
                    .filter((q) => cleanInput.get(q) === EMPTY_SPACE)
                    .filter((q) =>
                        res.concat(insiders).every((r) => !r.equals(q)),
                    ),
            );
            res.push(p);
        }
    }
    //let markedOutput = cleanInput.map((v, p) =>
    //    res.findIndex((q) => p.equals(q)) !== -1 ? "o" : v,
    //);
    //markedOutput.asLoggable().forEach((line) => console.log(line));
    return res.length;
}

dayRunner(
    {
        id: 1,
        testFiles: testFilesPart1,
        inputFile: inputFilePart1,
        reader: readInput,
        solver: part1Solver,
    },
    testOnly,
    false,
);

dayRunner(
    {
        id: 2,
        testFiles: testFilesPart2,
        inputFile: inputFilePart2,
        reader: readInput,
        solver: part2Solver,
    },
    testOnly,
    false,
);
