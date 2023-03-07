// A. MODULE FOR GAMEBOARD OBJECT WITH ARRAY CONTAINING CELLS

const gameBoard = (() => {
    const board = [];
    const Cell = (marker, index) => ({ marker, index });
    const numCols = 3;
    for (let i = 0; i <= ((numCols ** 2) - 1); i += 1) {
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

// B. PLAYER OBJECTS FACTORY

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

// C. GAMEPLAY OBJECT

const game = (() => {

    // ========= CHECK FOR GAMEOVER ============ //

    let endGameMessage;
    let winningArray;
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
    // 4. A function to check if any of the winning conditions are true, if true, change value of endgamemessage and winningarray
    const isGameOver = () => {
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
        else if (isBoardFull()) {
            endGameMessage = `It's a tie!`;
            winningArray = false;
        } else {
            endGameMessage = false;
            winningArray = false;
        }
    };

    const getEndGameMessage = () => endGameMessage
    const getWinningArray = () => winningArray

    // ============== HANDLE RANDOM PLAY =============== //

    let randomIndex;

    // return random index of a free cell
    const getRandomCell = () => {
        const emptyCells = gameBoard.board.filter((cell) => cell.marker === "");
        const randomFromEmptyCells = Math.floor(Math.random() * emptyCells.length);
        const random = emptyCells[randomFromEmptyCells].index;
        return random;
    }

    // =============== HANDLE ACTIVE PLAYER ============ //


    const switchActivePlayer = (active) =>
        active === players[0] ? players[1] : players[0];

    let globalActivePlayer = player1; // because each round starts with a player that didn't start the last round, regardless of who had the last move.
    let activePlayer = globalActivePlayer;

    // ================ START ROUND ==================== //
    
    const startNewRound = () => {
        gameBoard.clearBoard();
        randomIndex = null;
        globalActivePlayer = switchActivePlayer(globalActivePlayer);
        activePlayer = globalActivePlayer;
        if (activePlayer.getType() === "random") {
            randomIndex = getRandomCell();
            activePlayer.placeMarker(randomIndex);
            activePlayer = switchActivePlayer(activePlayer);
        }
    }

    // ================ HANDLE PLAYERS' MOVES ================ //

    const makeRandomMove = (player, index) => {
        player.placeMarker(index);
        activePlayer = switchActivePlayer(activePlayer);
        isGameOver();
        if (getEndGameMessage()) {
            startNewRound();
        }
    }

    const makeMove = (player, index) => {
        player.placeMarker(index);
        activePlayer = switchActivePlayer(activePlayer);
        isGameOver();
        if (getEndGameMessage()) {
            startNewRound();
        }
        // if new active player is random, play random cell
        else if (activePlayer.getType() === "random") {
            randomIndex = getRandomCell();
            makeRandomMove(activePlayer, randomIndex);
        }
    }

    // RETURN VALUES FOR DOM MANIPULATION

    const getActivePlayer = () => activePlayer;
    const getRandomIndex = () => randomIndex;


    return {
        getEndGameMessage,
        getWinningArray,
        getRandomIndex,
        getActivePlayer, 
        makeMove
    };
})();

// D. MODULE FOR DISPLAY CONTROLLER WITH FUNCTION TO RENDER GAMEBOARD OBJECT

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
        const updateTextActive = () => {
            textWaiting.textContent = `Waiting for ${game.getActivePlayer().getName()}'s move...`
        }

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
            // 6a. display first player
            updateTextActive();
            // 6b. remove cells from previous game
            while (boardDisplay.firstChild) {
                boardDisplay.removeChild(boardDisplay.lastChild);
            }
            // 6c. create 9 new  cells
            for (let i = 0; i <= gameBoard.board.length - 1; i += 1) {
                const btn = document.createElement("button");
                btn.classList.add("h1", "cell");
                btn.textContent = "\u200B"; // to preserve height when there's no marker.
                boardDisplay.appendChild(btn);
            }
            const allButtons = [...boardDisplay.querySelectorAll("button")];
            // 6d. create function to update cell visually
            const updateCell = (player, index) => {
                const activeCell = allButtons[index];
                activeCell.textContent = player.getMarker();
                activeCell.classList.add(player.getColor());
            };
            // 6e. if first player is random update randomly played cell
            if (game.getRandomIndex()) {
                const randomIndex = game.getRandomIndex();
                setTimeout(() => updateCell(player2, randomIndex), 400);
            }
            // 6f. function to update board on end game
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
                setTimeout(() => displayDialogEndGame.showModal(), 600)
                ;
            };
            // 6g. function to get index to play and update cell
            const handleClick = (e) => {
                const index = allButtons.indexOf(e.currentTarget);
                const activePlayer = game.getActivePlayer();
                game.makeMove(activePlayer, index); // call main function
                updateCell(activePlayer, index);
                updateTextActive();
                if (game.getEndGameMessage()) {
                    updateBoard(game.getEndGameMessage(), game.getWinningArray())
                } else if (game.getRandomIndex()) {
                    const random = game.getRandomIndex();
                    allButtons[random].removeEventListener("click", handleClick);
                    setTimeout(() => updateCell(player2, random), 400)
                    if (game.getEndGameMessage()) {
                        updateBoard(game.getEndGameMessage(), game.getWinningArray())
                    }
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
