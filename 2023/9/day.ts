import * as fs from "fs";
import { sum, zip } from "lodash";
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = number[][];

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n");
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return input.map((line) => line.split(" ").map((x) => parseInt(x)));
}

function derive(series: number[]) {
    return zip(series.slice(1), series.slice(0, series.length - 1)).map(
        (p) => (p[0] ?? 0) - (p[1] ?? 0),
    );
}

function findOneNext(series: number[]) {
    let derivatives = [series];
    while (derivatives[0].some((x) => x !== 0)) {
        derivatives.unshift(derive(derivatives[0]));
    }
    let res = 0;
    for (let i = 1; i < derivatives.length; i++) {
        let d = derivatives[i];
        res = d[d.length - 1] + res;
    }
    return res;
}

function findOnePrev(series: number[]) {
    let derivatives = [series];
    while (derivatives[0].some((x) => x !== 0)) {
        derivatives.unshift(derive(derivatives[0]));
    }
    let res = 0;
    for (let i = 1; i < derivatives.length; i++) {
        let d = derivatives[i];
        res = d[0] - res;
    }
    return res;
}

function part1Solver(input: PbInput): number {
    return sum(input.map((series) => findOneNext(series)));
}

function part2Solver(input: PbInput): any {
    return sum(input.map((series) => findOnePrev(series)));
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
