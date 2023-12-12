import * as fs from "fs";
import { dayRunner } from "../../dayRunner";
import { lcm } from "../../prime";

const testFilesPart1 = ["./test.txt", "./test2.txt"];
const testFilesPart2 = ["./test3.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = {
    dirs: number[];
    edges: Map<string, string[]>;
};

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n");
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    const dirs = input[0].split("").map((c) => (c === "R" ? 1 : 0));
    input = input.slice(2);
    const edges = new Map(
        input.map((line) => {
            let s = line.replace(/[()]/g, "").split(" = ");
            let p = s[1].split(", ");
            return [s[0], [p[0], p[1]]];
        }),
    );

    return { dirs, edges };
}

function doStep(node: string, dir: number, input: PbInput) {
    let n = input.edges.get(node);
    if (n === undefined)
        throw "Not able to find the next node, probably a parsing bug";
    return n[dir];
}

function doRun(node: string, input: PbInput) {
    return input.dirs.reduce((n, v) => doStep(n, v, input), node);
}

function part1Solver(input: PbInput): any {
    let i = 0;
    let node = "AAA";
    do {
        i++;
        node = doRun(node, input);
    } while (node !== "ZZZ");
    return i * input.dirs.length;
}

function part2Solver(input: PbInput): any {
    let nodes = [...input.edges.keys()].filter((x) => x.endsWith("A"));
    console.log(nodes);
    let nodes2 = [...input.edges.keys()].filter((x) => x.endsWith("Z"));
    console.log(nodes2);
    let cycles = nodes.map((node) => {
        let i = 0;
        let n = node;
        do {
            i++;
            n = doRun(n, input);
        } while (!n.endsWith("Z"));
        return i;
    });

    return lcm(cycles) * input.dirs.length;
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
