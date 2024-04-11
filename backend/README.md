# API Documentation
 This is the API documentation for the backend of the project. The backend is built using Express.js and MongoDB running on the node.js framework.

## API Endpoints
The following are the API endpoints that are available in the backend:
/ - This is the root endpoint of the API. It returns a welcome message.
/api/users - This endpoint is used to get all users in the database.
/api/habits - This endpoint is used to get all habits in the database.
/api/notifications - This endpoint is used to get all notifications in the database.

## /api/users
The /api/users endpoint is used to get all users in the database. The response is a JSON object containing all the users in the database. The response is an array of user objects. Each user object contains the following fields:
- id: The unique identifier of the user.
- name: The name of the user.
- email: The email address of the user.
- password: The password of the user. # This should be hashed and salted.
- habits: An array of habit objects that the user has.
- notifications: An array of notification objects that the user has.

## /api/habits
The /api/habits endpoint is used to get all habits in the database. The response is a JSON object containing all the habits in the database. The response is an array of habit objects. Each habit object contains the following fields:
- id: The unique identifier of the habit.
- userId: The unique identifier of the user that has this habit.
- name: The name of the habit.
- description: A description of the habit.
- dueDate: The due date of the habit.
- completed: A boolean value indicating whether the habit has been completed.
- notifications: An array of notification objects that are associated with this habit.

## /api/notifications
The /api/notifications endpoint is used to get all notifications in the database. The response is a JSON object containing all the notifications in the database. The response is an array of notification objects. Each notification object contains the following fields:
- id: The unique identifier of the notification.
- userId: The unique identifier of the user that has this notification.
- habitId: The unique identifier of the habit that this notification is associated with.
- message: The message of the notification.
- date: The date of the notification.
- read: A boolean value indicating whether the notification has been read.

## Authentication
The API has authentication endpoints that are used to authenticate users. The authentication endpoints are:
- /api/login - This endpoint is used to log in a user. It takes a username and password and returns a token if the user is authenticated.
- /api/register - This endpoint is used to register a new user. It takes a username, email, and password and creates a new user in the database.


# Running the Backend
To run the backend, follow these steps:
1. Clone the repository.
2. Navigate to the backend directory.
3. Install node.js and npm if you haven't already.
3. Run `npm install` to install the dependencies.
4. Run `npm start` to start the server.
5. The server will start running on http://localhost:5000.