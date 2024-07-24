document.addEventListener("DOMContentLoaded", () => {
  const addEntryBtn = document.getElementById("addEntryBtn");
  const saveLogBtn = document.getElementById("saveLogBtn");
  const entriesContainer = document.getElementById("entriesContainer");
  const logDateInput = document.getElementById("logDate");

  let logs = JSON.parse(localStorage.getItem("logs")) || {};
  let currentEntries = [];

  const mealOrder = [
    "AM Snack",
    "Breakfast",
    "Lunch",
    "Afternoon Snack",
    "Dinner",
    "Evening Snack",
  ];

  const saveLogs = () => {
    localStorage.setItem("logs", JSON.stringify(logs));
  };

  const createEntryElement = (entry, index) => {
    const entryDiv = document.createElement("div");
    entryDiv.className = "entry";
    entryDiv.onclick = () => expandEntry(entryDiv);

    const summaryDiv = document.createElement("div");
    summaryDiv.className = "summary";

    const mealInfoDiv = document.createElement("div");
    mealInfoDiv.className = "meal-info";

    const mealSelect = document.createElement("select");
    mealSelect.className = "select-meal";
    [
      "AM Snack",
      "Breakfast",
      "Lunch",
      "Afternoon Snack",
      "Dinner",
      "Evening Snack",
    ].forEach((meal) => {
      const option = document.createElement("option");
      option.value = meal;
      option.textContent = meal;
      if (meal === entry.meal) option.selected = true;
      mealSelect.appendChild(option);
    });
    mealSelect.disabled = true;

    const foodSpan = document.createElement("span");
    foodSpan.textContent = entry.food || "What did you eat?";

    mealInfoDiv.appendChild(mealSelect);
    mealInfoDiv.appendChild(foodSpan);

    const ratingDiv = document.createElement("div");
    ratingDiv.className = "rating";
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.textContent = "★";
      if (i <= entry.rating) {
        star.classList.add("rated");
      }
      ratingDiv.appendChild(star);
    }

    summaryDiv.appendChild(mealInfoDiv);
    summaryDiv.appendChild(ratingDiv);

    const contentDiv = document.createElement("div");
    contentDiv.className = "content";

    const foodInput = document.createElement("input");
    foodInput.type = "text";
    foodInput.value = entry.food;
    foodInput.placeholder = "What did you eat?";

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
      if (timerCheckbox.checked) {
        timerControlsDiv.style.display = "block";
      } else {
        timerControlsDiv.style.display = "none";
      }
    };

    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    const commentTextarea = document.createElement("textarea");
    commentTextarea.maxLength = 500;
    commentTextarea.placeholder = "How did it make you feel?";
    commentTextarea.value = entry.comment;
    commentDiv.appendChild(commentTextarea);

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

    const saveBtn = document.createElement("button");
    saveBtn.className = "save-btn";
    saveBtn.textContent = "Save and Exit";
    saveBtn.onclick = (event) => {
      event.stopPropagation();
      saveEntry(entryDiv, index);
    };

    contentDiv.appendChild(foodInput);
    contentDiv.appendChild(timerCheckbox);
    contentDiv.appendChild(timerLabel);
    contentDiv.appendChild(timerControlsDiv);
    contentDiv.appendChild(commentDiv);
    contentDiv.appendChild(saveBtn);

    entryDiv.appendChild(summaryDiv);
    entryDiv.appendChild(contentDiv);
    entryDiv.appendChild(closeBtn);

    entriesContainer.appendChild(entryDiv);

    mealSelect.onchange = () => updateMeal(index, mealSelect.value);
    foodInput.oninput = () => updateFood(index, foodInput.value);
    commentTextarea.oninput = () => updateComment(index, commentTextarea.value);
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
    entryDiv.onclick = null;
  };

  const collapseEntry = (entryDiv) => {
    entryDiv.classList.remove("expanded");
    entryDiv.querySelector(".content").style.display = "none";
    entryDiv.querySelector(".select-meal").disabled = true;
    entryDiv.querySelector(".close-btn").style.display = "none";
    entryDiv.onclick = () => expandEntry(entryDiv);
  };

  const updateMeal = (index, meal) => {
    currentEntries[index].meal = meal;
    renderEntries();
  };

  const updateFood = (index, food) => {
    currentEntries[index].food = food;
  };

  const startTimer = (entryDiv, index, duration) => {
    const timer = document.createElement("span");
    timer.className = "timer";
    entryDiv.appendChild(timer);
    let timeLeft = duration * 60;
    const audio = new Audio("path/to/alarm-sound.mp3"); // replace with your sound file path
    const countdown = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(countdown);
        timer.textContent = "Time's up!";
        audio.play();
      } else {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timer.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
      }
    }, 1000);

    const stopBtn = document.createElement("button");
    stopBtn.textContent = "Stop Sound";
    stopBtn.onclick = () => {
      audio.pause();
      audio.currentTime = 0;
    };

    entryDiv.appendChild(stopBtn);

    document.addEventListener("mousemove", () => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  const rateEntry = (index, rating) => {
    currentEntries[index].rating = rating;
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

    currentEntries[index].food = foodInput.value;
    currentEntries[index].timer = timerCheckbox.checked
      ? timerRange.value
      : null;
    currentEntries[index].comment = commentTextarea.value;

    collapseEntry(entryDiv);
    saveLogs();
  };

  const removeEntry = (index) => {
    currentEntries.splice(index, 1);
    renderEntries();
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
  };

  addEntryBtn.onclick = () => {
    const newEntry = { meal: "Breakfast", food: "", rating: 0, comment: "" };
    currentEntries.push(newEntry);
    renderEntries();
  };

  saveLogBtn.onclick = saveLog;

  logDateInput.onchange = () => {
    const selectedDate = logDateInput.value;
    currentEntries = logs[selectedDate] || [];
    renderEntries();
  };

  renderEntries();
});
