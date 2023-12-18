import * as fs from "fs";
import { uniq, zip } from "lodash";
import { Direction, pos2dFromDirection } from "../../direction";
import { Array2D, Pos2D } from "../../array2d";
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

interface ColoredMove {
    dir: Direction;
    count: number;
    color: string;
}

type PbInput = ColoredMove[];

function UDLRtoDirection(udlr: string): Direction {
    switch (udlr) {
        case "U": return "^";
        case "D": return "v";
        case "L": return "<";
        case "R": return ">";
        default: throw `Unknown direction (${udlr})`;
    }
}

function hexToDirection(hex: string): Direction {
    switch (hex) {
        case "0": return ">";
        case "1": return "v";
        case "2": return "<";
        case "3": return "^";
        default: throw `Unknow direction (${hex})`;
    }
}

function parseColoredMove(line: string): ColoredMove {
    const pattern = /([UDLR]) (\d+) \((.*)\)/;

    let m = pattern.exec(line);
    if (m === null)
        throw `Unrecognized line (${line})`;
    else {
        return {
            dir: UDLRtoDirection(m[1]),
            count: parseInt(m[2]),
            color: m[3]
        }
    }
}

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return input.map((line) => parseColoredMove(line));
}

function moveToShape(moves: ColoredMove[]): Pos2D[] {
    return moves.reduce((arr, m) => arr.concat([arr[arr.length - 1].plus(pos2dFromDirection(m.dir).times(m.count))]), [new Pos2D(0, 0)]);
}

function countDugSquares(map: Array2D<string>) {
    return map.map(x => x === "#" ? 1 : 0).sum();
}

function moveToArray2D(moves: ColoredMove[]) {
    let shape = moveToShape(moves);
    let mins = shape.reduceRight((p1, p2) => new Pos2D(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y)));
    let maxs = shape.reduceRight((p1, p2) => new Pos2D(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y)));
    let shiftedShape = shape.map(s => s.minus(mins));
    let map = Array2D.fromSize(maxs.minus(mins).plus(new Pos2D(1, 1)), _ => ".");
    let s = shiftedShape[0];
    map.set(s, "#");
    for (let i = 0; i < moves.length; i++) {
        let step = pos2dFromDirection(moves[i].dir);
        for (let j = 0; j < moves[i].count; j++) {
            s = s.plus(step);
            map.set(s, "#");
        }
    }
    return map;
}

function fixColoredMove(move: ColoredMove): ColoredMove {
    return {
        dir: hexToDirection(move.color.substring(6)),
        count: Number(`0x${move.color.substring(1, 6)}`),
        color: ""
    }
}

function getInterestingYs(shape: Pos2D[]) {
    return uniq(shape.map(p => p.y)).sort((a, b) => a - b);
}

function lineSurface(y: number, edges: Pos2D[][]): bigint {
    let vEdges = edges
        .filter(e => (e[0].y != e[1].y)) // remove horizontal edges
        .filter(e => (e[0].y <= y && y <= e[1].y) || (e[1].y <= y && y <= e[0].y)) // capture edges that intersect the line
        .sort((a, b) => a[0].x - b[0].x);

    let res: bigint = BigInt(0);
    let isInside: Boolean = false;
    let prevInside = -1;

    for (let i = 0; i < vEdges.length; i++) {
        let x = vEdges[i][0].x;
        if (vEdges[i][0].y !== y && vEdges[i][1].y !== y) {
            if (isInside) {
                res += BigInt(x - prevInside);
                isInside = false;
            } else {
                res += BigInt(1);
                prevInside = x;
                isInside = true;
            }
        } else {
            if (isInside) {
                res += BigInt(vEdges[i + 1][0].x - prevInside);
            } else {
                res += BigInt(1 + vEdges[i + 1][0].x - x);
            }
            if ((vEdges[i][0].y - vEdges[i][1].y) * (vEdges[i + 1][0].y - vEdges[i + 1][1].y) > 0) {
                isInside = !isInside;
            }
            prevInside = vEdges[i + 1][0].x;
            i++;
        }
    }
    return res;
}


function surface(shape: Pos2D[]) {
    let edges = shape.slice(1).map((v, i) => [shape[i], v]);
    let ys = getInterestingYs(shape);

    let res: bigint = BigInt(0)
    for (let i = 0; i < ys.length; i++) {
        let y = ys[i];
        res += lineSurface(y, edges);
    }
    for (let i = 0; i < ys.length - 1; i++) {
        if (ys[i + 1] > ys[i] + 1) {
            res += BigInt(ys[i + 1] - ys[i] - 1) * lineSurface(ys[i] + 1, edges);
        }
    }
    return res;
}


function part1Solver(input: PbInput) {
    let map = moveToArray2D(input);
    let shape = moveToShape(input);
    return surface(shape);
}

// 1356344476277n
//  952408144115

function part2Solver(input: PbInput) {
    let moves = input.map(fixColoredMove);
    let shape = moveToShape(moves);
    return surface(shape);
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
