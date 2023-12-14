interface KeyValue<K, T> {
    key: K,
    value: T
}

export function findValueFromCycle<State, K, V>(initialState: State, iterator: (state: State, itcount: number) => State, iterations: number, kvExtractor: (state: State) => KeyValue<K, V>): V {
    let data: KeyValue<K, V>[] = [];
    let state = initialState;
    let previous = -1;
    let kv = kvExtractor(state);
    let itcount = 0;

    do {
        data.push(kv);
        state = iterator(state, itcount);
        kv = kvExtractor(state);
        previous = data.findIndex(d => kv.key === d.key);
        itcount++;
    } while (previous === -1 && data.length < iterations);
    if (data.length >= iterations) {
        return kv.value
    }
    else {
        let cycle_length = data.length - previous;
        let rem = (iterations - previous) % cycle_length;
        return data[previous + rem].value;
    }
}
