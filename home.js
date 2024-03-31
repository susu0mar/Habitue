

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

// TODO: Handling form submission
document.getElementById('addHabitForm').onsubmit = function(event) {
  event.preventDefault();
  // send data to DB or something
  console.log('Form submitted');
  
  //TODO: Also need to be able to add newly created habit to home screen!!!
  
  form.reset(); //clear the form after user clicks submit! 
  modal.style.display = 'none';
}
