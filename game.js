document.querySelector('#dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkmode', isDarkMode);
    // chang mobile status bar color
    document.querySelector('meta[name="theme-color"').setAttribute('content', isDarkMode ? '#1a1a2e' : '#fff');
});

//const values -----------------------------------------------------
const startScreen = document.querySelector("#start-screen");
const gameScreen = document.querySelector("#game-screen");
const pauseScreen = $("#pause-screen");

const playerName = $("#player-name");
const gameLevel = $("#level");
const gameTime = $('#game-time');

const nameInput = $("#input-name");
const cells = $('.main-grid-cell');
const inputNumbers = $('.number')



let levelIndex = 0;
let level = CONSTANT.LEVEL[levelIndex];
let timer = null;
let pause = false;
let seconds = 0;


let su = undefined;
let su_answer = undefined;

let selected_cell = -1;

function clearGame() {
    for (let i = 0; i < 81; i++) {
        cells.eq(i).html(" ");
        cells.eq(i).removeClass("filled");
        cells.eq(i).removeClass("selected")
    }
}

function initSudoku(level) {
    clearGame();
    resetHover();
    su = sudokuGen(level);
    su_answer = [...su.question];
    //console.table(su.original);
    for (let i = 0; i < 81; i++) {
        let row = Math.floor(i / 9);
        let col = i % 9;
        cells.eq(i).data('value', su.question[row][col]);
        if (su.question[row][col] != 0) {
            cells.eq(i).addClass("filled");
            cells.eq(i).html(su.question[row][col]);
        }
    }
}

//make the box 
function inHover(index) {
    let row = Math.floor(index / 9);
    let col = index % 9;

    let box_row = row - row % 3;
    let box_col = col - col % 3;

    // loop through all cells in the same box as the cell at the given index
    for (let i = box_row; i < box_row + 3; i++) {
        for (let j = box_col; j < box_col + 3; j++) {
            let cellIndex = 9 * i + j;
            if (cellIndex !== index) {
                cells.eq(cellIndex).addClass("hover");
            }
        }
    }

    // loop through all cells in the same row as the cell at the given index
    for (let j = 0; j < 9; j++) {
        let cellIndex = 9 * row + j;
        if (cellIndex !== index) {
            cells.eq(cellIndex).addClass("hover");
        }
    }

    // loop through all cells in the same column as the cell at the given index
    for (let i = 0; i < 9; i++) {
        let cellIndex = 9 * i + col;
        if (cellIndex !== index) {
            cells.eq(cellIndex).addClass("hover");
        }
    }
}

function resetHover() {
    cells.removeClass("hover");
}

function removeErrorClass() {
    cells.removeClass('err')
}
// set values ----------------------------------------------

function setPlayerName(name) {
    localStorage.setItem("playerName", name);
}

function getPlayerName() {
    localStorage.getItem("playerName");
}

//----------------------------------------------------------

//change time------------------------------------------------

function showTime(seconds) {
    return new Date(seconds * 1000).toISOString().substring(11, 19);
}
//=---------------------------------------------------------

// -----------------------------------------------------------------
function startGame() {
    $("#start-screen").removeClass("active");
    $("#game-screen").addClass("active");
    playerName.html(nameInput.val().trim());
    setPlayerName(nameInput.val().trim());
    console.log(CONSTANT.LEVEL_NAME[levelIndex]);
    gameLevel.html(CONSTANT.LEVEL_NAME[levelIndex]);
    seconds = 0;



    timer = setInterval(function () {
        if (!pause) {
            seconds = seconds + 1;
            gameTime.html(showTime(seconds));
        }
    }, 1000)

}

function saveGameInfo(){
    let game = {
        level: levelIndex,
        seconds: seconds,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer,
        }
    }
    localStorage.setItem('game', JSON.stringify(game));
}

function removeGameInfo(){
    localStorage.clear('game');
    $("#btn-continue").css('display', 'none');
}

function isWin(){
    sudokuCheck(su_answer);
}

function showResult(){
    clearInterval(timer);
    alert("win");
}

function startNewGame() {
    clearGame();
    clearInterval(timer);
    pause = false;
    seconds = 0;
    pauseScreen.removeClass("active");
    $('#game-screen').removeClass("active");
    $('#start-screen').addClass("active");
}


const initCellsEvent = () => {
    $.each(cells, (index, e) => {
        $(e).on('click', () => {
            if (!$(e).hasClass('filled')) {
                $.each(cells, (i, cell) => {
                    $(cell).removeClass('selected');
                });

                selected_cell = index;
                $(e).removeClass('err').addClass('selected');
                resetHover();
                inHover(index);
            }
        })
    })
}


