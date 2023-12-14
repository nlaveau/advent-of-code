import { min, max, sum } from "lodash";

export class Pos2D {
    constructor(public x: number, public y: number) {};

    toString() {
        return `${this.x},${this.y}`;
    }

    equals(other: any) {
        return other !== null && other !== undefined && other['x'] === this.x && other['y'] === this.y;
    }

    apply0(fun: (z: number) => number) {
        return new Pos2D(fun(this.x), fun (this.y));
    }

    apply1(fun: (z: number, p1: number) => number, param1: Pos2D) {
        return new Pos2D(fun(this.x, param1.x), fun (this.y, param1.y));
    }

    plus(dir: Pos2D): Pos2D {
        return this.apply1((z, oz) => z + oz, dir);
    }

    minus(dir: Pos2D): Pos2D {
        return this.apply1((z, oz) => z - oz, dir);
    }

    times(n: number): Pos2D {
        return this.apply0(z => z * n);
    }

    div(n: number): Pos2D {
        return this.apply0(z => z / n);
    }

    mod(n: number): Pos2D {
        return this.apply0(z => z % n);
    }

    floor(): Pos2D {
        return this.apply0(z => Math.floor(z));
    }

    clamp(size: Pos2D) {
        return this.apply1((z, sz) => Math.min(Math.max(0, z), sz - 1), size);
    }

    loop(size: Pos2D) {
        return this.apply1((z, sz) => (((z % sz) + sz) % sz), size);
    }
}

export function pos2D(x: number, y: number) {
    return new Pos2D(x, y);
}


export type Endo<T> = (input: T, pos: Pos2D, array2d: Array2D<T>) => T;
export type Morphism<T, U> = (input: T, pos: Pos2D, array2d: Array2D<T>) => U;
export type LineMorphisn<T, U> = (inputLine: T[], index: number, array2d: Array2D<T>) => U[]
export type Operation<T> = (input: T, pos: Pos2D, array2d: Array2D<T>) => any;
export type Predicate<T> = Morphism<T, boolean>;

export type Neighbourhood = (center: Pos2D) => Pos2D[];

export class Area2D {
    static readonly N4 = [pos2D(0,-1), pos2D(0,1), pos2D(-1,0), pos2D(1,0)];
    static readonly N8 = [-1,0,1].flatMap(offset_y => [-1,0,1].map(offset_x => pos2D(offset_x,offset_y))).filter(p => p.x !== 0 || p.y !== 0);

    public static neighbourhood(center: Pos2D, neighbourhood: Pos2D[]) {
        return neighbourhood.map(p => center.plus(p));
    }

    public static neighbourhood8(center: Pos2D) {
        return this.neighbourhood(center, Area2D.N8);
    }

    public static neighbourhood4(center: Pos2D) {
        return this.neighbourhood(center, Area2D.N4);
    }
}


export class Array2D<T> {
    private size: Pos2D;

    constructor(private array: T[][]) {
        this.size = new Pos2D(array[0].length, array.length);
    }

    static fromSize<T>(size: Pos2D, initializer: (pos: Pos2D) => T) {
        return new Array2D<T>([...Array(size.y)].map((_,y) =>
            [...Array(size.x)].map((__, x) =>
                initializer(pos2D(x,y)))));
    }

    private isInRange(i: number, m: number, M: number) {
        return (i >= m && i < M);
    }

    private static extractRow<T>(array: T[][], rowIndex: number) {
        return array[rowIndex];
    }

    private static extractColumn<T>(array: T[][], colIndex: number) {
        return array.map(row => row[colIndex]);
    }

    static transposeArray<T>(array: T[][]) {
        return array[0].map((_, i) => Array2D.extractColumn(array, i));
    }

    public isInside(point: Pos2D) {
        return this.isInRange(point.x, 0, this.size.x) && this.isInRange(point.y, 0, this.size.y);
    }

    public getSize() {
        return this.size;
    }

    public get(point: Pos2D) {
        return this.array[point.y][point.x];
    }

    public getRawArray() {
        return this.array;
    }

    public set(point: Pos2D, value: T) {
        this.array[point.y][point.x] = value;
    }

    public map<U>(operation: Morphism<T, U>) {
        return new Array2D(this.array.map((line, j) => line.map((cell, i) => operation(cell, new Pos2D(i, j), this))));
    }

    public mapRow<U>(operation: LineMorphisn<T, U>) {
        return new Array2D(this.array.map((line, j) => operation(line, j, this)))
    }

    public mapColumn<U>(operation: LineMorphisn<T, U>) {
        return new Array2D(Array2D.transposeArray(Array2D.transposeArray(this.array).map((line, j) => operation(line, j, this))));
    }

    public transpose() {
        return new Array2D(Array2D.transposeArray(this.array));
    }

    public forEach<U>(operation: Operation<T>) {
        this.array.forEach((line, j) => line.forEach((cell, i) => operation(cell, new Pos2D(i, j), this)));
    }

    public every(predicate: Predicate<T>) {
        return this.array.every((line, j) => line.every((cell, i) => predicate(cell, new Pos2D(i, j), this)));
    }

    public some(predicate: Predicate<T>) {
        return this.array.some((line, j) => line.some((cell, i) => predicate(cell, new Pos2D(i, j), this)));
    }

    public findIndex(predicate: Predicate<T>) {
        let pos = new Pos2D(0,0);
        for (pos.y = 0; pos.y < this.size.y; pos.y++) {
            for (pos.x = 0; pos.x < this.size.x; pos.x++) {
                if (predicate(this.get(pos), pos, this)) {
                    return pos;
                }
            }
        }
        return null;
    }

    public find(predicate: Predicate<T>) {
        let p = this.findIndex(predicate);
        if (p !== null) return this.get(p);
        return null;
    }

    public findIndexAll(predicate: Predicate<T>): Pos2D[] {
        return this.map((c, p, a) => predicate(c, p, a) ? [p] : []).getRawArray().flatMap(x => x).flatMap(x => x);
    }

    public min() {
        return min(this.array.flatMap(x => x));
    }

    public max() {
        return max(this.array.flatMap(x => x));
    }

    public sum() {
        return sum(this.array.flatMap(x => x));
    }

    public neighbourhood(center: Pos2D, neighbourhood: Pos2D[]) {
        return Area2D.neighbourhood(center, neighbourhood).filter(p => this.isInside(p));
    }

    public neighbourhood8(center: Pos2D) {
        return this.neighbourhood(center, Area2D.N8);
    }

    public neighbourhood4(center: Pos2D) {
        return this.neighbourhood(center, Area2D.N4);
    }

    public asLoggable(separator: string = ''): string[] {
        return this.array.map(line => line.join(separator));
    }
}

