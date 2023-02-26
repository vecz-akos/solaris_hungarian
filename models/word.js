import Base from "./base.js"

class Word {
    constructor(base=new Base(), suffixes=[], position=[0, 0], spinner=RingSpinners.random, wordclass=Wordclass.NotSpec) {
        this.base = base
        this.suffixes = suffixes
        this.position = position
        this.spinner = spinner
        if (wordclass instanceof Wordclass)
            this.wordclass = wordclass
    }
}

class Noun extends Word {
    constructor(base=Base(), suffixes=[], position=[0, 0], spinner=RingSpinners.random) {
        super(base, suffixes, position, spinner, Wordclass.Noun)
    }
}

// todo others ...

class RingSpinners {
    static military(level=0) {
        return 0
    }

    static spiral(level=0, angleStep=30, shiftAngle=0) {
        return (level-1) * angleStep + shiftAngle
    }

    static random(level=0) {
        return Math.random() * 360
    }
}

class Wordclass {
    static Noun      = new Wordclass('főnév', 'szofaj_fonev.png')
    static Verb      = new Wordclass('ige', 'szofaj_ige.png')
    static Adjective = new Wordclass('melléknév', 'szofaj_melleknev.png')
    static Adverb    = new Wordclass('határozószó', 'szofaj_hatarozo.png')
    static Not       = new Wordclass('tagadás', 'tagadas.png')
    static Be        = new Wordclass('létige', 'letige.png')
    static Pronoun   = new Wordclass('névmás')
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

export { Word, Noun, RingSpinners, Wordclass }
