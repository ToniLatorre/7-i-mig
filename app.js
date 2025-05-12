// Update the import path if files are in a Model folder
import Game from "./Model/Game.js";

// Create a new game instance
const game = new Game();

// UI Elements
let playerHandElement;
let dealerHandElement;
let messageElement;
let currentBetElement;
let betInputElement;
let playerMoneyElement;
let playerPointsElement;
let dealerPointsElement;
let betControlsElement;
let gameControlsElement;

// Card image mapping for Spanish deck (based on the provided image)
const suitMapping = {
    'Oros': 0,    // Primera fila (amarillo)
    'Copas': 1,   // Segunda fila (rojo)
    'Espadas': 2, // Tercera fila (azul)
    'Bastos': 3   // Cuarta fila (verde/rojo)
};

const valueMapping = {
    'A': 0,  // Index 0 (first card)
    '2': 1,
    '3': 2,
    '4': 3,
    '5': 4,
    '6': 5,
    '7': 6,
    '8': 7,  // Incluidas aunque no se usen en 7 y medio
    '9': 8,  // Incluidas aunque no se usen en 7 y medio
    'J': 9,  // Sota (10 en la imagen)
    'Q': 10, // Caballo (11 en la imagen)
    'K': 11  // Rey (12 en la imagen)
};

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    initializeUIElements();
    addEventListeners();
    updateUIState();
    game.newRound();
});

function initializeUIElements() {
    // Get elements from DOM
    playerHandElement = document.getElementById('player-hand');
    dealerHandElement = document.getElementById('dealer-hand');
    messageElement = document.getElementById('message');
    currentBetElement = document.getElementById('current-bet');
    betInputElement = document.getElementById('bet-amount');
    playerMoneyElement = document.getElementById('player-money');
    playerPointsElement = document.getElementById('player-points');
    dealerPointsElement = document.getElementById('dealer-points');
    betControlsElement = document.getElementById('bet-controls');
    gameControlsElement = document.getElementById('game-controls');

    // Initialize UI state
    updateUIState();
}

function updateUIState() {
    // Set initial visibility
    gameControlsElement.style.display = 'none';
    betControlsElement.style.display = 'block';
    
    // Make sure bet amount is valid
    validateBetAmount();
}

function validateBetAmount() {
    const currentValue = parseInt(betInputElement.value);
    const maxBet = game.player.money;
    
    // Ensure bet amount is not more than player's money
    if (currentValue > maxBet) {
        betInputElement.value = maxBet;
    }
    
    // Ensure minimum bet
    if (currentValue < 10 && maxBet >= 10) {
        betInputElement.value = 10;
    }
    
    // Disable bet button if player has no money
    document.getElementById('place-bet').disabled = maxBet < 10;
    
    // Update display
    playerMoneyElement.textContent = `Dinero: ${game.player.money}€`;
}

function addEventListeners() {
    // Game state updates
    document.addEventListener('gameStateUpdated', updateUI);

    document.getElementById('place-bet').addEventListener('click', () => {
        const betAmount = parseInt(betInputElement.value);
        if (game.placeBet(betAmount)) {
            playSound('placeBet'); // Sonido al realizar la apuesta
            playSound('buttonClick'); // Sonido adicional al pulsar el botón
        }
    });

    // Betting controls
    document.getElementById('increase-bet').addEventListener('click', () => {
        const currentValue = parseInt(betInputElement.value);
        const maxBet = game.player.money;
        betInputElement.value = Math.min(currentValue + 10, maxBet);
        playSound('buttonClick');
    });

    document.getElementById('decrease-bet').addEventListener('click', () => {
        const currentValue = parseInt(betInputElement.value);
        if (currentValue > 10) {
            betInputElement.value = currentValue - 10;
            playSound('buttonClick');
        }
    });

    document.getElementById('place-bet').addEventListener('click', () => {
        const betAmount = parseInt(betInputElement.value);
        if (game.placeBet(betAmount)) {
            playSound('cardDeal');
        }
    });

    // Game controls
    document.getElementById('hit').addEventListener('click', () => {
        if (game.hit()) {
            playSound('cardDeal');
        }
    });

    document.getElementById('stand').addEventListener('click', () => {
        if (game.stand()) {
            playSound('buttonClick');
        }
    });

    document.getElementById('new-game').addEventListener('click', () => {
        if (game.newRound()) {
            // Reset UI
            playerHandElement.innerHTML = '';
            dealerHandElement.innerHTML = '';
            playerPointsElement.textContent = '';
            dealerPointsElement.textContent = '';
            validateBetAmount();
            
            playSound('buttonClick');
        }
    });
}

