var isTermOpen = false;

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

// Update line numbers dynamically
const updateLineNumbers = () => {
    if (editor.innerText === "\n") {
        editor.innerText = "";
    }
    const lines = editor.innerText.split("\n").length; // Count lines based on visible text
    let lineNumberHTML = "";
    for (let i = 1; i <= lines; i++) {
        lineNumberHTML += `${i}.<br>`;
    }
    lineNumbers.innerHTML = lineNumberHTML;
};

// Synchronize line numbers with editor scrolling
editor.addEventListener("scroll", () => {
    lineNumbers.scroltor.scrollTop;
});

// Update line numbers on input
editor.addEventListener("input", updateLineNumbers);

// Initialize line numbers
updateLineNumbers();
