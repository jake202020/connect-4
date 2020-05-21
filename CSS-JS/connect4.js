/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;
let p1ScoreDisplay = document.querySelector('#p1Score');
let p1Score = 0;
p1ScoreDisplay.innerText = p1Score;

let p2ScoreDisplay = document.querySelector('#p2Score');
let p2Score = 0;
p2ScoreDisplay.innerText = p2Score;

const resetBtn = document.querySelector('#reset');
resetBtn.addEventListener('click', newGame);

const newPlayersBtn = document.querySelector('#newPlayers');
newPlayersBtn.addEventListener('click', newPlayers);

//TODO: remove anchor tag from URL for page refresh
const winStylesBtn = document.getElementById('wins');
// newPlayersBtn.addEventListener('click', winStyles);

const squareCheckbox = document.getElementById('square');
const fourCornersCheckbox = document.getElementById('fourCorners');

let currPlayer; // active player: 1 or 2
let htmlBoard = []; // array of rows, each row is array of cells  (htmlBoard[y][x])

//prevent click event function if gameOver = true
let gameOver;

let alertTimer;

newGame();

function newGame() {
	currPlayer = 1;
	gameOver = false;
	squareCheckbox.disabled = false;
	fourCornersCheckbox.disabled = false;
	winStylesBtn.disabled = false;
	makeBoard();
	makeHtmlBoard();

	// hover row is color of corresponding player
	let topRow = document.getElementById('columnTop');
	topRow.classList.add(currPlayer === 1 ? 'column-top-p1' : 'column-top-p2');

	// if users prefer that the boxes become unchecked with a new game
	// if (squareCheckbox.checked) {
	// 	squareCheckbox.click();
	// }
	// if (fourCornersCheckbox.checked) {
	// 	fourCornersCheckbox.click();
	// }
}

function newPlayers() {
	currPlayer = 1;
	gameOver = false;
	squareCheckbox.disabled = false;
	fourCornersCheckbox.disabled = false;
	winStylesBtn.disabled = false;
	makeBoard();
	makeHtmlBoard();

	// hover row is color of corresponding player
	let topRow = document.getElementById('columnTop');
	topRow.classList.add(currPlayer === 1 ? 'column-top-p1' : 'column-top-p2');

	if (squareCheckbox.checked) {
		squareCheckbox.click();
	}
	if (fourCornersCheckbox.checked) {
		fourCornersCheckbox.click();
	}
	p1Score = 0;
	p1ScoreDisplay.innerText = p1Score;

	p2Score = 0;
	p2ScoreDisplay.innerText = p2Score;
}

/** makeBoard: create in-JS board structure: board = array of rows, 
 * each row is array of empty cells  (htmlBoard[y][x])*/

function makeBoard() {
	htmlBoard.push(new Array(HEIGHT));
	for (let y = 0; y < HEIGHT; y++) {
		htmlBoard[y] = new Array(WIDTH);
		htmlBoard[y].fill(null);
	}
}

/** makeHtmlBoard: make HTML table and row of column tops. */
function makeHtmlBoard() {
	// get "htmlBoard" variable from the item in HTML w/ID of "board"
	const htmlBoard = document.getElementById('board');
	htmlBoard.innerHTML = '';

	// create row on top of Html Board for clicking on
	const top = document.createElement('tr');
	top.setAttribute('id', 'columnTop');
	top.addEventListener('click', handleClick);

	// create each td for each cell in the top row
	for (let x = 0; x < WIDTH; x++) {
		const headCell = document.createElement('td');
		headCell.setAttribute('id', x);
		top.append(headCell);
	}
	htmlBoard.append(top);

	// create the appropriate number of cells based on height and width of board
	for (let y = 0; y < HEIGHT; y++) {
		const row = document.createElement('tr');
		for (let x = 0; x < WIDTH; x++) {
			const cell = document.createElement('td');
			cell.setAttribute('id', `${y}-${x}`);
			row.append(cell);
		}
		htmlBoard.append(row);
	}
}