function checkError(value) {
    function addErrorClass(cell) {
        if (parseInt(cell.data('value')) === value) {
            cell.addClass('err cell-err');
            setTimeout(() => {
                cell.removeClass('cell-err');
            }, 500);

        }
    }
    
    let index = selected_cell;

    let row = Math.floor(index / 9);
    let col = index % 9;

    let box_row = row - row % 3;
    let box_col = col - col % 3;

    // loop through all cells in the same box as the cell at the given index
    for (let i = box_row; i < box_row + 3; i++) {
        for (let j = box_col; j < box_col + 3; j++) {
            let cellIndex = 9 * i + j;
            if (cellIndex !== index) {
                addErrorClass(cells.eq(cellIndex));
            }
        }
    }

    // loop through all cells in the same row as the cell at the given index
    for (let j = 0; j < 9; j++) {
        let cellIndex = 9 * row + j;
        if (cellIndex !== index) {
            addErrorClass(cells.eq(cellIndex));
        }
    }

    // loop through all cells in the same column as the cell at the given index
    for (let i = 0; i < 9; i++) {
        let cellIndex = 9 * i + col;
        if (cellIndex !== index) {
            addErrorClass(cells.eq(cellIndex));
        }
    }

}


function onInputEvent(){
    $.each(inputNumbers,function(index,element){
        $(element).on('click',function(){
            if(!cells.eq(selected_cell).hasClass('filled')){
                cells.eq(selected_cell).html(index+1);
                cells.eq(selected_cell).data('value',index+1);

                let row = Math.floor(selected_cell/9);
                let col = selected_cell% 9;
                su_answer[row][col] = index + 1;

                removeErrorClass();
                checkError(index+1);
                cells.eq(selected_cell).addClass("zoom-in");
                setTimeout(function(){
                    cells.eq(selected_cell).removeClass('zoom-in');
                },500);

                if(isWin()){
                    removeGameInfo();
                    showResult();
                }
            }
        })
    })
}


$("#btn-level").on('click', function () {
    levelIndex = levelIndex + 1 > CONSTANT.LEVEL.length - 1 ? 0 : levelIndex + 1;
    level = CONSTANT.LEVEL_NAME[levelIndex];
    $(this).text(CONSTANT.LEVEL_NAME[levelIndex]);
});
// play button click value ->--------------------------

$('#delete-btn').on('click' ,function(){
    cells.eq(selected_cell).html(" ");
    cells.eq(selected_cell).data('value',0);

    let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
    let col = selected_cell % CONSTANT.GRID_SIZE;

    su_answer[row][col] = 0;

    removeErrorClass();
})
$("#btn-play").on("click", function () {
    if (nameInput.val().trim().length > 0) {
        startGame();
        initSudoku(CONSTANT.LEVEL[levelIndex]);
    }
    else {
        nameInput.addClass('input-error');
        setTimeout(function () {
            nameInput.removeClass('input-error');
            nameInput.focus();
        }, 500);
    }
});

$('#pause-btn').on('click', function () {
    $("#game-screen").removeClass("active");
    pauseScreen.addClass('active');
    pause = true;
});

$('#resume-btn').on('click', function () {
    pauseScreen.removeClass('active');
    $("#game-screen").addClass('active');
    pause = false;
})

$('#newGame-btn').on("click", function () {
    startNewGame();
})
// Grid spacing ---------------------------------------------
const getGameInfo = () => JSON.parse(localStorage.getItem('game'));
const initGameGrid = () => {
    let index = 0;

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        if (row === 2 || row === 5) cells.eq(index).css("margin-bottom", "10px");
        if (col === 2 || col === 5) cells.eq(index).css("margin-right", "10px");

        index++;
    }
}
//-------------------------------------------------------------------

//Start Game -------------------------------------------------------
const init = () => {
    const darkmode = JSON.parse(localStorage.getItem('darkmode'));
    document.body.classList.toggle(darkmode ? 'dark' : 'light');
    document.querySelector('meta[name="theme-color"').setAttribute('content', darkmode ? '#1a1a2e' : '#fff');
    const game = getGameInfo();
    $("#btn-continue").css("display", game ? 'grid' : 'none');
    initGameGrid();
    onInputEvent();
    initCellsEvent();
    
}
//------------------------------------------------------------------
init();


