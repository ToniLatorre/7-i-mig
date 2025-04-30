import Player from './Player.js';
import Deck from './Deck.js';

export default class Game {
    constructor() {
        this.deck = new Deck();
        this.player = new Player('Jugador');
        this.computer = new Player('Banca');
        this.currentPlayer = this.player;
        this.gameState = 'betting'; // betting, playing, computerTurn, gameOver
        this.bet = 0;
        this.message = '';
    }

    get deck() {
        return this._deck;
    }

    set deck(deck) {
        this._deck = deck;
    }

    get player() {
        return this._player;
    }

    set player(player) {
        this._player = player;
    }

    get computer() {
        return this._computer;
    }

    set computer(computer) {
        this._computer = computer;
    }

    get currentPlayer() {
        return this._currentPlayer;
    }

    set currentPlayer(player) {
        this._currentPlayer = player;
    }

    initGame() {
        // Clear previous hands
        this.player.clearHand();
        this.computer.clearHand();
        
        // Create and shuffle a new deck
        this.deck = new Deck();
        this.deck.shuffle();
        
        // Deal initial cards
        this.player.hand.push(this.deck.pop());
        this.computer.hand.push(this.deck.pop()); // Dealer's card is hidden initially
        
        this.gameState = 'playing';
        this.currentPlayer = this.player;
        this.message = "El teu torn. Demana una carta o planta't.";
        this.updateGameState();
    }

    placeBet(amount) {
        if (this.gameState !== 'betting' || amount <= 0 || amount > this.player.money) {
            return false;
        }
        
        this.bet = amount;
        this.player.money -= amount;
        this.initGame();
        return true;
    }

    hit() {
        if (this.gameState !== 'playing' && this.gameState !== 'computerTurn') return false;
        
        // Give the current player a card
        this.currentPlayer.hand.push(this.deck.pop());
        
        // Check if player busted (over 7.5)
        if (this.currentPlayer.calculatePoints() > 7.5) {
            if (this.currentPlayer === this.player) {
                this.message = "T'has Pasat! La banca guanya.";
                this.gameState = 'gameOver';
            } else {
                this.message = "La banca s'ha pasat! Tu guanyes!";
                this.player.money += this.bet * 2;
                this.gameState = 'gameOver';
            }
        } else if (this.currentPlayer === this.player) {
            this.message = "El teu torn. Vols una carta?";
        }
        
        this.updateGameState();
        return true;
    }

    stand() {
        if (this.gameState !== 'playing') return false;
        
        if (this.currentPlayer === this.player) {
            // Switch to dealer's turn
            this.currentPlayer = this.computer;
            this.gameState = 'computerTurn';
            this.message = "Torn de la banca. Espera...";
            this.updateGameState();
            this.playComputerTurn();
            return true;
        }
        
        return false;
    }

    playComputerTurn() {
        // Reveal hidden card
        this.updateGameState();
        
        // Computer's strategy: hit until 5 or higher
        const dealerPlay = () => {
            const currentPoints = this.computer.calculatePoints();
            
            if (currentPoints < 5) {
                setTimeout(() => {
                    this.hit();
                    if (this.gameState === 'computerTurn') {
                        dealerPlay();
                    }
                }, 1000);
            } else {
                setTimeout(() => {
                    this.determineWinner();
                }, 1000);
            }
        };
        
        setTimeout(() => {
            dealerPlay();
        }, 1000);
    }

    determineWinner() {
        const playerPoints = this.player.calculatePoints();
        const computerPoints = this.computer.calculatePoints();
        
        if (playerPoints > 7.5) {
            this.message = "T'has pasat! La banca guanya.";
        } else if (computerPoints > 7.5) {
            this.message = "La banca s'ha pasat! Tu guanyes!";
            this.player.money += this.bet * 2;
        } else if (playerPoints > computerPoints) {
            this.message = "Has guanyat! " + playerPoints + " vs " + computerPoints;
            this.player.money += this.bet * 2;
        } else if (playerPoints < computerPoints) {
            this.message = "La banca guanya " + computerPoints + " vs " + playerPoints;
        } else {
            this.message = "Empat! se't torna la teva aposta.";
            this.player.money += this.bet; // Return the bet
        }
        
        this.gameState = 'gameOver';
        this.updateGameState();
    }

    updateGameState() {
        // This method will be used to update the UI
        const gameStateEvent = new CustomEvent('gameStateUpdated', {
            detail: {
                player: this.player,
                computer: this.computer,
                currentPlayer: this.currentPlayer,
                gameState: this.gameState,
                bet: this.bet,
                message: this.message
            }
        });
        
        document.dispatchEvent(gameStateEvent);
    }

    newRound() {
        if (this.player.money <= 0) {
            this.message = "Fi de la partida. No tens diners per jugar.";
            this.updateGameState();
            return false;
        }
        
        this.gameState = 'betting';
        this.bet = 0;
        this.message = '';
        this.updateGameState();
        return true;
    }
}