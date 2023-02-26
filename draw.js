import { Word, Wordclass } from "./models/word.js"

const myCreateElement = (tag, attr={}) => {
    const obj = document.createElement(tag)
    for (const [key, value] of Object.entries(attr))
        obj[key] = value
    return obj
}

const menu = document.getElementById("menu")
const draw = SVG("#output")
const MaxLetterLevel = 6

const mediaCache = {}

class WordController {
    constructor() {
        this.word = new Word()
        this.word.position = [
            parseInt(200 + Math.random()*200),
            parseInt(200 + Math.random()*200)
        ]
        this.base = this.word.base
        this.ringIMGS = []
        this.centerImg = undefined
        this.oldInputContent = ""
        this.inputContent = ""
        this.baseLettersImgs = []

        this.populate()
    }

    async update(e) {
        this.oldInputContent = this.inputContent
        this.inputContent = e?.target.value
        const addedLetter = e?.data
        const cursorPos = e?.target.selectionStart
        const inputType = e?.inputType
        if (addedLetter === " ") {
            const nextWC = new WordController()
            return
        }
        switch (inputType) {
            case "insertText":
                this.base.addLetter(addedLetter, cursorPos-1)
                break
            case "deleteContentBackward":
            case "deleteContentForward":
                //if (Letter.isLetter(this.oldInputContent[cursorPos]))
                this.base.removeLetter(cursorPos)
                break
        }

        this.buildWord().then(() => {
            for (let i = this.ringIMGS.length-1; i >= 0; i--) {
                this.ringIMGS[i].remove() // remove from DOM
                this.ringIMGS.pop()       // remove from array
            }
            if (this.centerImg) {
                this.centerImg.remove()
            }
            if (this.word.wordclass.filename !== "") {
                const filename = this.word.wordclass.filename
                const rotation = 0
                const scale = 50
                WordController.getMedia(filename, "./media/classes/").then((img) => {
                    this.centerImg = draw.image(img)
                    this.centerImg.width(scale).height(scale).cx(this.word.position[0]).cy(this.word.position[1])//.rotate(rotation)
                })
            }
            for (let i = 0; i < this.baseLettersImgs.length; i++) {
                const rotation = this.base.letters[i].angle
                const scale = i <= MaxLetterLevel ? (i+2)*50 : (i+2)*55
                const currentRingImg = this.baseLettersImgs[i]
                const ring = draw.image(currentRingImg)
                ring.width(scale).height(scale).cx(this.word.position[0]).cy(this.word.position[1]).transform({rotate: rotation})
                this.ringIMGS[i] = ring
                //const nested = draw.nested()
                // const ring = nested.svg(letter)
                // nested.size(scale).cx(this.word.position[0]).cy(this.word.position[1])//.rotate(rotation)
                // this.ringSVG.push(ring)
            }
        })
    }

    updatePos(e) {
        this.word.position[0] = +this.xInput.value
        this.word.position[1] = +this.yInput.value
        this.update()
    }

    updateWordclass(e) {
        this.word.wordclass = Wordclass.get(this.wordclassSelect.value)
        this.update()
    }

    populate() {
        this.container = myCreateElement("div", {className: "card"})
        this.editorDiv = myCreateElement("div", {className: "card-body"})

        this.wordInput = myCreateElement("input", {type: "text"})
        this.wordInput.addEventListener("input", (e) => {
            this.update(e)
        })

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

        this.wordclassSelect = myCreateElement("select", {id: "wordclass"})
        for (let w of Object.keys(Wordclass)) {
            const option = myCreateElement("option", {
                value: Wordclass[w].name,
                innerHTML: Wordclass[w].name
            })
            this.wordclassSelect.appendChild(option)
        }
        this.wordclassSelect.value = Wordclass.getDefault().name

        this.wordclassSelect.addEventListener("change", (e) => {
            this.updateWordclass(e)
        })

        this.editorDiv.append(this.wordInput, coordsDiv, this.wordclassSelect)
        this.container.appendChild(this.editorDiv)
        menu.appendChild(this.container)
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
