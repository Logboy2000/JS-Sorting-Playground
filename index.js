let arr = []
let highestNum = 0
let activeIndices = []
let sortedIndices = []
let doFinalCheck = false
let displayBars = []



let config = {
    // sorting
    SELECTED_ALGORITHM: 12, // default to merge sort
    SPEED_MULT: 5,
    SMOOTH_ANIMATION: true,
    ANIMATION_SPEED: 0.1,

    // generation
    ARRAY_TYPE: "linear",
    ARRAY_OPERATION: "randomized",
    ARRAY_LENGTH: 400,

    SOUND_TYPE: "sine",

    /// visual
    SPACING: 0,
    BG_COLOR: '#000000',
    // color
    PRIMARY_COLOR: '#FFFFFF',
    ACTIVE_COLOR: '#FF0000',
    SORTED_COLOR: '#00FF00',

    /// stats
    STATS_FONT_SIZE: 20,
    SHOW_STEPS: false,
    SHOW_FPS: false,
    SHOW_DT: false,


    PAUSED: true,
}

const SAVE_KEY = 'sorting_playground_config';

function saveSettings() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(config));
}

function loadSettings() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        // Merge saved settings into the current config
        Object.assign(config, parsed);
    }
}

function clearSettings() {
    localStorage.clear()
}
loadSettings() // from cookies if saved
const gui = new dat.GUI({ name: 'Settings' });

const sortAlgos = [
    bubbleSort,
    selectionSort,
    insertionSort,
    quickSort,
    cocktailSort,
    pancakeSort,
    shellSort,
    oddEvenSort,
    gnomeSort,
    combSort,
    heapSort,
    cycleSort,
    mergeSort,
    sleepSort,
    radixSort,
    circleSort,
    stoogeSort,
    bogoSort
]



gui.add(config, 'ARRAY_TYPE', {
    "Linear": "linear",
    "Quadratic": "quadratic",
    "Logarithmic": "logarithmic",
    "Sinusoidal": "sinusoidal",
    "Duplicates": "duplicates",
    "Only 2": "only2",
    "Only 4": "only4",
}).name('Array Type')

gui.add(config, 'ARRAY_OPERATION', {
    "Normal": "normal",
    "Reversed": "reversed",
    "Randomized": "randomized",
}).name('Array Operation')




gui.add(config, 'ARRAY_LENGTH', 3, 4096, 1).name("# Of Elements")








// make key: value stuff so I sont have to type it for every new algothitm
const algoMap = {};
sortAlgos.forEach((fn, index) => {
    // Converts "bubbleSort" to "Bubble Sort"
    const name = fn.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    algoMap[name] = index;
});

gui.add(config, 'SELECTED_ALGORITHM', algoMap).name('Algorithm').onFinishChange(() => {
    sortInstance = sortAlgos[config.SELECTED_ALGORITHM](arr);
}).listen();
gui.add(config, 'SPEED_MULT', 1, 100, 1).name("Speed Mult").listen()
gui.add(config, 'SMOOTH_ANIMATION').name('Smooth Animation');
gui.add(config, 'ANIMATION_SPEED', 0.01, 1).name('Animation Speed');





gui.add(config, 'SOUND_TYPE', {
    "None": "none",
    "Sine": "sine",
    "Square": "square",
    "Sawtooth": "sawtooth",
    "Triangle": "triangle"
})
    .name('Sound Type')
    .onFinishChange((newValue) => {
        if (newValue === "none") return
        if (synth && synth.osc) {
            synth.osc.type = newValue;
        }
    });
gui.add(config, 'SPACING', 0, 10).step(1).name('Bar Spacing');



const colorFolder = gui.addFolder("Colors")

colorFolder.addColor(config, "BG_COLOR").name("Background")
colorFolder.addColor(config, "PRIMARY_COLOR").name("Primary")
colorFolder.addColor(config, "ACTIVE_COLOR").name("Active Indecies")
colorFolder.addColor(config, "SORTED_COLOR").name("Sorted Color")

let stats = {
    STEPS: 0,
    FPS: 0,
    DELTA_TIME: 0,
}

const statsFolder = gui.addFolder("Stats")
statsFolder.add(config, 'STATS_FONT_SIZE', 0, 50, 1).name("Font Size")
statsFolder.add(config, "SHOW_STEPS").name("Steps")
statsFolder.add(config, "SHOW_FPS").name("FPS")
statsFolder.add(config, "SHOW_DT").name("Delta Time")




