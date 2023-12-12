import * as fs from "fs";
import { dayRunner } from "../../dayRunner";
import { sum } from "lodash";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test2.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = string[][];

function findFirstDigit(str: string) {
    let s = str;
    const patterns = [
        /^one/,
        /^two/,
        /^three/,
        /^four/,
        /^five/,
        /^six/,
        /^seven/,
        /^eight/,
        /^nine/,
    ];
    while (s.length > 0) {
        if (!isNaN(parseInt(s[0]))) {
            return parseInt(s[0]);
        }
        for (let i = 0; i < patterns.length; i++) {
            if (s.match(patterns[i])) return i + 1;
        }
        s = s.substring(1);
    }
    return NaN;
}

function findLastDigit(str: string) {
    let s = str;
    const patterns = [
        /one$/,
        /two$/,
        /three$/,
        /four$/,
        /five$/,
        /six$/,
        /seven$/,
        /eight$/,
        /nine$/,
    ];

    while (s.length > 0) {
        if (!isNaN(parseInt(s[s.length - 1]))) {
            return parseInt(s[s.length - 1]);
        }
        for (let i = 0; i < patterns.length; i++) {
            if (s.match(patterns[i])) return i + 1;
        }
        s = s.substring(0, s.length - 1);
    }
    return NaN;
}

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n");
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return input.map((line) => line.split(""));
}

function part1Solver(dataTest: PbInput): number {
    let numbers = dataTest
        .map((row) => row.filter((c) => !isNaN(parseInt(c))))
        .map((row) => parseInt(row[0]) * 10 + parseInt(row[row.length - 1]));
    return sum(numbers);
}

function part2Solver(dataTest: PbInput): number {
    let numbers = dataTest
        .map((row) => row.join(""))
        .map((row) => findFirstDigit(row) * 10 + findLastDigit(row));
    return sum(numbers);
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
