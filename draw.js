import { RingSpinner, Word, Wordclass } from "./models/word.js"
import Letter from "./models/letter.js"

const myCreateElement = (tag, attr={}) => {
    const obj = document.createElement(tag)
    for (const [key, value] of Object.entries(attr))
        obj[key] = value
    return obj
}

const menu = document.getElementById("menu")
const draw = SVG("#output")
const MaxLetterLevel = 6
const scale1 = 50
const scale2 = 55

const mediaCache = {}

class WordController {
    constructor(prevWord=null, pos=[parseInt(200 + Math.random()*200), parseInt(200 + Math.random()*200)]) {
        this.word = new Word()
        this.word.position = pos
        this.base = this.word.base
        this.ringIMGS = []
        this.centerImg = undefined
        this.rotation = 0
        //this.oldInputContent = ""
        this.inputContent = ""
        this.baseLettersImgs = []
        this.prevWord = prevWord
        this.nextWord = null

        this.populate()
    }

    async update() {
        this.buildWord().then(() => {
            for (let i = this.ringIMGS.length-1; i >= 0; i--) {
                this.ringIMGS[i].remove() // remove from DOM
                this.ringIMGS.pop()       // remove from array
            }
            for (let i = 0; i < this.baseLettersImgs.length; i++) {
                const rotation = this.base.letters[i].angle
                const scale = i <= MaxLetterLevel ? (i+2)*scale1 : (i+2)*scale2
                const currentRingImg = this.baseLettersImgs[i]
                const ring = draw.image(currentRingImg)
                ring.width(scale).height(scale)
                    .cx(this.word.position[0])
                    .cy(this.word.position[1])
                    .transform({rotate: rotation+this.rotation})
                this.ringIMGS[i] = ring
            }
        })
    }

    updateBase(e) {
        //this.oldInputContent = this.inputContent
        this.inputContent = e.target.value
        const addedLetter = e.key
        const cursorPos = e.currentTarget.selectionStart
        const cursorEndPos = e.currentTarget.selectionEnd
        const isDelete = addedLetter == "Backspace" || addedLetter === "Delete" ? addedLetter : false
        if (addedLetter === " ") {
            e.preventDefault()
            this.nextWord = new WordController(this)
            return
        }
        if (isDelete) {
            this.base.removeLetter(cursorPos-(isDelete === "Backspace" ? 1 : 0))
        } else if (!Letter.isLetter(addedLetter)) {
            if (!addedLetter.startsWith("Arrow") && !addedLetter.startsWith("F"))
                e.preventDefault()
        } else {
            this.base.addLetter(addedLetter, cursorPos)
        }
        this.update()
    }

    updatePos(e) {
        this.word.position[0] = +this.xInput.value
        this.word.position[1] = +this.yInput.value
        
        this.centerImg?.center(this.word.position[0], this.word.position[1])

        this.update()
    }

    updateWordclass(e) {
        this.word.wordclass = Wordclass.get(this.wordclassSelect.value)
        this.centerImg?.remove()
        if (this.word.wordclass.filename !== "") {
            const filename = this.word.wordclass.filename
            const rotation = 0
            const scale = scale1
            WordController.getMedia(filename, "./media/classes/").then((img) => {
                this.centerImg = draw.image(img)
                this.centerImg.width(scale).height(scale).center(this.word.position[0], this.word.position[1])//.rotate(rotation)
            })
        }
    }

    updateSpinner(e) {
        this.word.base.spinner = RingSpinner.get(this.spinnerSelect.value)
        this.word.spinner = RingSpinner.get(this.spinnerSelect.value)
        
        this.base.recalcAngle()
        this.ringIMGS.forEach((ring, i) => {
            const rotation = this.base.letters[i].angle
            ring.transform({rotate: rotation+this.rotation})
        })
    }

    updateRotation(e) {
        this.rotation = parseInt(e.target.value)
        this.ringIMGS.forEach((ring, i) => {
            const rotation = this.base.letters[i].angle
            ring.transform({rotate: rotation+this.rotation})
        })
    }

