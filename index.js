// Google Sign-In integration
function handleCredentialResponse(response) {
    // Decode the JWT token to get user info
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
    );

    const userInfo = JSON.parse(jsonPayload);
    console.log('Google User Info:', userInfo);

    // Check if user info is present
    if (userInfo.name) {
        alert(`Welcome, ${userInfo.name}!`);
        // Redirect to another page after successful sign-in
        window.location.href = 'base.html';
    } else {
        alert('Google Sign-In failed!');
    }
}

// Initialize Google Sign-In button
window.onload = function() {
    // Google Sign-In setup
    google.accounts.id.initialize({
        client_id: '847610751230-ii8b8v8h87e8h3irr6gupmon7oepdo67.apps.googleusercontent.com', // Your Client ID
        callback: handleCredentialResponse,
        ux_mode: 'redirect' // Use redirect mode instead of popup
    });

    // Render Google Sign-In button
    google.accounts.id.renderButton(
        document.querySelector('.google.btn'),
        {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'sign_in_with',
            logo_alignment: 'left'
        }
    );

    // Prompt the user automatically (optional)
    google.accounts.id.prompt();

    // Add form submission event listener for manual login
    document.querySelector('form').addEventListener('submit', handleManualLogin);
};

// Manual form login handler
function handleManualLogin(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;

    // Simple validation for manual login
    if (username.trim() !== '' && password.trim() !== '') {
        console.log(`Manual Login - Username: ${username}, Password: ${password}`);
        alert('Manual login successful!');
        // Example redirection after successful manual login
        window.location.href = 'base.html';
    } else {
        alert('Please enter both username and password!');
    }
}
