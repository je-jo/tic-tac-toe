// module for gameboard object with array containing cells

const gameBoard = (() => {
    const board = [];
    const Cell = (marker, index) => ({ marker, index });
    for (let i = 0; i <= 8; i += 1) {
        const cell = Cell("", i);
        board.push(cell);
    }
    const clearBoard = () => {
        board.forEach((cell) => {
            const clearedCell = cell; // because of eslint no-param-reasign
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
    let type = "human";
    const getType = () => type;
    const addPoint = () => {
        score += 1;
    };
    const setName = (value) => {
        if (value) { // if empty leave default
            // eslint-disable-next-line no-param-reassign
            name = value;
        }
        return name;
    };
    const setType = (value) => {
        type = value;
    };

    return {
        getName,
        getMarker,
        getColor,
        getScore,
        getType,
        addPoint,
        setName,
        setType,
    };
};
const player1 = Player("Player 1", "X", "color-x");
const player2 = Player("Player 2", "O", "color-o");
players.push(player1, player2);

// gameplay object

const game = (() => {
    // switch active player
    let activePlayer = players[1];
    const switchActivePlayer = () => {
        activePlayer = activePlayer === players[1] ? players[0] : players[1];
        return activePlayer;
    };

    // allow player to place marker on cell
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
        let endGameMessage;
        let winningArray;
        if (isThreeInARowIndex() !== -1) {
            const winningIndex = isThreeInARowIndex();
            // 5. If there is a winning array, extract the following from it:
            // 5a. the winning marker to get to the winning player
            const winningMarker = potentialWins()[winningIndex][0];
            // 5b. the winning player
            const winner = players.find(
                (player) => player.getMarker() === winningMarker
            );
            // 5c. increase winners score
            winner.addPoint();
            // 5d. and the indexes of winning cells for styling
            winningArray = winCombos[winningIndex];
            // 6. clear the game board and set winning message
            gameBoard.clearBoard();
            endGameMessage = `${winner.getName()} Won!`;

        }
        if (isBoardFull()) {
            gameBoard.clearBoard();
            endGameMessage = `It's a tie!`;
        }
        return { endGameMessage, winningArray };
    };
    return { switchActivePlayer, placeMarker, isGameOver };
})();

// module for display controller with function to render gameboard object

const displayController = (() => {
    // main display variables
    const startPage = document.getElementById("start-page");
    const gamePage = document.getElementById("game-page");
    const displayDialogEndGame = document.getElementById("dialog-end-game");
    const textDialogEndGame = document.getElementById("text-end-game");
    const btnDialogClose = document.getElementById("btn-end-game");
    btnDialogClose.addEventListener("click", () => {
        displayDialogEndGame.close();
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
        const namesDisplay = [
            ...gameDisplay.querySelectorAll(".display-player-name"),
        ];
        namesDisplay.forEach((name, index) => {
            const displayName = name;
            displayName.textContent = players[index].getName();
            if (players[index].getType() === "random") {
                displayName.textContent += "(AI)";
            }
        });
        // 4. display whose turn it is
        const textWaiting = gameDisplay.getElementById("text-waiting");
        textWaiting.textContent = `Waiting for ${players[0].getName()}'s move...`;
        // 5. Display score and update after every game over
        const displayScores = [...gameDisplay.querySelectorAll(".display-score")];
        const updateDisplayScores = () => {
            displayScores.forEach((score, index) => {
                const displayScore = score;
                displayScore.textContent = players[index].getScore();
            });
        };
        updateDisplayScores();
        // 6. manipulate board display
        const boardDisplay = gameDisplay.getElementById("board");
        const renderBoard = () => {
            // 6a. make waiting message visible again
            textWaiting.style.visibility = "visible";
            // 6b. remove cells from previous game
            while (boardDisplay.firstChild) {
                boardDisplay.removeChild(boardDisplay.lastChild);
            }
            // 6c. create 9 cells
            for (let i = 0; i <= 8; i += 1) {
                const btn = document.createElement("button");
                btn.classList.add("h1", "cell");
                btn.textContent = "\u200B"; // to preserve height when there's no marker.
                boardDisplay.appendChild(btn);
            }
            const allButtons = [...boardDisplay.querySelectorAll("button")];
            // 6d. create function to update cell visually
            const updateCell = (index, player) => {
                const activeCell = allButtons[index];
                activeCell.classList.add(player.getColor());
                activeCell.textContent = player.getMarker();
            };
            // 6e. create function to update board on end game
            const updateBoard = (text, winnerArr) => {
                    if (winnerArr) {
                        const winnerButtons = allButtons.filter((_btn, index) => winnerArr.includes(index));
                        winnerButtons.forEach(btn => {
                            btn.classList.add("winning-array")
                        })
                    }
                    textWaiting.style.visibility = "hidden";
                    updateDisplayScores();
                    textDialogEndGame.textContent = text;
                    displayDialogEndGame.showModal();
                
            }
            // 6f. create function to place marker on board and check for gameover
            const handleClick = (e) => {
                const activeIndex = allButtons.indexOf(e.currentTarget);
                const activePlayer = game.switchActivePlayer();
                const waitForClick = players.find(
                    (player) => player.getName() !== activePlayer.getName()
                );
                textWaiting.textContent = `Waiting for ${waitForClick.getName()}'s move...`;
                game.placeMarker(gameBoard.board[activeIndex], activePlayer);
                updateCell(activeIndex, activePlayer);
                const isGameOver = game.isGameOver();
                const displayEndGameMessage = isGameOver.endGameMessage;
                const displayWinningArray = isGameOver.winningArray;
                if (displayEndGameMessage) {
                    updateBoard(displayEndGameMessage, displayWinningArray);
                }
            };
            // 6g. add single use event listener for each cell
            allButtons.forEach((btn) =>
                btn.addEventListener("click", handleClick, { once: true })
            );
        };
        // 7. reset the game display when closing endgame modal
        displayDialogEndGame.addEventListener("close", renderBoard);
        gamePage.appendChild(gameDisplay);
        renderBoard();
    };

    const renderStartPage = () => {
        const templateStart = document.getElementById("template-start-page");
        const startDisplay = templateStart.content.cloneNode(true);

        const form = startDisplay.getElementById("form-input-names");
        const nameInputs = [...form.querySelectorAll("input[type='text']")];
        const typeInputs = [...form.querySelectorAll("input[type='radio']")];
        form.addEventListener(
            "submit",
            (e) => {
                nameInputs.forEach((input, index) => {
                    players[index].setName(input.value);
                });
                let opponentType;
                typeInputs.forEach((radio) => {
                    if (radio.checked) {
                        opponentType = radio.value;
                    }
                });
                players[1].setType(opponentType);
                renderGamePage();
                e.preventDefault();
            },
            { once: true }
        );

        startPage.appendChild(startDisplay);
    };

    return { renderStartPage };
})();

displayController.renderStartPage();
