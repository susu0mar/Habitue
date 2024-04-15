// Javascript file for manage habits page - viewing and deleting habits

document.addEventListener('DOMContentLoaded', function() {
    updateHabitDisplay();
  });
  
  // Load habit list 
  async function updateHabitDisplay() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found. Please Login or Create Account');
      alert("Please Login/Create Account before managing habits");
      return;
    }
  
    try {
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
  }
  
  function createHabitElement(habitData) {
    // Create a habit element
    var habitElement = document.createElement('div');
    habitElement.className = 'habit';
  
    // Create a div for habit info and add habit name
    var habitInfo = document.createElement('div');
    habitInfo.className = 'habit-info';
    habitInfo.textContent = habitData.name; // Using habitData properties
    habitElement.appendChild(habitInfo);
    
    // Create a div for habit details
    var habitDetails = document.createElement('div');
    habitDetails.className = 'habit-details';
  
    // Add due date to habit details
    var dateElement = document.createElement('span');
    dateElement.textContent = 'Due: ' + habitData.dueDate + ','; // Using habitData properties
    habitDetails.appendChild(dateElement);
  
    // Add trash icon for deleting habit
    var trashIcon = document.createElement('span');
    trashIcon.className = 'trash-icon';
    trashIcon.innerHTML = '🗑️'; 
    habitDetails.appendChild(trashIcon);
  
    // Add event listener for deleting habit
    trashIcon.addEventListener('click', function(event) {
      const habitName = habitData.name; 

      // Ask user to confirm that they want to delete the habit before calling the remove habit function
      const isConfirmed = confirm(`Are you sure you want to delete the habit "${habitName}"?`);
      if (isConfirmed) {
        removeHabitDB(habitName);
      }
    });
  
    // Append habit details to habit element
    habitElement.appendChild(habitDetails);
  
    return habitElement;
  }
  
  // Remove selected habit from list and update database
  async function removeHabitDB(habitName) {
    const userId = sessionStorage.getItem('userId');
    const response = await fetch(`http://localhost:5000/api/users/${userId}/habits?name=${habitName}`, {
      method: 'DELETE'
    });
  
    if (response.ok) {
      console.log(`Habit '${habitName}' removed from database`);
      // Refresh the habit display after deletion
      updateHabitDisplay();
    } else {
      console.error('Error deleting habit from database');
      alert('Failed to delete habit. Please try again.');
    }
  }
  