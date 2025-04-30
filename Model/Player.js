export default class Player {
    constructor(name) {
        this.name = name;
        this.hand = [];
        this.money = 1000; // Default starting money
    }

    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name;
    }

    get hand() {
        return this._hand;
    }

    set hand(hand) {
        this._hand = hand;
    }

    get money() {
        return this._money;
    }

    set money(money) {
        this._money = money;
    }

    calculatePoints() {
        let points = 0;
        
        for (let card of this.hand) {
            // In 7 i mig, court cards (J, Q, K) are worth 0.5 points
            if (['J', 'Q', 'K'].includes(card.value)) {
                points += 0.5;
            } 
            // Aces to 7 are worth their face value
            else if (['A', '2', '3', '4', '5', '6', '7'].includes(card.value)) {
                if (card.value === 'A') {
                    points += 1;
                } else {
                    points += parseInt(card.value);
                }
            }
            // 8, 9, 10 are not used in traditional 7 i mig but we'll handle them just in case
            else {
                // If using a standard deck and these cards are included, they would have no value
                points += 0;
            }
        }
        
        return points;
    }

    clearHand() {
        this.hand = [];
    }
}