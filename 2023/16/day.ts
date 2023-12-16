import * as fs from "fs";
import { max, uniqWith } from "lodash";
import { Array2D, Pos2D } from "../../array2d";
import { dayRunner } from "../../dayRunner";
import { Direction, pos2dFromDirection } from "../../direction";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

type PbInput = Array2D<string>;

function readInput(file: string): PbInput {
    let input = fs
        .readFileSync(file)
        .toString()
        .split("\n")
        .map((line) => line.replace("\r", ""));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return new Array2D(input.map((line) => line.split("")));
}

interface Beam {
    pos: Pos2D;
    dir: Direction;
}

function stepBeam(map: Array2D<string>, beam: Beam): Beam[] {
    let dirs: Direction[];

    switch (map.get(beam.pos)) {
        case ".":
            dirs = [beam.dir];
            break;
        case "-":
            dirs =
                beam.dir === "<" || beam.dir === ">" ? [beam.dir] : ["<", ">"];
            break;
        case "|":
            dirs =
                beam.dir === "^" || beam.dir === "v" ? [beam.dir] : ["^", "v"];
            break;
        case "/": {
            switch (beam.dir) {
                case ">":
                    dirs = ["^"];
                    break;
                case "^":
                    dirs = [">"];
                    break;
                case "<":
                    dirs = ["v"];
                    break;
                case "v":
                    dirs = ["<"];
                    break;
            }
            break;
        }
        case "\\": {
            switch (beam.dir) {
                case ">":
                    dirs = ["v"];
                    break;
                case "^":
                    dirs = ["<"];
                    break;
                case "<":
                    dirs = ["^"];
                    break;
                case "v":
                    dirs = [">"];
                    break;
            }
            break;
        }
        default:
            throw "Incorrect character on map";
    }
    return dirs
        .map((dir) => ({ dir, pos: beam.pos.plus(pos2dFromDirection(dir)) }))
        .filter((b) => map.isInside(b.pos));
}

function displayPath(map: Array2D<string>, beams: Beam[]) {
    let draw = map.map((x) => x);
    beams.forEach((b) => {
        switch (draw.get(b.pos)) {
            case ".":
                draw.set(b.pos, b.dir);
                break;
            case "<":
            case ">":
            case "^":
            case "v":
                draw.set(b.pos, "2");
                break;
            case "/":
            case "\\":
            case "-":
            case "|":
                break;
            default:
                throw "Lazy today";
        }
    });
    draw.asLoggable().forEach((l) => console.log(l));
}

function runBeam(map: Array2D<string>, startBeam: Beam) {
    let toProcess: Beam[] = [startBeam];
    let paths: Beam[] = [];

    while (toProcess.length > 0) {
        let beam = toProcess.pop();
        if (beam !== undefined) {
            paths.push(beam);
            let beams = stepBeam(map, beam).filter((b) =>
                paths.every((bb) => bb.dir !== b.dir || !bb.pos.equals(b.pos)),
            );
            toProcess = toProcess.concat(beams);
        }
    }
    let energized = uniqWith(
        paths.map((b) => b.pos),
        (a, b) => a.equals(b),
    );
    return energized.length;
}

function part1Solver(input: PbInput) {
    return runBeam(input, { dir: ">", pos: new Pos2D(0, 0) });
}

function part2Solver(input: PbInput): any {
    let s = input.getSize();
    let beams = [...Array(s.y)]
        .flatMap((_, j): Beam[] => [
            { dir: ">", pos: new Pos2D(0, j) },
            { dir: "<", pos: new Pos2D(s.x - 1, j) },
        ])
        .concat(
            [...Array(s.x)].flatMap((_, i): Beam[] => [
                { dir: "v", pos: new Pos2D(i, 0) },
                { dir: "^", pos: new Pos2D(i, s.y - 1) },
            ]),
        );
    return max(beams.map((beam) => runBeam(input, beam)));
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
