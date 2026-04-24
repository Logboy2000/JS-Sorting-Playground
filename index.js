//////////////
document.addEventListener("DOMContentLoaded", loaded)
let canvas, ctx
let prevTime = performance.now()

function loaded() {
	canvas = document.getElementById("canvas")
	ctx = canvas.getContext("2d")
	ctx.imageSmoothingEnabled = false

	// older browser support
	ctx.mozImageSmoothingEnabled = false
	ctx.webkitImageSmoothingEnabled = false
	ctx.msImageSmoothingEnabled = false
	window.addEventListener("resize", resizeCanvas)
	resizeCanvas()
	start()
	loop()
	logicLoop()
}

function loop() {
	const dt = performance.now() - prevTime
	stats.FPS = (1000 / dt).toFixed(2)
	stats.DELTA_TIME = dt.toFixed(2)

	// Process the final check sweep here so it's tied to refresh rate, not step delay
	if (doFinalCheck && sortInstance && !config.PAUSED) {
		// This calculates a speed that ensures the sweep takes ~1.6 seconds regardless of array size
		const sweepSpeed = Math.max(1, Math.ceil(arr.length / 100))
		for (let i = 0; i < sweepSpeed; i++) {
			if (doFinalCheck) update()
		}
	}

	draw(canvas, ctx)
	prevTime = performance.now()
	requestAnimationFrame(loop)
}
function logicLoop() {
	// Only process the actual sorting algorithm in the logic loop
	if (sortInstance && !config.PAUSED && !doFinalCheck) {
		let stepsToRun = config.STEP_DELAY === 0 ? 1000 : 1

		for (let i = 0; i < stepsToRun; i++) {
			// Break if the sort finishes and transitions to the check
			if (!sortInstance || config.PAUSED || doFinalCheck) break
			update()
		}
	}
	setTimeout(logicLoop, config.STEP_DELAY)
}

function resizeCanvas() {
	const canvas = document.getElementById("canvas")
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight
}

//////////////
const SAVE_KEY = "sorting_playground_config"
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
	stalinSort,
	stoogeSort,
	bogoSort,
]
const algoNames = [
	"Bubble Sort",
	"Selection Sort",
	"Insertion Sort",
	"Quick Sort",
	"Cocktail Shaker Sort",
	"Pancake Sort",
	"Shell Sort",
	"Odd-Even Sort",
	"Gnome Sort",
	"Comb Sort",
	"Heap Sort",
	"Cycle Sort",
	"Merge Sort",
	"Sleep Sort",
	"Radix Sort",
	"Circle Sort",
	"Stalin Sort",
	"Stooge Sort",
	"Bogo Sort",
]

let arr = []
let highestNum = 0
let activeIndices = []
let sortedIndices = []
let doFinalCheck = false
let isRunningAllSorts = false
let displayBars = []

let config = {
	// sorting
	SELECTED_ALGORITHM: 12, // default to merge sort
	STEP_DELAY: 10,
	AUTO_NEXT_ALGO: false,
	SMOOTH_ANIMATION: true,
	ANIMATION_SPEED: 0.1,

	// generation
	ARRAY_TYPE: "linear",
	ARRAY_OPERATION: "randomized",
	ARRAY_LENGTH: 400,

	SOUND_TYPE: "sine",

	/// visual
	SPACING: 0,
	ZOOM: 1,
	
	// color
	BG_COLOR: "#000000",
	PRIMARY_COLOR: "#FFFFFF",
	ACTIVE_COLOR: "#FF0000",
	SORTED_COLOR: "#00FF00",

	/// stats
	STATS_FONT_SIZE: 20,
	SHOW_STEPS: false,
	SHOW_FPS: false,
	SHOW_DT: false,
	SHOW_ALGORITHM_NAME: false,

	PAUSED: true,
}

let stats = {
	STEPS: 0,
	FPS: 0,
	DELTA_TIME: 0,
}

