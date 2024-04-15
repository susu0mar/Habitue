
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

// Load user habits when 'manage habits' tab is clicked
document.getElementById('manageHabitsPage').addEventListener('click', function(event) {
  updateHabitDisplay();
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

  // Get all habit-check buttons after they have been added to the DOM
  var habitCheckButtons = document.querySelectorAll('.habit-check');

  // Add event listeners to habit-check buttons
  habitCheckButtons.forEach(function (button) {
    // Toggle 'checked' if the button is clicked
    // If the button is already 'checked' and clicked again, then its not 'checked' 
    button.addEventListener('click', async function () {
      button.classList.toggle('checked');
      const habitId = button.parentElement.dataset.habitId;
      const completed = button.classList.contains('checked');

      try {
        // Send a PUT request to update habit completion status
        const response = await fetch(`http://localhost:5000/api/habits/${habitId}/completed`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed }) 
        });
        
        if (!response.ok) {
            throw new Error('Failed to update habit completion status');
        }

    } catch (error) {
        console.error('Error updating habit completion status:', error);
    }
      
      // Play confetti animation if the habit is checked off
      if (completed) {
        confettiAnimation();
    }
    });
  });
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

  // If on the manage habits page, add trash bin icon for each habit
  if (window.location.pathname === '/manage_habits.html') {
    var trashIcon = document.createElement('span');
    trashIcon.className = 'trash-icon';
    trashIcon.innerHTML = '🗑️'; 
    habitElement.appendChild(trashIcon);

    // Add event listener for this specific trash icon
    trashIcon.addEventListener('click', function(event) {
      // Get the habit name for the habit that needs to be deleted
      const habitElement = event.target.parentElement; 
      const habitName = habitElement.querySelector('.habit-name').textContent; 

      // Display confirmation popup
      const isConfirmed = confirm(`Are you sure you want to delete the habit "${habitName}"?`);

      // If the user confirms deletion, remove the habit
      if (isConfirmed) {
        removeHabitDB(habitName);
      }
    });
}

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


async function removeHabitDB(habitName) {
  // Send request to server to delete habit from the database
  const userId = sessionStorage.getItem('userId');
  const response = await fetch(`http://localhost:5000/api/users/${userId}/habits?name=${habitName}`, {
      method: 'DELETE'
  });

  if (response.ok) {
      console.log(`Habit '${habitName}' removed from database`);

      // Remove habit from the HTML display
      const habitElements = document.querySelectorAll('.habit-list .habit-info');
      habitElements.forEach(habitElement => {
          if (habitElement.textContent === habitName) {
              habitElement.parentElement.remove();
          }
      });
  } else {
      console.error('Error deleting habit from database');
  }
}

