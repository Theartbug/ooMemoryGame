'use strict';

let flippedCards = [];
let cardsArray = [];
let scoreInStorage = localStorage.getItem('scoreInStorage');

function Card(cardNumber, x) {
    this.cardNumber = cardNumber;
    this.cardId = x + cardNumber;
    this.div = '<div class="card" id=' + this.cardId + '> \
    <div class="front"><p> Show! </p></div> \
    <div class="back"><p>' + this.cardNumber + '</p></div> \
    </div>';
} // Card constructor

Card.prototype.createCard = function() { // creates card in DOM
    let thisCard = this;
    let cardsDiv = document.querySelector('.cards'); 

    cardsDiv.innerHTML += thisCard.div;
    
}; // create card prototype

Card.prototype.flip = function() {

    let el = document.getElementById(this.cardId);

    el.addEventListener('click', function() {

        if (!this.classList.contains('flipped') && flippedCards.length < 2) {
            this.classList.toggle('flipped');
            flippedCards.push(this);
            // only lets two cards be flipped at a time
            if (flippedCards.length === 2) {
                checkMatch();
            }
        }
    }); // event listener
}; // flip prototype

function checkMatch() {
    if (flippedCards[0].innerText === flippedCards[1].innerText) {
        flippedCards[0].classList.add('match');
        flippedCards[1].classList.add('match');
        flippedCards = [];
        updateScore(4);
    } else {
        setTimeout(flipBack, 700);
        updateScore(-2);
    }
} // checkMatch

function flipBack() {
    flippedCards[0].classList.toggle('flipped');
    flippedCards[1].classList.toggle('flipped');
    flippedCards = [];
} // flipBack

function createCardObjects(numberOfCards) {
    for (let i = 1; i<= numberOfCards; i++) {
        window['card'+i] = new Card(i, 'a'); 
        window['card'+i].name = 'card'+i;
        window['card'+i+'a'] = new Card(i, 'b'); //creates two objects with the same card number
        window['card'+i+'a'].name = 'card'+i+'a';

        cardsArray.push(window['card'+i], window['card'+i+'a']); //pushes objects into an array two at a time
    }

    //Fisher-Yates Shuffle of card objects array
    for (let i = cardsArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [cardsArray[i], cardsArray[j]] = [cardsArray[j], cardsArray[i]];
    }

    //Creates cards onto screen from array of randomized objects
    for (let i=0; i< cardsArray.length; i++) {
        cardsArray[i].createCard(); 
    }
    //Assigns click event to each card
    for (let i=0; i< cardsArray.length; i++) {
        cardsArray[i].flip();
    }
	
} // createCardObjects, only needs to be called once

function gameMode() {
    let easybtn = document.getElementById('easy');
    let medbtn = document.getElementById('med');
    let hardbtn = document.getElementById('hard');
    let timer = document.querySelector('.timer');
    setBestScore();
    if (easybtn) { // if buttons exist
        easybtn.addEventListener('click', function() {
            clear();
            createCardObjects(5);
            setTime(20, timer);
        });
        medbtn.addEventListener('click', function() {
            clear();
            createCardObjects(10);
            setTime(40, timer);
        });
        hardbtn.addEventListener('click', function() {
            clear();
            createCardObjects(15);
            setTime(90, timer);
        });
    }
} //gameMode

// function startGame(numberOfCards) {
//     clear();
//     createCardArray(numberOfCards);
//     createCards();
//     cardClick();
// } // startGame

function clear() {
    let cardsDiv = document.querySelector('.cards');
    cardsDiv.innerHTML = '';
    cardsDiv.classList.remove('select'); // flex direction
    cardsArray = [];
    document.querySelector('.score').lastChild.textContent = 0;
} // clear, resets flex direction & score

function setTime(duration, display) {
    let timer = duration, minutes, seconds;
    let interval = setInterval(function() {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        display.textContent = minutes + ':' + seconds;

        if (--timer < 0 || document.getElementsByClassName('match').length === cardsArray.length) {
            clearInterval(interval); // fix timer continuing
            endGame();
        }
    }, 1000);
} // setTime

function updateScore(points) {
    let score = document.querySelector('.score').lastChild;
    if (parseInt(score.textContent) == 0 && points > 0) {
        score.textContent = parseInt(points);
    } // doesn't let score dip below 0

    else if (parseInt(score.textContent) != 0) {
        score.textContent = parseInt(score.textContent) + parseInt(points);
    } // when score is not 0

    if (document.getElementsByClassName('match').length === cardsArray.length) { // add left over time if win
        score.textContent = parseInt(score.textContent) + timeScore();
    }
} // updateScore

function timeScore() { // converts seconds into score points
    let timeLeft = document.querySelector('.timer').textContent;
    let convertedTime;

    convertedTime = parseInt(timeLeft.charAt(3) + timeLeft.charAt(4));
    convertedTime += (parseInt(timeLeft.charAt(1)) * 60);

    return convertedTime;

} // timeScore

function setBestScore() {
    let score = document.querySelector('.score').lastChild;
    let bestScore = document.querySelector('.bestScore').lastChild;
    if (!scoreInStorage) { // if no score in storage
        localStorage.setItem('scoreInStorage', parseInt(score.textContent));
        bestScore.textContent = parseInt(score.textContent);
    }
    if (parseInt(score.textContent) > parseInt(bestScore.textContent)) { // if score is higher than best score
        localStorage.setItem('scoreInStorage', parseInt(score.textContent));
        bestScore.textContent = parseInt(score.textContent);
    }
    if (JSON.parse(localStorage.getItem('scoreInStorage')) > parseInt(score.textContent)) { // if best score is higher than score
        bestScore.textContent = JSON.parse(localStorage.getItem('scoreInStorage'));
    }
} // setBestScore

function endGame() {
    let timer = document.querySelector('.timer').textContent;
    if (document.getElementsByClassName('match').length === cardsArray.length || timer == '00:00') {
        let cardsDiv = document.querySelector('.cards');
        setTimeout(function() {
            cardsDiv.classList.add('slowFade');
        }, 1200); // fade out gameboard
        setTimeout(function() {
            cardsDiv.classList.remove('slowFade');
            cardsDiv.classList.add('select'); // reset flex direction
            if (document.getElementsByClassName('match').length === cardsArray.length) {
                cardsDiv.innerHTML = "<div class='win'>You Win! Play Again?</div>";
            } // all matched
            if (timer === '00:00') { // if timer ran out
                cardsDiv.innerHTML = "<div class='win'>Time Out! Play Again?</div>";
            } // timer ran out
            cardsDiv.innerHTML += "<div class='win2'><button id='easy'>Easy</button> \
        <button id='med'>Medium</button> \
        <button id='hard'>Hard</button></div>";
            setBestScore();
        }, 2300); // settimeout with button creation
        setTimeout(gameMode,2301); //waits to run gameMode until buttons are created
    } // if
} // endGame

gameMode();
