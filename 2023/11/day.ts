import * as fs from "fs";
import { Array2D, Pos2D } from "../../array2d";
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = string[][];

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n");
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return input.map((line) => line.split(""));
}

function expandMap(input: PbInput): Array2D<string> {
    let vExpand = input.flatMap((line) =>
        line.every((c) => c === ".") ? [line, line] : [line],
    );
    let hExpandNeeded = vExpand[0].flatMap((_, x) =>
        vExpand.every((line) => line[x] === "."),
    );
    return new Array2D(
        vExpand.map((line) =>
            line.flatMap((v, i) => (hExpandNeeded[i] ? [v, v] : [v])),
        ),
    );
}

interface Distortion {
    horizontal: boolean[];
    vertical: boolean[];
}

function computeDistortion(input: PbInput): Distortion {
    return {
        horizontal: input[0].map((_, x) =>
            input.every((line) => line[x] === "."),
        ),
        vertical: input.map((line) => line.every((c) => c === ".")),
    };
}

function distort(pos: Pos2D, factor: number, distortion: Distortion) {
    return new Pos2D(
        pos.x +
            (factor - 1) *
                distortion.horizontal.slice(0, pos.x).filter((x) => x).length,
        pos.y +
            (factor - 1) *
                distortion.vertical.slice(0, pos.y).filter((x) => x).length,
    );
}

function part1Solver(input: PbInput) {
    let map = expandMap(input);
    let galaxies = map.findIndexAll((c) => c === "#");
    let res = 0;
    for (let i = 0; i < galaxies.length; i++) {
        for (let j = i + 1; j < galaxies.length; j++) {
            res += galaxies[i].minus(galaxies[j]).l1norm();
        }
    }
    return res;
}

const FACTOR = 1000000;

function part2Solver(input: PbInput) {
    let distortion = computeDistortion(input);
    let map = new Array2D<string>(input);
    let galaxies = map
        .findIndexAll((c) => c === "#")
        .map((p) => distort(p, FACTOR, distortion));
    let res = 0;
    for (let i = 0; i < galaxies.length; i++) {
        for (let j = i + 1; j < galaxies.length; j++) {
            res += galaxies[i].minus(galaxies[j]).l1norm();
        }
    }
    return res;
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
