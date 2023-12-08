
export type BinaryArray = boolean[];


export function fromHexChar(hex: string) {
    let num = parseInt(hex, 16);
    return [3,2,1,0].map(b => ((num >> b) & 1 ) === 1);
}

export function fromHexString(hex: string) {
    return hex.split('').flatMap(h => fromHexChar(h));
}

export function toNumber(binary: BinaryArray) {
    let res = 0;
    binary.forEach(b => res = res * 2 + (b ? 1 : 0));
    return res;
}

export function toHexChar(binary: BinaryArray) {
    toNumber(binary).toString(16);
}

export function toHexString(binary: BinaryArray) {
    let size = binary.length;
    if (size % 4 !== 0) throw 'Unable to convert binary stream to hexadecimal. Length (' + size + ') is not a multiple of 4.';

    return Array.from({length: Math.floor(size/4)}, (v, k) => toHexChar(binary.slice(k*4, (k+1)*4)));
}

export function toBinaryString(binary: BinaryArray) {
    return binary.map(b => b ? 1 : 0).join('');
}