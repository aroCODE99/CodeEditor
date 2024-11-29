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
    updateLineNumbers();
    drawCanvas();
    getCursorPosition();
    drawCursor();
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
    //clear prev timer
    clearTimeout(timeout);
    //intitate the new timer
    timeout = setTimeout(() => {
        getCursorPosition(); // Update cursor position
    }, 300); // Delay of 300ms before executing getCursorPosition

    saveThisBuffer();
});

// setInterval(saveThisBuffer, 2000); //constantly saving buffers after each 2sec

//making a text editor from scratch
var fontSize = 30;
let text = [""];
const lineHeight = fontSize * 2.1; // Set line height to be a bit larger than font size
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

let currLine = 0;
let column = 0;
let count = 1;
editor.addEventListener("keydown", (event) => {
    //now they are in-sync but i am leaving this logic like as it is
    // i dk why really
    // console.log("cursor.line" + cursor.line, "currLine" + currLine);

    // console.log(event.key);
    if (event.key === "Backspace") {
        // handle Backspace
        if (text[currLine] === "" && currLine > 0) {
            text.pop();
            currLine -= 1;
        } else {
            text[currLine] = text[currLine].slice(0, -1);
            column -= 1;
        }
    } else if (event.key === "Enter") {
        text.push("");
        currLine += 1;
    } else if (event.key === "ArrowUp" && cursor.line > 1) {
        // its only going in once
        console.log(count + 1);
        cursor.line -= 1;
        // logic to handle
        // 1. while moving up i think that the cursor should be remain at same position meaning that if only line should be changing
        //
        // 2. but if the line is smaller than cursor position that we should move it at the last position and also it should not be moving past curr line
        //
        // 3. cursor should not go below zero
    } else if (event.key.length === 1) {
        text[currLine] += event.key;
    }
    //thinking of adding the aro functionality but we could switch arrow's to vim motions in future

    //i think keydown and input events does not work with each other
    //yes they do because they clash on each other
    updateLineNumbers();
    getCursorPosition();
    drawCanvas();
    drawCursor();
});
function drawCanvas() {
    ctx.clearRect(0, 0, editor.width, editor.height); // Clear the entire canvas
    text.forEach((lineText, index) => {
        ctx.fillText(lineText, 3, index * lineHeight);
    });
}

function drawCursor() {
    const currentLine = text[cursor.line - 1] || "";
    //measuring the width of the currLine text width and placing the cursor there
    const cursorX =
        10 + ctx.measureText(currentLine.substring(0, cursor.col)).width;
    // meh! logic
    const cursorY = cursor.line * lineHeight - 40;

    // Drawing the cursor
    // This ensures the cursor is drawn independently without affecting other drawings on the canvas.
    ctx.beginPath();
    //this just moves the cursor
    ctx.moveTo(cursorX, cursorY - 20);
    //this is what actually draws something
    ctx.lineTo(cursorX, cursorY + 10);
    ctx.strokeStyle = "white";
    ctx.lineHeight = 100;
    ctx.lineWidth = 6;
    // enders the line on the canvas based on the defined path.
    ctx.stroke();
}

function updateLineNumbers() {
    let lineNumberHTML = "";
    for (let i = 1; i <= currLine + 1; i++) {
        lineNumberHTML += `${i}.<br>`;
    }
    lineNumbers.innerHTML = lineNumberHTML;
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
//
//  currTodos
//  1. fix the text editor logic
//      a. lets first learn about the cursor positioning
//      b. remove the dependency from currLine and currCol variables instead use the object
//  2. get the buffers and buffer running
//
//
//
//
//
// maybe
// maybe try to make lineNumbers out of the canvas
// add vim functionality
