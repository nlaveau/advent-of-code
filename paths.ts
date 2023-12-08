import { min } from 'lodash';
import { Pos2D, Array2D } from './array2d';


export type MetricOnArray2D<T> = (src: Pos2D, dst: Pos2D, array: Array2D<T>) => number;

export type DistanceAndPath = { distance: number, path: Pos2D[] };
export type PointAndPath = { point: Pos2D, path: Pos2D[] };


export function computeDistanceAndPathArray<T>(src: Pos2D, array: Array2D<T>, metric: MetricOnArray2D<T>) {
    let current: Array2D<DistanceAndPath|null> = array.map(x => null);
    current.set(src, { distance: 0, path: [src] });
    let todo = new Map<number, PointAndPath[]>();
    todo.set(0, [{ point: src, path: [src] }]);

    while (todo.size > 0) {
        let current_distance = min([...todo.keys()])||0;
        let at_distance = todo.get(current_distance);
        todo.delete(current_distance);

        at_distance?.forEach(p => {
            array.neighbourhood4(p.point).forEach(q => {
                let new_path = p.path.concat([q]);
                let pq_distance = metric(p.point, q, array);
                let q_distance = pq_distance + current_distance;
                let old_q_distance = current.get(q)?.distance ?? 0;
                if (current.get(q) && old_q_distance > q_distance) {
                    todo.set(old_q_distance, todo.get(old_q_distance)?.filter(r => q !== r.point) || []);
                }
                if (current.get(q) === null || old_q_distance > q_distance) {
                    current.set(q, { distance: q_distance, path: new_path });
                    todo.set(q_distance, (todo.get(q_distance)??[]).concat([{point: q, path: new_path}]));
                }
            });
        });
    }
    return current;
}

export function findShortestPath2D<T>(src: Pos2D, dst: Pos2D, array: Array2D<T>, metric: MetricOnArray2D<T>) {
    let current = computeDistanceAndPathArray(src, array, metric);

    return current.get(dst);
}

export function printPath<T>(array: Array2D<T>, dp: DistanceAndPath) {
    let draw = array.map(x => '.');
    for (let i = 0; i < dp.path.length-1; i++) {
        let dir: string;
        if (dp.path[i].x === dp.path[i+1].x) {
            dir = (dp.path[i].y < dp.path[i+1].y) ? 'v' : '^';
        } else {
            dir = (dp.path[i].x > dp.path[i+1].x) ? '<' : '>';
        }
        draw.set(dp.path[i], dir);
    }
    draw.set(dp.path[dp.path.length-1], 'E');
    draw.asLoggable().forEach(l => console.log(l));
}
