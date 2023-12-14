import * as fs from "fs";
import { zip, sum } from "lodash";
import { Array2D } from "../../array2d";
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = Array2D<string>[];

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    let res: Array2D<string>[] = [];
    let cut: number = input.findIndex(line => line === "");
    while (cut >= 0) {
        res.push(new Array2D(input.slice(0, cut).map(row => row.split(""))));
        input = input.slice(cut + 1);
        cut = input.findIndex(line => line === "");
    }
    res.push(new Array2D(input.map(row => row.split(""))));

    return res;
}

function updateDiscrepancies(discreplancies: number[], line: string[], target: number) {
    let length = line.length;
    return discreplancies.map((count, i) => {
        if (count > target) return count;
        let reflectionLength = Math.min(i + 1, length - i - 1);
        let sliceLeft = line.slice(i + 1 - reflectionLength, i + 1);
        let sliceRight = line.slice(i + 1, i + 1 + reflectionLength).reverse();
        return count + sum(zip(sliceLeft, sliceRight).map(p => p[0] !== p[1] ? 1 : 0));
    })
}

function countGoodDiscrepancies(discreplancies: number[], target: number) {
    return sum(discreplancies.map((count, i) => count === target ? i + 1 : -1).filter(x => x > 0));
}

function findSymmetry(array: Array2D<string>, target: number) {
    let horzDisc = array.getRow(0).slice(1).map(_ => 0);
    let vertDisc = array.getColumn(0).slice(1).map(_ => 0);
    let size = array.getSize();

    for (let i = 0; i < size.x; i++) {
        let column = array.getColumn(i);
        vertDisc = updateDiscrepancies(vertDisc, column, target);
    }
    for (let j = 0; j < size.y; j++) {
        let column = array.getRow(j);
        horzDisc = updateDiscrepancies(horzDisc, column, target);
    }
    return countGoodDiscrepancies(vertDisc, target) * 100 + countGoodDiscrepancies(horzDisc, target);
}

function part1Solver(input: PbInput) {
    return sum(input.map(map => findSymmetry(map, 0)));
}

function part2Solver(input: PbInput) {
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
