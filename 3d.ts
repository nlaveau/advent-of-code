
export type Nd<T> = T[];

export type PosND = Nd<number>;
export interface Interval {
    min: number;
    max: number;
}

export type IntervalNd = Nd<Interval>;




export function volumeNd(area: IntervalNd) {
    return area.reduce((v, interval) => v*(interval.max+1-interval.min), 1);
}


export function intersectIntervals(a: Interval, b: Interval) {
    if (a.max < b.min || a.min > b.max) {
        return null;
    } else {
        let points = [a.min, a.max, b.min, b.max].sort((c,d) => c-d);
        return {min: points[1], max: points[2]};
    }
}
    
export function splitIntervalByInterval(splitted: Interval, splitter: Interval) {
    if (splitted.max < splitter.min || splitted.min > splitter.max) {
        //  ssssss  
        //          SSSSSSSSSS
        return [splitted];
    } else if (splitted.max <= splitter.max && splitted.min >= splitter.min) {
        //       sssssssssss
        //  SSSSSSSSSSSSSSSSSSSSS
        return [splitted];
    } else if (splitted.min < splitter.min && splitted.max > splitter.max) {
        //  ssssssssssssssssssssss
        //     SSSSSSSSSS
        return [{min: splitted.min, max: splitter.min-1}, splitter, {min: splitter.max+1, max: splitted.max}]
    } else if (splitted.min < splitter.min) {
        //   sssssssssss
        //     SSSSSSSSSSSS
        return [{min: splitted.min, max: splitter.min-1}, {min:splitter.min, max:splitted.max}];
    } else {
        //     ssssssssssssss
        //  SSSSSSSSSSS
        return [{min: splitted.min, max: splitter.max}, {min:splitter.max+1, max:splitted.max}];
    }
}
    
export function splitIntervalNdByIntervalNd(splitted: IntervalNd, splitter: IntervalNd) {
    let res: IntervalNd[] = [[]];
    for (let i = 0; i < splitted.length; i++) {
        let split = splitIntervalByInterval(splitted[i], splitter[i]);
        res = split.flatMap(x => res.map(y => y.concat(x)));
    }
    return res;
}

export function intervalNdAreEquals(a: IntervalNd, b: IntervalNd) {
    return a.every((v,k) => b[k].min === v.min && b[k].max === v.max);
}

export function intervalNdIntersect(a: IntervalNd, b: IntervalNd) {
    return a.every((dim, dim_i) => dim.max >= b[dim_i].min && b[dim_i].max >= dim.min);
}

export function intervalNdContains(a: IntervalNd, b: IntervalNd) {
    return a.every((dim, dim_i) => dim.max >= b[dim_i].max && dim.min <= b[dim_i].min);
}


