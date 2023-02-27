import Letter from "./letter.js"
import { RingSpinner } from "./word.js"

class Base {
    constructor(base="", spinner=RingSpinner.Random) {
        this.spinner = spinner
        this.letters = []
        this.createLetterString(base)
    }

    createLetterString(s) {
        const arr = []
        for (let i = 0; i < s.length; i++) {
            let letter = s[i]
            if (Letter.couldBeMoreCharsLetter(s[i]) && i+1 < s.length) {
                let longLetter = s.substr(i, 2)
                if (Letter.isMoreCharsLetter(longLetter)) {
                    letter = longLetter
                    i++
                }
                if (i+2 < s.length) {
                    longLetter = s.substr(i, 3)
                    if (Letter.isTheLongestLetter(s)) {
                        letter = longLetter
                        i += 2
                    }
                }
            }
            try {
                this.addLetter(letter)
            }
            catch (err) {
                console.error(err)
            }
        }
        return arr
    }

    getLetter(index, onlyStr=true) {
        if (index < 0)
            index += this.letters.length
        if (index >= 0 && index < this.letters.length)
            return onlyStr ? this.letters[index].getLetter() : this.letters[index]
        return undefined
    }

    #addLett(letter, index=undefined) {
        if (typeof(index) === "undefined") index = this.letters.length
        if (index < 0) index = (index % this.letters.length) + this.letters.length
        if (Letter.isLetter(letter))
            this.letters.splice(index, 0, new Letter(letter, index+1, this.spinner.func(index+1)))
    }

    addLetter(letter, index=undefined) {    
        if (typeof(index) === "undefined") index = this.letters.length
        if (index < 0) index = (index % this.letters.length) + this.letters.length
        let nextLetter = undefined
        let i = this.letters.length < 2 ? 0 : index-2
        while (i <= index && !nextLetter) {
            let possibleLetter = ""
            for (let j = i; j < index; j++) {
                if (this.getLetter(j))
                    possibleLetter += this.getLetter(j)
            }
            possibleLetter += letter
            if (Letter.isLetter(possibleLetter)) {
                nextLetter = new Letter(possibleLetter, index, this.spinner.func(index))
                this.letters.splice(index, 0, nextLetter)
                let insertedPlace = this.letters.indexOf(nextLetter)
                for (let j = i; j < insertedPlace; j++)
                    this.removeLetter(j)
                this.recalcAngle()
            }
            i++
        }
        return nextLetter
    }

    removeLetter(index=undefined) {
        if (typeof(index) === "undefined") index = this.letters.length-1
        if (index >= 0 && index < this.letters.length && this.letters.length !== 0) {
            this.letters.splice(index, 1)
            if (index !== this.letters.length)
                this.recalcAngle(index)
        }
    }

    disconnectChars(index=undefined) {
        if (typeof(index) === "undefined") index = this.letters.length-1
        if (index >= 0 && index < this.letters.length && this.letters.length !== 0) {
            const origLetters = this.getLetter(index)
            if (origLetters.length <= 1) return
            this.removeLetter(index)
            for (let c of origLetters) {
                this.#addLett(c, index)
                index++
            }
            this.recalcAngle()
        }
    }

    recalcAngle(from=0, to=undefined) {
        if (typeof(to) === "undefined") to = this.letters.length
        if (from < 0) return
        for (let i = from; i < to; i++) {
            this.letters[i].angle = this.spinner.func(i+1)
        }
    }
}

export default Base
