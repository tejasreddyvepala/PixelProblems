// Function to switch between tabs
function openTab(event, tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = 'none';
    }

    // Remove 'active' class from all tab links
    const tabLinks = document.getElementsByClassName('tab-link');
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(' active', '');
    }

    // Show the current tab and add 'active' class to the clicked tab
    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.className += ' active';
}

// Function to run the combined code
function runCombinedCode() {
    const htmlCode = document.getElementById('html-code').value;
    const cssCode = document.getElementById('css-code').value;
    const jsCode = document.getElementById('js-code').value;
    const outputFrame = document.getElementById('output-frame');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Reset messages
    errorMessage.textContent = '';
    successMessage.textContent = '';

    // Construct the combined HTML
    const combinedCode = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${cssCode}</style>
        </head>
        <body>
            ${htmlCode}
            <script>${jsCode}<\/script>
        </body>
        </html>
    `;

    // Render the combined code in the iframe
    try {
        const doc = outputFrame.contentDocument || outputFrame.contentWindow.document;
        doc.open();
        doc.write(combinedCode);
        doc.close();

        // Display success message
        successMessage.innerHTML = '<span class="tick">&#10004;</span> Code executed successfully!';
        successMessage.style.display = 'block';
    } catch (error) {
        errorMessage.textContent = 'Error rendering the code. Please check your code.';
        successMessage.style.display = 'none'; // Hide success message in case of error
    }
}

// Initialize the first tab as active
document.addEventListener('DOMContentLoaded', function() {
    openTab(event, 'html');
});
