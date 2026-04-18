let deltaTime = 0
let arr = []
let highestNum = 0
let activeIndices = []

let config = {
    SELECTED_ALGORITHM: 0,
    SPEED_MULT: 1,

    ARRAY_TYPE: "linear",
    ARRAY_LENGTH: 100,
    RANDOMIZE_ORDER: true,
    REVERSE_ORDER: false,

    SOUND_TYPE: "sine",
    SPACING: 0,
    BG_COLOR: '#000000',
    PRIMARY_COLOR: '#FFFFFF',
    SECONDARY_COLOR: '#FF0000',

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
    stoogeSort,
    bogoSort       
]



gui.add(config, 'ARRAY_TYPE', {
    "Linear": "linear",
    "Quadratic": "quadratic",
    "Logarithmic": "logarithmic",
    "Sinusoidal": "sinusoidal",
    "Duplicates": "duplicates"
}).name('Array Type')

gui.add(config, "RANDOMIZE_ORDER").name("Randomized")
gui.add(config, "REVERSE_ORDER").name("Reversed")
gui.add(config, 'ARRAY_LENGTH', 3, 25000, 1).name("# Of Elements")








// make key: value stuff so I sont have to type it for every new algothitm
const algoMap = {};
sortAlgos.forEach((fn, index) => {
    // Converts "bubbleSort" to "Bubble Sort"
    const name = fn.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    algoMap[name] = index;
});

gui.add(config, 'SELECTED_ALGORITHM', algoMap).name('Algorithm').onFinishChange(() => {
    sortInstance = sortAlgos[config.SELECTED_ALGORITHM](arr);
});
gui.add(config, 'SPEED_MULT', 1, 100, 1).name("Speed Mult").listen()





gui.add(config, 'SOUND_TYPE', {
    "None": "none",
    "Sine": "sine",
    "Square": "square",
    "Sawtooth": "sawtooth",
    "Triangle": "triangle",
})
.name('Sound Type')
.onFinishChange((newValue) => {
    if(newValue === "none") return
    if (synth && synth.osc) {
        synth.osc.type = newValue;
    }
});
gui.add(config, 'SPACING', 0, 10).step(1).name('Bar Spacing');



const colorFolder = gui.addFolder("Colors")

colorFolder.addColor(config, "BG_COLOR").name("Background")
colorFolder.addColor(config, "PRIMARY_COLOR").name("Primary")
colorFolder.addColor(config, "SECONDARY_COLOR").name("Secondary")



gui.add({
    fun: saveSettings
}, 'fun').name('Save Settings to Cookie');
gui.add({
    fun: saveSettings
}, 'fun').name('Clear Saved Settings');
gui.add({
    fun: generateArrButtonPressed
}, 'fun').name('Generate Array');

function generateArrButtonPressed() {
    arr = makeRandomArray(config.ARRAY_LENGTH)
    activeIndices = []
    config.PAUSED = true;
    playbackBtn.name("Play")
    sortInstance = sortAlgos[config.SELECTED_ALGORITHM](arr)
}
const playbackBtn = gui.add({
    fun: playbackBtnPressed
}, 'fun').name('Start');

function playbackBtnPressed() {
    if (config.PAUSED) {
        config.PAUSED = false;
        playbackBtn.name("Pause")
        if (!sortInstance) {
            sortInstance = sortAlgos[config.SELECTED_ALGORITHM](arr);
        }
    } else {
        config.PAUSED = true;
        playbackBtn.name("Play")
    }
}










let sortInstance = null; // Holds the active generator*

export function start() {
    arr = makeRandomArray(config.ARRAY_LENGTH)
    document.addEventListener('keypress', (e) => {
        if (e.key === " ") {playbackBtnPressed()}
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

export function update(dt) {
    // Every frame, if a sort is running, take one step
    for (let i = 0; i < config.SPEED_MULT; i++) {
        if (sortInstance && !config.PAUSED) {

            const result = sortInstance.next();

            if (!result.done) {
                // result.value contains the { highlighting: [...] } object we yielded
                activeIndices = result.value.highlighting;
                if (activeIndices.length > 0) {
                    const val = arr[activeIndices[0]];
                    playNote(val);
                }
            } else {
                sortInstance = null;
                activeIndices = []; // Clear highlights when done
                config.PAUSED = true
                playbackBtn.name("Start")
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
    }
    highestNum = nums.reduce((a, b) => Math.max(a, b), -Infinity);

    if (config.RANDOMIZE_ORDER) {
        nums = shuffle(nums)
    }
    if (config.REVERSE_ORDER) {
        nums.reverse()
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

    for (let k = 0; k < totalBars; k++) {
        const barHeight = canvas.height * (arr[k] / highestNum);

        if (activeIndices.includes(k)) {
            ctx.fillStyle = config.SECONDARY_COLOR;
        } else {
            ctx.fillStyle = config.PRIMARY_COLOR;
        }

        // Calculate X as an integer to keep things sharp
        const x = Math.floor(k * barWidth);
        
        // Subtract spacing from the width
        // We use Math.max(1, ...) to ensure bars don't disappear if spacing is too high
        const drawWidth = Math.max(1, Math.ceil(barWidth) - config.SPACING);

        ctx.fillRect(
            x, 
            canvas.height - barHeight, 
            drawWidth, 
            barHeight
        );
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

