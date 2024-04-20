//The intention of this script is to teach a bot how to dynamically learn
//the game of BlackJack.  The game will be built in sections.  At the time
//of writing, the GUI is completed for the entire human-based game.  The
//gui independently records certain data points for the user.  Our
//first step is to design the game using OOP where possible.  This will
//be completed in Javascript.  We'll use the flask python webserver for a backend 
//when the game has been completed, and start recording data to a mySQL
//database for our data source.  When we have some data collected, we will
//program our bot to dynamically make decisions based on query data from 
//our database.  Let's rock!

//Define our HTML elements
//GUI column
const messageBox = document.getElementById('messages');
const guiForm = document.getElementById('gui');
const playerNameText = document.getElementById('playerName');
const nameInput = document.getElementById('nameInput');
const startGameButton = document.getElementById('startHumanGame');
const startBotButton = document.getElementById('startBotGame');
const chipsText = document.getElementById('chips');
const roundNoText = document.getElementById('roundNo');
const winsText = document.getElementById('wins');
const lossesText = document.getElementById('losses');
const anteText = document.getElementById('ante');
const anteInput = document.getElementById('anteInput');
const anteUpButton = document.getElementById('anteUp');
const anteDownButton = document.getElementById('anteDown');
const anteSubmitButton = document.getElementById('anteSubmit');
const userActionsForm = document.getElementById('userActions');
const actionSelect = document.getElementById('actionSelect');
const currentScoreText = document.getElementById('currentScore');
const actionButton = document.getElementById('actionButton');
const botCount = document.getElementById('count');

//Game Table
const blackJackTable = document.getElementById('blackJackTable');
const splitStackDiv = document.getElementById('splitStack');
const splitCardImage = document.getElementsByClassName('split');
const mainStackDiv = document.getElementById('mainStack');
const dealerCardImage = document.getElementsByClassName('dealerCard');
const playerCardImage = document.getElementsByClassName('playerCard');


//Define global variables
let gameDeck;
let ourPlayer;
let gameDealer;
let score;
let dealerScore;
let over = false;
let aChanged;
let gameCount;

//I'm separating this section from the rest of the variables.  Here will be our data collection for the database
let humanData;
let timeStampData;
let anteData;
let actionCountData = Number(0);
let winStateData;
let dealerCardData;

let scoreStateData;
let deckFactorData;
let terminalStatusData;

let actionData;
let stateChangeData;

//Variables for calculating the above
let state = [];
let pointsTotal;



//Set up our constructors
//This will send the ai data to python for query
function blackJackQuery(dealerCard, stateFactor, deckFactor, choices) {
    this.dealerCard = dealerCard,
    this.stateFactor = stateFactor,
    this.deckFactor = deckFactor,
    this.choices = choices
}
let blackJackQueryObject;
//Constructor for our query data to send to python
function dataCollectionQuery(human, timeStamp, ante) {
    this.human = human;
    this.actionCount;
    this.timeStamp = timeStamp;
    this.winState;
    this.ante = ante;
    this.dealerCard;
    this.stateData = [];
    this.actionData = [];

}
let dataCollectionQueryObject;
//Constructor for State object to be included in the query object's arrays
function stateCollectionQuery(scoreData, deckFactor, terminalStatus) {
    this.scoreData = scoreData;
    this.deckFactor = deckFactor;
    this.terminalStatus = terminalStatus;
}
let stateCollectionQueryObject;
//Constructor for actionData
function actionCollectionQuery(action, stateChange) {
    this.action = action;
    this.stateChange = stateChange;
}
let actionCollectionQueryObject;

//dealer constructor
function dealer() {
    this.hand = [];
}

//player constructor
function player(human, name, chips) {
    this.human = human;
    this.hand = [];
    this.name = name;
    this.chips = chips;
    this.wins = 0;
    this.losses = 0;
    this.rounds = this.wins + this.losses;
    this.ante;
    this.splitHand = [];
    this.split = false;
    
}


//card constructor
function card(color, suit, suitSrc, text, points) {
    this.name = text + "_" + suit;
    this.points = points;
    this.color = color;
    this.suit = suit;
    this.suitSrc = suitSrc;
    this.text = text;
    this.element;
}

