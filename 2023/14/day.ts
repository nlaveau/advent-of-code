import * as fs from "fs";
import { findValueFromCycle } from "../../cycle";
import { Array2D } from "../../array2d";
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = string[][];

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return input.map((line) => line.split(""));
}

function fall(line: string[], dir: number) {
    return line.join('').split('#').map(chunk => chunk.split('').sort((a, b) => a.localeCompare(b) * dir).join('')).join('#').split('');
}

function TiltNS(array: Array2D<string>, dir: number) {
    return array.mapColumn(c => fall(c, dir));
}

function tiltWE(array: Array2D<string>, dir: number) {
    return array.mapRow(c => fall(c, dir));
}

function iterator2(array: Array2D<string>) {
    return tiltWE(TiltNS(tiltWE(TiltNS(array, -1), -1), 1), 1);
}

function countRocks2(array: Array2D<string>) {
    return array.map((c, p) => c === 'O' ? array.getSize().y - p.y : 0).sum();
}

function part1Solver(input: PbInput) {
    return countRocks2(TiltNS(new Array2D(input), -1));
}

function part2Solver(input: PbInput): any {
    let state = new Array2D(input);
    return findValueFromCycle(state, iterator2, 1000000000, state => ({ key: state.asLoggable().join(''), value: countRocks2(state) }));
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
