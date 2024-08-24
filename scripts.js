document.addEventListener("DOMContentLoaded", () => {
  const addEntryBtn = document.getElementById("addEntryBtn");
  const saveLogBtn = document.getElementById("saveLogBtn");
  const entriesContainer = document.getElementById("entriesContainer");
  const logDateInput = document.getElementById("logDate");
  const customDatePicker = document.getElementById("customDatePicker");
  const percentageDaysGreenContainer = document.querySelector(".flex-child2");
  const daysMissedContainer = document.querySelector(".flex-child1");
  const prevMonthBtn = document.getElementById("prevMonthBtn");
  const nextMonthBtn = document.getElementById("nextMonthBtn");
  const monthYearDisplay = document.getElementById("monthYearDisplay");

  let logs = JSON.parse(localStorage.getItem("logs")) || {};
  let currentEntries = [];
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedDateCell = null; // Track the selected date cell

  const mealOrder = [
    "Breakfast",
    "AM Snack",
    "Lunch",
    "Afternoon Snack",
    "Dinner",
    "Evening Snack",
    "Journal",
  ];

  const saveLogs = () => {
    localStorage.setItem("logs", JSON.stringify(logs));
  };

  const createEntryElement = (entry, index) => {
    const entryDiv = document.createElement("div");
    entryDiv.className = `entry ${entry.meal === "Journal" ? "journal" : ""}`;
    entryDiv.onclick = () => expandEntry(entryDiv);

    updateEntryColor(entryDiv, entry.rating, entry.meal);

    const summaryDiv = document.createElement("div");
    summaryDiv.className = "summary";

    const mealInfoDiv = document.createElement("div");
    mealInfoDiv.className = "meal-info";

    const mealSelect = document.createElement("select");
    mealSelect.className = "select-meal";
    [
      "Breakfast",
      "AM Snack",
      "Lunch",
      "Afternoon Snack",
      "Dinner",
      "Evening Snack",
      "Journal",
    ].forEach((meal) => {
      const option = document.createElement("option");
      option.value = meal;
      option.textContent = meal;
      if (meal === entry.meal) option.selected = true;
      mealSelect.appendChild(option);
    });
    mealSelect.disabled = false;

    const foodInput = document.createElement("input");
    foodInput.type = "text";
    foodInput.value = entry.food || "";
    foodInput.placeholder = "What did you eat?";
    foodInput.className = "food-input";

    foodInput.oninput = () => {
      entry.food = foodInput.value;
    };

    mealInfoDiv.appendChild(mealSelect);
    mealInfoDiv.appendChild(foodInput);

    const ratingDiv = document.createElement("div");
    ratingDiv.className = "rating";
    if (entry.meal !== "Journal") {
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.textContent = "★";
        if (i <= entry.rating) {
          star.classList.add("rated");
        }
        star.onclick = (event) => {
          event.stopPropagation();
          rateEntry(index, i, entryDiv, entry.meal);
        };
        ratingDiv.appendChild(star);
      }
    }

    summaryDiv.appendChild(mealInfoDiv);
    summaryDiv.appendChild(ratingDiv);

    const contentDiv = document.createElement("div");
    contentDiv.className = "content";

    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    const commentTextarea = document.createElement("textarea");
    commentTextarea.maxLength = 500;
    commentTextarea.placeholder = "How did it make you feel?";
    commentTextarea.value = entry.comment || "";
    commentTextarea.oninput = () => {
      entry.comment = commentTextarea.value;
    };
    commentDiv.appendChild(commentTextarea);

    const saveBtn = document.createElement("button");
    saveBtn.className = "save-btn";
    saveBtn.textContent = "Save and Exit";
    saveBtn.onclick = (event) => {
      event.stopPropagation();
      saveEntry(entryDiv, index);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Remove";
    deleteBtn.onclick = (event) => {
      event.stopPropagation();
      removeEntry(index);
    };

    contentDiv.appendChild(commentDiv);
    contentDiv.appendChild(saveBtn);
    contentDiv.appendChild(deleteBtn);

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        `;
    closeBtn.onclick = (event) => {
      event.stopPropagation();
      collapseEntry(entryDiv);
    };

    entryDiv.appendChild(summaryDiv);
    entryDiv.appendChild(contentDiv);
    entryDiv.appendChild(closeBtn);

    entriesContainer.appendChild(entryDiv);

    mealSelect.onchange = () => {
      entry.meal = mealSelect.value;
      renderEntries();
    };
  };

  const renderEntries = () => {
    entriesContainer.innerHTML = "";
    currentEntries.sort(
      (a, b) => mealOrder.indexOf(a.meal) - mealOrder.indexOf(b.meal)
    );
    currentEntries.forEach((entry, index) => createEntryElement(entry, index));
  };

  const expandEntry = (entryDiv) => {
    entryDiv.classList.add("expanded");
    entryDiv.querySelector(".content").style.display = "block";
    entryDiv.querySelector(".select-meal").disabled = false;
    entryDiv.querySelector(".close-btn").style.display = "block";
    entryDiv.classList.remove("journal");
    entryDiv.onclick = null;
  };

  const collapseEntry = (entryDiv) => {
    entryDiv.classList.remove("expanded");
    entryDiv.querySelector(".content").style.display = "none";
    entryDiv.querySelector(".select-meal").disabled = true;
    entryDiv.querySelector(".close-btn").style.display = "none";
    if (
      currentEntries[Array.from(entriesContainer.children).indexOf(entryDiv)]
        .meal === "Journal"
    ) {
      entryDiv.classList.add("journal");
    }
    entryDiv.onclick = () => expandEntry(entryDiv);
  };

  const updateEntryColor = (entryDiv, rating, meal) => {
    entryDiv.classList.remove(
      "low-rating",
      "medium-rating",
      "high-rating",
      "journal"
    );
    if (meal === "Journal") {
      entryDiv.classList.add("journal");
    } else if (rating === 0) {
      entryDiv.style.backgroundColor = "#f0f0f0"; // Grey for no rating
    } else if (rating <= 2) {
      entryDiv.classList.add("low-rating");
    } else if (rating <= 4) {
      entryDiv.classList.add("medium-rating");
    } else if (rating === 5) {
      entryDiv.classList.add("high-rating");
    }
  };

  const rateEntry = (index, rating, entryDiv, meal) => {
    currentEntries[index].rating = rating;
    updateEntryColor(entryDiv, rating, meal);
    renderEntries();
  };

  const saveEntry = (entryDiv, index) => {
    currentEntries[index].food = entryDiv.querySelector(".food-input").value;
    currentEntries[index].comment =
      entryDiv.querySelector(".comment textarea").value;
    collapseEntry(entryDiv);
    renderEntries();
    saveLogs();
  };

  const removeEntry = (index) => {
    currentEntries.splice(index, 1);
    renderEntries();
    saveLogs();
  };

  const saveLog = () => {
    const selectedDate = logDateInput.value;
    if (!selectedDate) {
      alert("Please select a date before saving the log.");
      return;
    }
    logs[selectedDate] = currentEntries;
    saveLogs();
    currentEntries = [];
    renderEntries();
    updateCalendar();
  };

  const updateCalendar = () => {
    const datesWithEntries = Object.keys(logs);
    customDatePicker.innerHTML = ""; // Clear previous calendar
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let greenDaysCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const dateCell = document.createElement("div");
      dateCell.className = "date-cell";
      if (datesWithEntries.includes(dateStr)) {
        dateCell.classList.add("highlighted");
        greenDaysCount++;
      }
      dateCell.textContent = day;
      dateCell.onclick = () => {
        if (selectedDateCell) {
          selectedDateCell.classList.remove("selected"); // Remove highlight from the previous selection
        }
        selectedDateCell = dateCell;
        dateCell.classList.add("selected"); // Highlight the new selection
        logDateInput.value = dateStr;
        logDateInput.dispatchEvent(new Event("change"));
      };
      customDatePicker.appendChild(dateCell);
    }

    const missedDaysCount = daysInMonth - greenDaysCount;
    const percentageGreen = ((greenDaysCount / daysInMonth) * 100).toFixed(2);

    daysMissedContainer.textContent = `Days Missed: ${missedDaysCount}`;
    percentageDaysGreenContainer.textContent = `% Days Green: ${greenDaysCount}/${daysInMonth} (${percentageGreen}%)`;

    // Update the month and year display
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  };

  const changeMonth = (direction) => {
    if (direction === "next") {
      if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
      } else {
        currentMonth++;
      }
    } else if (direction === "prev") {
      if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
      } else {
        currentMonth--;
      }
    }
    updateCalendar();
  };

  prevMonthBtn.onclick = () => changeMonth("prev");
  nextMonthBtn.onclick = () => changeMonth("next");

  addEntryBtn.onclick = () => {
    const newEntry = {
      meal: "Uncategorized",
      food: "",
      rating: 0,
      comment: "",
    };
    currentEntries.push(newEntry);
    createEntryElement(newEntry, currentEntries.length - 1);
  };

  saveLogBtn.onclick = saveLog;

  logDateInput.onchange = () => {
    const selectedDate = logDateInput.value;
    currentEntries = logs[selectedDate] || [];
    renderEntries();
  };

  updateCalendar();
  renderEntries();
});
