import * as fs from "fs";
import { sum } from "lodash";
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

interface Record {
    condition: string[];
    groups: number[];
}

interface ValidationStatus {
    possibly_valid: boolean;
    i_cond: number;
    i_groups: number;
    current_run: number;
    remaining_hashes: number;
    remaining_qmark: number;
}

type PbInput = Record[];

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n");
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return input.map((line) => {
        let sp = line.split(" ");
        return {
            condition: sp[0].split(""),
            groups: sp[1].split(",").map((c) => parseInt(c)),
        };
    });
}

let cache = new Map<string, number>();

function recordToString(record: Record) {
    return record.condition.join("") + "|" + record.groups.join(",");
}

function doCutPoint(record: Record, cutPoint: number) {
    let s1 = record.condition.slice(0, cutPoint);
    let s2 = record.condition.slice(cutPoint + 1);
    let res = 0;
    for (let i = 0; i < record.groups.length + 1; i++) {
        let f1 = nbArrangementsForSection({
            condition: s1,
            groups: record.groups.slice(0, i),
        });
        let f2 = nbArrangementsForSection({
            condition: s2,
            groups: record.groups.slice(i),
        });
        res += f1 * f2;
    }
    return res;
}

function nbArrangementsForSection(record: Record) {
    let key = recordToString(record);
    if (cache.has(key)) return cache.get(key) ?? 0;
    let value = 0;
    let trimmedRecord = {
        condition: record.condition
            .join("")
            .replace(/^\.*/, "")
            .replace(/\.*$/, "")
            .replace(/\.+/g, ".")
            .split(""),
        groups: record.groups,
    };

    if (trimmedRecord.groups.length === 0) {
        // we should not have groups there
        if (trimmedRecord.condition.some((c) => c === "#")) value = 0;
        else value = 1;
    } else if (
        trimmedRecord.groups.length === 1 &&
        trimmedRecord.groups[0] === trimmedRecord.condition.length
    ) {
        // we should not have space there
        if (trimmedRecord.condition.some((c) => c === ".")) value = 0;
        else value = 1;
    } else if (
        trimmedRecord.condition.length <
        sum(trimmedRecord.groups) + trimmedRecord.groups.length - 1
    ) {
        // there is not enough space to put all the groups needed with their length
        value = 0;
    } else {
        let cutPoint = trimmedRecord.condition.findIndex((x) => x === ".");
        if (cutPoint >= 0) {
            // if we have a space, we try to spread the groups around this space
            value = doCutPoint(trimmedRecord, cutPoint);
        } else {
            let switchPoint = trimmedRecord.condition.findIndex(
                (x) => x === "?",
            );
            if (switchPoint < 0) {
                value = 0; // should not happen
            } else {
                value =
                    nbArrangementsForSection({
                        condition: trimmedRecord.condition
                            .slice(0, cutPoint)
                            .concat(["#"])
                            .concat(
                                trimmedRecord.condition.slice(cutPoint + 1),
                            ),
                        groups: trimmedRecord.groups,
                    }) +
                    nbArrangementsForSection({
                        condition: trimmedRecord.condition
                            .slice(0, cutPoint)
                            .concat(["."])
                            .concat(
                                trimmedRecord.condition.slice(cutPoint + 1),
                            ),
                        groups: trimmedRecord.groups,
                    });
            }
        }
    }

    cache.set(key, value);
    //console.log(`${key}: ${value}`);
    return value;
}

function part1Solver(input: PbInput) {
    return sum(input.map((record) => nbArrangementsForSection(record)));
}

function part2Solver(input: PbInput) {
    let foldedInput = input.map((record) => ({
        condition: [
            ...record.condition,
            "?",
            ...record.condition,
            "?",
            ...record.condition,
            "?",
            ...record.condition,
            "?",
            ...record.condition,
        ],
        groups: [
            ...record.groups,
            ...record.groups,
            ...record.groups,
            ...record.groups,
            ...record.groups,
        ],
    }));
    return sum(
        foldedInput.map((record, i) => {
            console.log(i);
            return nbArrangementsForSection(record);
        }),
    );
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
