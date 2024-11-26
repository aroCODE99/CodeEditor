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

    getFileName() {
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

    addBuffer(fileName, content) {
        this.buffers[fileName] = new Buffer(
            fileName,
            content,
            getCursorPosition
        );
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
                this.addBuffer(fileName, storedBuffer.content); // Fix: Use 'this' to call addBuffer
            }
        });
    }

    // Additional methods like load all buffers from storage, save buffers, etc.
}

var isTermOpen = false;
var buffer;
var bufferManager;
var fileName = "";
var lines = 0;

const editorDiv = document.getElementById("editor-container");
const outPut = document.getElementById("showOp");
const terminal = document.getElementById("term");
const editor = document.getElementById("editor");
const lineNumbers = document.getElementById("lineNumbers");

// Function to run code
const runCode = () => {
    const code = editor.innerText.trim(); // Remove leading/trailing whitespace.

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
}

document.addEventListener("DOMContentLoaded", onLoad);

function saveThisBuffer() {
    const content = editor.innerText.trim();
    const cursor = getCursorPosition();
    console.log(cursor);
    buffer.updateContent(content, cursor);
    buffer.saveToStorage();
    // bufferManager.savet;
}

function loadAllBuffersCont() {
    bufferManager.loadAllBuffers();
}

function getCursorPosition() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const column = range.endOffset;

    const rect = range.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();

    const cursorX = rect.left - editorRect.left;
    const cursorY = rect.top - editorRect.top; // Fixed the Y coordinate calculation

    lines = editor.querySelectorAll("div").length + 1;
    let lineNumberHTML = "";
    for (let i = 1; i <= lines; i++) {
        lineNumberHTML += `${i}.<br>`;
    }

    lineNumbers.innerHTML = lineNumberHTML;

    // Optionally, you can return the cursor position if needed
    // const tooltip = document.createElement("div");
    // tooltip.textContent = "This is a tooltip!";
    // tooltip.style.position = "absolute";
    // tooltip.style.left = `${cursorX}px`;
    // tooltip.style.top = `${cursorY}px`;

    // document.body.appendChild(tooltip); // Append tooltip to the document
    //
    // Store cursor position
    return { lines, column, cursorX, cursorY };
}

function handleEditorInput() {
    getCursorPosition();
    saveThisBuffer();
}
// Update line numbers on input
editor.addEventListener("input", handleEditorInput);

// saving stuff
// setInterval(loadAllBuffersCont, 69000);

//
// todos
// 3. and then working on loading lines them properly
// 5. make a status line with cursor position
//
// BufferManager
