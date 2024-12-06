const gridSize = 10;
const gridElement = document.getElementById('grid');
const wordsListElement = document.getElementById('words');
const levelMessageElement = document.getElementById('level-message');
const nextLevelButton = document.getElementById('next-level');

const levelWords = [
    ['CAT'],
    ['DOG', 'FISH'],
    ['APPLE', 'MANGO', 'PEAR'],
    ['GIRAFFE', 'TIGER', 'ELEPHANT'],
];

let currentLevel = 0;
let wordsToFind = levelWords[currentLevel];
let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));

// Function to generate the grid and place words
function generateGrid() {
    gridElement.innerHTML = '';

    wordsToFind.forEach(word => {
        let direction;
        let startX, startY, fits = false;

        while (!fits) {
            direction = Math.floor(Math.random() * 3); // 0 = horizontal, 1 = vertical, 2 = diagonal
            startX = Math.floor(Math.random() * gridSize);
            startY = Math.floor(Math.random() * gridSize);
            fits = true;

            for (let i = 0; i < word.length; i++) {
                const x = startX + (direction === 0 ? i : direction === 2 ? i : 0);
                const y = startY + (direction === 1 ? i : direction === 2 ? i : 0);

                if (x >= gridSize || y >= gridSize || (grid[y][x] !== '' && grid[y][x] !== word[i])) {
                    fits = false;
                    break;
                }
            }
        }

        for (let i = 0; i < word.length; i++) {
            const x = startX + (direction === 0 ? i : direction === 2 ? i : 0);
            const y = startY + (direction === 1 ? i : direction === 2 ? i : 0);
            grid[y][x] = word[i];
        }
    });

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (!grid[y][x]) {
                grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }

    grid.forEach((row, y) => {
        row.forEach((letter, x) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = letter;
            cell.dataset.x = x;
            cell.dataset.y = y;
            gridElement.appendChild(cell);
        });
    });
}

function renderWordList() {
    wordsListElement.innerHTML = '';
    wordsToFind.forEach(word => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        wordsListElement.appendChild(listItem);
    });
}

function resetForNextLevel() {
    currentLevel++;
    if (currentLevel < levelWords.length) {
        wordsToFind = levelWords[currentLevel];
        grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
        generateGrid();
        renderWordList();
        levelMessageElement.textContent = '';
        nextLevelButton.style.display = 'none';
    } else {
        levelMessageElement.textContent = 'You have completed all levels!';
        nextLevelButton.style.display = 'none';
    }
}

let selectedCells = [];
gridElement.addEventListener('click', event => {
    const cell = event.target;
    if (cell.classList.contains('cell')) {
        const x = Number(cell.dataset.x);
        const y = Number(cell.dataset.y);

        if (!cell.classList.contains('selected')) {
            cell.classList.add('selected');
            selectedCells.push({ x, y });
        } else {
            cell.classList.remove('selected');
            selectedCells = selectedCells.filter(cell => cell.x !== x || cell.y !== y);
        }

        checkForWords();
    }
});

// Function to check if the selected cells form a valid word and are adjacent
function checkForWords() {
    if (selectedCells.length === 0) return;

    // Sort selected cells in order
    selectedCells.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

    // Check if selected cells are adjacent (horizontally, vertically, or diagonally)
    let isAdjacent = true;
    for (let i = 1; i < selectedCells.length; i++) {
        const prevCell = selectedCells[i - 1];
        const currCell = selectedCells[i];
        const dx = Math.abs(currCell.x - prevCell.x);
        const dy = Math.abs(currCell.y - prevCell.y);

        // Check if the current cell is adjacent to the previous one
        if (dx > 1 || dy > 1) {
            isAdjacent = false;
            break;
        }
    }

    if (!isAdjacent) {
        // If the cells are not adjacent, reset the selection
        selectedCells.forEach(cell => {
            const cellElement = Array.from(document.querySelectorAll('.cell')).find(
                el => el.dataset.x == cell.x && el.dataset.y == cell.y
            );
            cellElement.classList.remove('selected');
        });
        selectedCells = [];
        return;
    }

    // Get the selected word
    const selectedWord = selectedCells.map(cell => grid[cell.y][cell.x]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    // Check if the word or its reverse exists in the word list
    const wordIndex = wordsToFind.indexOf(selectedWord);
    const reverseWordIndex = wordsToFind.indexOf(reversedWord);

    if (wordIndex !== -1 || reverseWordIndex !== -1) {
        const foundWord = wordIndex !== -1 ? selectedWord : reversedWord;

        // Highlight the found cells
        selectedCells.forEach(cell => {
            const cellElement = Array.from(document.querySelectorAll('.cell')).find(
                el => el.dataset.x == cell.x && el.dataset.y == cell.y
            );
            cellElement.classList.add('found');
            cellElement.classList.remove('selected');
        });

        wordsToFind = wordsToFind.filter(word => word !== foundWord);
        renderWordList();
        selectedCells = [];
    }

    if (wordsToFind.length === 0) {
        levelMessageElement.textContent = 'Congratulations! You found all the words!';
        nextLevelButton.style.display = 'block';
    }
}

nextLevelButton.addEventListener('click', resetForNextLevel);

generateGrid();
renderWordList();
