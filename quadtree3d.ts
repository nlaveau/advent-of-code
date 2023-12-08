import { max, sum } from 'lodash';

export interface QuadTree<T> {
    mins: number[];
    size: number;
    state: null | T;
    children: QuadTree<T>[];
}

export function createNode<T>(mins: number[], size: number, value: T): QuadTree<T> {
    return {
        mins,
        size,
        state: value,
        children: []
    };
}

export function createTree<T>(mins: number[], size: number[], value: T): QuadTree<T> {
    const maxs = mins.map((x, i) => x + size[i]);
    const maxSize = max(mins.map(x => Math.abs(x-1)).concat(maxs)) || 0;
    const log2 = Math.log(2);
    let finalSize = Math.round(Math.exp(log2 * Math.ceil(Math.log(maxSize)/log2)));
    if (finalSize / 2 >= maxSize) finalSize = maxSize;

    return createNode(mins.map(_ => -finalSize+1), 2 * finalSize, value);
}

export function splitNode<T>(node: QuadTree<T>): QuadTree<T> {
    const state = node.state;
    if (state === null) {
        return node;
    }
    console.log(`splitting node ${JSON.stringify(node.mins)}/${node.size} at state ${node.state}`);
    let all_mins: number[][] = [[]];
    let halfSize = Math.round(node.size / 2);
    node.mins.forEach(m => {
        all_mins = all_mins.flatMap(am => [am.concat([m]), am.concat([m+halfSize])])
    });
    return {
        mins: node.mins,
        size: node.size,
        state: null,
        children: all_mins.map(m => createNode<T>(m, halfSize, state))
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
            size: node.size,
            state: null,
            children
        };
    } else {
        return {
            mins: node.mins,
            size: node.size,
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
    if (mins.every((m, i) => m <= current_node.mins[i] && m + sizes[i] >= current_node.mins[i] + current_node.size)) {
        return {
            mins: current_node.mins,
            size: current_node.size,
            state,
            children: []
        }
    }
    if (current_node.size === 1 || mins.some((m, i) => m >= current_node.mins[i] + current_node.size || m + sizes[i] <= current_node.mins[i])) {
        return current_node;
    }
    if (current_node.state !== null) {
        current_node = splitNode(current_node);
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
        return node.mins.reduce((p,s) => p * node.size, 1);
    } else {
        return 0;
    }
}