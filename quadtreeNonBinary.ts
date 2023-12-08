import { max, sum } from 'lodash';
import _ from 'lodash';

export interface QuadTree<T> {
    mins: number[];
    sizes: number[];
    state: null | T;
    children: QuadTree<T>[];
}

export function createNode<T>(mins: number[], sizes: number[], value: T): QuadTree<T> {
    return {
        mins,
        sizes,
        state: value,
        children: []
    };
}

export function splitNode<T>(node: QuadTree<T>, point: number[]): QuadTree<T> {
    const state = node.state;
    if (state === null) {
        // node already split
        return node;
    }
    if (point.some((c, i) => node.mins[i] > c || node.mins[i] + node.sizes[i] <= c)) {
        // point outside node
        return node;
    }
    let all_mins: number[][] = [[]];
    let all_sizes: number[][] = [[]];
    node.mins.forEach((m,i) => {
        if (m === point[i]) {
            all_mins = all_mins.map(am => am.concat([m]));
            all_sizes = all_sizes.map(am => am.concat([node.sizes[i]]));
        } else {
            all_mins = all_mins.flatMap(am => [am.concat([m]), am.concat([point[i]])]);
            all_sizes = all_sizes.flatMap(am => [am.concat([point[i]-m]), am.concat([m+node.sizes[i]-point[i]])]);
        }
    });
    return {
        mins: node.mins,
        sizes: node.sizes,
        state: null,
        children: all_mins.map((m,i) => createNode<T>(m, all_sizes[i], state))
    };
}

export function simplifyNode<T>(node: QuadTree<T>): QuadTree<T> {
    if (node.state !== null) {
        return node;
    }
    const children = node.children.map(simplifyNode);
    const potential_state = children[0].state;
    if (potential_state === null || !children.every(n => n.state === potential_state)) {
        return {
            mins: node.mins,
            sizes: node.sizes,
            state: null,
            children
        };
    } else {
        return {
            mins: node.mins,
            sizes: node.sizes,
            state: potential_state,
            children: []
        };
    }
}

export function setAreaState<T>(node: QuadTree<T>, mins: number[], sizes: number[], state: T): QuadTree<T> {
    let current_node = node;
    if (current_node.state !== null && current_node.state === state) {
        return current_node;
    }
//    console.log(current_node, mins, sizes);
    if (mins.every((m, i) => m <= current_node.mins[i] && m + sizes[i] >= current_node.mins[i] + current_node.sizes[i])) {
        return {
            mins: current_node.mins,
            sizes: current_node.sizes,
            state,
            children: []
        }
    }
    if (current_node.sizes.every(x => x === 1) || mins.some((m, i) => m >= current_node.mins[i] + current_node.sizes[i] || m + sizes[i] <= current_node.mins[i])) {
        return current_node;
    }
    if (current_node.state !== null) {
        let inside_coords = mins.map((m, i) => {
            let M = m + sizes[i];
            let nm = current_node.mins[i];
            let nM = current_node.mins[i] + current_node.sizes[i];
            if (nm < m && m < nM) {
                return m;
            }
            if (nm < M && M < nM) {
                return M;
            }
            return nm;
        });
        current_node = splitNode(current_node, inside_coords);
    }
    current_node = {
        ...current_node,
        children: current_node.children.map(n => setAreaState(n, mins, sizes, state))
    };
    if (state !== null && current_node.children.every(n => n.state === state)) {
        return simplifyNode(current_node);
    }
    return current_node;
}

export function countBy<T>(node: QuadTree<T>, pred: (x: T) => boolean): number {
    if (node.state === null) {
        return sum(node.children.map(n => countBy(n, pred)));
    }
    if (pred(node.state)) {
        return node.sizes.reduce((p,s) => p * s, 1);
    } else {
        return 0;
    }
}