//deck constructor
function deck() {
    
    //Our array and values
    this.cards = [];
    const suits = ['hearts', 'diamonds', 'spades', 'clubs'];
    const values = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    //define some values for the loops
    let color;
    let suit;
    let suitSrc;
    let text;
    let points;
    let cardPositions = [];
    let cardCAP;
    let rand;
    

    for (let i = 0; i < (suits.length * values.length); i++){
        cardPositions.push(i);
    }

    //We need a couple loops to populate the deck
    //for each suit
    for (let loopy = 0; loopy < suits.length; loopy++) {
        //for each value
        for (let loopy2 = 0; loopy2 < values.length; loopy2++){
            //First establish color
            if (loopy < 2) {
                color = 'redText';
            } else {
                color = 'blackText';
            }
            //suit
            suit = suits[loopy];
            //suitSrc
            suitSrc = '<img src="/static/imgs/' + suit + '.svg" style="width: 7.5px; height: 10px;">';
            //text
            text = values[loopy2];
            //points.  We'll treat A as 11 to start
            if (isNaN(text) == false) {
                points = text;
            } else if (text !== 'A') {
                points = '10';
            } else {
                points = '11';
            }

            //Now we have our values.  Time to create card!
            //add to cardsCAP
            rand = Math.random();
            cardCAP = cardPositions.splice(Math.floor(rand * cardPositions.length - 1), 1);
            this.cards[cardCAP] = new card(color, suit, suitSrc, text, points);
        }
    }

}


//initial eventListener and message
messageBox.innerText = "Welcome to the black jack table!  Enter your name and hit start game to begin.";

startGameButton.addEventListener("click", newGame);
startBotButton.addEventListener("click", botGame);



//functions


function botGame() {
    if (isNaN(botCount.value) == true || Number(botCount.value) > 100) {
        return;
    }
    //Store name in a variable
    let name = 'bot';
    gameCount = Number(Math.round(Math.abs(botCount.value)));
    console.log('gameCount: ' + gameCount);
    //Now let's hide the box and display the name
    nameInput.value = '';
    nameInput.style.display = 'none';
    startGameButton.style.display = 'none';
    playerNameText.innerHTML = name;
    //Now we need to create our player
    ourPlayer = new player(false, name, 200);
    //Now the gameDeck
    gameDeck = new deck();
    //Now the dealer
    gameDealer = new dealer();

    //Now we need to establish ante
    setAnte();
}

function newGame() {
    //Store name in a variable
    let name = nameInput.value;

    //Now let's hide the box and display the name
    nameInput.value = '';
    nameInput.style.display = 'none';
    startGameButton.style.display = 'none';
    playerNameText.innerHTML = name;
    //Now we need to create our player
    ourPlayer = new player(true, name, 200);
    //Now the gameDeck
    gameDeck = new deck();
    //Now the dealer
    gameDealer = new dealer();

    //Now we need to establish ante
    chooseAnte();
}

function chooseAnte() {
    //If out of chips...game over!
    userActionsForm.style.display = 'none';
    //If we're here, we know we aren't a bot
    startBotButton.style.display = 'none';
    let playerChips = Number(chipsText.innerText);
    if (playerChips <= 0) {
        messageBox.innerHTML = 'GAME OVER!  YOU\'RE OUT OF CHIPS!';
        return;
    }
    anteInput.style.display = 'block';
    anteInput.value = 1;
    anteUpButton.style.display = 'block';
    anteDownButton.style.display = 'block';
    anteSubmitButton.style.display = 'block';
    messageBox.innerText += '<br>Choose your ante, then hit submit.';
    anteSubmitButton.addEventListener("click", setAnte);
    anteUpButton.addEventListener('click', upAnte);
    anteDownButton.addEventListener('click', downAnte);
}

function resetHand(player) {
    player.hand = [];
    for (let i = 0; i < playerCardImage.length; i++){
        playerCardImage[i].style.display = 'none';
    }
    dealerCardImage[0].style.display = 'none';
    dealerCardImage[1].style.display = 'none';
    gameDealer.hand = [];
}

