const {MongoClient} = require('mongodb');
const express = require('express');
const cors = require('cors'); //Souad added this to allow front and back end to run on diff ports
const bodyParser = require('body-parser');

const uri = "mongodb+srv://habitue-dev.mytvaae.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Habitue-dev";

const api_port = 5000;

const app = express();
app.use(bodyParser.json());
const client = new MongoClient(uri, {useUnifiedTopology: true, tls: true, tlsCertificateKeyFile: './certificates/X509-apicert.pem'});

 app.use(cors({
     origin : 'http://localhost:8080'
 }));


/**
 * SCHEMA
 * 
 * User {
 *      id: String,
 *      name: String,
 *      email: String,
 *      password: String, # Hashed + Salted
 *      habits: [String] # Habit IDs
 * }
 * 
 * Habit {
 *      id: String,
 *      userId: String,
 *      name: String,
 *      description: String,
 *      dueDate: Date,
 *      completed: Boolean
 *      notifications: [String] # Notification IDs
 * }
 * 
 * Notification {
 *      id: String,
 *      habitId: String,
 *      message: String,
 *      date: Date,
 *      read: Boolean
 * }
 * 
 * 
 */


client.connect().then(() => {
    app.listen(api_port, () => {
        console.log('Server has started!');
    });
});

app.get('/api/hello', (req, res) => {
    res.send({ express: 'Hello From Express' });
});

/**
 * Users API endpoints
 */
app.get('/api/users', async (req, res) => {
    const users = await client.db('habitue').collection('users').find().toArray();
    res.send(users);
});

app.get('/api/users/:id', async (req, res) => {
    const user = await client.db('habitue').collection('users').findOne({id: req.params.id});
    res.send(user);
});

app.post('/api/users', async (req, res) => {
    const user = req.body;
    await client.db('habitue').collection('users').insertOne(user);
    res.send(user);
});

app.put('/api/users/:id', async (req, res) => {
    const user = req.body;
    await client.db('habitue').collection('users').updateOne({id: req.params.id}, {$set: user});
    res.send(user);
});

app.delete('/api/users/:id', async (req, res) => {
    await client.db('habitue').collection('users').deleteOne({id: req.params.id});
    res.send('User deleted');
});

/**
 * Authentication API endpoints
 */
app.post('/api/login', async (req, res) => {
    const {username, password} = req.body;
    const user = await client.db('habitue').collection('users').findOne({username, password});
    res.send(user);
});

app.post('/api/register', async (req, res) => {
    const user = req.body;
    await client.db('habitue').collection('users').insertOne(user);
    res.send(user);
});

/** 
 * Habits API endpoints
 */

app.get('/api/habits', async (req, res) => {
    const habits = await client.db('habitue').collection('habits').find().toArray();
    res.send(habits);
});

app.get('/api/habits/:id', async (req, res) => {
    const habit = await client.db('habitue').collection('habits').findOne({id: req.params.id});
    res.send(habit);
});

app.post('/api/habits', async (req, res) => {
    const habit = req.body;
    await client.db('habitue').collection('habits').insertOne(habit);
    res.send(habit);
});

app.put('/api/habits/:id', async (req, res) => {
    const habit = req.body;
    await client.db('habitue').collection('habits').updateOne({id: req.params.id}, {$set: habit});
    res.send(habit);
});

app.delete('/api/habits/:id', async (req, res) => {
    await client.db('habitue').collection('habits').deleteOne({id: req.params.id});
    res.send('Habit deleted');
});

/**
 *  User Habit endpoints 
 */
app.get('/api/users/:id/habits', async (req, res) => { //also handles sorting by due date!
    const userId = req.params.id;
    const sort = {};

    // Check for sort query parameter and prepare the sort object
    if (req.query.sort === 'ascending') {
        sort.dueDate = 1; // MongoDB sort ascending
    } else if (req.query.sort === 'descending') {
        sort.dueDate = -1; // MongoDB sort descending
    }

    try {
        const habits = await client.db('habitue').collection('habits')
                              .find({ userId: userId })
                              .sort(sort) // Apply sorting based on the query parameter *its optional
                              .toArray();
        res.send(habits);
    } catch (error) {
        console.error('Failed to fetch habits:', error);
        res.status(500).send('Error fetching habits');
    }
});

app.put('/api/users/:id/habits', async (req, res) => {
    const user = await client.db('habitue').collection('users').findOne({id: req.params.id});
    user.habits.push(req.body.id);
    await client.db('habitue').collection('users').updateOne({id: req.params.id}, {$set: user});
    res.send(user);
});

app.delete('/api/users/:id/habits/:habitId', async (req, res) => {
    const user = await client.db('habitue').collection('users').findOne({id: req.params.id});
    user.habits = user.habits.filter(habit => habit !== req.params.habitId);
    await client.db('habitue').collection('users').updateOne({id: req.params.id}, {$set: user});
    res.send(user);
});

/** 
 * Habit dueDate endpoints
 */

app.get('/api/habits/:id/dueDate', async (req, res) => {
    const habit = await client.db('habitue').collection('habits').findOne({id: req.params.id});
    res.send(habit.dueDate);
});

app.put('/api/habits/:id/dueDate', async (req, res) => {
    const habit = await client.db('habitue').collection('habits').findOne({id: req.params.id});
    habit.dueDate = req.body.dueDate;
    await client.db('habitue').collection('habits').updateOne({id: req.params.id}, {$set: habit});
    res.send(habit);
});

/**
 * Habit completion endpoints
 */

app.get('/api/habits/:id/completed', async (req, res) => {
    const habit = await client.db('habitue').collection('habits').findOne({id: req.params.id});
    res.send(habit.completed);
});

app.put('/api/habits/:id/completed', async (req, res) => {
    const habit = await client.db('habitue').collection('habits').findOne({id: req.params.id});
    habit.completed = req.body.completed;
    await client.db('habitue').collection('habits').updateOne({id: req.params.id}, {$set: habit});
    res.send(habit);
});