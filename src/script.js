class Buffer {
    constructor(
        fileName = null,
        content = "",
        cursorPosition = { line: 0, column: 0, cursorX: 0, cursorY: 0 }
    ) {
        this.fileName = fileName;
        this.content = content; // storing the editor content
        this.cursorPosition = cursorPosition; // Tracks cursor position

        // Try loading content from localStorage if it exists
        this.loadFromStorage();
    }

    updateContent(newContent, cursorPosition) {
        this.content = newContent;
        this.cursorPosition = cursorPosition; // Update cursor position
    }

    letFileName() {
        return this.fileName;
    }

    saveToStorage() {
        localStorage.setItem(
            this.getStorageKey(),
            JSON.stringify({
                content: this.content,
                cursorPosition: this.cursorPosition, // Save cursor position
            })
        );
    }

    // Generate a unique key for storing content based on file path or other properties
    getStorageKey() {
        return `buffer-${this.fileName || "unsaved"}`;
    }

    loadFromStorage() {
        const storedData = localStorage.getItem(this.getStorageKey());
        if (storedData) {
            const { content, cursorPosition } = JSON.parse(storedData);
            this.content = content;
            this.cursorPosition = cursorPosition || {
                line: 0,
                column: 0,
                cursorX: 0,
                cursorY: 0,
            };
        }
    }

    save() {
        if (this.fileName) {
            // Implement file saving logic (e.g., send content to server)
            console.log(`Saving to ${this.fileName}`);
        } else {
            console.log("No file path provided.");
        }
    }
}

class BufferManager {
    constructor() {
        this.buffers = {}; // { fileName: Buffer }
        this.loadAllBuffers();
    }

    addBuffer(fileName, content, cursorPosition) {
        this.buffers[fileName] = new Buffer(fileName, content, cursorPosition);
    }

    getBuffers() {
        return this.buffers;
    }

    getBuffer(fileName) {
        return this.buffers[fileName];
    }

    removeBuffer(fileName) {
        delete this.buffers[fileName];
    }

    loadAllBuffers() {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("buffer-")) {
                const fileName = key.replace("buffer-", "");
                const storedBuffer = JSON.parse(localStorage.getItem(key));
                this.addBuffer(
                    fileName,
                    storedBuffer.content,
                    storedBuffer.cursorPosition
                ); // Load cursorPosition as well
            }
        });
    }
}

var buffer;
var bufferManager;
var fileName = "";
var lines = 0;
var isTermOpen = false;

const editor = document.getElementById("editor");
const editorDiv = document.getElementById("editor-container");
const outPut = document.getElementById("showOp");
const terminal = document.getElementById("term");
const lineNumbers = document.getElementById("lineNumbers");

// Close terminal
const closeTerm = () => {
    editorDiv.style.marginBottom = "0%";
    isTermOpen = false;
    terminal.style.display = "none";
    clearTerm();
};

// Clear terminal output
const clearTerm = () => {
    outPut.innerHTML = "";
};

// Synchronize line numbers with editor scrolling
editor.addEventListener("scroll", () => {
    lineNumbers.scrollTop = editor.scrollTop;
});

// this is for when html is loaded
function onLoad() {
    // if (fileName === "") {
    //     fileName = prompt("Please enter the file name:");
    // }
    const content = editor.innerText.trim();
    buffer = new Buffer(fileName, content, getCursorPosition);
    // bufferManager = new BufferManager();

    editor.innerText = buffer.content;
    // lines = buffer.cursorPosition.lines;
    // console.log(lines);
    drawCanvas();
    getCursorPosition();
}

document.addEventListener("DOMContentLoaded", onLoad);

function saveThisBuffer() {
    const content = editor.innerText.trim();
    const cursorPosition = getCursorPosition();
    buffer.updatecontent(content, cursorPosition);
    buffer.saveToStorage();
}

function loadAllBuffersCont() {
    bufferManager.loadAllBuffers();
}

//throttling
let timeout;
editor.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        console.log("hello");
        getCursorPosition(); // Update cursor position
    }, 300); // Delay of 300ms before executing getCursorPosition

    saveThisBuffer();
});

// setInterval(saveThisBuffer, 2000); //constantly saving buffers after each 2sec

//making a text editor from scratch
//this store's the line's of text
let text = [""];