function updateUI(event) {
    const state = event.detail;
    
    // Update hands with animation
    updateHand(playerHandElement, state.player.hand, false);
    updateHand(dealerHandElement, state.computer.hand, state.gameState === 'playing');
    
    // Update player money
    playerMoneyElement.textContent = `Diners: ${state.player.money}€`;
    
    // Update message
    messageElement.textContent = state.message;
    
    // Update current bet
    if (state.bet > 0) {
        currentBetElement.textContent = `Aposta actual: ${state.bet}€`;
    } else {
        currentBetElement.textContent = '';
    }
    
    // Update controls visibility
    betControlsElement.style.display = state.gameState === 'betting' ? 'block' : 'none';
    gameControlsElement.style.display = state.gameState !== 'betting' ? 'block' : 'none';
    
    // Update button states
    document.getElementById('hit').disabled = state.gameState !== 'playing' || state.currentPlayer !== state.player;
    document.getElementById('stand').disabled = state.gameState !== 'playing' || state.currentPlayer !== state.player;
    document.getElementById('new-game').disabled = state.gameState === 'betting';
    
    // Show points
    if (state.gameState !== 'betting') {
        const playerPoints = state.player.calculatePoints();
        const computerPoints = state.computer.calculatePoints();
        
        if (playerPoints > 0) {
            playerPointsElement.textContent = `Punts: ${playerPoints}`;
        }
        
        if (computerPoints > 0 && state.gameState !== 'playing') {
            dealerPointsElement.textContent = `Punts: ${computerPoints}`;
        } else if (state.gameState === 'playing') {
            dealerPointsElement.textContent = ''; // Hide dealer points during player's turn
        }
    } else {
        playerPointsElement.textContent = '';
        dealerPointsElement.textContent = '';
    }
    
    // Update max bet based on player money
    betInputElement.max = state.player.money;
    if (parseInt(betInputElement.value) > state.player.money) {
        betInputElement.value = state.player.money;
    }
    
    // Play sound effects for game results
    // Play sound effects for game results
    if (state.gameState === 'gameOver') {
        // Check if player won by looking at the message
        if (state.message.includes('Ganas')) {
            console.log("Reproduciendo sonido de victoria...");
            playSound('win'); // Asegúrate de que el sonido esté definido correctamente
        } else if (state.message.includes('Has perdut') || state.message.includes('La banca guanya')) {
            console.log("Reproduciendo sonido de derrota...");
            playSound('lose');
        }
    }
}

function updateHand(handElement, cards, hideCard) {
    handElement.innerHTML = '';
        cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        setTimeout(() => {
            cardElement.classList.add('card-dealt');
        }, index * 300);
        if (hideCard && index === 0) {
            cardElement.classList.add('card-hidden');
        } else {
            const suitIndex = suitMapping[card.suit];
            const valueIndex = valueMapping[card.value];
            
            cardElement.style.backgroundImage = 'url("/Imatges/baraja_espanola.png")';
            const cardWidth = 208;
            const cardHeight = 319;
            const xPos = -valueIndex * cardWidth;
            const yPos = -suitIndex * cardHeight;
            
            cardElement.style.backgroundPosition = `${xPos}px ${yPos}px`;
            cardElement.style.backgroundSize = 'auto';
        }
        
        handElement.appendChild(cardElement);
    });
}

// Sound effects
const sounds = {
    cardDeal: new Audio('/Sons/card-deal.mp3'),
    win: new Audio('/Sons/win.mp3'),
    lose: new Audio('/Sons/lose.mp3'),
    buttonClick: new Audio('/Sons/button-click.mp3'),
    placeBet: new Audio('/Sons/place-bet.mp3'),
};

const musicaFons = new Audio('/Sons/Fondo.mp3');
musicaFons.load();
musicaFons.autoplay = false;
musicaFons.loop = true;
musicaFons.volume = 0.5;
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', () => {
        musicaFons.play().catch(e => console.log("Error al reproduir la música de fons:", e));
    }, { once: true });
});

// Imagen de victoria
const victoryImage = document.createElement('img');
victoryImage.src = '/Imatges/victory.png';
victoryImage.alt = 'Has guanyat!';
victoryImage.style.position = 'fixed';
victoryImage.style.top = '50%';
victoryImage.style.left = '50%';
victoryImage.style.transform = 'translate(-50%, -50%)';
victoryImage.style.zIndex = '1000';
victoryImage.style.display = 'none';
document.body.appendChild(victoryImage);

// Sonido de victoria
const victorySound = new Audio('/Sons/victory.mp3');
document.addEventListener('playerWon', (event) => {
    victoryImage.style.display = 'block';
    victorySound.volume = 0.8; 
    victorySound.play().catch(e => console.log("Error al reproduir el so de victòria", e));

    setTimeout(() => {
        victoryImage.style.display = 'none';
    }, 10000);
});