function calculateScore() {
    score = Number(0);
    for (let i = 0; i < ourPlayer.hand.length; i++) {
        //Add our score from each card
        score += Number(ourPlayer.hand[i].points);
    }
    currentScoreText.innerHTML = score;
    //If the score is a bust, let's change all aces to '1' and check again
    if (score > 21) {
        let acesChanged = false;
        for (let j = 0; j < ourPlayer.hand.length; j++) {
            //If it's an ace, change score to 1.
            if (ourPlayer.hand[j].text == 'A' && ourPlayer.hand[j].points !== 1){
                ourPlayer.hand[j].points = Number(1);
                acesChanged = true;
            }
        }
        //Now if acesChanged is true, recalculate score
        if (acesChanged == true) {
            calculateScore();
        }
    }
}
function createsCQO(){
    //We should create our state data object here before an action is selected
    //The state score equation is simple.  It is the positive of the score for 1-21.  Beginning at 22, it is the negative of the score.  Later on stays, the difference between the player and dealer scores will come into play.
    if (score < 22) {
        scoreStateData = score;
    } else {
        scoreStateData = score * (-1);
    }
    state[0] = scoreStateData;
    //The deck factor is also simple.  The mean of the points of remaining cards in the deck, divided by the number of remaining cards.
    //Create a loop for each card in deck
    pointsData = Number(0);
    for (let i = 0; i < gameDeck.cards.length; i++) {
        pointsData += Number(gameDeck.cards[i].points);
    }
    //Now we have the data in a variable.  Let's get the average for the deck factor
    deckFactorData = (pointsData / gameDeck.cards.length).toFixed(1);
    //now Terminal Status...which is false here
    terminalStatusData = false;
    //Now we create the stateCollectionQueryObject
    stateCollectionQueryObject = new stateCollectionQuery(scoreStateData, deckFactorData, terminalStatusData);
    //Now we add this to our stateData array for the dCQO
    dataCollectionQueryObject.stateData.push(stateCollectionQueryObject);
}
function populateUserActionSelect() {
    actionSelect.innerHTML = '';
    actionSelect.innerHTML += '<option value="Hit">Hit</option> <option value="Stay">Stay</option>';
    //Check for splits on the first draw
    if (ourPlayer.hand.length == 2) {
        //If we have a pair
        if (ourPlayer.hand[0].text == ourPlayer.hand[1].text) {
            actionSelect.innerHTML += ' <option value="Split">Split</option> <option value="Double">Double</option>';
        }
    }
    createsCQO();
    //We need to now set an event listener for taking user input
    actionButton.addEventListener("click", humanTurn_02);
}
//This function will take user input and perform the selected action
function humanTurn_02() {
    let action;
    //CHECKPOINT
    console.log("We have successfully navigated to the commit command");
    //Cancel our event listener
    actionButton.removeEventListener("click", humanTurn_02);
    //Now let's determine our action
    action = actionSelect.value
    actionData = action;
    actionCountData++;
    //CHECKPOINTAI
    //Now call a different function for a different action
    if (action == 'Hit') {
        hit();
        return;
    } else if (action == 'Stay') {
        stay();
        return;
    } else if (action == 'Split') {
        split();
        return;
    } else {
        double();
        return;
    }
}
//Here will be our AI processing step
function botProcessingStep() {
    //Create our sCQO
    createsCQO();
    let ourChoices = ['Hit', 'Stay'];
    if (ourPlayer.hand.length == 2) {
        //If we have a pair
        if (ourPlayer.hand[0].text == ourPlayer.hand[1].text) {
            ourChoices.push('Double');
            ourChoices.push('Split');
        }
    }
    //Our possible choices are now in an array.
    //We need to compile our data
    blackJackQueryObject = new blackJackQuery(dataCollectionQueryObject.dealerCard, stateCollectionQueryObject.scoreDate, stateCollectionQueryObject.deckFactor, ourChoices);
    //Now we can send a request to the server
    bJQ();

    

}

