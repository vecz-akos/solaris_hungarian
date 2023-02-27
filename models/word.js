import Base from "./base.js"

class Word {
    constructor(base=new Base(), suffixes=[], position=[0, 0], spinner=RingSpinner.Random, wordclass=Wordclass.NotSpec) {
        this.base = base
        this.suffixes = suffixes
        this.position = position
        this.spinner = spinner
        if (wordclass instanceof Wordclass)
            this.wordclass = wordclass
    }

    addSuffix(suffix) {
        if (suffix instanceof Suffix)
            if (suffix.fromWordclass === this.wordclass) {
                this.suffixes.push(suffix)
                this.wordclass = suffix.to
            }
    }
}

class RingSpinner {
    static Military = new RingSpinner("katonás", (level=0) => {
        return 0
    })

    static Spiral = new RingSpinner("spirál", (level=0, angleStep=20, shiftAngle=0) => {
        return level * angleStep + shiftAngle
    })

    static Random = new RingSpinner("random", (level=0) => {
        return Math.random() * 360
    })

    constructor(name, func) {
        this.name = name
        this.func = func
    }

    static get(klassz) {
        for (let [k, v] of Object.entries(this)) {
            if (k === klassz || v.name === klassz)
                return v
        }
        return null
    }

    static getDefault() {
        return RingSpinner.Random
    }
}

class Wordclass {
    static Noun      = new Wordclass('főnév', 'szofaj_fonev.png')
    static Verb      = new Wordclass('ige', 'szofaj_ige.png')
    static Adjective = new Wordclass('melléknév', 'szofaj_melleknev.png')
    static Adverb    = new Wordclass('határozószó', 'szofaj_hatarozo.png')
    static Not       = new Wordclass('tagadás', 'tagadas.png')
    static Be        = new Wordclass('létige', 'letige.png')
    //static Pronoun   = new Wordclass('névmás')
    //static Number    = new Wordclass('szám')
    // kérdőszó
    // mutató
    static NotSpec   = new Wordclass('nincs')

    constructor(name, filename="") {
      this.name = name
      this.filename = filename
    }

    static get(klassz) {
        for (let [k, v] of Object.entries(this)) {
            if (k === klassz || v.name === klassz)
                return v
        }
        return null
    }

    static getDefault() {
        return Wordclass.NotSpec
    }

    static getFilePath(klassz) {
        for (let [k, v] of Object.entries(this)) {
            if (k === klassz || v.name === klassz)
                return v.filename
        }
        return ""
    }

    toString() {
      return `Wordclass.${this.name}`
    }
}

class Suffix {
    constructor(fromWordclass) {
        if (fromWordclass instanceof Wordclass) {
            this.from = fromWordclass
            this.to = fromWordclass
        }
    }
}

class Kepzo extends Suffix {
    constructor(fromWordclass, toWordclass, note="") {
        super(fromWordclass)
        this.note = note
        if (toWordclass instanceof Wordclass)
            this.to = toWordclass
    }
    // TODO setter getter
}

class Jel extends Suffix {
    static acceptedWordClasses = [Wordclass.Verb, Wordclass.Adjective, Wordclass.Noun]
    constructor(fromWordclass) {
        super(fromWordclass)
        if (this.from) {
            if (Jel.acceptedWordClasses.every((wc) => wc !== this.from)) {
                this.from = null
            }
        }
    }
}

class Rag extends Suffix {
    static acceptedWordClasses = [Wordclass.Verb, Wordclass.Adjective, Wordclass.Noun]
    constructor(fromWordclass) {
        super(fromWordclass)
        if (this.from) {
            if (Rag.acceptedWordClasses.every((wc) => wc !== this.from)) {
                this.from = null
            }
        }
    }
}

export { Word, RingSpinner, Wordclass }
