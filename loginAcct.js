document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent the default form submission

        //get data from fields
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            console.log("Debug: Try block entered");
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);

                // Extract the 'id' from the response and store it
                if(data._id) {
                    //USING SESSIONSTORAGE TO KEEP TRACK OF USERID **IMPORTANT FOR RETRIEVING AND STORING USER HABITS (BY ID)
                    //didnt want to deal with tokens or anything so using userid
                    sessionStorage.setItem('userId', data._id);

                    // Redirect the user to homepage
                    window.location.href = '/index.html';
                } 
                else {
                    // Handle case where 'id' is not included in the response
                    console.error('User ID not provided in login response');
                    alert('Login failed. Please try again.');
                    return;
                }
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});