var fontSize = 30;
const lineHeight = fontSize * 2;
// Set line height to be a bit larger than font size
const ctx = editor.getContext("2d");
let cursor = { line: 0, col: 0 }; // Initial cursor state
ctx.font = `normal ${fontSize}px Arial`; // Ensure normal weight
ctx.textBaseline = "top";
ctx.fillStyle = "white";
ctx.imageSmoothingEnabled = false;

//making the editor into focus
editor.addEventListener("click", () => {
    editor.focus();
});

editor.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "Backspace":
            handleBackspace();
            break;
        case "Enter":
            handleEnter();
            break;
        case "ArrowUp":
            handleArrowUp();
            break;
        case "ArrowDown":
            handleArrowDown();
            break;
        case "ArrowLeft":
            handleArrowLeft();
            break;
        case "ArrowRight":
            handleArrowRight();
            break;
        //add
        default:
            if (event.key.length === 1) {
                handleTextInput(event.key);
            }
            break;
    }

    // this was causing big problem
    // getCursorPosition();
    drawCanvas();
    drawCursor();
});

function handleBackspace() {
    if (cursor.col > 0) {
        // Remove character from the current position
        text[cursor.line - 1] =
            text[cursor.line - 1].substring(0, cursor.col - 1) +
            text[cursor.line - 1].substring(cursor.col);
        cursor.col -= 1; // Move cursor left
    } else if (cursor.line > 1) {
        // Merge current line with the previous one
        const prevLine = text[cursor.line - 2];
        const currentLine = text[cursor.line - 1];
        text[cursor.line - 2] = prevLine + currentLine;
        //this remove's the current line
        text.splice(cursor.line - 1, 1); // Remove current line
        cursor.line -= 1;
        cursor.col = prevLine.length; // Move cursor to end of previous line
    }
}

function handleEnter() {
    let rightSubstring = text[cursor.line - 1].substring(cursor.col);
    text[cursor.line - 1] = text[cursor.line - 1].substring(0, cursor.col);
    text.splice(cursor.line, 0, rightSubstring);
    cursor.col = 0;
    cursor.line += 1;
}

function handleArrowUp() {
    // so this is now working
    // so what is happening this arrowUp is only working only once
    // but the enter is editing the cursor.line += 1
    if (cursor.line > 1) {
        cursor.line -= 1;
        currLength = text[cursor.line - 1].length;
        cursor.col = Math.min(currLength, cursor.col);
    }
}

function handleArrowDown() {
    if (cursor.line < text.length) {
        cursor.line += 1;
        currLength = text[cursor.line - 1].length;
        cursor.col = Math.min(currLength, cursor.col);
    }
}

function handleTextInput(key) {
    const currentLine = text[cursor.line - 1];
    text[cursor.line - 1] =
        currentLine.substring(0, cursor.col) +
        key +
        currentLine.substring(cursor.col);
    cursor.col += 1;
}

function handleArrowLeft() {
    if (cursor.col > 0) {
        cursor.col -= 1;
    }
}

function handleArrowRight() {
    if (cursor.col < text[cursor.line - 1].length) {
        cursor.col += 1;
    }
}

function drawCanvas() {
    ctx.clearRect(0, 0, editor.width, editor.height); // Clear the entire canvas
    text.forEach((lineText, index) => {
        // Set style for line numbers
        ctx.font = `bold ${fontSize}px Arial`; // Bold font for line numbers
        ctx.fillStyle = "#ff6f61"; // Color for line numbers
        ctx.fillText("~", 0, index * lineHeight + 5); // Draw line number

        // Set style for the actual text
        ctx.font = `normal ${fontSize}px Arial`; // Normal font for text
        ctx.fillStyle = "#ffffff"; // Color for text
        ctx.fillText(lineText, 60, index * lineHeight + 5); // Draw text
    });
}

//blinking cursor
let blinkingCursor = true;
setInterval(() => {
    blinkingCursor = !blinkingCursor;
    drawCanvas();
    if (blinkingCursor) drawCursor();
}, 500);

function drawCursor() {
    const currentLine = text[cursor.line - 1] || "";
    //measuring the width of the currLine text width and placing the cursor there
    const cursorX =
        62 + ctx.measureText(currentLine.substring(0, cursor.col)).width;
    // meh! logic
    const cursorY = cursor.line * lineHeight - 37;

    // Drawing the cursor
    // This ensure the cursor is drawn independently without affecting other drawings on the canvas.
    ctx.beginPath();
    //this just moves the cursor
    ctx.moveTo(cursorX, cursorY - 20);
    //this is what actually draws something
    ctx.lineTo(cursorX, cursorY + 15);
    ctx.strokeStyle = "white";
    ctx.lineHeight = 60;
    ctx.lineWidth = 2;
    // renders the line on the canvas based on the defined path.
    ctx.stroke();
}

