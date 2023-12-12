import * as fs from "fs";
import { sum, intersection } from 'lodash';
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = number[][][];

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return input.map(row => row.split(':')[1].split('|').map(p => p.split(' ').filter(x => x !== '').map(x => parseInt(x))));
}

function score(card: number[][]) {
    let k = intersection(card[0], card[1]).length;
    return k === 0 ? 0 : Math.pow(2, k - 1);
}

function part1Solver(input: PbInput) {
    return sum(input.map(card => score(card)));
}

function part2Solver(input: PbInput) {
    let scores = input.map(card => intersection(card[0], card[1]).length);
    let count = scores.map(_ => 1n);
    for (let i = 0; i < count.length; i++) {
        for (let j = i + 1; j < Math.min(i + 1 + scores[i], count.length); j++) {
            count[j] += count[i];
        }
    }
    return sum(count);
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
