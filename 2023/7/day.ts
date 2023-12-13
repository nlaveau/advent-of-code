import * as fs from "fs";
import { sum, uniq } from 'lodash';
import { dayRunner } from "../../dayRunner";

const testFilesPart1 = ["./test.txt"];
const testFilesPart2 = ["./test.txt"];
const inputFilePart1 = "./input.txt";
const inputFilePart2 = "./input.txt";
let testOnly = false;

interface Game {
    hand: string,
    renamedHand?: string,
    handType?: number,
    bid: number
}

type PbInput = Game[];

const CARD_ORDER = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

let CARD_MAPPING: { [l: string]: string } = {};
let A = 'a'.charCodeAt(0);
CARD_ORDER.forEach((c, i) => CARD_MAPPING[c] = String.fromCharCode(A + i));

function getRenamedHand(hand: string) {
    return hand.split('').map(c => CARD_MAPPING[c]).join('');
}

function getRenamedHand2(hand: string) {
    return getRenamedHand(hand).replace(/d/g, 'z');
}

function readInput(file: string): PbInput {
    let input = fs.readFileSync(file).toString().split("\n").map(line => line.replace('\r', ''));
    if (input[input.length - 1] === "") {
        input = input.slice(0, -1);
    }

    return input.map(s => {
        let cut = s.split(' ').filter(x => x !== ' ');
        return ({
            hand: cut[0],
            bid: parseInt(cut[1])
        })
    });
}

const FIVE_OF_A_KIND = 0;
const FOUR_OF_A_KIND = 1;
const FULL_HOUSE = 2;
const THREE_OF_A_KIND = 3;
const TWO_PAIRS = 4;
const ONE_PAIR = 5;
const HIGH_CARD = 6;

function getHandType(hand: string) {
    let cards = hand.split('').sort();

    switch (uniq(cards).length) {
        case 5: return HIGH_CARD;
        case 4: return ONE_PAIR;
        case 3: {
            if (
                (cards[1] === cards[2] && (cards[0] === cards[1] || cards[2] === cards[3])) || // AAABC || ABBBC
                (cards[2] === cards[3] && cards[3] === cards[4])) { // ABCCC
                return THREE_OF_A_KIND;
            }
            else {
                return TWO_PAIRS; // AABBC || AABCC || ABBCC
            }
        }
        case 2: {
            // FH: AAABB || AABBB  FOAK: ABBBB || AAAAB
            if (cards[3] === cards[4] && cards[0] === cards[1]) return FULL_HOUSE; else return FOUR_OF_A_KIND;
        }
        case 1: return FIVE_OF_A_KIND;
    }
}

function getHandType2(hand: string) {
    let baseType = getHandType(hand);
    let jokers = hand.split('').filter(x => x === 'J').length;
    if (jokers === 0) return baseType;

    switch (baseType) {
        case FIVE_OF_A_KIND:
            return FIVE_OF_A_KIND; // JJJJJ
        case FOUR_OF_A_KIND:
            return FIVE_OF_A_KIND; // JAAAA || JJJJA
        case FULL_HOUSE:
            return FIVE_OF_A_KIND; // JJAAA || AAJJJ
        case THREE_OF_A_KIND:
            return FOUR_OF_A_KIND; // AAAJB || JJJAB
        case TWO_PAIRS:
            // JJAAB || AABBJ
            if (jokers === 2) return FOUR_OF_A_KIND; else return FULL_HOUSE;
        case ONE_PAIR:
            // JJABC || AAJBC
            return THREE_OF_A_KIND;
        case HIGH_CARD:
            // JABCD
            return ONE_PAIR;
        default:
            throw "Impossible card type";
    }
}

function compare(g1: Game, g2: Game) {
    if (g1.handType === undefined || g2.handType === undefined || g1.renamedHand === undefined || g2.renamedHand === undefined) throw 'compare only works on "improved" hands';

    return (g2.handType - g1.handType) || (-g1.renamedHand.localeCompare(g2.renamedHand));
}


function part1Solver(input: PbInput): any {
    let betterGames: Game[] = input.map(g => ({
        ...g, handType: getHandType(g.hand), renamedHand: getRenamedHand(g.hand)
    })).sort(compare);

    return sum(betterGames.map((g, i) => g.bid * (i + 1)));

}

function part2Solver(input: PbInput): any {
    let betterGames: Game[] = input.map(g => ({
        ...g, handType: getHandType2(g.hand), renamedHand: getRenamedHand2(g.hand)
    })).sort(compare);

    return sum(betterGames.map((g, i) => g.bid * (i + 1)));
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
