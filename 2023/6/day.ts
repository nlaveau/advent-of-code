import * as fs from "fs";
import { zip } from 'lodash';
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

interface Race {
    time: number,
    distance: number
}

type PbInput = Race[];

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    let times = input[0].split(':')[1].split(' ').filter(x => x !== '').map(x => parseInt(x));
    let distances = input[1].split(':')[1].split(' ').filter(x => x !== '').map(x => parseInt(x));
    return zip(times, distances).map(t => ({ time: t[0] ?? 0, distance: t[1] ?? 0 }));
}

// (T-n)*n > k => 0 > k - Tn + n2
// ax2 + bx + c | b2 - 4ac => T^2 - k
// ]ceil((T - sqrt(delta))/2) | floor((T + sqrt(delta))/2)[

function solve_race(race: Race) {
    const det = race.time * race.time - 4 * race.distance;
    if (det < 0) return 0;
    if (det === 0) return 0; // you can match the distance but cannot beat it
    let mfloat = (race.time - Math.sqrt(det)) / 2;
    let Mfloat = (race.time + Math.sqrt(det)) / 2;
    let m = mfloat === Math.ceil(mfloat) ? Math.ceil(mfloat) + 1 : Math.ceil(mfloat);
    let M = Mfloat === Math.floor(Mfloat) ? Math.floor(Mfloat) - 1 : Math.floor(Mfloat);
    return M - m + 1;
}

function part1Solver(input: PbInput) {
    let ways = input.map(race => solve_race(race));
    return ways.reduce((acc, n) => acc * n, 1);

}

function part2Solver(input: PbInput) {
    let actual_race = {
        time: parseInt(input.map(r => r.time.toString()).join('')),
        distance: parseInt(input.map(r => r.distance.toString()).join('')),
    }
    return solve_race(actual_race);

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