function bPS2(data) {
    actionData = data;
    actionCountData++;
    if (data == 'Hit') {
        hit();
        return;
    }
    if (data == 'Stay') {
        stay();
        return;
    }
    if (data == 'Double') {
        double();
        return;
    }
    if (data == 'Split') {
        split();
        return;
    }
}
//We now need functions to process each possible action
function double(){
//We need to double ante, deal one more card, then call a stay
//Double ante
let ante = Number(anteText.innerText);
ante = ante * 2;
dataCollectionQueryObject.ante = ante;
anteText.innerText = ante;
//Draw a card
drawCard(gameDeck, 1, ourPlayer);
stay();
}
function split(){
    //Here's the complicated part.  We need to split the hand, then run two hands.
    //Let's splice the hand into the splithand
    console.log("Hand Length before: " + ourPlayer.hand.length);
    const splitCard = ourPlayer.hand.splice(1, 1);
    console.log("Hand Length after: " + ourPlayer.hand.length);
    console.log("splitHand length before: " + ourPlayer.splitHand.length);
    ourPlayer.splitHand.push(splitCard);
    console.log("splitHand length: " + ourPlayer.splitHand.length);
    //Now let's reset our decks on screen, and set them up as twos
        playerCardImage[1].style.display = 'none';
    //All cards are hidden; set up split hand first
    splitCardImage[0].style.display = 'block';
    splitCardImage[0].getElementsByClassName('bottomRight')[0].innerText = ourPlayer.splitHand[0].text;
    splitCardImage[0].getElementsByClassName('bottomLeft')[0].innerHTML = ourPlayer.splitHand[0].suitSrc;
    ourPlayer.split = true;
    drawSplit(gameDeck, 1, ourPlayer);
    //Now draw our regular
    drawCard(gameDeck, 1, ourPlayer);
    //Now we reset actions.  We'll worry about the split hand at the end.
    //Now we want to calculate score
    score = Number(0);
    console.log(stringify(ourPlayer.hand));
    calculateScore();
    currentScoreText.innerHTML = score;
    //Now we need to record our action and state data
    //Now we will determine the new state
    if (score < 22) {
        scoreStateData = score;
    } else {
        scoreStateData = score * (-1);
    }
    state[1] = scoreStateData;
    //Now we take the stateChange
    stateChangeData = state[1] - state[0];
    //Now we can greate our actionCollectionQueryObject
    actionCollectionQueryObject = new actionCollectionQuery(actionData, stateChangeData);
    //And write that object to the actionData array
    dataCollectionQueryObject.actionData.push(actionCollectionQueryObject);
    //Now loop
    //Now let's prepare for the next action
    if (ourPlayer.human == true) {
        populateUserActionSelect();
    } else {
        botProcessingStep();
    }
}

function hit(){
    console.log("You chose to hit.");
    //First we draw a new card
    drawCard(gameDeck, 1, ourPlayer);
    //Now we want to calculate score
    calculateScore();
    //Now we will determine the new state
    if (score < 22) {
        scoreStateData = score;
    } else {
        scoreStateData = score * (-1);
    }
    state[1] = scoreStateData;
    //Now we take the stateChange
    stateChangeData = state[1] - state[0];
    //Now we can greate our actionCollectionQueryObject
    actionCollectionQueryObject = new actionCollectionQuery(actionData, stateChangeData);
    //And write that object to the actionData array
    dataCollectionQueryObject.actionData.push(actionCollectionQueryObject);
    //Now check if they busted, and if so start the loss function
    if (score > 21) {
        messageBox.innerHTML = "Your Score: " + score + "<br>Your Hand: ";
        for (let i = 0; i < ourPlayer.hand.length; i++) {
            messageBox.innerHTML += ourPlayer.hand[i].name + " ";
        }
        //Let's calculate our difference first
        scoreStateData -= (score - dealerScore);
        //And declare a loss
        winStateData = 0;
        //Now we need to define the terminal state and the deckFactor
        deckFactorData = calculateDeckFactor(gameDeck).toFixed(1);
        terminalStatusData = true;
        //Now create a new sCQO and add to the dCQO
        stateCollectionQueryObject = new stateCollectionQuery(scoreStateData, deckFactorData, terminalStatusData);
        dataCollectionQueryObject.stateData.push(stateCollectionQueryObject);
        //Now we can write our other variables
        dataCollectionQueryObject.winState = winStateData;
        dataCollectionQueryObject.actionCount = actionCountData;
        //Now we can go to the loss function
        loss();
    }
    //Now let's prepare for the next action
    if (ourPlayer.human == true) {
        populateUserActionSelect();
    } else {
        botProcessingStep();
    }
    
}

function calculateDeckFactor(aDeck) {
    let df;
    pointsTotal = Number(0);
    for (let i = 0; i < aDeck.cards.length; i++) {
        pointsTotal += Number(aDeck.cards[i].points);
    }
    df = (pointsTotal/aDeck.cards.length);
    return df;
}

