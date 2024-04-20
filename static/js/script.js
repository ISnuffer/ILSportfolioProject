
//Define our HTML elements
const a1 = document.querySelector('#ta1');
const a1Text = document.querySelector('#a1');

const a2 = document.querySelector('#ta2');
const a2Text = document.querySelector('#a2');

const a3 = document.querySelector('#ta3');
const a3Text = document.querySelector('#a3');

const b1 = document.querySelector('#tb1');
const b1Text = document.querySelector('#b1');

const b2 = document.querySelector('#tb2');
const b2Text = document.querySelector('#b2');

const b3 = document.querySelector('#tb3');
const b3Text = document.querySelector('#b3');

const c1 = document.querySelector('#tc1');
const c1Text = document.querySelector('#c1');

const c2 = document.querySelector('#tc2');
const c2Text = document.querySelector('#c2');

const c3 = document.querySelector('#tc3');
const c3Text = document.querySelector('#c3');

const messageBox = document.querySelector('#TTTM');
const playButton = document.querySelector('#play');

const playerForm = document.querySelector('#add_player');
const playerNameInput = document.querySelector('#name_input');
const playerMarkerSelect = document.querySelector('#marker_select');
const addPlayerButton = document.querySelector('#Player_submit');
const game = document.querySelector('#game');
const controller = document.querySelector('#controller');
const positionSelect = document.getElementById('positionSelect');
const chooseButton = document.querySelector('#choose');

var gameBoard = new Board();

let loopy;
let loopy2;
let rowCheck;
let colCheck;
let d1Check;
let d2Check;

playButton.onclick = newGame;
//Define our variables
let players = [];
let position = 1;
//let gameBoard = [[], [], []];
let playerUp = 0;
let _col;
let _row;
let theState;

//Constructor for players
function Player(position, name, marker, ai, state) {
    this.position = position;
    this.name = name;
    this.marker = marker;
    this.ai = ai;
    this.state = state;
}

//Constructor for gameBoard
function Board(initialA = [], initialB = [], initialC = []) {
    this.A = initialA;
    this.B = initialB;
    this.C = initialC;
}

//Function to initiate the game by adding the players
function newGame() {
    playButton.style.display = 'none';
    messageBox.innerHTML = 'Would you like to play a game?  Add player 1 please!';
    
    playerForm.style.display = 'block';
    //addPlayerButton.onclick = () => addPlayer(position);
    addPlayerButton.addEventListener("click", () => addPlayer(position)); // Set initial position
}

//Victory!
function victory(playerUp) {
    messageBox.innerHTML = "Congrats " + players[playerUp].name + "! You win!";
}
//Draw
function draw() {
    messageBox.innerHTML = "DRAW!";
}

function choosePosition(marker) {
    let posStr = document.querySelector('#positionSelect').value;
    //messageBox.innerHTML = posStr;
    //messageBox.innterHTML += positionSelect.options.length;
    document.getElementById(posStr).innerText = marker;
    //We need to amend the array as well
    let colNo;
    let row;
    switch (posStr) {
        case "A1":
            colNo = 'A';
            row = 0;
            break;
        case "A2":
            colNo = 'A';
            row = 1;
            break;
        case "A3":
            colNo = 'A';
            row = 2;
            break;
        case "B1":
            colNo = 'B';
            row = 0;
            break;
        case "B2":
            colNo = 'B';
            row = 1;
            break;
        case "B3":
            colNo = 'B';
            row = 2;
            break;
        case "C1":
            colNo = 'C';
            row = 0;
            break;
        case "C2":
            colNo = 'C';
            row = 1;
            break;
        case "C3":
            colNo = 'C';
            row = 2;
            break;
    }
    //now fix the array
    gameBoard[colNo][row] = marker;
    console.log(gameBoard[colNo][row]);
    //remove from list
    for (let i = 0; i < positionSelect.length; i++) {
        if (posStr == positionSelect[i].value) {
            positionSelect.remove(i);
        }
    }
    //remove event listener
    chooseButton.removeEventListener("click", choosePosition);
    //Update State
    updateState();
}

