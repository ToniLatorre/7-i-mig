export default class Card {
    
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }  
    
    get suit() {
        return this._suit;
    }

    get value() {
        return this._value;
    }

    set suit(suit) {
        this._suit = suit;
    }

    set value(value) {
        this._value = value;
    }

    toString() {
        return `${this.value} of ${this.suit}`;
    }
}