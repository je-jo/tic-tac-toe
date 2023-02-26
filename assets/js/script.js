// module for gameboard object with array containing cells

const gameBoard = (() => {
    const board = [];
    const Cell = (marker, index) => ({ marker, index });
    for (let i = 0; i <= 8; i += 1) {
        // eslint no-plus-plus
        const cell = Cell("", i);
        board.push(cell);
    }
    const clearMarkers = () => {
        board.forEach((cell) => {
            const clearedCell = cell; // eslint no-param-reasign
            clearedCell.marker = "";
        });
    };
    return { board, clearMarkers };
})();

// player objects factory

const players = [];
const Player = (name, marker, color) => {
    const getName = () => name;
    const getMarker = () => marker;
    const getColor = () => color;
    return { getName, getMarker, getColor };
};
const player1 = Player("Player 1", "X", "hotpink");
const player2 = Player("Player 2", "O", "blue");
players.push(player1, player2);

// gameplay object

const game = (() => {
    let activePlayer = players[1];
    // switch active player
    const switchActivePlayer = () => {
        activePlayer = activePlayer === players[1] ? players[0] : players[1];
        return activePlayer;
    };
    // allow active player to place marker on empty cell
    const placeMarker = (cell, player) => {
        // console.log(`${player.getName()}'s turn...`);
        const activeCell = cell;
        // check if cell is empty
        activeCell.marker = player.getMarker();
        /* console.log(
                `${player.getName()} is putting their marker ${player.getMarker()} on cell ${activeCell.index
                }.`
            );
            console.table(gameBoard.board); */
    };
    const endGame = () => {
        gameBoard.clearMarkers();
    };
    // check for gameover
    const isGameOver = () => {
        const winCombos = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        const potentialWins = winCombos.map((arr) =>
            arr.map((elem) => gameBoard.board[elem].marker)
        );

        const winCondition = potentialWins.some((arr) =>
            arr.every((elem) => elem === "X" || elem === "O")
        );
        if (winCondition) {
            alert(`somebody won`);
            endGame();
            return "won";
        }
        if (gameBoard.board.every((elem) => elem.marker)) {
            return "tie";
        }
    };
    return { switchActivePlayer, placeMarker, isGameOver };
})();

// function to render gameboard object

const displayController = (() => {
    const boardDisplay = document.getElementById("board");
    const displayEndGameDialog = document.getElementById("endgame");
    const closeBtn = document.getElementById("btn-close");
    closeBtn.addEventListener("click", () => {
        displayEndGameDialog.close();
    });

    displayEndGameDialog.addEventListener("close", () => {
        boardDisplay.textContent = "";
    });
    const renderBoard = () => {
        for (let i = 0; i <= 8; i += 1) {
            const btn = document.createElement("button");
            boardDisplay.appendChild(btn);
        }
        const allButtons = [...boardDisplay.querySelectorAll("button")];

        function handleClick(e) {
            const activeIndex = allButtons.indexOf(e.currentTarget);
            const activePlayer = game.switchActivePlayer();
            game.placeMarker(gameBoard.board[activeIndex], activePlayer);
            e.currentTarget.style.color = activePlayer.getColor();
            e.currentTarget.textContent = activePlayer.getMarker();
            if (game.isGameOver() === "tie") {
                displayEndGameDialog.showModal();
            }
        }

        allButtons.forEach((btn) =>
            btn.addEventListener("click", handleClick, { once: true })
        );
    };

    return { renderBoard };
})();

const btnStart = document.getElementById("start");
btnStart.addEventListener("click", displayController.renderBoard);
