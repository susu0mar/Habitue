use('habitue')

/**
 * SCHEMA
 * 
 * User {
 *      id: String,
 *      name: String,
 *      email: String,
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
 *      userId: String,
 *      habitId: String,
 *      message: String,
 *      date: Date,
 *      read: Boolean
 * }
 * 
 * 
 */


db.getCollection('users').insertMany([
    {
        "name": "John Doe",
        "email": "doej@test.net",
        "password": "123456",
        "habits": []
    },
    {
        "name": "Test User",
        "email": "usert@domain.com",
        "password": "password",
        "habits": []
    }])
var id1 = db.getCollection('users').findOne({email: "doej@test.net"})._id
var id2 = db.getCollection('users').findOne({email: "usert@domain.com"})._id
db.getCollection('habits').insertMany([
    {
        "userId": id1,
        "name": "Exercise",
        "description": "Do some pushups and situps",
        "dueDate": new Date(),
        "completed": false,
        "notifications": []
    },
    {
        "userId": id2,
        "name": "Read",
        "description": "Read a book for 30 minutes",
        "dueDate": new Date(),
        "completed": false,
        "notifications": []
    }])

var hid1 = db.getCollection('habits').findOne({userId: id1})._id
var hid2 = db.getCollection('habits').findOne({userId: id2})._id