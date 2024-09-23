
const optionContainer = document.querySelector('.option-container');
const flipButton = document.querySelector('#flip-button');
const gamesBoardContainer = document.querySelector('#gamesboard-container');
const startButton = document.querySelector('#start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')

//random player ship 
const randomButton = document.querySelector('#random-button')

// creating function to flip the ships 
let angle = 0; // this a global variable that'll allow the ability to 'flip' the ships without resetting each time.. hence why its outside of the flip function
function flip () {
const optionShips = Array.from(optionContainer.children); 
  if (angle === 0) {
    angle = 90;
  } 
  else {
    angle = 0;
  }
  // shorthand (conditional/ternary operator)  for if else statement  -> angle = angle === 0 ? 90 : 0
optionShips.forEach(optionShips => optionShips.style.transform = `rotate(${angle}deg)`);

}

flipButton.addEventListener('click', flip);

// function that allows player to randomize ship placement 
function randomPlayerShips() {
  // clears player board of any existing ships 
  const allPlayerBlocks = document.querySelectorAll('#player div')
  allPlayerBlocks.forEach(block => block.classList.remove('taken','destroyer', 'submarine', 'cruiser', 'battleship', 'carrier'))


  ships.forEach(ship => addShipPiece('player', ship))
}
randomButton.addEventListener('click', randomPlayerShips)

// creating the boards 
const width = 10;

function createBoard (color, user) {
   const gameBoardContainer =  document.createElement('div');
   gameBoardContainer.classList.add('game-board');
   gameBoardContainer.style.backgroundColor = color;
   gameBoardContainer.id = user;


   for (let i = 0; i < width * width; i++) {
    const block = document.createElement('div');
    block.classList.add('block');
    block.id = i;
    gameBoardContainer.append(block);
   }

   gamesBoardContainer.append(gameBoardContainer);
}
createBoard ('', 'player');
createBoard ('', 'computer'); 

//creating ships

class Ship {
  constructor(name,length) {
    this.name = name
    this.length = length
  }
}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier]
let notDropped

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
  let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex : width * width - ship.length : 
  // handle vertical 
  startIndex <= width * width - width * ship.length ? startIndex : startIndex - ship.length * width + width 

  let shipBlocks = []

  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i])
    }
    else {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])
    }
  }
 
// to prevent ships from overlapping and making moves invalid if the ships has to split to the next line

let valid
// starting with horizontal positioning
if (isHorizontal) {
  shipBlocks.every((_shipBlock, index) => 
    valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1))) 
  } else {
  valid = shipBlocks.every((_shipBlock, index) => shipBlocks[0].id < 90 + (width * index + 1))
}

const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

return {shipBlocks, valid, notTaken}

}

function addShipPiece(user, ship, startId) {

  // this section randomly selects the starting point on the computers game board and places the ships horizontal or vertical
  const allBoardBlocks = document.querySelectorAll(`#${user} div`)
  let randomBoolean = Math.random() < 0.5
  let isHorizontal = user == 'player' ? angle === 0 : randomBoolean
  let randomStartIndex = Math.floor(Math.random() * width * width)

  let startIndex = startId ? startId : randomStartIndex

  const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)



if (valid && notTaken) {
  shipBlocks.forEach(shipBlock => {
  shipBlock.classList.add(ship.name)
  shipBlock.classList.add('taken')
})
} else {
  if (user === 'computer') addShipPiece('computer', ship, startId) 
  if (user === 'player') notDropped = true
}


}
ships.forEach(ship => addShipPiece('computer', ship)) 


// drag player ships while checking validity of moves 
let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))


const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
  playerBlock.addEventListener('dragover', dragOver)
  playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e){
  notDropped = false
  draggedShip = e.target
}

function dragOver(e) {
  e.preventDefault()
  const ship = ships[draggedShip.id]
  highlightArea(e.target.id, ship)
}

function dropShip(e){
  const startId = e.target.id
  const ship = ships[draggedShip.id]
  addShipPiece('player', ship, startId)
  if (!notDropped) {
    draggedShip.remove()
  }
}
 
// add highlight 

function highlightArea(startIndex, ship) { // highlighting the ship that is currently being dragged 
  const allBoardBlocks = document.querySelectorAll('#player div')
  let isHorizontal = angle === 0 // to check if the ship thats being dragged is horizontal.. if angle does equal 0 then the ship is horizontal 
const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

if (valid && notTaken) {
  shipBlocks.forEach(shipBlock => {
    shipBlock.classList.add('hover') 
    setTimeout(() => shipBlock.classList.remove('hover'), 500)
  })
}

}