function stay(){
    let dealerList = "";
    //let dealerScore = Number(gameDealer.hand[0].points) + Number(gameDealer.hand[1].points);
    console.log("You chose to stay.");
    //We've chosen to stay.  Time to determine winner
    //dealerList
    
    
    try {
        for(let i = 0; i < gameDealer.hand.length; i++){
            dealerList += gameDealer.hand[i].name + " "
        }
    } catch (error) {
        resetGame();
    }
    //Let's write what data we can before proceeding forward
    calculateScore();
    //Now we will determine the new state
    if (score < 22) {
        scoreStateData = Number(score + Math.abs(score-dealerScore));
    } else {
        scoreStateData = Number((score + Math.abs(score-dealerScore)) * (-1));
    }
    state[1] = scoreStateData;
    //Write scores to messageBox
    messageBox.innerHTML = 'Dealer Cards: ' + dealerList + '<br>Dealer Score: ' + dealerScore + '<br>Your Score: ' + score + '<br>Your Cards: ';
    for (let i = 0; i < ourPlayer.hand.length; i++) {
        messageBox.innerHTML += ourPlayer.hand[i].name + " ";
    }
    //conditional statement for win or loss
    if (score >= dealerScore) {
        state[1] += (score - dealerScore);
        stateChangeData = state[1] - state[0];
        //Now we create our action object
        actionCollectionQueryObject = new actionCollectionQuery(actionData, stateChangeData);
        dataCollectionQueryObject.actionData.push(actionCollectionQueryObject);
        //We've added our action object.  Now we need to write the rest of our needed data before going to the win function
        //And declare a win
        winStateData = 1;
        //Now we need to define the terminal state and the deckFactor
        deckFactorData = calculateDeckFactor(gameDeck).toFixed(1);
        terminalStatusData = true;
        //Now create a new sCQO and add to the dCQO
        stateCollectionQueryObject = new stateCollectionQuery(scoreStateData, deckFactorData, terminalStatusData);
        dataCollectionQueryObject.stateData.push(stateCollectionQueryObject);
        //Now we can write our other variables
        dataCollectionQueryObject.winState = winStateData;
        dataCollectionQueryObject.actionCount = actionCountData;
        //Now we can go to win :)
        win();
    } else {
        state[1] -= (dealerScore-score);
        stateChangeData = state[1] - state[0];
        //Now we create our action object
        actionCollectionQueryObject = new actionCollectionQuery(actionData, stateChangeData);
        dataCollectionQueryObject.actionData.push(actionCollectionQueryObject);
        //We've added our action object.  Now we need to write the rest of our needed data before going to the win function
        //And declare a win
        winStateData = 0;
        //Now we need to define the terminal state and the deckFactor
        deckFactorData = calculateDeckFactor(gameDeck).toFixed(1);
        terminalStatusData = true;
        //Now create a new sCQO and add to the dCQO
        stateCollectionQueryObject = new stateCollectionQuery(scoreStateData, deckFactorData, terminalStatusData);
        dataCollectionQueryObject.stateData.push(stateCollectionQueryObject);
        //Now we can write our other variables
        dataCollectionQueryObject.winState = winStateData;
        dataCollectionQueryObject.actionCount = actionCountData;
        //Now we can go to the loss function
        loss();
    }
}

function splitTrue(){
    //Push our split hand to hand, then play as normal
    if (ourPlayer.splitHand[0].element && ourPlayer.splitHand[1].element) {
        ourPlayer.splitHand[0].element.style.display = 'none';
        ourPlayer.splitHand[1].element.style.display = 'none';
    }
    ourPlayer.hand.push(ourPlayer.splitHand[0]);
    ourPlayer.hand.push(ourPlayer.splitHand[1]);
    console.log(stringify(ourPlayer.hand));
    //We need to fill out the stuff
    for (let j = 0; j < 2; j++){
        playerCardImage[j].classList.add(player.hand[j].color);
        playerCardImage[j].getElementsByClassName('topLeft')[0].innerText = player.hand[j].text;
        console.log(player.hand[j].text);
        playerCardImage[j].getElementsByClassName('bottomRight')[0].innerText = player.hand[j].text;
        playerCardImage[j].getElementsByClassName('topRight')[0].innerHTML = player.hand[j].suitSrc;
        console.log(player.hand[j].suitSrc);
        playerCardImage[j].getElementsByClassName('bottomLeft')[0].innerHTML = player.hand[j].suitSrc;
    }
    //Now get our score and go to our actions
    calculateScore();
    //We need to reset our hand now for a different game
    timeStampData = Date.now();
    humanData = dataCollectionQueryObject.human;
    anteData = dataCollectionQueryObject.ante;
    //now create the object
    dataCollectionQueryObject = new dataCollectionQuery(humanData, timeStampData, anteData);
    if (ourPlayer.human == true) {
        populateUserActionSelect();
    } else {
        botProcessingStep();
    }
}
//dCIQ
function dCIQ() {
     //Before any of the initial function code, let's go ahead
    //and write our dCQO to the server with a post request
    //Prepare the POST data string
    startBotButton.style.display = 'none';
    const POST = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataCollectionQueryObject)
    };

    console.log(POST);
    //Now send the request to the server
    fetch('/dCIQ', POST)
        .then(response => {
            //Determine if request was successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
                
            }
            //Parse response as JSON
            return response.json();
            
        })
        .then(data => {
            console.log(data);
            startBotButton.style.display = 'block';
        }) 
        .catch(error => {
            //Error handling
            console.error('Fetch error:', error);
            startBotButton.style.display = 'block';
            resetGame();
            return;
        });
}

