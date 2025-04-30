import Card from './Card.js';

// Spanish deck suits
const SUITS = ['Oros', 'Copas', 'Espadas', 'Bastos'];
// For 7 i mig, we only use A-7 and J, Q, K (no 8, 9, 10)
const VALUES = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];

export default class Deck {

    constructor() {
        this._cards = [];
        this.createDeck();
    }

    get cards() {
        return this._cards;
    }

    set cards(cards) {
        this._cards = cards;
    }

    createDeck() {
        this._cards = [];
        for (let suit of SUITS) {
            for (let value of VALUES) {
                this._cards.push(new Card(suit, value));
            }
        }
    }

    shuffle() {
        for (let i = this._cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this._cards[i], this._cards[j]] = [this._cards[j], this._cards[i]];
        }
    }

    pop() {
        return this._cards.pop();
    }

    push(card) {
        this._cards.push(card);
    }

    toString() {
        return this._cards.map(card => card.toString()).join(', ');
    }
}