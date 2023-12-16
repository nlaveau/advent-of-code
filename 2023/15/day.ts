import * as fs from "fs";
import { sum } from "lodash";
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test2.txt", "./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = string[];

interface Lens {
    focal: number;
    label: string;
}

interface Operation {
    opcode: "=" | "-";
    focal: number;
    label: string;
}

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return input[0].split(",");
}

function hash(str: string, init: number) {
    let res = init;
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        res += c;
        res *= 17;
    }
    return res & 255;
}

function getOperation(instr: string): Operation {
    if (instr.endsWith("-")) {
        return { opcode: "-", label: instr.substring(0, instr.length - 1), focal: -1 }
    } else {
        let sp = instr.split("=")
        return { opcode: "=", label: sp[0], focal: parseInt(sp[1]) };
    }
}

function getBoxIndex(op: Operation) {
    return hash(op.label, 0);
}

function applyOp(boxes: Lens[][], op: Operation) {
    let boxIndex = getBoxIndex(op);
    if (op.opcode === "-") {
        boxes[boxIndex] = boxes[boxIndex].filter(l => l.label !== op.label);
    } else {
        let lensIndex = boxes[boxIndex].findIndex(l => l.label === op.label);
        if (lensIndex !== -1) {
            boxes[boxIndex][lensIndex].focal = op.focal;
        } else {
            boxes[boxIndex].push({ label: op.label, focal: op.focal });
        }
    }
    return boxes;
}

function focusingPower(boxes: Lens[][]) {
    return sum(boxes.flatMap((box, boxIndex) => box.map((lens, lensIndex) => (boxIndex + 1) * (lensIndex + 1) * lens.focal)));
}

function part1Solver(input: PbInput) {
    return sum(input.map((v) => hash(v, 0)));
}

function part2Solver(input: PbInput) {
    let boxes: Lens[][] = [...Array(256)].map(_ => []);
    return focusingPower(input.reduce((b, instr) => applyOp(b, getOperation(instr)), boxes));
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
