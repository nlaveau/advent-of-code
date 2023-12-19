import * as fs from "fs";
import { min } from "lodash";
import { Pos2D, Array2D } from "../../array2d";
import { dayRunner } from "../../dayRunner";
import { Direction, pos2dFromDirection } from "../../direction";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt", "./test2.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = Array2D<number>;

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return new Array2D(input.map((line) => line.split("").map(x => parseInt(x))));
}

class Pos2DCount extends Pos2D {
    constructor(p: Pos2D, public dir: Direction) {
        super(p.x, p.y);
    }
}


function computeDistanceAndPathArray(src: Pos2D, array: Array2D<number>, minStep: number, maxStep: number) {
    let init = new Pos2DCount(src, ">");
    let init2 = new Pos2DCount(src, "v");
    let current: Array2D<number | null>[] = [array.map(x => null), array.map(x => null)];
    current[0].set(src, 0);
    current[1].set(src, 0);
    let todo = [new Map<number, Pos2DCount[]>(), new Map<number, Pos2DCount[]>()];
    todo[0].set(0, [init]);
    todo[1].set(0, [init2]);

    while (todo[0].size > 0 || todo[1].size > 0) {
        let current_distance = min([...todo[0].keys(), ...todo[1].keys()]) || 0;
        let at_distance0 = todo[0].get(current_distance);
        let at_distance1 = todo[1].get(current_distance);
        let at_distance = (at_distance0 ?? []).concat(at_distance1 ?? []);
        if (at_distance0) todo[0].delete(current_distance);
        if (at_distance1) todo[1].delete(current_distance);

        at_distance?.forEach(p => {
            let direction: number;
            if (p.dir === "<" || p.dir === ">") direction = 0;
            else direction = 1;
            let nextDirs: Direction[] = direction ? ["<", ">"] : ["^", "v"];

            nextDirs.forEach(d => {
                let pq_distance = 0;
                for (let c = 1; c <= maxStep; c++) {
                    let qq = new Pos2DCount(p.plus(pos2dFromDirection(d).times(c)), d);
                    if (!array.isInside(qq)) return;
                    pq_distance += array.get(qq);
                    if (c >= minStep) {
                        let q_distance = pq_distance + current_distance;
                        let old_q_distance = current[direction].get(qq) ?? 0;
                        if (current[direction].get(qq) && old_q_distance > q_distance) {
                            todo[direction].set(old_q_distance, todo[direction].get(old_q_distance)?.filter(r => qq !== r) || []);
                        }
                        if (current[direction].get(qq) === null || old_q_distance > q_distance) {
                            current[direction].set(qq, q_distance);
                            todo[direction].set(q_distance, (todo[direction].get(q_distance) ?? []).concat([qq]));
                        }
                    }
                }
            });
        });
    }
    return current;
}

function findShortestPath2D(src: Pos2D, dst: Pos2D, array: Array2D<number>, minStep: number, maxStep: number) {
    let current = computeDistanceAndPathArray(src, array, minStep, maxStep);
    let x0 = current[0].get(dst) ?? 12345678;
    let x1 = current[1].get(dst) ?? 12345678;

    return Math.min(x0, x1);
}

function part1Solver(input: PbInput) {
    return findShortestPath2D(new Pos2D(0, 0), input.getSize().minus(new Pos2D(1, 1)), input, 1, 3);
}

function part2Solver(input: PbInput) {
    return findShortestPath2D(new Pos2D(0, 0), input.getSize().minus(new Pos2D(1, 1)), input, 4, 10);
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