function saveSettings() {
	localStorage.setItem(SAVE_KEY, JSON.stringify(config))
	alert("Settings saved! They will be loaded next time you're here!")
}

function loadSettings() {
	const saved = localStorage.getItem(SAVE_KEY)
	if (saved) {
		const parsed = JSON.parse(saved)
		// Merge saved settings into the current config
		Object.assign(config, parsed)
	}
}

function clearSettings() {
	localStorage.clear()
	alert("Saved settings cleared!")
}
loadSettings() // from cookies if saved
const gui = new dat.GUI({ name: "Settings" })

gui
	.add(config, "ARRAY_TYPE", {
		Linear: "linear",
		Quadratic: "quadratic",
		Logarithmic: "logarithmic",
		Sinusoidal: "sinusoidal",
		Duplicates: "duplicates",
		"Only 2": "only2",
		"Only 4": "only4",
	})
	.name("Array Type")

gui
	.add(config, "ARRAY_OPERATION", {
		Normal: "normal",
		Reversed: "reversed",
		Randomized: "randomized",
	})
	.name("Array Operation")

gui.add(config, "ARRAY_LENGTH", 3, 4096, 1).name("# Of Elements")

// create mapping for the GUI dropdown using pre-defined names
const algoMap = {}
algoNames.forEach((name, index) => {
	algoMap[name] = index
})

gui
	.add(config, "SELECTED_ALGORITHM", algoMap)
	.name("Algorithm")
	.onFinishChange((val) => {
		beginSort(Number(val))
	})
	.listen()
gui.add(config, "STEP_DELAY", 0, 1000, 0.0001).name("Step Delay (ms)").listen()
gui.add(config, "AUTO_NEXT_ALGO").name("Auto Next Algo")
gui.add(config, "SMOOTH_ANIMATION").name("Smooth Animation")
gui.add(config, "ANIMATION_SPEED", 0.01, 1).name("Animation Speed")

gui
	.add(config, "SOUND_TYPE", {
		None: "none",
		Sine: "sine",
		Square: "square",
		Sawtooth: "sawtooth",
		Triangle: "triangle",
	})
	.name("Sound Type")
	.onFinishChange((newValue) => {
		if (newValue === "none") return
		if (synth && synth.osc) {
			synth.osc.type = newValue
		}
	})
gui.add(config, "SPACING", 0, 10).step(1).name("Bar Spacing")
gui.add(config, "ZOOM", 0.1, 1, 0.001).name("Zoom")


gui.add({fun: useCustomArrayButtonPressed},"fun",).name("Use Custom Array")
gui.add({fun: generateArrButtonPressed},"fun",).name("Generate Array")

function generateArrButtonPressed() {
	arr = makeRandomArray(config.ARRAY_LENGTH)
	config.PAUSED = true
	beginSort()
	playbackBtn.name("Play")
}
function useCustomArrayButtonPressed() {
	const input = prompt("Enter a comma-separated list of numbers (e.g. 5,3,8,1):")
	if (input) {
		const parsed = input
			.split(",")
			.map((s) => parseFloat(s.trim()))
			.filter((n) => !isNaN(n))
		if (parsed.length > 0) {
			arr = parsed
			highestNum = Math.max(...arr)
			config.PAUSED = true
			beginSort()
			playbackBtn.name("Play")
		} else {
			alert("No valid numbers found in input.")
		}
	}
}

const playbackBtn = gui
	.add(
		{
			fun: playbackBtnPressed,
		},
		"fun",
	)
	.name("Start")

function playbackBtnPressed() {
	if (config.PAUSED) {
		config.PAUSED = false
		playbackBtn.name("Pause")
		if (!sortInstance || doFinalCheck) {
			// This runs once before the sort begins
			beginSort()
		}
	} else {
		config.PAUSED = true
		playbackBtn.name("Play")
	}
}

