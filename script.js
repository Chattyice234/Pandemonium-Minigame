const gameContainer = document.getElementById('game-container');
const blankCircle = document.getElementById('blank-circle');
const bar = document.getElementById('bar');
const jumpscareContainer = document.getElementById('jumpscare-container');

// Create a custom cursor element
const cursor = document.createElement('div');
cursor.id = 'cursor';
document.body.appendChild(cursor);

// Load the main autoplay theme and the jumpscare sound
const mainTheme = new Audio('pande.mp3');
const jumpscareSound = new Audio('PandyJumpp.wav');
mainTheme.loop = true; // Set the main theme to loop
mainTheme.play(); // Start playing the main theme

let barWidth = 200; // Initialize bar width to full value
const barDecreaseRate = 2; // Set the bar decrease rate to a balanced value
const intervalTime = 100; // Interval time (ms) for the game loop

const jitterAmount = 6; // Amount of jitter in pixels
const jitterFrequency = 50; // Frequency of jitter in milliseconds

let gameDuration = 30000; // Game duration in milliseconds (30 seconds)
let gameStartTime = Date.now();

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

// Function to get cursor position changes
function updateCursorPosition(event) {
    cursorX += event.movementX;
    cursorY += event.movementY;

    // Ensure the cursor stays within the window bounds
    cursorX = Math.max(0, Math.min(window.innerWidth - cursor.offsetWidth, cursorX));
    cursorY = Math.max(0, Math.min(window.innerHeight - cursor.offsetHeight, cursorY));

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    updateBar({ x: cursorX + cursor.offsetWidth / 2, y: cursorY + cursor.offsetHeight / 2 });
}

// Function to check if the cursor is inside the white icon
function isCursorInsideCircle(cursorPos) {
    const circleRect = blankCircle.getBoundingClientRect();
    const circleCenter = {
        x: circleRect.left + circleRect.width / 2,
        y: circleRect.top + circleRect.height / 2
    };
    const distance = Math.sqrt(
        Math.pow(cursorPos.x - circleCenter.x, 2) +
        Math.pow(cursorPos.y - circleCenter.y, 2)
    );
    return distance < (circleRect.width / 2);
}

// Function to displace the cursor position
function displaceCursor() {
    const randomX = Math.random() * (window.innerWidth - cursor.offsetWidth);
    const randomY = Math.random() * (window.innerHeight - cursor.offsetHeight);

    cursorX = randomX;
    cursorY = randomY;

    // Add class for smooth transition
    cursor.classList.add('teleporting');
    cursor.style.left = `${randomX}px`;
    cursor.style.top = `${randomY}px`;

    // Remove the teleporting class after the transition duration
    setTimeout(() => {
        cursor.classList.remove('teleporting');
    }, 50); // Faster transition duration (50ms)

    // Update the bar status immediately after teleporting
    updateBar({ x: cursorX + cursor.offsetWidth / 2, y: cursorY + cursor.offsetHeight / 2 });
}

// Function to update the bar based on cursor position
function updateBar(cursorPos) {
    if (isCursorInsideCircle(cursorPos)) {
        cursor.classList.remove('red');
        bar.style.backgroundColor = 'white';
        barWidth = Math.min(barWidth + 5, 200); // Regain width more slowly
    } else {
        cursor.classList.add('red');
        bar.style.backgroundColor = 'red';
        barWidth -= barDecreaseRate; // Shrink bar width at a balanced rate
    }
    bar.style.width = `${barWidth}px`;

    if (barWidth <= 0) {
        triggerJumpscare();
    }
}

// Function to reset the game
function resetGame() {
    barWidth = 200;
    bar.style.width = `${barWidth}px`;
    bar.style.backgroundColor = 'white';
    gameStartTime = Date.now();
}

// Function to apply jitter to the cursor
function applyJitter() {
    const jitterX = (Math.random() - 0.5) * jitterAmount * 2;
    const jitterY = (Math.random() - 0.5) * jitterAmount * 2;

    cursorX += jitterX;
    cursorY += jitterY;

    // Ensure the cursor stays within the window bounds
    cursorX = Math.max(0, Math.min(window.innerWidth - cursor.offsetWidth, cursorX));
    cursorY = Math.max(0, Math.min(window.innerHeight - cursor.offsetHeight, cursorY));

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    updateBar({ x: cursorX + cursor.offsetWidth / 2, y: cursorY + cursor.offsetHeight / 2 });
}

// Function to trigger the jumpscare
function triggerJumpscare() {
    mainTheme.pause(); // Stop the main theme
    mainTheme.currentTime = 0; // Reset the main theme to the start
    jumpscareSound.loop = false; // Ensure the jumpscare sound does not loop
    jumpscareSound.play(); // Play the jumpscare sound

    jumpscareContainer.style.display = 'flex';
    setTimeout(() => {
        location.reload();
    }, 1000); // Adjust the delay as needed
}

// Function to request pointer lock
function requestPointerLock() {
    gameContainer.requestPointerLock = gameContainer.requestPointerLock || gameContainer.mozRequestPointerLock || gameContainer.webkitRequestPointerLock;
    gameContainer.requestPointerLock();
}

// Function to handle pointer lock change events
function pointerLockChange() {
    if (document.pointerLockElement === gameContainer || document.mozPointerLockElement === gameContainer || document.webkitPointerLockElement === gameContainer) {
        // Pointer lock is active
        document.addEventListener('mousemove', updateCursorPosition, false);
    } else {
        // Pointer lock is inactive
        document.removeEventListener('mousemove', updateCursorPosition, false);
    }
}

// Function to check the game duration
function checkGameDuration() {
    const elapsedTime = Date.now() - gameStartTime;
    if (elapsedTime >= gameDuration) {
        // Handle end of game here
    }
}

// Reset the bar width when the page loads
window.onload = function() {
    resetGame();
    document.addEventListener('click', requestPointerLock, false);
    document.addEventListener('pointerlockchange', pointerLockChange, false);
    document.addEventListener('mozpointerlockchange', pointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
}

// Set interval to displace cursor
setInterval(displaceCursor, Math.random() * 2000 + 2000);
setInterval(displaceCursor, Math.random() * 3000 + 4000);

// Set interval for game loop to decrease bar width at a balanced rate and check game duration
setInterval(() => {
    const cursorPos = {
        x: cursorX + cursor.offsetWidth / 2,
        y: cursorY + cursor.offsetHeight / 2
    };
    updateBar(cursorPos);
    checkGameDuration(); // Check if the game duration has been reached
}, intervalTime); // Interval time for the game loop

// Set interval to apply jitter to the cursor
setInterval(applyJitter, jitterFrequency);