//bJQ
function bJQ() {
    //Before any of the initial function code, let's go ahead
   //and write our dCQO to the server with a post request
   //Prepare the POST data string
   const POST = {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify(blackJackQueryObject)
   };

   console.log(POST);
   //Now send the request to the server
   fetch('/bJQTST', POST)
       .then(response => {
           //Determine if request was successful
           if (!response.ok) {
               throw new Error('Network response was not ok');
           }
           //Parse response as JSON
           return response.json();
       })
       .then(data => {
            console.log(data)
            bPS2(data);
        })
       .catch(error => {
           //Error handling
           console.error('Fetch error:', error);
           resetGame();
           return;
       });
}

//Win and Loss Functions
function win() {
    //Let's see if our data passed correctly
    console.log(JSON.stringify(dataCollectionQueryObject));
    let winCount;
    let playerChips;
    let ante;
    if (!actionCountData === 0){
        dCIQ();
    }
   


    messageBox.innerHTML += 'YOU WIN!';
    winCount = Number(winsText.innerText);
    winCount++;
    winsText.innerText = winCount;
    //Now add ante to your chips
    playerChips = Number(chipsText.innerText);
    ante = Number(anteText.innerText);
    playerChips += ante;
    chipsText.innerText = playerChips;
    anteText.innerHTML = '';
    //Will need a reset here
    resetHand(ourPlayer);
    if (gameDeck.cards.length < 36){
        gameDeck = new deck();
    }
    if (ourPlayer.split == false){
        //Now let's prepare for the next action
        if (ourPlayer.human == true) {
            chooseAnte();
        } else {
            if (gameCount <= 0){
                console.log("The game should be exitting here.  If you read this, you're in the loop.");
                gameCount--;
                startBotButton.removeEventListener('click', botGame);
                startBotButton.addEventListener('click', setAnte);
                return;
            } else {
                gameCount--;
                setAnte();
            }
        }
    } else {
        splitTrue();
    }
    
}