let gameOver = false
let playerTurn 


//start game 

function startGame() {
  if(playerTurn === undefined) {
    if (optionContainer.children.length !=0) {
  infoDisplay.textContent = "Please place all of your ships first!!"
  }
  else {
    const allBoardBlocks = document.querySelectorAll('#computer div')
    allBoardBlocks.forEach(block => block.addEventListener('click',handleClick)) 
    
    playerTurn = true
    turnDisplay.textContent = "your turn"
    infoDisplay.textContent = "the game has started"
    }
  }
 


}

startButton.addEventListener('click', startGame) // adds event listener to listen out for a click in the start button 

let playerHits = []
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []

// function when game starts to let you know that you've hit a computer ship 
function handleClick(e) {
  if (!gameOver) {
    if (e.target.classList.contains('taken')) { // when a ship is hit
      e.target.classList.add('boom')
      infoDisplay.textContent = "You hit the computer's ship"

      // extracting the class names of the ship that was hit 
      let classes = Array.from(e.target.classList) 
      classes = classes.filter(className => className !== 'block')
      classes = classes.filter(className => className !== 'boom')
      classes = classes.filter(className => className !== 'taken')

      //record the hit ship class
      playerHits.push(...classes)
     checkScore('player', playerHits, playerSunkShips)
    }
    else if (!e.target.classList.contains('taken')) {
      infoDisplay.textContent = "nothing hit this time." // if a ship wasnt hit, this message will show 
      e.target.classList.add('empty')
    }
    playerTurn = false 
    const allBoardBlocks = document.querySelectorAll('#computer div')
    allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
    setTimeout(computerGo, 3000)
  }
}

// define the computers turn 
function computerGo() {
  if (!gameOver) {
    turnDisplay.textContent = "computers turn!"
    infoDisplay.textContent = "the computer is thinking..."

    // setting some time before computer takes its turn 
    setTimeout(() => {
      let randomGo = Math.floor(Math.random() * width * width)// randomly picks within 0 - 99
      const allBoardBlocks = document.querySelectorAll('#player div') // gets/selects the player id and gets ita divs 

      if(allBoardBlocks[randomGo].classList.contains('taken') && allBoardBlocks[randomGo].classList.contains('boom') // lets it know somethings been hit which allows the computer to take another turn 
      ) {
          computerGo ()
          return
         } else if ( allBoardBlocks[randomGo].classList.contains('taken') && !allBoardBlocks[randomGo].classList.contains('boom')
         ) {
          allBoardBlocks[randomGo].classList.add('boom')
          infoDisplay.textContent = "the computer hit your ship!"
          let classes = Array.from(allBoardBlocks[randomGo].classList) 
          classes = classes.filter(className => className !== 'block')
          classes = classes.filter(className => className !== 'boom')
          classes = classes.filter(className => className !== 'taken')
          computerHits.push(...classes)
          checkScore('computer', computerHits, computerSunkShips)
         } else {
          infoDisplay.textContent = "nothing hit this time."
          allBoardBlocks[randomGo].classList.add('empty')

         }
    }, 4000)

    setTimeout(() => { // letting player know its their turn 
      playerTurn = true
      turnDisplay.textContent = "your turn"
      infoDisplay.textContent = "please take your turn"
      const allBoardBlocks = document.querySelectorAll('#computer div')
      allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
    }, 5000)
  }
}

// function to check the score of the player/computer
function checkScore(user, userHits, userSunkShips) {
// function checks which ship was hit and displays which one it was 
  function checkShip(shipName, shipLength) {
    if (
      userHits.filter(storedShipName => storedShipName === shipName).length === shipLength)
      { 
        if(user === 'player') {
          infoDisplay.textContent = `you sunk the computer's ${shipName}`
          playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
        } 
        if(user === 'computer') {
          infoDisplay.textContent = `the computer sunk your ${shipName}`
          computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
        } 
        userSunkShips.push(shipName) // adds sunk ship to the list 
      }

      
  }
  checkShip('destroyer', 2)
  checkShip('submarine', 3)
  checkShip('cruiser', 3)
  checkShip('battleship', 4)
  checkShip('carrier', 5)

console.log("computerSunkShips:", computerSunkShips);

  console.log('playerHits', playerHits)
  console.log('playerSunkShips', playerSunkShips)



  if(playerSunkShips.length === 5) {
  infoDisplay.textContent = "you sunk all the the computer's ships! YOU WON"
  gameOver = true
}

 if(computerSunkShips.length === 5) {
  infoDisplay.textContent = "The computer sunk all your ships! YOU LOST"
  gameOver = true
}


}
 

