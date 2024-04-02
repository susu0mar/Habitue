

//SCRIPT TO OPEN & CLOSE ADD HABIT MODAL 

// Get the modal
var modal = document.getElementById('addHabitModal');

// Get the button that opens the modal
var Addbtn = document.querySelector('.add-habit');

// Get the close button elemtn
var span = document.getElementsByClassName('close-button')[0];

//Get form element
var form = document.getElementById("addHabitForm");

// When the user clicks the button, open the modal 
Addbtn.onclick = function() {
  modal.style.display = 'block';
}

// When the user clicks X close the modal
span.onclick = function() {
  modal.style.display = 'none';
  form.reset(); //clear the form after user clicks x
}

//MIGHT DELETE THIS ONE IDK
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

document.getElementById('addHabitForm').onsubmit = function(event) {
  // Get the values of all form fields
  var habitName = document.getElementById('habitName').value;
  var dueDate = document.getElementById('dueDate').value;
  var priority = document.getElementById('priority').value;
  var repeatCycle = document.getElementById('repeatCycle').value;
  
  // Add the habit to the habit list 
  addHabit(habitName, dueDate, priority, repeatCycle);

  event.preventDefault();
  // send data to DB or something
  console.log('Form submitted');
  
  form.reset(); //clear the form after user clicks submit! 
  modal.style.display = 'none';
}

// Function for adding habits to list
function addHabit(habitName, dueDate, priority, repeatCycle) {
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
  habitInfo.textContent = habitName;
  habitElement.appendChild(habitInfo);
  
  // Create a div for habit details
  var habitDetails = document.createElement('div');
  habitDetails.className = 'habit-details';

  // Add due date to habit details
  var dateElement = document.createElement('span');
  dateElement.textContent = 'Due: ' + dueDate + ',';
  habitDetails.appendChild(dateElement);

  // Add priority to habit details
  var priorityElement = document.createElement('span');
  priorityElement.textContent = ' Priority: ' + priority + ',';
  habitDetails.appendChild(priorityElement);

  // Add repeat to habit details
  var repeatElement = document.createElement('span');
  repeatElement.textContent = ' Repeat: ' + repeatCycle;
  habitDetails.appendChild(repeatElement);

  // Append habit details to habit element
  habitElement.appendChild(habitDetails);

  // Append habit element to habit list
  var habitList = document.querySelector('.habit-list');
  habitList.appendChild(habitElement);
}



