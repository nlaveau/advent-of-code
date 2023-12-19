import { Pos2D } from './array2d';


export type Direction = '>'|'v'|'<'|'^';

export function intFromDirection(dir: Direction): number {
    switch (dir) {
        case '>': return 0;
        case 'v': return 1;
        case '<': return 2;
        case '^': return 3;
    }
}

export function pos2dFromDirection(dir: Direction): Pos2D {
    switch (dir) {
        case '>': return new Pos2D(+1, 0);
        case 'v': return new Pos2D( 0,+1);
        case '<': return new Pos2D(-1, 0);
        case '^': return new Pos2D( 0,-1);
    }
}

export function directionFromInt(intDir: number): Direction {
    switch (intDir) {
        case 0: return '>';
        case 1: return 'v';
        case 2: return '<';
        case 3: return '^';
        default: throw intDir + ' is not a valid direction.';
    }
}

export function directionFromPos2D(pos: Pos2D): Direction {
    if (pos.x === 0) {
        if (pos.y > 0) return "v";
        else return "^";
    }
    else {
        if (pos.x > 0) return ">";
        else return "<";
    }
}