function getCursorPosition() {
    let line = text.length;
    let col = text[text.length - 1].length + 1;
    cursor = { line, col };
}

//this is also important so keep this for later
//function getCursorPosition() {
//    const selection = window.getSelection();
//    if (!selection.rangeCount) return;
//    //this givies us the column
//    const range = selection.getRangeAt(0);
//    const column = range.endOffset;

//    // Relative Positioning Calculation
//    // this gives us the actual co-ordinates of the cursor on
//    // viewport super handy for adding the tooltip
//    const rect = range.getBoundingClientRect();
//    const editorRect = editor.getBoundingClientRect();

//    //this caluclates that cursor ka he
//    const cursorX = rect.left - editorRect.left;
//    const cursorY = rect.top - editorRect.top;

//    // Optionally, you can return the cursor position if needed
//    // const tooltip = document.createElement("div");
//    // tooltip.textContent = "This is a tooltip!";
//    // tooltip.style.position = "absolute";
//    // tooltip.style.left = `${cursorX}px`;
//    // tooltip.style.top = `${cursorY}px`;

//    // document.body.appendChild(tooltip); // Append tooltip to the document

//    // Store cursor position
//    return { lines, column, cursorX, cursorY };
//}

// function to run code
const runCode = () => {
    //filling the code
    let code = "";
    text.forEach((lineText) => {
        code += lineText;
    });

    //if the code is Empty don't open the terminal
    if (code !== "") {
        isTermOpen = true;
        terminal.style.display = "block";
    }

    // Clear previous terminal output
    clearTerm();

    // Override console.log
    const oldConsoleLog = console.log;
    console.log = (message) => {
        outPut.innerHTML += message + "<br>";
    };

    try {
        // Safely evaluate code
        if (isTermOpen) {
            editorDiv.style.marginBottom = "20%";
        }
        const func = new Function(code); // Use Function constructor instead of eval
        func();
        outPut.style.color = "#ffffff"; // Reset terminal color to default
    } catch (error) {
        // Display errors in terminal
        outPut.style.color = "#ff0000";
        outPut.innerHTML += `ERR: ${error.message}<br>`;
    }

    // Restore console.log behavior
    console.log = oldConsoleLog;
};

//resizing stuff
// we do this on window meaning the whole page
window.addEventListener("resize", () => {
    console.log("hello");
});
// saving stuff
// setInterval(loadAllBuffersCont, 69000)

// Areas of Improvement or Enhancement

// Making the Editor From Scratch:
// Instead of using a contenteditable div, consider manually rendering text in an HTML canvas or custom rendering engine.
// Handle text input via keydown and keypress events, and manually draw text, caret, and selection.

// Line Number and Cursor Position Updates:
// Consider recalculating line numbers only when the content changes rather than on every cursor movement.
// Cursor position tracking can be enhanced by taking multi-line selections into account.

// Improved User Experience:
// Add syntax highlighting using libraries like CodeMirror or Monaco Editor.
// Allow custom file loading and saving options (e.g., upload/download files).

// Error Handling and Robustness:
// Handle edge cases like exceeding localStorage capacity gracefully.
// Validate inputs before saving to avoid malformed buffer data.

// Status Line:
// Implement a persistent status bar to display the cursor position and file information.

//
//
//
//  BufferManager
//
//
//
//
//  Done - fix the terminal output
//  DONE - fix the column positioning
//  Done - Before adding the cursor wee should first get the position of the cursor
//  Done - add the cursor
//  Done - lets first learn about the cursor positioning
//  Done - we need to add aroow's functionality
//  Donw - we have to fix teh input vala function
//  Done - we have to fix the enter
//  Done - we have to make the navigation through line's happen
//  Done - fix the cursor (hard) (actually it was preety easy)
//  Done - do line numbers with canvas
//
//
//  currTodos
//  1. let's do the resizing fixes
//  2. get the buffers and buffer running
//  3. add the selection, copy, past, cut support and more editor support
//
// maybe
// maybe try to make lineNumbers out of the canvas
// make text editor customizable
// add vim functionality
