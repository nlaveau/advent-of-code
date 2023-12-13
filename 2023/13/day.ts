import * as fs from "fs";
import { zip, sum } from "lodash";
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = string[][][];

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    let res: string[][][] = [];
    let cut: number = input.findIndex(line => line === "");
    while (cut >= 0) {
        res.push(input.slice(0, cut).map(row => row.split("")));
        input = input.slice(cut + 1);
        cut = input.findIndex(line => line === "");
    }
    res.push(input.map(row => row.split("")));

    return res;
}

function findSymmetry(map: string[][], target: number) {
    let horizontal = map[0].map(_ => 0).slice(0, -1);
    let vertical = map.map(_ => 0).slice(0, -1);
    let w = map[0].length;
    let h = map.length;
    for (let j = 0; j < h; j++) {
        for (let i = 1; i < w; i++) {
            if (horizontal[i - 1] > target) continue;
            let len = Math.min(i, w - i);
            let sb = map[j].slice(i - len, i);
            let sa = map[j].slice(i, i + len).reverse();
            horizontal[i - 1] += sum(zip(sa, sb).map(p => p[0] !== p[1] ? 1 : 0));
        }
    }
    for (let i = 0; i < w; i++) {
        let column = map.map(row => row[i]);
        for (let j = 1; j < h; j++) {
            if (vertical[j - 1] > target) continue;
            let len = Math.min(j, h - j);
            let sb = column.slice(j - len, j);
            let sa = column.slice(j, j + len).reverse();
            vertical[j - 1] += sum(zip(sa, sb).map(p => p[0] !== p[1] ? 1 : 0));
        }
    }
    let hcount = sum(horizontal.map((b, x) => b === target ? x + 1 : -1).filter(x => x > 0));
    let vcount = sum(vertical.map((b, x) => b === target ? x + 1 : -1).filter(x => x > 0));
    return vcount * 100 + hcount;
}


function part1Solver(input: PbInput) {
    return sum(input.map(map => findSymmetry(map, 0)));
}

function part2Solver(input: PbInput): any {
    return sum(input.map(map => findSymmetry(map, 1)));
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
