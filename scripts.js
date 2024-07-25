document.addEventListener("DOMContentLoaded", () => {
  const addEntryBtn = document.getElementById("addEntryBtn");
  const saveLogBtn = document.getElementById("saveLogBtn");
  const entriesContainer = document.getElementById("entriesContainer");
  const logDateInput = document.getElementById("logDate");

  let logs = JSON.parse(localStorage.getItem("logs")) || {};
  let currentEntries = [];

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

    const foodSpan = document.createElement("span");
    foodSpan.textContent = entry.food || "What did you eat?";
    foodSpan.className = "entry-title";
    foodSpan.onclick = (event) => {
      event.stopPropagation();
      toggleFoodInput(entryDiv, true);
    };

    const foodInput = document.createElement("input");
    foodInput.type = "text";
    foodInput.value = entry.food;
    foodInput.placeholder = "What did you eat?";
    foodInput.className = "food-input";
    foodInput.style.display = "none";

    foodInput.onblur = () => {
      entry.food = foodInput.value;
      foodSpan.textContent = entry.food || "What did you eat?";
      toggleFoodInput(entryDiv, false);
    };

    mealInfoDiv.appendChild(mealSelect);
    mealInfoDiv.appendChild(foodSpan);
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

    if (entry.meal === "Journal") {
      const titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.value = entry.title || "";
      titleInput.placeholder = "Title";
      titleInput.className = "journal-title";
      titleInput.oninput = () => {
        entry.title = titleInput.value;
      };

      const journalTextarea = document.createElement("textarea");
      journalTextarea.maxLength = 1000;
      journalTextarea.placeholder = "Write your journal entry...";
      journalTextarea.value = entry.text || "";
      journalTextarea.className = "journal-input";
      journalTextarea.oninput = () => {
        entry.text = journalTextarea.value;
      };

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

      contentDiv.appendChild(titleInput);
      contentDiv.appendChild(journalTextarea);
      contentDiv.appendChild(saveBtn);
      contentDiv.appendChild(deleteBtn);
    } else {
      const timerCheckbox = document.createElement("input");
      timerCheckbox.type = "checkbox";
      timerCheckbox.id = `setTimer-${index}`;
      timerCheckbox.className = "set-timer";

      const timerLabel = document.createElement("label");
      timerLabel.htmlFor = `setTimer-${index}`;
      timerLabel.textContent = "Set Timer?";

      const timerControlsDiv = document.createElement("div");
      timerControlsDiv.className = "timer-controls";

      const timerRange = document.createElement("input");
      timerRange.type = "range";
      timerRange.min = "5";
      timerRange.max = "60";
      timerRange.step = "5";
      timerRange.value = "30";
      timerRange.className = "timer-range";

      const timerRangeLabel = document.createElement("label");
      timerRangeLabel.textContent = `Timer: ${timerRange.value} mins`;

      timerRange.oninput = () => {
        timerRangeLabel.textContent = `Timer: ${timerRange.value} mins`;
      };

      const timerBtn = document.createElement("button");
      timerBtn.textContent = "Start Timer";
      timerBtn.onclick = () => startTimer(entryDiv, index, timerRange.value);

      timerControlsDiv.appendChild(timerRangeLabel);
      timerControlsDiv.appendChild(timerRange);
      timerControlsDiv.appendChild(timerBtn);

      timerCheckbox.onchange = () => {
        timerControlsDiv.style.display = timerCheckbox.checked
          ? "block"
          : "none";
      };

      const commentDiv = document.createElement("div");
      commentDiv.className = "comment";
      const commentTextarea = document.createElement("textarea");
      commentTextarea.maxLength = 500;
      commentTextarea.placeholder = "How did it make you feel?";
      commentTextarea.value = entry.comment;
      commentTextarea.oninput = () =>
        updateComment(index, commentTextarea.value);
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

      contentDiv.appendChild(timerCheckbox);
      contentDiv.appendChild(timerLabel);
      contentDiv.appendChild(timerControlsDiv);
      contentDiv.appendChild(commentDiv);
      contentDiv.appendChild(saveBtn);
      contentDiv.appendChild(deleteBtn);
    }

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

    entriesContainer.appendChild(entryDiv); // New entries are initially added to the bottom

    mealSelect.onchange = () => {
      updateMeal(index, mealSelect.value);
      renderEntries();
    };
  };

  const toggleFoodInput = (entryDiv, show) => {
    const foodSpan = entryDiv.querySelector(".entry-title");
    const foodInput = entryDiv.querySelector(".food-input");
    if (show) {
      foodSpan.style.display = "none";
      foodInput.style.display = "inline";
      foodInput.focus();
    } else {
      foodSpan.style.display = "inline";
      foodInput.style.display = "none";
    }
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

  const updateComment = (index, comment) => {
    currentEntries[index].comment = comment;
  };

  const saveEntry = (entryDiv, index) => {
    const foodInput = entryDiv.querySelector('input[type="text"]');
    const timerCheckbox = entryDiv.querySelector(".set-timer");
    const timerRange = entryDiv.querySelector(".timer-range");
    const commentTextarea = entryDiv.querySelector(".comment textarea");

    currentEntries[index].food = foodInput ? foodInput.value : "";
    currentEntries[index].timer = timerCheckbox
      ? timerCheckbox.checked
        ? timerRange.value
        : null
      : null;
    currentEntries[index].comment = commentTextarea
      ? commentTextarea.value
      : "";
    currentEntries[index].title = entryDiv.querySelector(".journal-title")
      ? entryDiv.querySelector(".journal-title").value
      : "";
    currentEntries[index].text = entryDiv.querySelector(".journal-input")
      ? entryDiv.querySelector(".journal-input").value
      : "";

    collapseEntry(entryDiv);
    renderEntries();
    saveLogs();
    updateCalendar();
  };

  const removeEntry = (index) => {
    currentEntries.splice(index, 1);
    renderEntries();
    saveLogs();
    updateCalendar();
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
    const dateInput = logDateInput;
    dateInput.querySelectorAll("option").forEach((option) => {
      if (datesWithEntries.includes(option.value)) {
        option.style.backgroundColor = "lightgreen";
      } else {
        option.style.backgroundColor = "";
      }
    });
  };

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
