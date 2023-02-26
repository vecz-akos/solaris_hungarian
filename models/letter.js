class Letter {
    // private
    #letter

    // public
    static abc = ["a", "á", "b", "c", "cs", "d", "dz", "dzs", "e", "é", "f", "g", "gy", "h", "i", "í", "j", "k", "l", "ly", "m", "n", "ny", "o", "ó", "ö", "ő", "p", "r", "s", "sz", "t", "ty", "u", "ú", "ü", "ű", "v", "z", "zs"]
    //static lettersWithMoreChars = this.abc.filter((s) => s.length > 1)
    static lettersWithMoreChars = ["cs", "dz", "dzs", "gy", "ly", "ny", "sz", "ty", "zs"]
    static ignoreLetters = ["q", "w", "x", "y"]

    constructor(s="", level=1, angle=0) {
        this.level = level
        this.isUpper = s === s.toUpperCase()
        this.angle = angle
        this.setLetter(s)
    }

    setLetter(s) {
        if (Letter.isLetter(s)) {
            this.#letter = s.toLowerCase()
        } else {
            throw `Given string "${s}" is not a letter.`
        }
    }

    getLetter() {
        return this.#letter
    }

    static isLetter(s) {
        if (s.length > 3)
            return false
        s = s.toLowerCase()
        return this.abc.some((c) => c === s)
    }

    static isMoreCharsLetter(s) {
        return this.lettersWithMoreChars.some((c) => c === s)
    }

    static couldBeMoreCharsLetter(s) {
        if (s.length > 1) return this.isMoreCharsLetter(s)
        return this.lettersWithMoreChars.some((c) => c[0] === s)
    }

    static isTheLongestLetter(s) {
        return s === "dzs"
    }

    static isIgnoreLetter(s) {
        return this.ignoreLetters.some((c) => c === s)
    }
}

export default Letter