/** findSpotForCol: given column x, return top empty y (null if filled) */
function findSpotForCol(x) {
	for (let y = HEIGHT - 1; y >= 0; y--) {
		if (!htmlBoard[y][x]) {
			return y;
		}
	}
	return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */
function placeInTable(y, x) {
	// TODO: make a div and insert into correct table cell
	const placed = document.createElement('div');
	placed.classList.add('piece');
	placed.classList.add(`p${currPlayer}`);

	//do not allow additional win styles to be selected once a piece is played
	squareCheckbox.disabled = true;
	fourCornersCheckbox.disabled = true;
	winStylesBtn.disabled = true;

	const cell = document.getElementById(`${y}-${x}`);
	cell.append(placed);
}

/** endGame: announce game end */
function endGame(msg) {
	//pop up alert message
	alert(msg);
	gameOver = true;
	clearInterval(alertTimer);

	// remove hover color on game end
	let topRow = document.getElementById('columnTop');
	topRow.classList.remove('column-top-p1', 'column-top-p2');
}

/** handleClick: handle click of column top to play piece */
function handleClick(evt) {
	if (!gameOver) {
		// get x from ID of clicked cell
		const x = evt.target.id;

		// get next spot in column (if none, ignore click)
		const y = findSpotForCol(x);
		if (y === null) {
			return;
		}

		// place piece in board and add to HTML table
		//position from htmlBoard declaration: currPlayer is there.
		htmlBoard[y][x] = currPlayer;
		placeInTable(y, x);

		// check for win
		if (checkForWin()) {
			//wait until the piece is places before alerting
			alertTimer = setInterval(endGame, 10, `Player ${currPlayer} won!`);

			//incrementing score based on win
			if (currPlayer === 1) {
				if (!p1Score) {
					p1Score = 0;
				}
				p1Score++;
				p1ScoreDisplay.innerText = p1Score;
			}
			if (currPlayer === 2) {
				if (!p2Score) {
					p2Score = 0;
				}
				p2Score++;
				p2ScoreDisplay.innerText = p2Score;
			}
		}

		// check for tie
		// check if all cells in board are filled; if so call, call endGame
		if (htmlBoard.every((row) => row.every((cell) => cell))) {
			alertTimer = setInterval(endGame, 10, 'Tie!');
		}

		// switch players using ternary function
		currPlayer = currPlayer === 1 ? 2 : 1;

		//top row hover is current player color
		let topRow = document.getElementById('columnTop');
		topRow.classList.toggle('column-top-p1');
		topRow.classList.toggle('column-top-p2');
	}
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
	function _win(cells) {
		// Check four cells to see if they're all color of current player
		//  - cells: list of four (y, x) cells
		//  - returns true if all are legal coordinates & all match currPlayer

		return cells.every(([ y, x ]) => y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH && htmlBoard[y][x] === currPlayer);
	}

	//look for wins based on piece placement first look across the rows
	for (let y = 0; y < HEIGHT; y++) {
		//also look across the columns
		for (let x = 0; x < WIDTH; x++) {
			//win types
			const horiz = [ [ y, x ], [ y, x + 1 ], [ y, x + 2 ], [ y, x + 3 ] ];
			const vert = [ [ y, x ], [ y + 1, x ], [ y + 2, x ], [ y + 3, x ] ];
			const diagDR = [ [ y, x ], [ y + 1, x + 1 ], [ y + 2, x + 2 ], [ y + 3, x + 3 ] ];
			const diagDL = [ [ y, x ], [ y + 1, x - 1 ], [ y + 2, x - 2 ], [ y + 3, x - 3 ] ];
			//only check for square if the checkbox is checked
			if (squareCheckbox.checked) {
				squareWin = [ [ y, x ], [ y - 1, x ], [ y - 1, x + 1 ], [ y, x + 1 ] ];
				if (_win(squareWin)) {
					return true;
				}
			}
			//only check for 4 corners win if checkbox is checked
			if (fourCornersCheckbox.checked) {
				fourCornsWin = [ [ 0, 0 ], [ 5, 0 ], [ 5, 6 ], [ 0, 6 ] ];
				if (_win(fourCornsWin)) {
					return true;
				}
			}

			//if any of the above aside from additional types are true, call win(true)
			if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
				return true;
			}
		}
	}
}
