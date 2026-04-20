
// SORTS
function* bubbleSort(array) {
    let len = array.length;
    for (let j = 0; j < len; j++) {
        for (let i = 0; i < len - j - 1; i++) {
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
            }
            // Yield the indices we are currently looking at
            yield { highlighting: [i, i + 1] };
        }
    }
}

function* selectionSort(array) {
    for (let i = 0; i < array.length; i++) {
        let min = i;
        for (let j = i + 1; j < array.length; j++) {
            if (array[j] < array[min]) {
                min = j;
            }
            yield { highlighting: [j, j + 1] }; // Pause to show comparison
        }
        if (min !== i) {
            [array[i], array[min]] = [array[min], array[i]];
        }
        yield { highlighting: [i, i + 1] }; // Pause to show swap
    }
}

function* insertionSort(array) {
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;

        while (j >= 0 && array[j] > key) {
            yield { highlighting: [j, j + 1] };
            array[j + 1] = array[j];
            j = j - 1;
        }
        array[j + 1] = key;
        yield { highlighting: [j + 1] };
    }
}

function* cocktailSort(array) {
    let swapped = true;
    let start = 0;
    let end = array.length - 1;

    while (swapped) {
        swapped = false;
        // Forward pass
        for (let i = start; i < end; i++) {
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                swapped = true;
            }
            yield { highlighting: [i, i + 1] };
        }
        if (!swapped) break;
        swapped = false;
        end--;

        // Backward pass
        for (let i = end - 1; i >= start; i--) {
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                swapped = true;
            }
            yield { highlighting: [i, i + 1] };
        }
        start++;
    }
}
function* shellSort(array) {
    let n = array.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            let temp = array[i];
            let j;
            for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {
                array[j] = array[j - gap];
                yield { highlighting: [j, j - gap] };
            }
            array[j] = temp;
            yield { highlighting: [j] };
        }
    }
}
function* quickSort(array, low = 0, high = array.length - 1) {
    if (low < high) {
        let pivotIndex = yield* partition(array, low, high);
        yield* quickSort(array, low, pivotIndex);
        yield* quickSort(array, pivotIndex + 1, high);
    }
}

function* partition(array, low, high) {
    let pivot = array[Math.floor((low + high) / 2)];
    let i = low - 1;
    let j = high + 1;
    while (true) {
        do { i++; } while (array[i] < pivot);
        do { j--; } while (array[j] > pivot);
        if (i >= j) return j;
        [array[i], array[j]] = [array[j], array[i]];
        yield { highlighting: [i, j] };
    }
}
function* oddEvenSort(array) {
    let sorted = false;
    while (!sorted) {
        sorted = true;
        for (let i = 1; i < array.length - 1; i += 2) {
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                sorted = false;
            }
            yield { highlighting: [i, i + 1] };
        }
        for (let i = 0; i < array.length - 1; i += 2) {
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                sorted = false;
            }
            yield { highlighting: [i, i + 1] };
        }
    }
}
function* gnomeSort(array) {
    let index = 0;
    while (index < array.length) {
        if (index === 0) index++;
        if (array[index] >= array[index - 1]) {
            index++;
        } else {
            [array[index], array[index - 1]] = [array[index - 1], array[index]];
            index--;
        }
        yield { highlighting: [index] };
    }
}
function* combSort(array) {
    let gap = array.length;
    let shrink = 1.3;
    let sorted = false;
    while (!sorted) {
        gap = Math.floor(gap / shrink);
        if (gap <= 1) { gap = 1; sorted = true; }
        for (let i = 0; i + gap < array.length; i++) {
            if (array[i] > array[i + gap]) {
                [array[i], array[i + gap]] = [array[i + gap], array[i]];
                sorted = false;
            }
            yield { highlighting: [i, i + gap] };
        }
    }
}
function* heapSort(array) {
    let n = array.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        yield* heapify(array, n, i);
    }
    for (let i = n - 1; i > 0; i--) {
        [array[0], array[i]] = [array[i], array[0]];
        yield* heapify(array, i, 0);
    }
}

function* heapify(array, n, i) {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;
    if (l < n && array[l] > array[largest]) largest = l;
    if (r < n && array[r] > array[largest]) largest = r;
    if (largest !== i) {
        [array[i], array[largest]] = [array[largest], array[i]];
        yield { highlighting: [i, largest] };
        yield* heapify(array, n, largest);
    }
}
function* cycleSort(array) {
    for (let cycleStart = 0; cycleStart < array.length - 1; cycleStart++) {
        let item = array[cycleStart];
        let pos = cycleStart;
        for (let i = cycleStart + 1; i < array.length; i++) {
            if (array[i] < item) pos++;
            yield { highlighting: [cycleStart, i] };
        }
        if (pos === cycleStart) continue;
        while (item === array[pos]) pos++;
        [array[pos], item] = [item, array[pos]];
        while (pos !== cycleStart) {
            pos = cycleStart;
            for (let i = cycleStart + 1; i < array.length; i++) {
                if (array[i] < item) pos++;
                yield { highlighting: [pos, i] };
            }
            while (item === array[pos]) pos++;
            [array[pos], item] = [item, array[pos]];
        }
    }
}
function* stoogeSort(array, l = 0, h = array.length - 1) {
    if (array[l] > array[h]) {
        [array[l], array[h]] = [array[h], array[l]];
    }
    yield { highlighting: [l, h] };
    if (h - l + 1 > 2) {
        let t = Math.floor((h - l + 1) / 3);
        yield* stoogeSort(array, l, h - t);
        yield* stoogeSort(array, l + t, h);
        yield* stoogeSort(array, l, h - t);
    }
}
function* pancakeSort(array) {
    for (let currSize = array.length; currSize > 1; --currSize) {
        let mi = 0;
        for (let i = 0; i < currSize; i++) {
            if (array[i] > array[mi]) mi = i;
            yield { highlighting: [i, mi] };
        }
        if (mi !== currSize - 1) {
            yield* flip(array, mi);
            yield* flip(array, currSize - 1);
        }
    }
}

