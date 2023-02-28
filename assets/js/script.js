// module for gameboard object with array containing cells

const gameBoard = (() => {
    const board = [];
    const Cell = (marker, index) => ({ marker, index });
    for (let i = 0; i <= 8; i += 1) {
        // eslint no-plus-plus
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
    let score = 0;
    const getScore = () => score;
    const addPoint = () => {
        // eslint-disable-next-line no-param-reassign
        score += 1;
    };
    const setName = (value) => {
        if (value) { // if empty leave default
            // eslint-disable-next-line no-param-reassign
            name = value;
        }
        return name;
    };
   
    return { getName, getMarker, getColor, getScore, addPoint, setName };
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
        if (!activeCell.marker) {
            // check if cell is empty
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
    const potentialWins = () =>
        winCombos.map((arr) => arr.map((index) => gameBoard.board[index].marker));
    // 3. Define winning conditions
    // 3a. Write a function to return a winning array index - where all cells in array are marked, and all are equal
    const isThreeInARowIndex = () =>
        potentialWins().findIndex((arr) =>
            arr.every((elem) => elem && elem === arr[0])
        );
    // 3b. If there's no winning array, check if all cells are full - a tie
    const isBoardFull = () => gameBoard.board.every((elem) => elem.marker);
    // 4. On every cell click, run a function to check if any of the winning conditions are true
    const isGameOver = () => {
        if (isThreeInARowIndex() !== -1) {
            // 5. If there is a winning array, extract the following from it:
            // 5a. the winning marker to get to the winning player
            const winningMarker = potentialWins()[isThreeInARowIndex()][0];
            // 5b. the winning player
            const winner = players.find(
                (player) => player.getMarker() === winningMarker
            );
            // 5c. increase winners score
            winner.addPoint();
            // 5d. and the indexes of winning cells for styling
            /* const winningArray = winCombos[isThreeInARowIndex()];
                  console.log(winningArray) */
            // 6. clear the game board and return winning message
            gameBoard.clearBoard();
            return `${winner.getName()} Won!`;
        }
        if (isBoardFull()) {
            gameBoard.clearBoard();
            return "It's a tie!";
        }
        return false;
    };
    return { switchActivePlayer, placeMarker, isGameOver };
})();


// module for display controller with function to render gameboard object

// eslint-disable-next-line no-unused-vars
const displayController = (() => {
    // main display variables
    const startPage = document.getElementById("start-page");
    const gamePage = document.getElementById("game-page");
    const displayEndGameDialog = document.getElementById("endgame");
    const closeMessage = document.getElementById("endgame-message");
    const closeBtn = document.getElementById("btn-close");
    closeBtn.addEventListener("click", () => {
        displayEndGameDialog.close();
    });


    const renderGamePage = () => {
        // 1. remove content from start "page"
        while (startPage.firstChild) {
            startPage.removeChild(startPage.lastChild);
        }
        // 2. create game "page" from template
        const templateGame = document.getElementById("template-game-page");
        const gameDisplay = templateGame.content.cloneNode(true);
        // 3. Display player names in top banner
        const namesDisplay = [...gameDisplay.querySelectorAll("h2")];
        namesDisplay.forEach((name, index) => {
            const displayName = name;
            displayName.textContent = players[index].getName();
        });
        // 4. display whose turn it is
        const turnDisplay = gameDisplay.getElementById("text-turn");
        turnDisplay.textContent = `It's ${players[0].getName()}'s turn...`;
        // 5. Display score and update after every game over
        const displayScoreNames = [
            ...gameDisplay.querySelectorAll(".display-score-names"),
        ];
        displayScoreNames.forEach((name, index) => {
            const displayName = name;
            displayName.textContent = `${players[index].getName()}'s score: `;
        });
        const displayScores = [...gameDisplay.querySelectorAll(".display-score")];
        const updateDisplayScores = () => {
            displayScores.forEach((score, index) => {
                const displayScore = score;
                displayScore.textContent = players[index].getScore();
            });
        }
        updateDisplayScores();
        // 6. manipulate board display
        const boardDisplay = gameDisplay.getElementById("board");
        const renderBoard = () => {
            // 6a. remove cells from previous game
            while (boardDisplay.firstChild) {
                boardDisplay.removeChild(boardDisplay.lastChild);
            }
            // 6b. create 9 cells
            for (let i = 0; i <= 8; i += 1) {
                const btn = document.createElement("button");
                btn.textContent = "\u200B"; // to preserve height when there's no marker.
                boardDisplay.appendChild(btn);
            }
            const allButtons = [...boardDisplay.querySelectorAll("button")];
            // 6c. create function to place marker on board and check for gameover
            function handleClick(e) {
                const activeIndex = allButtons.indexOf(e.currentTarget);
                const activePlayer = game.switchActivePlayer();
                const waitForClick = players.filter(player => player.getName() !== activePlayer.getName());
                turnDisplay.textContent = `It's ${waitForClick[0].getName()}'s turn...`;
                game.placeMarker(gameBoard.board[activeIndex], activePlayer);
                e.currentTarget.style.color = activePlayer.getColor();
                e.currentTarget.textContent = activePlayer.getMarker();
                const gameOverMessage = game.isGameOver();
                if (gameOverMessage) {
                    turnDisplay.textContent = "\u200B";
                    updateDisplayScores();
                    closeMessage.textContent = gameOverMessage;
                    displayEndGameDialog.showModal();
                }
            }
            // 6d. add single use event listener for each cell
            allButtons.forEach((btn) =>
                btn.addEventListener("click", handleClick, { once: true })
            );
        };
        // 7. reset the game display when closing endgame modal
        displayEndGameDialog.addEventListener("close", renderBoard);

        gamePage.appendChild(gameDisplay);
        renderBoard();
    };

    const renderStartPage = () => {
        const templateInput = document.getElementById("template-input");
        const inputContainer = document.getElementById("wrapper-input");
        // create name inputs for players
        players.forEach((player) => {
            const input = templateInput.content.cloneNode(true);
            // cloneNode references a doc fragment and not a regular node, child of a doc fragment is a regular node
            const labelReference = input.children[0];
            const labelText = labelReference.children[0];
            const inputReference = labelReference.children[1];
            // set matching ids and fors for input and label
            inputReference.setAttribute(
                "id",
                `input-name-player-${player.getMarker()}`
            );
            labelReference.setAttribute("for", inputReference.getAttribute("id"));
            inputReference.value = player.getName();
            // label text is a span inside label, so changing text content doesn't overwrite input field
            labelText.textContent = `${player.getName()} name: `;
            const changeName = (e) => {
                player.setName(e.currentTarget.value);
            };
            inputReference.addEventListener("input", changeName);
            inputContainer.appendChild(input);
        });
        const btnStart = document.createElement("button");
        btnStart.textContent = "Start game";
        inputContainer.appendChild(btnStart);
        btnStart.addEventListener("click", renderGamePage, { once: true });
    };

    renderStartPage();
})();
