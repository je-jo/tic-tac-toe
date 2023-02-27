// module for gameboard object with array containing cells

const gameBoard = (() => {
    const board = [];
    const Cell = (marker, index) => ({ marker, index });
    for (let i = 0; i <= 8; i += 1) { // eslint no-plus-plus
        const cell = Cell("", i);
        board.push(cell);
    }
    const clearBoard = () => {
        board.forEach((cell) => {
            const clearedCell = cell; // eslint no-param-reasign
            clearedCell.marker = "";
        });
    };
    return { board, clearBoard };
})();

// player objects factory

const players = [];
const Player = (name, marker, color) => {
    const getName = () => name;
    const getMarker = () => marker;
    const getColor = () => color;
    return { getName, getMarker, getColor };
};
const player1 = Player("Player 1", "X", "hsl(331, 74%, 67%)");
const player2 = Player("Player 2", "O", "hsl(195, 95%, 48%)");
players.push(player1, player2);

// gameplay object

const game = (() => {
    // switch active player
    let activePlayer = players[1];
    const switchActivePlayer = () => {
        activePlayer = activePlayer === players[1] ? players[0] : players[1];
        return activePlayer;
    };

    // allow player to place marker on empty cell
    const placeMarker = (cell, player) => {
        const activeCell = cell;
        if (!activeCell.marker) { // check if cell is empty
            activeCell.marker = player.getMarker();
        }
    };
    // check for gameover

    // 1. define winning combinations (index of cells)
    const winCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    // 2. transform indexes to placed markers
    const potentialWins = () => winCombos.map((arr) => arr.map((index) => gameBoard.board[index].marker));
    // 3. Define winning conditions
    // 3a. Write a function to return a winning array index - where all cells in array are marked, and all are equal
    const isThreeInARowIndex = () => potentialWins().findIndex((arr) => arr.every((elem) => (elem) && (elem === arr[0])));
    // 3b. If there's no winning array, check if all cells are full - a tie
    const isBoardFull = () => gameBoard.board.every((elem) => elem.marker);
    // 4. On every cell click, run a function to check if any of the winning conditions are true
    const isGameOver = () => {
        if (isThreeInARowIndex() !== -1) {
            // 5. If there is a winning array, extract the following from it:
            // 5a. the winning marker to get to the winning player
            const winningMarker = potentialWins()[isThreeInARowIndex()][0];
            // 5b. the winning player
            const winner = players.find(player => player.getMarker() === winningMarker);
            // 5c. and the indexes of winning cells for styling
            /* const winningArray = winCombos[isThreeInARowIndex()];
            console.log(winningArray) */
            // 6. clear the game board and return winning message
            gameBoard.clearBoard();
            return `${winner.getName()} Won!`
        } if (isBoardFull()) {
            gameBoard.clearBoard();
            return "It's a tie!"
        }
        return false
    };
    return { switchActivePlayer, placeMarker, isGameOver };
})();

// module for display controller with function to render gameboard object

const displayController = (() => {

    const boardDisplay = document.getElementById("board");
    const clearBoardDisplay = () => {
        while (boardDisplay.firstChild) {
            boardDisplay.removeChild(boardDisplay.lastChild);
        }
    }

    const displayEndGameDialog = document.getElementById("endgame");
    const closeMessage = document.getElementById("endgame-message");
    const closeBtn = document.getElementById("btn-close");

    closeBtn.addEventListener("click", () => {
        displayEndGameDialog.close();
    });
    

    const renderBoard = () => {
        for (let i = 0; i <= 8; i += 1) {
            const btn = document.createElement("button");
            btn.textContent = "\u200B"; // to preserve height when there's no marker.
            boardDisplay.appendChild(btn);
        }
        const allButtons = [...boardDisplay.querySelectorAll("button")];

        function handleClick(e) {
            const activeIndex = allButtons.indexOf(e.currentTarget);
            const activePlayer = game.switchActivePlayer();
            game.placeMarker(gameBoard.board[activeIndex], activePlayer);
            e.currentTarget.style.color = activePlayer.getColor();
            e.currentTarget.textContent = activePlayer.getMarker();
            const gameOverMessage = game.isGameOver();
            if (gameOverMessage) {
                closeMessage.textContent = gameOverMessage;
                displayEndGameDialog.showModal();
            }
        }

        allButtons.forEach((btn) =>
            btn.addEventListener("click", handleClick, { once: true })
        );
    };

    displayEndGameDialog.addEventListener("close", () => {
        clearBoardDisplay();
        renderBoard();
    });

    return { renderBoard };
})();

displayController.renderBoard();

/* const btnStart = document.getElementById("start");
btnStart.addEventListener("click", displayController.renderBoard); */