//#region Folders
const colorFolder = gui.addFolder("Colors")
colorFolder.addColor(config, "BG_COLOR").name("Background")
colorFolder.addColor(config, "PRIMARY_COLOR").name("Primary")
colorFolder.addColor(config, "ACTIVE_COLOR").name("Active Indecies")
colorFolder.addColor(config, "SORTED_COLOR").name("Sorted Color")

const statsFolder = gui.addFolder("Stats")
statsFolder.add(config, "STATS_FONT_SIZE", 0, 50, 1).name("Font Size")
statsFolder.add(config, "SHOW_ALGORITHM_NAME").name("Show Algo Name")
statsFolder.add(config, "SHOW_STEPS").name("Steps")
statsFolder.add(config, "SHOW_FPS").name("FPS")
statsFolder.add(config, "SHOW_DT").name("Delta Time")

const saveFolder = gui.addFolder("Save/Load")
saveFolder
	.add(
		{
			fun: saveSettings,
		},
		"fun",
	)
	.name("Save Settings to Cookie")
saveFolder
	.add(
		{
			fun: clearSettings,
		},
		"fun",
	)
	.name("Clear Saved Settings")
//#endregion

gui
	.add(
		{
			fun: () => {
				window.open("https://github.com/Logboy2000/JS-Sorting-Playground")
			},
		},
		"fun",
	)
	.name("View on GitHub")
gui
	.add(
		{
			fun: () => {
				window.open("https://loganhowarth.pages.dev/")
			},
		},
		"fun",
	)
	.name("Site by Logan Howarth")

const keybindsButton = gui
	.add(
		{
			fun: () => {
				if (
					document.getElementById("keybinds-popup").style.display === "block"
				) {
					document.getElementById("keybinds-popup").style.display = "none"
				} else {
					document.getElementById("keybinds-popup").style.display = "block"
				}
			},
		},
		"fun",
	)
	.name("Keybinds")

let sortInstance = null // Holds the active generator* that is called each frame

/**
 * Runs once right before update/draw loop begins
 */
function start() {
	arr = makeRandomArray(config.ARRAY_LENGTH)
	displayBars = arr.map((val, i) => ({ value: val, x: i, targetX: i }))
	document.addEventListener("keypress", (e) => {
		if (e.key === " ") {
			playbackBtnPressed()
		}
	})
	document.addEventListener("keydown", (e) => {
		if (e.key === "=" || e.key === "+") {
			if (config.STEP_DELAY < 1000) {
				config.STEP_DELAY += 0.001
			}
		}
		if (e.key === "-") {
			if (config.STEP_DELAY >= 1) {
				config.STEP_DELAY -= 0.001
			} else {
				config.STEP_DELAY = 0
			}
		}
		if (e.key === "ArrowRight") {
			if (config.SELECTED_ALGORITHM < sortAlgos.length - 1) {
				beginSort(config.SELECTED_ALGORITHM + 1)
			}
		}
		if (e.key === "ArrowLeft") {
			if (config.SELECTED_ALGORITHM > 0) {
				beginSort(config.SELECTED_ALGORITHM - 1)
			}
		}
		if (e.key === "g") {
			generateArrButtonPressed()
		}
		if (e.key === "s") {
			saveSettings()
		}
		if (e.key === "c") {
			clearSettings()
			location.reload()
		}
		// step through sort with enter key (only works when paused and not in final check)
		if (e.key === "Enter") {
			step()
		}
	})
}

/**
 * Does the initial setup for the sort and resets values
 */
function beginSort(selectedAlgorithm = config.SELECTED_ALGORITHM) {
	config.SELECTED_ALGORITHM = selectedAlgorithm
	doFinalCheck = false
	activeIndices = []
	sortedIndices = []
	stats.STEPS = 0
	sortInstance = sortAlgos[config.SELECTED_ALGORITHM](arr)
	displayBars = arr.map((val, i) => ({ value: val, x: i, targetX: i }))
}

function update() {
	if (sortInstance && !config.PAUSED) {
		step()
	}
}

/**
 * Processes a single step of the current sort
 */
