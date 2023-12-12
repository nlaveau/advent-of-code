import * as fs from "fs";
import { min } from 'lodash';
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

interface PbInput {
    seeds: number[];
    maps: number[][][];
};

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    let seeds = input[0].split(': ')[1].split(' ').filter(x => x !== ' ').map(x => parseInt(x));

    let maps: number[][][] = [];
    let currentMap: number[][] | null = null;

    for (let j = 3; j < input.length; j++) {
        let m = /(\d+) (\d+) (\d+)/.exec(input[j]);
        if (m !== null) {
            if (currentMap === null) {
                currentMap = [];
            }
            currentMap.push([m[1], m[2], m[3]].map(x => parseInt(x)));
        }
        else {
            if (currentMap !== null) {
                maps.push(currentMap);
            }
            currentMap = null;
        }
    }
    if (currentMap !== null) {
        maps.push(currentMap);
    }

    return {
        seeds,
        maps
    };
}

function pushThroughMap(v: number, m: number[][]) {
    for (let i = 0; i < m.length; i++) {
        if (v >= m[i][0] && v < m[i][1]) {
            return v + m[i][2];
        }
    }
    throw 'wtf';
}

function pushThroughMaps(v: number, maps: number[][][]) {
    let res = v;
    for (let i = 0; i < maps.length; i++) {
        res = pushThroughMap(res, maps[i]);
    }
    return res;
}

function convertMaps(maps: number[][][]) {
    return maps.map(m => m.map(r => [r[1], r[1] + r[2], r[0] - r[1]]));
}

function completeMap(m: number[][]) {
    let ms = m.sort((r1, r2) => r1[0] - r2[0]);

    if (ms[0][0] > 0) {
        ms.unshift([0, ms[0][0], 0]);
    }

    for (let i = 0; i < ms.length - 1; i++) {
        if (ms[i][1] < ms[i + 1][0]) {
            ms.splice(i + 1, 0, [ms[i][1], ms[i + 1][0], 0]);
        }
    }
    if (ms[ms.length - 1][1] < Number.MAX_SAFE_INTEGER) {
        ms.push([ms[ms.length - 1][1], Number.MAX_SAFE_INTEGER, 0]);
    }
    return ms;
}

function intersectByMap(interval: number[], m: number[][]) {
    let currentMin = interval[0];
    let res: number[][] = [];
    let ii = 0;
    while (m[ii][1] <= currentMin) ii++;
    while (m[ii][1] <= interval[1]) {
        res.push([currentMin, m[ii][1]]);
        currentMin = m[ii][1];
        ii++;
    }
    res.push([currentMin, interval[1]]);
    return res;
}


function part1Solver(input: PbInput) {
    let maps = convertMaps(input.maps).map(m => completeMap(m));
    let final = input.seeds.map(s => pushThroughMaps(s, maps));
    return min(final);
}

function part2Solver(input: PbInput) {
    let maps = convertMaps(input.maps).map(m => completeMap(m));
    let intervals = [...Array(input.seeds.length / 2)].map((_, i) => [input.seeds[2 * i], input.seeds[2 * i] + input.seeds[2 * i + 1]]);
    maps.forEach(m => {
        intervals = intervals.flatMap(int => intersectByMap(int, m)).map(int => [pushThroughMap(int[0], m), pushThroughMap(int[1] - 1, m) + 1]);
    });
    return min(intervals.map(int => int[0]));

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