    populate() {
        const container = myCreateElement("div", {className: "card mb-3"})
        const editorDiv = myCreateElement("div", {className: "card-body"})

        const wordInputDiv = myCreateElement("div", {className: "input-group mb-3"})
        this.wordInput = myCreateElement("input", {type: "text", className: "form-control"})
        this.wordInput.addEventListener("keydown", (e) => {
            this.updateBase(e)
        })
        wordInputDiv.append(this.wordInput)

        const coordsDiv = myCreateElement("div", {className: "input-group mb-3"})
        const spanX = myCreateElement("span", {className: "input-group-text", innerHTML: "x"})
        const spanY = myCreateElement("span", {className: "input-group-text", innerHTML: "y"})
        this.xInput = myCreateElement("input", {className: "form-control", type: "number", value: this.word.position[0], step: 5})
        this.xInput.addEventListener("input", (e) => {
            this.updatePos(e)
        })
        this.yInput = myCreateElement("input", {className: "form-control", type: "number", value: this.word.position[1], step: 5})
        this.yInput.addEventListener("input", (e) => {
            this.updatePos(e)
        })
        coordsDiv.append(spanX, this.xInput, spanY, this.yInput)

        const rotDiv = myCreateElement("div", {className: "input-group mb-3"})
        this.rotationInput = myCreateElement("input", {type: "range", class: "form-range", min: 0, max: 359, value: 180})
        this.rotationInput.addEventListener("input", (e) => {
            this.updateRotation(e)
        })
        rotDiv.append(this.rotationInput)

        const classSelectDiv = myCreateElement("div", {className: "input-group mb-3"})
        this.wordclassSelect = myCreateElement("select", {className: "form-select"})
        for (let w of Object.keys(Wordclass)) {
            const option = myCreateElement("option", {
                value: Wordclass[w].name,
                innerHTML: Wordclass[w].name
            })
            this.wordclassSelect.appendChild(option)
        }
        this.wordclassSelect.value = Wordclass.getDefault().name
        classSelectDiv.append(this.wordclassSelect)

        this.wordclassSelect.addEventListener("change", (e) => {
            this.updateWordclass(e)
        })

        const spinnerDiv = myCreateElement("div", {className: "input-group mb-3"})
        this.spinnerSelect = myCreateElement("select", {className: "form-select"})
        for (let w of Object.keys(RingSpinner)) {
            const option = myCreateElement("option", {
                value: RingSpinner[w].name,
                innerHTML: RingSpinner[w].name
            })
            this.spinnerSelect.appendChild(option)
        }
        this.spinnerSelect.value = RingSpinner.getDefault().name
        spinnerDiv.append(this.spinnerSelect)

        this.spinnerSelect.addEventListener("change", (e) => {
            this.updateSpinner(e)
        })

        editorDiv.append(wordInputDiv, coordsDiv, rotDiv, classSelectDiv, spinnerDiv)
        container.appendChild(editorDiv)
        menu.appendChild(container)
        this.wordInput.focus()
    }

    async buildWord() {
        this.baseLettersImgs = []
        for (let i = 0; i < this.base.letters.length; i++) {
            const letter = this.base.letters[i]
            const mediaName = `${letter.getLetter()}_${i < MaxLetterLevel ? i+1: MaxLetterLevel}.png`
            this.baseLettersImgs.push(await WordController.getMedia(mediaName))
        }
    }

    static async getMedia(file, path="./media/letters/") {
        if (!(file in mediaCache)) {
            const response = await fetch(`${path}${file}`)
            let media
            if (file.endsWith(".svg")) {
                media = await response.text()
            } else /*if (file.endsWith(".png"))*/ {
                media = await response.blob().then((imgBlob) => {
                    return URL.createObjectURL(imgBlob)
                })
            }
            mediaCache[file] = media
        }
        return mediaCache[file]
    }

    getRadius() {
        return this.base.letters.length *
            (this.base.letters.length <= MaxLetterLevel ? scale1 : scale2)
    }
}

class WordclassController {
    static classes = Object.keys(Wordclass)

    getFilePath(klassz) {
        const filename = Wordclass.getFilePath(klassz)
        if (filename !== "")
            return `./media/classes/${filename}`
        return ""
    }
}

const wc = new WordController()