function loss() {
    //Let's see if our data passed correctly
    console.log(JSON.stringify(dataCollectionQueryObject));
    let lossCount;
    let playerChips;
    let ante;

    dCIQ();

    messageBox.innerHTML += 'YOU LOSE!';
    lossCount = Number(lossesText.innerText);
    lossCount++;
    lossesText.innerText = lossCount;
    //Now subtract ante to your chips
    playerChips = Number(chipsText.innerText);
    ante = Number(anteText.innerText);
    playerChips -= ante;
    chipsText.innerText = playerChips;
    anteText.innerHTML = '';
    //Will need a reset here
    resetHand(ourPlayer);
    if (gameDeck.cards.length < 26){
        gameDeck = new deck();
    }
    if (ourPlayer.split == false){
        //Now let's prepare for the next action
        if (ourPlayer.human == true) {
            chooseAnte();
        } else {
            if (gameCount <= 0){
                console.log("The game should be exitting here.  If you read this, you're in the loop.");
                gameCount--;
                startBotButton.removeEventListener('click', botGame);
                startBotButton.addEventListener('click', setAnte);
                return;
            } else {
                gameCount--;
                setAnte();
            }
        }
    } else {
        splitTrue();
    }
}
//Ante has been set and cards are ready to be dealt.
function humanTurn_01() {
    dealerScore = Number(0);
    console.log('Successfully made it to human turn step.');
    messageBox.innerText = 'Select an option from the dropdown and hit commit.';
    //Draw our first cards
    drawCard(gameDeck, 2, ourPlayer);
    //Now we need a function to draw for our dealer
    dealerDraw(gameDeck);
    //if over return
    if (over == true) {
        return;
    }
    //We have everything we need now to start the player actions.
    
    //Add our score
    calculateScore();
    //Populate our select form
    if (ourPlayer.human == true) {
        //Show the userActionsForm
        userActionsForm.style.display = 'block';
        populateUserActionSelect();
    } else {
        botProcessingStep();
    }
    

}
function dealerScoreCheck(){
    dealerScore = Number(0);
    aChanged = false;

    for (let i = 0; i < Number(gameDealer.hand.length); i++) {
        if (gameDealer.hand[i] && gameDealer.hand[i].points) {
            dealerScore += Number(gameDealer.hand[i].points);
        }
    }
    //if score is over 17, change As to 1s
    if (dealerScore >= 17) {
        //for each card
        for (let j = 0; j < gameDealer.hand.length; j++) {
            //If an ace, change the points and the change status
            if (gameDealer.hand[j] && gameDealer.hand[j].text && gameDealer.hand[j].points) {
                if (gameDealer.hand[j].text == 'A' && gameDealer.hand[j].points > Number(1)) {
                    gameDealer.hand[j].points = Number(1);
                    aChanged = true;
                } 
            }
        }
        //restart if changes were made
        if (aChanged == true) {
            dealerScoreCheck();
        }
    }
}
function dealerDraw(aDeck) {
    const rand = Math.random();
    //draw two cards for le dealer
    const drawnCards = aDeck.cards.splice(Math.floor(rand * aDeck.cards.length) + 1, 2);
    if (drawnCards && drawnCards[0] && drawnCards[1]) {
        //Now we need to add these to the dealer's hand.
      gameDealer.hand[0] = drawnCards[0];
      gameDealer.hand[1] = drawnCards[1];

      //Add our dealerCard to our dataCollectionQueryObject
      
      dataCollectionQueryObject.dealerCard = gameDealer.hand[0].points;

    //Now we need to display the cards
    //Only gameDealer.hand[0] needs to be displayed in dealerCardImage[0]
    dealerCardImage[0].getElementsByClassName('bottomRight')[0].innerHTML = gameDealer.hand[0].text;
    dealerCardImage[0].getElementsByClassName('bottomLeft')[0].innerHTML = gameDealer.hand[0].suitSrc;

    //We need to display the dealer cards now
    dealerCardImage[0].style.display = 'block';
    dealerCardImage[1].style.display = 'block';

    dealerDraw_02(aDeck);
    } else {
        gameDeck = new deck();
        dealerDraw(gameDeck);
    }
      

}

function dealerDraw_02(aDeck){
    //Now let's draw for the dealer until they hit their limit
    for(let i = 0; i < 10; i++) {
        dealerScoreCheck();
        if (dealerScore > 21) {
            messageBox.innerHTML = 'Dealer Score: ' + dealerScore + "<br>";
            over = true;
            dealerScore = Number(0);
            //In this case, we'll skip the data collection, as the user did nothing
            win();
        } else if (dealerScore < 17) {
            drawDealerCard(aDeck);
        } else {

        }
    }
}

function drawDealerCard(aDeck){
    const rand = Math.random();
    //draw two cards for le dealer
    const drawnCards = aDeck.cards.splice(Math.floor(rand * aDeck.cards.length) + 1, 1);
    gameDealer.hand.push(drawnCards[0]);
    dealerDraw_02(aDeck);
}

function drawCard(aDeck, num, player) {
    for (let i = 0; i < num; i++) {
        const rand = Math.random();
        const card = aDeck.cards.splice(Math.floor(rand * aDeck.cards.length) + 1, 1);
        if (card && card[0] && card[0].name) {
            player.hand.push(card[0]);
        } else {
            gameDeck = new deck();
            drawCard(gameDeck, num - (i - 1), player)
        }
        
        
        try {
            for (let j = 0; j < player.hand.length; j++) {
                if (player.hand[j].name === card[0].name) {
                    // We found it!
                    player.hand[j].element = playerCardImage[j];
                    player.hand[j].element.style.display = 'block';
        
                    // Fill out the rest of the properties
                    playerCardImage[j].classList.add(player.hand[j].color);
                    playerCardImage[j].getElementsByClassName('topLeft')[0].innerText = player.hand[j].text;
                    console.log(player.hand[j].text);
                    playerCardImage[j].getElementsByClassName('bottomRight')[0].innerText = player.hand[j].text;
                    playerCardImage[j].getElementsByClassName('topRight')[0].innerHTML = player.hand[j].suitSrc;
                    console.log(player.hand[j].suitSrc);
                    playerCardImage[j].getElementsByClassName('bottomLeft')[0].innerHTML = player.hand[j].suitSrc;
                }
            }
        } catch (error) {
            resetGame();
        }
            
    }
}