const saveFolder = gui.addFolder("Save/Load")
saveFolder.add({
    fun: saveSettings
}, 'fun').name('Save Settings to Cookie');
saveFolder.add({
    fun: clearSettings
}, 'fun').name('Clear Saved Settings');


gui.add({
    fun: generateArrButtonPressed
}, 'fun').name('Generate Array');

function generateArrButtonPressed() {
    arr = makeRandomArray(config.ARRAY_LENGTH)
    config.PAUSED = true;
    beginSort()
    playbackBtn.name("Play")
}
const playbackBtn = gui.add({
    fun: playbackBtnPressed
}, 'fun').name('Start');

function playbackBtnPressed() {
    if (config.PAUSED) {

        config.PAUSED = false;
        playbackBtn.name("Pause")
        if (!sortInstance || doFinalCheck) {
            // This runs once before the sort begins
            beginSort()
        }
    } else {
        config.PAUSED = true;
        playbackBtn.name("Play")
    }
}










let sortInstance = null; // Holds the active generator* that is called each frame

/**
 * Runs once right before update/draw loop begins
 */
export function start() {
    arr = makeRandomArray(config.ARRAY_LENGTH)
    displayBars = arr.map((val, i) => ({ value: val, x: i, targetX: i }));
    document.addEventListener('keypress', (e) => {
        if (e.key === " ") { playbackBtnPressed() }
    })
    document.addEventListener('keydown', (e) => {
        if (e.key === "-") {
            if (config.SPEED_MULT > 0) {
                config.SPEED_MULT--
            }

        }
        if (e.key === "=") {
            if (config.SPEED_MULT < 100) {
                config.SPEED_MULT++
            }
        }
        if (e.key === "g") {
            generateArrButtonPressed()
        }
    })
}
/**
 * Does the initial setup for the sort and resets values
 */
function beginSort() {
    doFinalCheck = false
    activeIndices = []
    sortedIndices = []
    stats.STEPS = 0
    sortInstance = sortAlgos[config.SELECTED_ALGORITHM](arr);
    displayBars = arr.map((val, i) => ({ value: val, x: i, targetX: i }));
}

/**
 * Runs every requestAnimationFrame(), usually the monitor's refresh rate
 * @param {Number} dt Time since the previous frame
 */
