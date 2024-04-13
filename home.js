
//TODO: NEED TO FIGURE OUT CHECKING OFF HABITS/COMPLETEION
//SCRIPT TO OPEN & CLOSE ADD HABIT MODAL 

// Get the modal
var modal = document.getElementById('addHabitModal');

// Get the button that opens the modal
var Addbtn = document.querySelector('.add-habit');

// Get the close button elemtn
var span = document.getElementsByClassName('close-button')[0];

//Get form element
var form = document.getElementById("addHabitForm");

//array of habits (storing all habits)
var habitArray = [];

//array of habits from DB
var habitArrayFromDB = [];

//allow display update, use this variable to prevent the screen of habits from being reloaded unnecessarily
var allowDisplayUpdate = true

// When the user clicks the button, open the modal 
Addbtn.onclick = function() {
  modal.style.display = 'block';
}

// When the user clicks X close the modal
span.onclick = function() {
  modal.style.display = 'none';
  form.reset(); //clear the form after user clicks x
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

//Load all user habits once they're loggedin
document.addEventListener('DOMContentLoaded', function() {
  if(allowDisplayUpdate){
  updateHabitDisplay();}
});

document.getElementById('addHabitForm').onsubmit = function(event) {
  // Get the values of all form fields
  var habitName = document.getElementById('habitName').value;
  var dueDate = document.getElementById('dueDate').value;
  var priority = document.getElementById('priority').value;
  var repeatCycle = document.getElementById('repeatCycle').value;
  
  // Add the habit to the habit array!
  //addHabit(habitName, dueDate, priority, repeatCycle);
  //add habit to db
  addHabitDB(habitName, dueDate, priority, repeatCycle);

  event.preventDefault();
  // send data to DB or something
  console.log('Form submitted');
  
  form.reset(); //clear the form after user clicks submit! 
  modal.style.display = 'none';
}

// Function for adding habits to list
function addHabit(habitName, dueDate, priority, repeatCycle) {//might delete (uses array)

  // Add habit data to the array
  habitArray.push({
    name: habitName,
    dueDate: dueDate,
    priority: priority,
    repeatCycle: repeatCycle,
    element: null
  });

  //update html display with newly added habit!
  updateHabitDisplay();

}

async function addHabitDB(habitName, dueDate, priority, repeatCycle){

  // Create habit object with **priority and repeat cycle** included in the description
  const habitData = {
    userId: sessionStorage.getItem('userId'),
    name: habitName,
    description: `Priority: ${priority}, Repeat Cycle: ${repeatCycle}`,
    dueDate: dueDate,
    completed: false, // Assuming new habits are initially not completed
    notifications: [] // Assuming no notifications initially
  };

  // Add habit data to the array
  habitArrayFromDB.push(habitData);

  // Send data to the backend
  const wasSuccessful = await sendHabitToBackend(habitData);

  // Call function to update HTML display
  //updateHabitDisplayDB();
  if(wasSuccessful){
    allowDisplayUpdate = true
    await updateHabitDisplay();}
  else{
    console.error('Failed to add the habit to the database :(');
  }
 



}

async function sendHabitToBackend(habitData){

  try {
    const response = await fetch('http://localhost:5000/api/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData)
    });

    if (!response.ok) {
        throw new Error('Failed to save habit to backend');
    }

    const savedHabit = await response.json();
    console.log('Habit saved:', savedHabit);
    return true;
} catch (error) {
    console.error('Error saving habit to backend:', error);
    return false;
}


}

//function to update the html display with addition of each new habit
async function updateHabitDisplay(){ 

  //fetch habits from database
  const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('No user ID found. Please Login or Create Account');
        alert("Please Login/Create Account before creating habits");
        return; // Early return if no user ID is stored
    }

    try {
        console.log("getting habits to update display")
        const response = await fetch(`http://localhost:5000/api/users/${userId}/habits`, {headers:{'Cache-Control': 'no-cache'}});
        if (!response.ok) {
            throw new Error('Failed to fetch habits');
        }
        const habits = await response.json();
        
        // Clear existing habits display
        const habitList = document.querySelector('.habit-list');
        habitList.innerHTML = '';

        // Display each habit
        habits.forEach(habit => {
            const habitElement = createHabitElement(habit);
            habitList.appendChild(habitElement);
        });

    } catch (error) {
        console.error('Error fetching habits:', error);
    }

  //clear previous display
  // var habitList = document.querySelector('.habit-list')
  // habitList.innerHTML = '' //clear inner html elements on display

  // // Add each habit in the array back to the display
  // habitArray.forEach(habit => {
  //   if (!habit.element) {
  //     habit.element = createHabitElement(habit);
  //   }
  //   habitList.appendChild(habit.element);
  // });

}

function displayHabitsfromArray(habits) {
  const habitList = document.querySelector('.habit-list');
  habitList.innerHTML = ''; // Clear current habits to refresh the list

  habits.forEach(habit => {
      const habitElement = createHabitElement(habit);
      habitList.appendChild(habitElement);
  });
}

function createHabitElement(habitData ){ //habitData is from database
  
  // Create a habit element
  var habitElement = document.createElement('div');
  habitElement.className = 'habit';

  // Create a checkbox for the habit element
  var checkBox = document.createElement('span');
  checkBox.className = 'habit-check';
  checkBox.textContent = '☐'; 
  habitElement.appendChild(checkBox);

  // Create a div for habit info and add habit name
  var habitInfo = document.createElement('div');
  habitInfo.className = 'habit-info';
  habitInfo.textContent = habitData.name; // Using habitData (from array)properties
  habitElement.appendChild(habitInfo);
  
  // Create a div for habit details
  var habitDetails = document.createElement('div');
  habitDetails.className = 'habit-details';

  // Add due date to habit details
  var dateElement = document.createElement('span');
  dateElement.textContent = 'Due: ' + habitData.dueDate + ','; // Using habitData (from array) properties
  habitDetails.appendChild(dateElement);

  // Extract and display priority and repeat cycle from the description
    // Assuming description format is "Priority: Low, Repeat Cycle: Weekly"
    var descriptionParts = habitData.description.split(', ');  // Split the description by commas
    descriptionParts.forEach(part => {
        var detailSpan = document.createElement('span');
        detailSpan.textContent = part.trim();  
        habitDetails.appendChild(detailSpan);
    });

  // Append habit details to habit element
  habitElement.appendChild(habitDetails);
  // This habitElement is now fully constructed and can be returned
  return habitElement;


}

//***FUNCTIONS FOR FILTERING HABITS***
//toggle dropdown menue for filter
function toggleFilterDropdown() {
  document.getElementById("filterDropdown").classList.toggle("show");
}

// Function for actual filtering by due date
  async function filterHabits(order) {
  console.log('Filtering habits:', order);

  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    alert("User ID is not available. Please log in.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}/habits?sort=${order}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sorted habits');
    }
    const sortedHabits = await response.json();
    habitArray = sortedHabits; // Update local habit array with the sorted data

    allowDisplayUpdate = false //make sure it doesn't reload the page (which would reset the filter)
    displayHabitsfromArray(habitArray);
    allowDisplayUpdate = true //set it back to true MIGHT DELETE IDK
  } catch (error) {
    console.error('Error fetching sorted habits:', error);
    alert('Failed to load sorted habits. Please try again.');
  }
}