function resetGame() {
    // Handle the exception
            // Will need a reset here
            messageBox.innerHTML = "GAME WAS RESET DUE TO INTERNAL ERROR!";
            resetHand(ourPlayer);
            if (gameDeck.cards.length < 36) {
                gameDeck = new deck();
            }
            if (!ourPlayer.split) {
                // Now let's prepare for the next action
                if (ourPlayer.human) {
                    chooseAnte();
                } else {
                    startBotButton.removeEventListener('click', botGame);
                    startBotButton.addEventListener('click', setAnte);
                    return;
                }
            } else {
                splitTrue();
            }
}

function drawSplit(aDeck, num, player) {
    for (let i = 0; i < num; i++) {
        const rand = Math.random();
        const card = aDeck.cards.splice(Math.floor(rand * aDeck.cards.length) + 1, 1);
        player.hand.push(card[0]);
        //now find which card we are in the array, and take care of business
        for (let j = 0; j < player.splitHand.length; j++) {
            if (player.splitHand[j].name == card[0].name) {
                //We found it!
                player.splitHand[j].element = playerCardImage[j];
                player.splitHand[j].element.style.display = 'block';
                //We need to fill out the stuff
                splitCardImage[j].classList.add(player.splitHand[j].color);
                splitCardImage[j].getElementsByClassName('topLeft')[0].innerText = player.splitHand[j].text;
                console.log(player.splitHand[j].text);
                splitCardImage[j].getElementsByClassName('bottomRight')[0].innerText = player.splitHand[j].text;
                splitCardImage[j].getElementsByClassName('topRight')[0].innerHTML = player.splitHand[j].suitSrc;
                console.log(player.splitHand[j].suitSrc);
                splitCardImage[j].getElementsByClassName('bottomLeft')[0].innerHTML = player.splitHand[j].suitSrc;
            }
        }
    }
}

function setAnte() {
    console.log('gameCount: ' + gameCount);
    over = false;
    actionCountData = Number(0);
    anteSubmitButton.removeEventListener('click', setAnte);
    let ante;
    if (ourPlayer.human == false) {
        ante = Number(1);
    } else {
        ante = anteInput.value;
    }
    if (isNaN(ante) == true) {
        messageBox.innerText = 'Please enter a number and try again.';
        anteSubmitButton.addEventListener('click', setAnte);
        return;
    }
    ourPlayer.ante = ante;
    anteInput.style.display = 'none';
    anteText.innerHTML = ante;
    anteUpButton.style.display = 'none';
    anteDownButton.style.display = 'none';
    anteSubmitButton.style.display = 'none';
    if (ourPlayer.human == true) {
        //Before we start the turn, we need to create our data object for the game
        //Set what variables we can
        timeStampData = new Date().toLocaleString();
        humanData = 'human';
        anteData = ante;
        //now create the object
        dataCollectionQueryObject = new dataCollectionQuery(humanData, timeStampData, anteData);
        //Start the human turn
        humanTurn_01();
    } else {
        //Before we start the turn, we need to create our data object for the game
        //Set what variables we can
        timeStampData = new Date().toLocaleString();
        humanData = 'bot';
        anteData = ante;
        //now create the object
        dataCollectionQueryObject = new dataCollectionQuery(humanData, timeStampData, anteData);
        //Start the human turn
        humanTurn_01();
    }
}

function upAnte() {
    let ante = anteInput.value;
    anteUpButton.removeEventListener('click', upAnte);
    if (isNaN(ante) == true || ante >= ourPlayer.chips) {
        return;
    }
    ante++;
    anteInput.value = ante;
    anteUpButton.addEventListener('click', upAnte);
}

function downAnte() {
    let ante = anteInput.value;
    anteDownButton.removeEventListener('click', downAnte);
    if (isNaN(ante) == true || ante <= 1) {
        return;
    }
    ante--;
    anteInput.value = ante;
    anteDownButton.addEventListener('click', downAnte);
}