// Confetti animation code from Codepen.io 
function confettiAnimation() {
  // Globals
  var random = Math.random
      , cos = Math.cos
      , sin = Math.sin
      , PI = Math.PI
      , PI2 = PI * 2
      , confetti = [];

  var particles = 10
      , spread = 40
      , sizeMin = 3
      , sizeMax = 12 - sizeMin
      , eccentricity = 10
      , deviation = 100
      , dxThetaMin = -.1
      , dxThetaMax = -dxThetaMin - dxThetaMin
      , dyMin = .13
      , dyMax = .18
      , dThetaMin = .4
      , dThetaMax = .7 - dThetaMin;

  var colorThemes = [
      function () {
          return color(200 * random() | 0, 200 * random() | 0, 200 * random() | 0);
      }, function () {
          var black = 200 * random() | 0; return color(200, black, black);
      }, function () {
          var black = 200 * random() | 0; return color(black, 200, black);
      }, function () {
          var black = 200 * random() | 0; return color(black, black, 200);
      }, function () {
          return color(200, 100, 200 * random() | 0);
      }, function () {
          return color(200 * random() | 0, 200, 200);
      }, function () {
          var black = 256 * random() | 0; return color(black, black, black);
      }, function () {
          return colorThemes[random() < .5 ? 1 : 2]();
      }, function () {
          return colorThemes[random() < .5 ? 3 : 5]();
      }, function () {
          return colorThemes[random() < .5 ? 2 : 4]();
      }
  ];
  function color(r, g, b) {
      return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // Cosine interpolation
  function interpolation(a, b, t) {
      return (1 - cos(PI * t)) / 2 * (b - a) + a;
  }

  // Create a 1D Maximal Poisson Disc over [0, 1]
  var radius = 1 / eccentricity, radius2 = radius + radius;
  function createPoisson() {
      // domain is the set of points which are still available to pick from
      // D = union{ [d_i, d_i+1] | i is even }
      var domain = [radius, 1 - radius], measure = 1 - radius2, spline = [0, 1];
      while (measure) {
          var dart = measure * random(), i, l, interval, a, b, c, d;

          // Find where dart lies
          for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
              a = domain[i], b = domain[i + 1], interval = b - a;
              if (dart < measure + interval) {
                  spline.push(dart += a - measure);
                  break;
              }
              measure += interval;
          }
          c = dart - radius, d = dart + radius;

          // Update the domain
          for (i = domain.length - 1; i > 0; i -= 2) {
              l = i - 1, a = domain[l], b = domain[i];
              // c---d          c---d  Do nothing
              //   c-----d  c-----d    Move interior
              //   c--------------d    Delete interval
              //         c--d          Split interval
              //       a------b
              if (a >= c && a < d)
                  if (b > d) domain[l] = d; // Move interior (Left case)
                  else domain.splice(l, 2); // Delete interval
              else if (a < c && b > c)
                  if (b <= d) domain[i] = c; // Move interior (Right case)
                  else domain.splice(i, 0, c, d); // Split interval
          }

          // Re-measure the domain
          for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
              measure += domain[i + 1] - domain[i];
      }

      return spline.sort();
  }

  // Create the overarching container
  var container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '0';
  container.style.overflow = 'visible';
  container.style.zIndex = '9999';

  // Confetto constructor
  function Confetto(theme) {
      this.frame = 0;
      this.outer = document.createElement('div');
      this.inner = document.createElement('div');
      this.outer.appendChild(this.inner);

      var outerStyle = this.outer.style, innerStyle = this.inner.style;
      outerStyle.position = 'absolute';
      outerStyle.width = (sizeMin + sizeMax * random()) + 'px';
      outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
      innerStyle.width = '100%';
      innerStyle.height = '100%';
      innerStyle.backgroundColor = theme();

      outerStyle.perspective = '50px';
      outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
      this.axis = 'rotate3D(' +
          cos(360 * random()) + ',' +
          cos(360 * random()) + ',0,';
      this.theta = 360 * random();
      this.dTheta = dThetaMin + dThetaMax * random();
      innerStyle.transform = this.axis + this.theta + 'deg)';

      this.x = window.innerWidth * random();
      this.y = -deviation;
      this.dx = sin(dxThetaMin + dxThetaMax * random());
      this.dy = dyMin + dyMax * random();
      outerStyle.left = this.x + 'px';
      outerStyle.top = this.y + 'px';

      // Create the periodic spline
      this.splineX = createPoisson();
      this.splineY = [];
      for (var i = 1, l = this.splineX.length - 1; i < l; ++i)
          this.splineY[i] = deviation * random();
      this.splineY[0] = this.splineY[l] = deviation * random();

      this.update = function (height, delta) {
          this.frame += delta;
          this.x += this.dx * delta;
          this.y += this.dy * delta;
          this.theta += this.dTheta * delta;

          // Compute spline and convert to polar
          var phi = this.frame % 7777 / 7777, i = 0, j = 1;
          while (phi >= this.splineX[j]) i = j++;
          var rho = interpolation(
              this.splineY[i],
              this.splineY[j],
              (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
          );
          phi *= PI2;

          outerStyle.left = this.x + rho * cos(phi) + 'px';
          outerStyle.top = this.y + rho * sin(phi) + 'px';
          innerStyle.transform = this.axis + this.theta + 'deg)';
          return this.y > height + deviation;
      };
  }

  function poof() {
      // Append the container
      document.body.appendChild(container);

      // Add confetti
      var theme = colorThemes[0];
      for (var i = 0; i < particles; ++i) {
          var confetto = new Confetto(theme);
          confetti.push(confetto);
          container.appendChild(confetto.outer);
      }

      // Start the loop
      var prev = undefined;
      (function loop(timestamp) {
          var delta = prev ? timestamp - prev : 0;
          prev = timestamp;
          var height = window.innerHeight;

          for (var i = confetti.length - 1; i >= 0; --i) {
              if (confetti[i].update(height, delta)) {
                  container.removeChild(confetti[i].outer);
                  confetti.splice(i, 1);
              }
          }

          if (confetti.length)
              return requestAnimationFrame(loop);

          // Cleanup
          document.body.removeChild(container);
      })();
  }

  poof();
}