function step() {
	if (!sortInstance) {
		beginSort()
	}
	const result = sortInstance.next()

	if (!result.done) {
		activeIndices = result.value.highlighting
		if (activeIndices.length > 0) {
			const val = arr[activeIndices[0]]
			playNote(val)
		}
		if (!doFinalCheck) {
			stats.STEPS++
		}
	} else {
		if (doFinalCheck === false) {
			doFinalCheck = true
			sortInstance = finalCheck(arr)
		} else {
			if (config.AUTO_NEXT_ALGO) {
				config.PAUSED = true
				playbackBtn.name("Waiting...")
				setTimeout(() => {
					if (config.SELECTED_ALGORITHM < sortAlgos.length - 1) {
						config.SELECTED_ALGORITHM++
						arr = makeRandomArray(config.ARRAY_LENGTH)
						beginSort(config.SELECTED_ALGORITHM)
						config.PAUSED = false
						playbackBtn.name("Pause")
					} else {
						playbackBtn.name("Start")
						sortInstance = null
					}
				}, 500)
			} else {
				config.PAUSED = true
				playbackBtn.name("Start")
				sortInstance = null
			}
		}

		activeIndices = [] // Clear highlights when done
	}
}

function makeRandomArray(length = 10) {
	let nums = []

	switch (config.ARRAY_TYPE) {
		case "linear":
			for (let i = 0; i < length; i++) {
				nums.push(i + 1)
			}
			break

		case "quadratic":
			// Grows faster than linear, slower than exponential
			for (let i = 0; i < length; i++) {
				nums.push(i ** 2)
			}
			break

		case "logarithmic":
			// Rapid growth at first, then flattens out
			for (let i = 1; i <= length; i++) {
				nums.push(Math.log(i))
			}
			break

		case "sinusoidal":
			// Creates a wave pattern
			for (let i = 0; i < length; i++) {
				nums.push(Math.sin(i * 0.1) * 100)
			}
			break

		case "duplicates":
			// Great for testing sorting stability
			for (let i = 0; i < length; i++) {
				nums.push(Math.floor(i / 3))
			}
			break
		case "only2":
			for (let i = 0; i < length; i++) {
				nums.push((i % 2) + 1)
			}
			break
		case "only4":
			for (let i = 0; i < length; i++) {
				nums.push((i % 4) + 1)
			}
			break
	}
	highestNum = nums.reduce((a, b) => Math.max(a, b), -Infinity)

	switch (config.ARRAY_OPERATION) {
		case "randomized":
			nums = shuffle(nums)
			break
		case "reversed":
			nums.reverse()
			break
	}
	return nums
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		// Generate random index
		const j = Math.floor(Math.random() * (i + 1))
		// Swap elements using destructuring
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}