//function to convert colno to letter
function colConvert(i){
    if (i == 0) {
        return 'A';
    } else if (i == 1) {
        return 'B';
    } else {
        return 'C';
    }
}
let oMarker;
function checkState(theBoard, marker) {
    theState = 0;
    if (marker == "X") {
        oMarker = "O";
    } else {
        oMarker = "X";
    }
    

    //rows
    for (loopy = 0; loopy < 3; loopy++) {
       
        console.log('colConvert: ' + colConvert(loopy) + " " + loopy);
        if (theBoard[colConvert(loopy)][0] == marker && theBoard[colConvert(loopy)][1] == marker && theBoard[colConvert(loopy)][2] == marker) {
            theState += 100;
            console.log('row' + loopy);
        }
        
    }
    //columns
    for (loopy = 0; loopy < 3; loopy++) {
      
        if (theBoard['A'][loopy] == marker && theBoard['B'][loopy] == marker && theBoard['C'][loopy] == marker) {
            theState += 100;
            console.log('column ' + loopy);
        }
       
    }
    //diagnol top-left
    if (theBoard['A'][0] == marker && theBoard['B'][1] == marker && theBoard['C'][2] == marker) {
        
        theState += 100;
        console.log('diag-top-left');
      
    }
    //diagnol top-right
    if (theBoard['C'][0] == marker && theBoard['B'][1] == marker && theBoard['A'][2] == marker) {
        
        theState += 100;
        console.log('diag-top-right');
      
    }
    //Now let's check for our states of 2
    if (theBoard['A'][0] == marker && theBoard['B'][0] == marker && theBoard['C'][0] != oMarker) {
        theState++;
    }
    if (theBoard['B'][0] == marker && theBoard['C'][0] == marker && theBoard['A'][0] != oMarker) {
        theState++;
    }
    if (theBoard['A'][0] == marker && theBoard['B'][1] == marker && theBoard['C'][2] != oMarker) {
        theState++;
    }
    if (theBoard['B'][1] == marker && theBoard['C'][2] == marker && theBoard['A'][0] != oMarker) {
        theState++;
    }
    if (theBoard['A'][0] == marker && theBoard['A'][1] == marker && theBoard['A'][2] != oMarker) {
        theState++;
    }
    if (theBoard['A'][1] == marker && theBoard['A'][2] == marker && theBoard['A'][0] != oMarker) {
        theState++;
    }
    if (theBoard['B'][0] == marker && theBoard['B'][1] == marker && theBoard['B'][2] != oMarker) {
        theState++;
    }
    if (theBoard['B'][1] == marker && theBoard['B'][2] == marker && theBoard['B'][0] != oMarker) {
        theState++;
    }
    if (theBoard['C'][0] == marker && theBoard['C'][1] == marker && theBoard['C'][2] != oMarker) {
        theState++;
    }
    if (theBoard['C'][1] == marker && theBoard['C'][2] == marker && theBoard['C'][0] != oMarker) {
        theState++;
    }
    if (theBoard['A'][1] == marker && theBoard['B'][1] == marker && theBoard['C'][1] != oMarker) {
        theState++;
    }
    if (theBoard['B'][1] == marker && theBoard['C'][1] == marker && theBoard['A'][1] != oMarker) {
        theState++;
    }
    if (theBoard['A'][2] == marker && theBoard['B'][2] == marker && theBoard['C'][2] != oMarker) {
        theState++;
    }
    if (theBoard['B'][2] == marker && theBoard['C'][2] == marker && theBoard['A'][2] != oMarker) {
        theState++;
    }
    if (theBoard['A'][2] == marker && theBoard['B'][1] == marker && theBoard['C'][0] != oMarker) {
        theState++;
    }
    if (theBoard['B'][1] == marker && theBoard['C'][0] == marker && theBoard['A'][2] != oMarker) {
        theState++;
    }

    //Now just singles
    for (loopy = 0; loopy < 3; loopy++) {
        for (loopy2 = 0; loopy2 < 3; loopy2++) {
            if (theBoard[colConvert(loopy)][loopy2] == marker) {
                theState++;
            }
        }
    }
    //Now return the state
    return theState;
}

function updateState() {
    let marker = players[playerUp].marker;
    let state = checkState(gameBoard, marker);
    if (state > 100) {
        console.log("gameArray: " + JSON.stringify(gameBoard));
        victory(playerUp);
        return;
    }
    //Now check for victory
    //rows
    
    console.log(positionSelect.length);
    if (positionSelect.length == 0) {
        draw();
        return;
    }


    if (playerUp == 0) {
        playerUp = 1;
    } else {
        playerUp = 0;
    }
    
    gameTurn(playerUp);
}

