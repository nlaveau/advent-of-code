function partN<I, R>(
    fileName: string,
    partNumber: number,
    reader: (f: string) => I,
    solver: (p: I) => R,
    showData: boolean,
) {
    const data = reader(fileName);
    if (showData) console.log(data);

    const answer = solver(data);
    console.log(`Part${partNumber} (${fileName})`, answer);
}

export interface PartElements<I, R> {
    id: number;
    testFiles: string[];
    inputFile: string;
    reader: (f: string) => I;
    solver: (p: I) => R;
}

export function dayRunner<I, R>(
    partElements: PartElements<I, R>,
    testOnly: boolean,
    showData: boolean,
) {
    partElements.testFiles.forEach((filename) =>
        partN(
            filename,
            partElements.id,
            partElements.reader,
            partElements.solver,
            showData,
        ),
    );
    if (!testOnly) {
        partN(
            partElements.inputFile,
            partElements.id,
            partElements.reader,
            partElements.solver,
            showData,
        );
    }
}
