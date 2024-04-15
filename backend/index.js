const {MongoClient, ObjectId} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const uri = "mongodb+srv://habitue-dev.mytvaae.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Habitue-dev";

const api_port = 8080;

const app = express();
app.use(bodyParser.json());
const client = new MongoClient(uri, {useUnifiedTopology: true, tls: true, tlsCertificateKeyFile: './certificates/X509-apicert.pem'});



/**
 * SCHEMA
 * 
 * User {
 *      id: String,
 *      name: String,
 *      email: String,
 *      username: String,
 *      password: String, # Hashed + Salted
 *      habits: [String] # Habit IDs
 *      notifications: [String] # Notification IDs
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

function validateUser(user) {
    if (!user.name)
        user.name = '';
    if (!user.email)
        user.email = '';
    if (!user.username)
        throw 'Username is required';
    if (!user.password)
        throw 'Password is required';
    if (!user.habits)
        user.habits = [];
    if (!user.notifications)
        user.notifications = [];
    return user;
}

function validateHabit(habit) {
    if (!habit.userId)
        throw 'User ID is required';
    if (!habit.name)
        throw 'Habit name is required';
    if (!habit.description)
        habit.description = '';
    if (!habit.dueDate)
        throw 'Due date is required';
    if (!habit.completed)
        habit.completed = false;
    if (!habit.notifications)
        habit.notifications = [];
    return habit;
}

function validateNotification(notif) {
    if (!notif.habitId)
        throw 'Habit ID is required';
    if (!notif.message)
        throw 'Message is required';
    if (!notif.date)
        throw 'Date is required';
    if (!notif.read)
        notif.read = false;
    return notif;
}

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
    const user = await client.db('habitue').collection('users').findOne({"_id": new ObjectId(req.params.id)});
    res.send(user);
});

// app.post('/api/users', async (req, res) => {
//     var user = req.body;
//     try {
//         user = validateUser(user);
//     } catch (e) {
//         res.status(400).send(e);
//         return;
//     }
//     await client.db('habitue').collection('users').insertOne(user);
//     res.send(user);
// });

app.post('/api/habits', async (req, res) => {
    let habit = req.body;
    try {
        habit = validateHabit(habit);
    } catch (e) {
        res.status(400).send(e.toString()); //convert Error to string if necessary
        return;
    }
    const insertResult = await client.db('habitue').collection('habits').insertOne(habit);
    await client.db('habitue').collection('users').updateOne({"_id": new ObjectId(habit.userId)}, {$push: {habits: insertResult.insertedId}});
    res.send(habit);
});


app.put('/api/users/:id', async (req, res) => {
    const user = req.body;
    try {
        user = validateUser(user);
    } catch (e) {
        res.status(400).send(e);
        return;
    }
    await client.db('habitue').collection('users').updateOne({"_id": new ObjectId(req.params.id)}, {$set: user});
    res.send(user);
});

app.delete('/api/users/:id', async (req, res) => {
    await client.db('habitue').collection('users').deleteOne({"_id": new ObjectId(req.params.id)});
    res.send('User deleted');
});

/**
 * Authentication API endpoints
*/
app.post('/api/login', async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        res.status(400).send('Username and password are required');
        return;
    }
    const user = await client.db('habitue').collection('users').findOne({username, password});
    res.send(user);
});

app.post('/api/register', async (req, res) => {
    var user = req.body;
    try {
        user = validateUser(user);
    } catch (e) {
        res.status(400).send(e);
        return;
    }
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
    const habit = await client.db('habitue').collection('habits').findOne({"_id": new ObjectId(req.params.id)});
    res.send(habit);
});

app.post('/api/habits', async (req, res) => {
    const habit = req.body;
    try {
        habit = validateHabit(habit);
    } catch (e) {
        res.send(400).send(e);
        return;
    }
    await client.db('habitue').collection('habits').insertOne(habit);
    await client.db('habitue').collection('users').updateOne({"_id": new ObjectId(habit.userId)}, {$push: {habits: habit._id}});
    res.send(habit);
});

