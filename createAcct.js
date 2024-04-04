//Submitting new user account to database
document.addEventListener('DOMContentLoaded', function(){

    document.getElementById('createAccountForm').addEventListener('submit', function (e){

        e.preventDefault(); // Prevent the default form submission

        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Construct the user object
        const user = {
            email: email,
            username: username,
            password: password, // db will hashes the password 
        }
        
        registerUser(user);
    })

    
})

//Function to handle user registration and sending data to backend
async function registerUser(user){
    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            throw new Error('Failed to register user');
        }

        const registeredUser = await response.json();
        console.log('User registered:', registeredUser);

        //get user id **important for loading/storing user habits
        if(registeredUser._id){
            //USING SESSIONSTORAGE TO KEEP TRACK OF USERID **IMPORTANT FOR RETRIEVING AND STORING USER HABITS (BY ID)
            //didnt want to deal with tokens or anything so using userid
            sessionStorage.setItem('userId', registeredUser._id);

            // Redirect or update UI upon successful registration
            window.location.href = '/index.html'; //redirect to the homepage
        }


    } catch (error) {
        console.error('Error:', error);
        
    }
}