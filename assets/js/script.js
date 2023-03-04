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
        if (value) {
            // if empty leave default
            // eslint-disable-next-line no-param-reassign
            name = value;
        }
        return name;
    };
    const setType = (value) => {
        type = value;
    };
    const placeMarker = (index) => {
        const activeCell = gameBoard.board[index];
        if (!activeCell.marker) {
            activeCell.marker = marker;
        }
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
        placeMarker,
    };
};
const player1 = Player("Player 1", "X", "color-x");
const player2 = Player("Player 2", "O", "color-o");
players.push(player1, player2);

// gameplay object

const game = (() => {


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
    // 4. A function to check if any of the winning conditions are true, if true return end game message and winning array
    const isGameOver = () => {
        let endGameMessage = false;
        let winningArray = false;
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
            endGameMessage = `${winner.getName()} Won!`;
        }
        if (isBoardFull()) {

            endGameMessage = `It's a tie!`;
        }
        return { endGameMessage, winningArray };
    };





    // switch active player
    const switchActivePlayer = (active) =>
        active === players[0] ? players[1] : players[0];

    let globalActivePlayer = player1;
    let activePlayer = globalActivePlayer;


    const startNewRound = () => {
        gameBoard.clearBoard();
        globalActivePlayer = switchActivePlayer(globalActivePlayer);
        activePlayer = globalActivePlayer;
    }

    // play random free cell and return index for styling
    const getRandomCell = () => {
        const emptyCells = gameBoard.board.filter((cell) => cell.marker === "");
        const randomFromEmptyCells = Math.floor(Math.random() * emptyCells.length);
        const randomIndex = emptyCells[randomFromEmptyCells].index;
        return randomIndex;
    };

    const makeMove = (player, index) => {
        player.placeMarker(index);
        const checkEndGameObject = isGameOver();
        const { endGameMessage } = checkEndGameObject;
        const { winningArray } = checkEndGameObject;
        if (endGameMessage) {
            startNewRound();
        } else {
            activePlayer = switchActivePlayer(player);
        }
        // if new active player is random, play random cell
        let randomIndex;
        if (activePlayer.getType() === "random") {
            randomIndex = getRandomCell();
            makeMove(player2, randomIndex);
        }
        console.table(gameBoard.board)
        return { endGameMessage, winningArray, randomIndex }
    }

    const getActivePlayer = () => activePlayer;


    return {
        switchActivePlayer,
        isGameOver,
        getRandomCell,
        startNewRound,
        makeMove,
        getActivePlayer
    };
})();

// module for display controller with function to render gameboard object

const displayController = (() => {
    // main display variables
    const startPage = document.getElementById("start-page");
    const gamePage = document.getElementById("game-page");

    const renderGamePage = () => {

        const header = document.querySelector("h1");
        const displayDialogEndGame = document.getElementById("dialog-end-game");
        const textDialogEndGame = document.getElementById("text-end-game");
        const btnDialogClose = document.getElementById("btn-end-game");
        btnDialogClose.addEventListener("click", () => {
            displayDialogEndGame.close();
        });
        // 1. remove content from start "page" and hide header
        while (startPage.firstChild) {
            startPage.removeChild(startPage.lastChild);
        }
        header.classList.add("sr-only");
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
        // 4. display currently active player
        const textWaiting = gameDisplay.getElementById("text-waiting");
        textWaiting.textContent = `Waiting for ${game.getActivePlayer().getName()}'s move...`
        // 5. Display score and update after every game over
        const displayScores = [...gameDisplay.querySelectorAll(".display-score")];
        const updateDisplayScores = () => {
            displayScores.forEach((score, index) => {
                const displayScore = score;
                displayScore.textContent = players[index].getScore();
            });
        };
        updateDisplayScores(); // invoke on first render to display initial zeros
        // 6. manipulate board display
        const boardDisplay = gameDisplay.getElementById("board");
        const renderBoard = () => {
            // 6b. display who is first to play
            // 6c. remove cells from previous game
            while (boardDisplay.firstChild) {
                boardDisplay.removeChild(boardDisplay.lastChild);
            }
            // 6d. create 9 new  cells
            for (let i = 0; i <= 8; i += 1) {
                const btn = document.createElement("button");
                btn.classList.add("h1", "cell");
                btn.textContent = "\u200B"; // to preserve height when there's no marker.
                boardDisplay.appendChild(btn);
            }
            const allButtons = [...boardDisplay.querySelectorAll("button")];
            // 6e. create function to update cell visually
            const updateCell = (player, index) => {
                const activeCell = allButtons[index];
                activeCell.classList.add(player.getColor());
                activeCell.textContent = player.getMarker();
            };
            // 6f. create function to update board on end game
            const updateBoard = (text, winnerArr) => {
                if (winnerArr) {
                    const winnerButtons = allButtons.filter((_btn, index) =>
                        winnerArr.includes(index)
                    );
                    winnerButtons.forEach((btn) => {
                        btn.classList.add("winning-array");
                    });
                }
                textWaiting.textContent = "\u200B"; // hide whose turn it is because game is over
                updateDisplayScores();
                textDialogEndGame.textContent = text;
                displayDialogEndGame.showModal();
            };
            // 6g. create function to place marker on board and check for gameover
            const handleClick = (e) => {
                const index = allButtons.indexOf(e.currentTarget);
                const activePlayer = game.getActivePlayer();
                const makeMove = game.makeMove(activePlayer, index);
                updateCell(activePlayer, index);
                textWaiting.textContent = `Waiting for ${game.getActivePlayer().getName()}'s move...`
                if (makeMove.endGameMessage) {
                    const { endGameMessage } = makeMove;
                    const { winningArray } = makeMove;
                    updateBoard(endGameMessage, winningArray);
                } else if (makeMove.randomIndex) {
                    const makeRandomMove = game.makeMove(player2, makeMove.randomIndex);
                    setTimeout(() => updateCell(player2, makeMove.randomIndex), 500);
                    console.log(makeRandomMove.endGameMessage);
                    console.log(makeRandomMove.winningArray)
                    
                }
                
            }
            // 6h. add single use event listener for each cell
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