//Main loop
function gameTurn(playerUp) {
    //We're going to need to behave differently depending on human or AI turn
    if (players[playerUp].ai == false) {
        messageBox.innerHTML = "You're up " + players[playerUp].name + "!"
        chooseButton.onclick = () => choosePosition(players[playerUp].marker);
    } else {
        aiTurn(players[playerUp].marker);
    }
}
let tempInt;
let tempCol;
let choice;
function aiTurn(marker) {
    choice = chooseAiPosition(marker, gameBoard);
    tempCol = choice.charAt(0);
    tempInt = choice.charAt(1);
   tempInt++
   choice = tempCol + tempInt;
   console.log('choice:' + choice);
   //Now update the board
   document.getElementById(choice).innerText = marker;
    switch (choice) {
        case "A1":
            colNo = 'A';
            row = 0;
            break;
        case "A2":
            colNo = 'A';
            row = 1;
            break;
        case "A3":
            colNo = 'A';
            row = 2;
            break;
        case "B1":
            colNo = 'B';
            row = 0;
            break;
        case "B2":
            colNo = 'B';
            row = 1;
            break;
        case "B3":
            colNo = 'B';
            row = 2;
            break;
        case "C1":
            colNo = 'C';
            row = 0;
            break;
        case "C2":
            colNo = 'C';
            row = 1;
            break;
        case "C3":
            colNo = 'C';
            row = 2;
            break;
    }
    //now fix the array
    console.log('colno:' + colNo + "row " + row);
    gameBoard[colNo][row] = marker;
    console.log(gameBoard[colNo][row]);
    //remove from list
    for (let i = 0; i < positionSelect.length; i++) {
        if (choice == positionSelect[i].value) {
            positionSelect.remove(i);
        }
    }
    //Update States

    updateState();
}

function chooseAiPosition(marker, aBoard) {
    let currentChoice;
    let currentChoiceState = 0;
    let currentChoiceOtherState = 100;
    let otherMarker;
    if (marker == "X") {
        otherMarker = 'O';
    } else {
        otherMarker = 'X';
    }
    let otherState = checkState(aBoard, otherMarker);
    let myState = checkState(aBoard, marker);
    let newOtherState;
    let newMyState;

    //first we'll need a function to determine empty spaces in the gameboard
    const currentChoices = emptySpaces(aBoard);

    //Let's clone our aBoard
    let newBoard;

    //We now have our list of choices.  We need a loop to go through each choice
    for (let i = 0; i < currentChoices.length; i++) {
        //disect the array variable
        newBoard = JSON.parse(JSON.stringify(aBoard));
        _col = currentChoices[i].charAt(0);
        _row = currentChoices[i].charAt(1);
        newBoard[_col][_row] = marker;
        newOtherState = checkState(newBoard, otherMarker);
        newMyState = checkState(newBoard, marker);
        if (newMyState > 100) {
            currentChoice = currentChoices[i];
            currentChoiceState = newMyState;
            currentChoiceOtherState = newOtherState;
            //We win!  I don't need to run the rest.
            console.log("Current Choice State: " + currentChoiceState);
            return currentChoice;
        } else if (newOtherState < currentChoiceOtherState) {
            currentChoice = currentChoices[i];
            currentChoiceState = newMyState;
            currentChoiceOtherState = newOtherState;
        }

    }
    //Lowest state value for human
    console.log("Current Choice State: " + currentChoiceState);
    return currentChoice;
}

function chooseHumanPosition(marker, aBoard){

}

function emptySpaces(theBoard) {
    let emptySpaceArray = [];
    let space = '';
    for (let i = 0; i < 3; i++) {
        if (theBoard['A'][i] !== 'X' && theBoard['A'][i] !== 'O') {
            space = 'A' + i;
            emptySpaceArray.push(space);
        }
    }
    for (let i = 0; i < 3; i++) {
        if (theBoard['B'][i] !== 'X' && theBoard['B'][i] !== 'O') {
            space = 'B' + i;
            emptySpaceArray.push(space);
        }
    }
    for (let i = 0; i < 3; i++) {
        if (theBoard['C'][i] !== 'X' && theBoard['C'][i] !== 'O') {
            space = 'C' + i;
            emptySpaceArray.push(space);
        }
    }
    //Now return the array
    return emptySpaceArray;
}




//Function to add a player to the game
function addPlayer(position) {
    let name = playerNameInput.value;
    let marker = playerMarkerSelect.value;
    //Add our human player
    const newPlayer = new Player(position, name, marker, false, 0);

    players.push(newPlayer);
    console.log(newPlayer.name + '<br>' + newPlayer.marker);
    position++;

    //Now let's add our AI bot
    name = 'Bot';
    //Dynamically select marker not used
    if (marker == "X") {
        marker = "O";
    } else {
        marker = "X";
    }
    //create our Bot
    const aiBot = new Player(position, name, marker, true, 0);

    players.push(aiBot);
    messageBox.innerHTML = 'OK, let\'s get started!<br>Player 1: ' + players[0].name + '<br>Player 2: ' + players[1].name;
    playerForm.style.display = 'none';
    controller.style.display = 'block';
    gameTurn(playerUp);
    
    
}
