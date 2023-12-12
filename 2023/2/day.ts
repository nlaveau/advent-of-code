import * as fs from "fs";
import { sum, max } from 'lodash';
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

    return input.map((line) => line.split(":")[1].split(";").map(strToRound));
}

function strToRound(str: string): number[] {
    let res = [0, 0, 0];

    [/(\d+) red/, /(\d+) green/, /(\d+) blue/].forEach((p, i) => {
        let m = p.exec(str);
        if (m) {
            res[i] = parseInt(m[1]);
        }
    });

    return res;
}

const LIMIT_PART1 = [12, 13, 14];

function part1Solver(input: PbInput): any {
    return sum(input.map((game, index) => {
        if (game.every(round => round.every((v, i) => v <= LIMIT_PART1[i]))) {
            return index + 1;
        }
        else {
            return 0;
        }
    }));

}

function part2Solver(input: PbInput): any {
    return sum(input.map(game => [0, 1, 2].map(i => max(game.map(r => r[i])) ?? 0)).map(game => game[0] * game[1] * game[2]));
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