app.put('/api/habits/:id', async (req, res) => {
    const habit = req.body;
    try {
        habit = validateHabit(habit);
    } catch (e) {
        res.send(400).send(e);
        return;
    }
    await client.db('habitue').collection('habits').updateOne({"_id": new ObjectId(req.params.id)}, {$set: habit});
    res.send(habit);
});

app.delete('/api/habits/:id', async (req, res) => {
    await client.db('habitue').collection('habits').deleteOne({"_id": new ObjectId(req.params.id)});
    res.send('Habit deleted');
});

/**
 *  User Habit endpoints 
 */
app.get('/api/users/:id/habits', async (req, res) => {
    const user = await client.db('habitue').collection('users').findOne({"_id": new ObjectId(req.params.id)});
    if (!user) {
        res.status(404).send('User not found');
        return;
    }
    var habits = [];
    if (!user.habits) {
        console.log('No habits found')
        res.send(habits);
        return;
    }
    for (let i = 0; i < user.habits.length; i++) {
        habits[i] = await client.db('habitue').collection('habits').findOne({"_id": new ObjectId(user.habits[i])});
    }
    res.send(habits);
});

app.put('/api/users/:id/habits', async (req, res) => {
    const user = await client.db('habitue').collection('users').findOne({"_id": new ObjectId(req.params.id)});
    var habit = req.body;
    try {
        habit = validateHabit(habit);
    } catch (e) {
        res.status(400).send(e);
        return;
    }
    user.habits.push(req.body.id);
    await client.db('habitue').collection('users').updateOne({"_id": new ObjectId(req.params.id)}, {$set: user});
    res.send(user);
});

app.delete('/api/users/:id/habits/:habitId', async (req, res) => {
    const user = await client.db('habitue').collection('users').findOne({"_id": new ObjectId(req.params.id)});
    user.habits = user.habits.filter(habit => habit !== req.params.habitId);
    await client.db('habitue').collection('users').updateOne({"_id": new ObjectId(req.params.id)}, {$set: user});
    res.send(user);
});

/** 
 * Habit dueDate endpoints
 */

app.get('/api/habits/:id/dueDate', async (req, res) => {
    const habit = await client.db('habitue').collection('habits').findOne({"_id": new ObjectId(req.params.id)});
    res.send(habit.dueDate);
});

app.put('/api/habits/:id/dueDate', async (req, res) => {
    const habit = await client.db('habitue').collection('habits').findOne({"_id": new ObjectId(req.params.id)});
    habit.dueDate = req.body.dueDate;
    await client.db('habitue').collection('habits').updateOne({"_id": new ObjectId(req.params.id)}, {$set: habit});
    res.send(habit);
});

/**
 * Habit completion endpoints
 */

app.get('/api/habits/:id/completed', async (req, res) => {
    const habit = await client.db('habitue').collection('habits').findOne({"_id": new ObjectId(req.params.id)});
    res.send(habit.completed);
});

app.put('/api/habits/:id/completed', async (req, res) => {
    const habit = await client.db('habitue').collection('habits').findOne({"_id": new ObjectId(req.params.id)});
    habit.completed = req.body.completed;
    await client.db('habitue').collection('habits').updateOne({"_id": new ObjectId(req.params.id)}, {$set: habit});
    res.send(habit);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'welcomesplash.html'));
})

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'index.html'));
})

app.get('/home.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'home.js'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'login.html'))
});

app.get('/loginAcct.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'loginAcct.js'))
});

app.get('/createAccount.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'createAccount.html'))
});

app.get('/createAcct.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'createAcct.js'))
});

app.get('/habitStatistics.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'habitStatistics.html'))
});

app.get('/habitStat.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'habitStat.js'))
});

app.get('/manage_habits.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'manage_habits.html'))
});

app.get('/welcomespalsh.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'welcomesplash.html'))
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'style.css'))
});

app.get('/Habitue_tmp_logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'Habitue_tmp_logo.png'))
});

app.get('/Habitue_transparent.png', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'Habitue_transparent.png'))
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'favicon.ico'))
});