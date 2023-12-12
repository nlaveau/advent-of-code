import * as fs from "fs";
import { sum } from "lodash";
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

type State = 'SYMBOL_OR_DOT' | 'VALID_NUMBER' | 'QUESTIONABLE_NUMBER';

function isSymbol(str: string) {
    return str !== '.' && isNaN(parseInt(str));
}

interface SymbolWithLocation {
    x: number;
    y: number;
    s: string;
}

class NumberWithLocation {
    public neighbours: number = 0;

    public constructor(public x: number, public y: number, public n: string) { };

    isCloseFromSymbol(swl: SymbolWithLocation) {
        if (swl.y < this.y - 1 || swl.y > this.y + 1) return false;
        if (swl.x < this.x - 1 || swl.x > this.x + this.n.length) return false;
        return true;
    }
}


function getNumbersWithLocation(input: PbInput) {
    let numbers: NumberWithLocation[][] = [];

    return input.map((line, j) => {
        let numbersWithLocationForLine: NumberWithLocation[] = [];
        let currentNumberWithLocation: NumberWithLocation | null = null;
        for (let i = 0; i < line.length; i++) {
            let x = parseInt(line[i]);
            if (!isNaN(x)) {
                if (currentNumberWithLocation === null) {
                    currentNumberWithLocation = new NumberWithLocation(i, j, line[i]);
                }
                else {
                    currentNumberWithLocation.n = currentNumberWithLocation.n + line[i];
                }
            }
            else {
                if (currentNumberWithLocation !== null) {
                    numbersWithLocationForLine.push(currentNumberWithLocation);
                    currentNumberWithLocation = null;
                }
            }
        }
        if (currentNumberWithLocation !== null) {
            numbersWithLocationForLine.push(currentNumberWithLocation);
        }
        return numbersWithLocationForLine;
    });
}

function getSymbolsWithLocation(input: PbInput) {

    return input.map((line, j) => line.map((c, i) => ({ x: i, y: j, s: c })).filter(swl => isSymbol(swl.s)));
}


function part1Solver(input: PbInput) {
    let numbers = getNumbersWithLocation(input);
    let symbols = getSymbolsWithLocation(input);
    let total = 0;

    for (let n = 0; n < symbols.length; n++) {
        for (let m = 0; m < symbols[n].length; m++) {
            let neighbours: number[] = [];
            numbers[n].forEach(num => {
                if (num.isCloseFromSymbol(symbols[n][m])) {
                    neighbours.push(parseInt(num.n));
                }
            });
            if (n > 0) {
                numbers[n - 1].forEach(num => {
                    if (num.isCloseFromSymbol(symbols[n][m])) {
                        neighbours.push(parseInt(num.n));
                    }
                });
            }
            if (n < symbols.length - 1) {
                numbers[n + 1].forEach(num => {
                    if (num.isCloseFromSymbol(symbols[n][m])) {
                        neighbours.push(parseInt(num.n));
                    }
                });
            }
            total += sum(neighbours);
        }
    }

    return total;
}

function part2Solver(input: PbInput) {
    let numbers = getNumbersWithLocation(input);
    let symbols = getSymbolsWithLocation(input);
    let total = 0;

    for (let n = 0; n < symbols.length; n++) {
        for (let m = 0; m < symbols[n].length; m++) {
            if (symbols[n][m].s === '*') {
                let neighbours: number[] = [];
                numbers[n].forEach(num => {
                    if (num.isCloseFromSymbol(symbols[n][m])) {
                        neighbours.push(parseInt(num.n));
                    }
                });
                if (n > 0) {
                    numbers[n - 1].forEach(num => {
                        if (num.isCloseFromSymbol(symbols[n][m])) {
                            neighbours.push(parseInt(num.n));
                        }
                    });
                }
                if (n < symbols.length - 1) {
                    numbers[n + 1].forEach(num => {
                        if (num.isCloseFromSymbol(symbols[n][m])) {
                            neighbours.push(parseInt(num.n));
                        }
                    });
                }
                if (neighbours.length > 1) total += neighbours[0] * neighbours[1];
            }
        }
    }

    return total;

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