export function update(dt) {
    stats.FPS = (1000 / dt).toFixed(2)
    stats.DELTA_TIME = dt.toFixed(2)

    let speedMult = config.SPEED_MULT
    // Make the final check slower because it's satisfying to watch
    if (doFinalCheck) {
        speedMult = Math.ceil((arr.length)/100)
    }


    // Every frame, if a sort is running, take one step
    for (let i = 0; i < speedMult; i++) {
        if (sortInstance && !config.PAUSED) {
            const result = sortInstance.next();

            if (!result.done) {
                // result.value contains the { highlighting: [...] } object we yielded
                activeIndices = result.value.highlighting;
                if (activeIndices.length > 0) {
                    const val = arr[activeIndices[0]];
                    playNote(val);
                }
                if (!doFinalCheck) {
                    stats.STEPS++
                }
            } else {
                if (doFinalCheck === false) {
                    doFinalCheck = true
                    sortInstance = finalCheck(arr);
                } else {
                    config.PAUSED = true
                    playbackBtn.name("Start")
                    sortInstance = null;
                }

                activeIndices = []; // Clear highlights when done

            }
        }
    }
}
function makeRandomArray(length = 10) {
    let nums = [];

    switch (config.ARRAY_TYPE) {
        case "linear":
            for (let i = 0; i < length; i++) {
                nums.push(i + 1);
            }
            break;

        case "quadratic":
            // Grows faster than linear, slower than exponential
            for (let i = 0; i < length; i++) {
                nums.push(i ** 2);
            }
            break;

        case "logarithmic":
            // Rapid growth at first, then flattens out
            for (let i = 1; i <= length; i++) {
                nums.push(Math.log(i));
            }
            break;

        case "sinusoidal":
            // Creates a wave pattern
            for (let i = 0; i < length; i++) {
                nums.push(Math.sin(i * 0.1) * 100);
            }
            break;

        case "duplicates":
            // Great for testing sorting stability
            for (let i = 0; i < length; i++) {
                nums.push(Math.floor(i / 3));
            }
            break;
        case "only2":
            for (let i = 0; i < length; i++) {
                nums.push(i % 2 + 1);
            }
            break;
        case "only4":
            for (let i = 0; i < length; i++) {
                nums.push(i % 4 + 1);
            }
            break;
    }
    highestNum = nums.reduce((a, b) => Math.max(a, b), -Infinity);

    switch (config.ARRAY_OPERATION) {
        case "randomized":
            nums = shuffle(nums)
            break
        case "reversed":
            nums.reverse()
            break
    }
    return nums;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate random index
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements using destructuring
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function draw(canvas, ctx) {
    // bg
    ctx.fillStyle = config.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const totalBars = arr.length;
    const barWidth = canvas.width / totalBars;

    ctx.font = `${config.STATS_FONT_SIZE}px sans`
    ctx.fillStyle = config.PRIMARY_COLOR;
    let statsShown = 0;
    if (config.SHOW_STEPS) {
        statsShown++
        ctx.fillText("Steps: " + stats.STEPS, 10, config.STATS_FONT_SIZE * statsShown)
    }
    if (config.SHOW_FPS) {
        statsShown++
        ctx.fillText("FPS: " + stats.FPS, 10, config.STATS_FONT_SIZE * statsShown)
    }
    if (config.SHOW_DT) {
        statsShown++
        ctx.fillText("Delta Time: " + stats.DELTA_TIME, 10, config.STATS_FONT_SIZE * statsShown)
    }
    if (config.SMOOTH_ANIMATION && displayBars.length === totalBars) {
        // 1. Map current array values to their indices (handling duplicates stably)
        const targetIndices = new Map();
        for (let i = 0; i < totalBars; i++) {
            const val = arr[i];
            if (!targetIndices.has(val)) targetIndices.set(val, []);
            targetIndices.get(val).push(i);
        }

        // 2. Reconcile display bars with the target indices and interpolate
        displayBars.forEach(bar => {
            const list = targetIndices.get(bar.value);
            if (list && list.length > 0) {
                bar.targetX = list.shift();
            }

            // Interpolate position
            bar.x += (bar.targetX - bar.x) * config.ANIMATION_SPEED;

            const barHeight = canvas.height * (bar.value / highestNum);

            if (activeIndices.includes(bar.targetX)) {
                ctx.fillStyle = config.ACTIVE_COLOR;
            } else if (sortedIndices.includes(bar.targetX)) {
                ctx.fillStyle = config.SORTED_COLOR;
            } else {
                ctx.fillStyle = config.PRIMARY_COLOR;
            }

            const x = bar.x * barWidth;
            const drawWidth = Math.max(1, Math.ceil(barWidth) - config.SPACING);

            ctx.fillRect(
                x,
                canvas.height - barHeight,
                drawWidth,
                barHeight
            );
        });
    } else {
        // Original static drawing logic
        for (let k = 0; k < totalBars; k++) {
            const barHeight = canvas.height * (arr[k] / highestNum);
            if (activeIndices.includes(k)) {
                ctx.fillStyle = config.ACTIVE_COLOR;
            } else if (sortedIndices.includes(k)) {
                ctx.fillStyle = config.SORTED_COLOR;
            } else {
                ctx.fillStyle = config.PRIMARY_COLOR;
            }
            const x = Math.floor(k * barWidth);
            const drawWidth = Math.max(1, Math.ceil(barWidth) - config.SPACING);
            ctx.fillRect(x, canvas.height - barHeight, drawWidth, barHeight);
        }
    }
}

function randIntRange(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

let synth = null;

function initSynth() {
    if (synth) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = config.SOUND_TYPE;
    osc.frequency.setValueAtTime(440, ctx.currentTime);

    // Start with volume at 0
    gain.gain.setValueAtTime(0, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    synth = { ctx, osc, gain };
}

function playNote(value) {
    if (value === undefined) return;
    if (config.SOUND_TYPE === "none") return;
    if (!synth) initSynth();

    const { ctx, osc, gain } = synth;
    const freq = 200 + (value / highestNum) * 800;

    // 1. Immediately jump to the new frequency
    osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.001);

    // 2. "Pulse" the volume (Attack/Decay)
    // We use cancelScheduledValues to stop previous notes from fighting for the volume
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);

    // Quick attack to 0.1 volume, then fast decay
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
}

function* finalCheck(array) {
    let len = array.length;
    for (let i = 0; i < len; i++) {
        if (array[i] <= array[i + 1]) {
            sortedIndices.push(i)
        }
        yield { highlighting: [i, i + 1] };
    }
    sortedIndices.push(len - 1)
    yield { highlighting: [len - 1] };
    sortedIndices = []
}