function draw(canvas, ctx) {
	// bg
	ctx.fillStyle = config.BG_COLOR
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	const totalBars = arr.length
	const barWidth = canvas.width / totalBars

	ctx.font = `${config.STATS_FONT_SIZE}px sans`
	ctx.fillStyle = config.PRIMARY_COLOR
	let statsShown = 0
	if (config.SHOW_ALGORITHM_NAME) {
		statsShown++
		const algoName = algoNames[config.SELECTED_ALGORITHM] || "Unknown"
		ctx.fillText(
			"Algorithm: " + algoName,
			10,
			config.STATS_FONT_SIZE * statsShown,
		)
	}
	if (config.SHOW_STEPS) {
		statsShown++
		ctx.fillText(
			"Steps: " + stats.STEPS,
			10,
			config.STATS_FONT_SIZE * statsShown,
		)
	}
	if (config.SHOW_FPS) {
		statsShown++
		ctx.fillText("FPS: " + stats.FPS, 10, config.STATS_FONT_SIZE * statsShown)
	}
	if (config.SHOW_DT) {
		statsShown++
		ctx.fillText(
			"Delta Time: " + stats.DELTA_TIME,
			10,
			config.STATS_FONT_SIZE * statsShown,
		)
	}

	ctx.save()
	ctx.scale(config.ZOOM, config.ZOOM)
	ctx.translate(
		(canvas.width / config.ZOOM - canvas.width) / 2,
		(canvas.height / config.ZOOM - canvas.height) / 2,
	)


	if (config.SMOOTH_ANIMATION && displayBars.length === totalBars) {
		// 1. Map current array values to their indices
		const targetIndices = new Map()
		for (let i = 0; i < totalBars; i++) {
			const val = arr[i]
			if (!targetIndices.has(val)) targetIndices.set(val, [])
			targetIndices.get(val).push(i)
		}

		// 2. Reconcile display bars with the target indices and interpolate
		displayBars.forEach((bar) => {
			const list = targetIndices.get(bar.value)
			if (list && list.length > 0) {
				bar.targetX = list.shift()
			}

			// Interpolate position
			bar.x += (bar.targetX - bar.x) * config.ANIMATION_SPEED

			const barHeight = canvas.height * (bar.value / highestNum)

			if (activeIndices.includes(bar.targetX)) {
				ctx.fillStyle = config.ACTIVE_COLOR
			} else if (sortedIndices.includes(bar.targetX)) {
				ctx.fillStyle = config.SORTED_COLOR
			} else {
				ctx.fillStyle = config.PRIMARY_COLOR
			}

			const x = bar.x * barWidth
			const drawWidth = Math.max(1, Math.ceil(barWidth) - config.SPACING)

			ctx.fillRect(x, canvas.height - barHeight, drawWidth, barHeight)
		})
	} else {
		// static drawing without animation
		for (let k = 0; k < totalBars; k++) {
			const barHeight = canvas.height * (arr[k] / highestNum)
			if (activeIndices.includes(k)) {
				ctx.fillStyle = config.ACTIVE_COLOR
			} else if (sortedIndices.includes(k)) {
				ctx.fillStyle = config.SORTED_COLOR
			} else {
				ctx.fillStyle = config.PRIMARY_COLOR
			}
			const x = Math.floor(k * barWidth)
			const drawWidth = Math.max(1, Math.ceil(barWidth) - config.SPACING)
			ctx.fillRect(x, canvas.height - barHeight, drawWidth, barHeight)
		}
	}
	ctx.restore()
}
function randIntRange(min, max) {
	const minCeiled = Math.ceil(min)
	const maxFloored = Math.floor(max)
	return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
}

let synth = null

function initSynth() {
	if (synth) return

	const ctx = new (window.AudioContext || window.webkitAudioContext)()
	const osc = ctx.createOscillator()
	const gain = ctx.createGain()

	osc.type = config.SOUND_TYPE
	osc.frequency.setValueAtTime(440, ctx.currentTime)

	// Start with volume at 0
	gain.gain.setValueAtTime(0, ctx.currentTime)

	osc.connect(gain)
	gain.connect(ctx.destination)
	osc.start()

	synth = { ctx, osc, gain }
}

function playNote(value) {
	if (value === undefined) return
	if (config.SOUND_TYPE === "none") return
	if (!synth) initSynth()

	const { ctx, osc, gain } = synth
	const freq = 200 + (value / highestNum) * 800

	// 1. Immediately jump to the new frequency
	osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.001)

	// 2. "Pulse" the volume (Attack/Decay)
	// We use cancelScheduledValues to stop previous notes from fighting for the volume
	gain.gain.cancelScheduledValues(ctx.currentTime)
	gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)

	// Quick attack to 0.1 volume, then fast decay
	gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.001)
	gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
}

function* finalCheck(array) {
	let len = array.length
	for (let i = 0; i < len - 1; i++) {
		if (array[i] <= array[i + 1]) {
			sortedIndices.push(i)
		}
		yield { highlighting: [i, i + 1] }
	}
	sortedIndices.push(len - 1)
	yield { highlighting: [len - 1] }
}
