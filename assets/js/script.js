// module for gameboard object with array containing cells

const gameboard = (() => {
    const board = [];
    const Cell = (marker, index) => ({ marker, index })
    for (let i = 0; i <= 8; i += 1) {
        const cell = Cell("", i);
        board.push(cell);
    }
    return { board };
})();

console.log({gameboard});

// factory for player objects

const Player = (name, marker) => {
    const getName = () => name;
    const getMarker = () => marker;
    const placeMarker = (cell) => {
        const activeCell = cell;
        activeCell.marker = marker;
    };
    console.log({gameboard});
    return { getName, getMarker, placeMarker };
};

const player1 = Player("Player1", "X");
const player2 = Player("Player2", "Y");

console.log({player1, player2})

// gameplay object

const game = (() => {
    // switch active player
    const getActivePlayer = () => player1
    // allow active player to place marker on empty cell
    let placeMarker;
    // check for gameover
    let isGameOver
    return { getActivePlayer, placeMarker, isGameOver };
})();

console.log({game}) 





// function to render gameboard object

// const boardDisplay = document.getElementById("board");
// const btn = document.createElement("button");

/* gameboard().board.forEach(element => {
    console.log(element)
}) */

// function to allow players to add markers to empty cells on gameboard

// function to check for game over