function* flip(array, i) {
    let start = 0;
    while (start < i) {
        [array[start], array[i]] = [array[i], array[start]];
        start++;
        i--;
        yield { highlighting: [start, i] };
    }
}
function* bogoSort(array) {
    const isSorted = (arr) => {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] > arr[i + 1]) return false;
        }
        return true;
    };
    while (!isSorted(array)) {
        // Shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        yield { highlighting: Array.from({ length: array.length }, (_, i) => i) };
    }
}

//////
function* mergeSort(array, start = 0, end = array.length - 1) {
    if (start < end) {
        let mid = Math.floor((start + end) / 2);
        yield* mergeSort(array, start, mid);
        yield* mergeSort(array, mid + 1, end);
        yield* merge(array, start, mid, end);
    }
}

function* merge(array, start, mid, end) {
    let left = array.slice(start, mid + 1);
    let right = array.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            array[k] = left[i];
            i++;
        } else {
            array[k] = right[j];
            j++;
        }
        yield { highlighting: [k] };
        k++;
    }

    while (i < left.length) {
        array[k] = left[i];
        i++;
        yield { highlighting: [k] };
        k++;
    }

    while (j < right.length) {
        array[k] = right[j];
        j++;
        yield { highlighting: [k] };
        k++;
    }
}



function* sleepSort(array) {
    let sorted = [];
    let original = [...array];
    let max = Math.max(...array);
    
    // We simulate the "time" steps
    for (let time = 0; time <= max; time++) {
        for (let i = 0; i < original.length; i++) {
            if (original[i] === time) {
                sorted.push(original[i]);
                // Highlight the element "waking up"
                yield { highlighting: [i] };
            }
        }
    }
    
    // Map sorted values back to original array for display
    for (let i = 0; i < array.length; i++) {
        array[i] = sorted[i];
        yield { highlighting: [i] };
    }
}



function* radixSort(array) {
    const max = Math.max(...array);
    // Determine number of digits in the max number
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        yield* countingSortForRadix(array, exp);
    }
}

function* countingSortForRadix(array, exp) {
    let output = new Array(array.length);
    let count = new Array(10).fill(0);

    for (let i = 0; i < array.length; i++) {
        let digit = Math.floor(array[i] / exp) % 10;
        count[digit]++;
        yield { highlighting: [i] };
    }

    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }

    for (let i = array.length - 1; i >= 0; i--) {
        let digit = Math.floor(array[i] / exp) % 10;
        output[count[digit] - 1] = array[i];
        count[digit]--;
    }

    for (let i = 0; i < array.length; i++) {
        array[i] = output[i];
        yield { highlighting: [i] };
    }
}
// !!!Broken!!! I dont know why yet 😭
// function* bitonicSort(array) {
//     let n = array.length;
//     for (let k = 2; k <= n; k *= 2) {
//         for (let j = k / 2; j > 0; j /= 2) {
//             for (let i = 0; i < n; i++) {
//                 let l = i ^ j;
//                 if (l > i) {
//                     if (((i & k) === 0 && array[i] > array[l]) || 
//                         ((i & k) !== 0 && array[i] < array[l])) {
//                         [array[i], array[l]] = [array[l], array[i]];
//                     }
//                     yield { highlighting: [i, l] };
//                 }
//             }
//         }
//     }
// }

function* circleSort(array) {
    let changed = true;
    while (changed) {
        changed = (yield* circleSortRecursive(array, 0, array.length - 1)) > 0;
    }
}

function* circleSortRecursive(array, low, high) {
    let swaps = 0;
    if (low === high) return 0;

    let l = low;
    let h = high;

    while (l < h) {
        if (array[l] > array[h]) {
            [array[l], array[h]] = [array[h], array[l]];
            swaps++;
        }
        yield { highlighting: [l, h] };
        l++;
        h--;
    }

    if (l === h) {
        if (array[l] > array[l + 1]) {
            [array[l], array[l + 1]] = [array[l + 1], array[l]];
            swaps++;
        }
        yield { highlighting: [l, l + 1] };
    }

    let mid = Math.floor((high - low) / 2);
    swaps += yield* circleSortRecursive(array, low, low + mid);
    swaps += yield* circleSortRecursive(array, low + mid + 1, high);

    return swaps;
}