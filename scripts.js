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

    const topRow = document.createElement("div");
    topRow.className = "top-row";

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

    const foodInput = document.createElement("input");
    foodInput.type = "text";
    foodInput.value = entry.food;
    foodInput.placeholder = "What did you eat?";

    topRow.appendChild(mealSelect);
    topRow.appendChild(foodInput);

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

    const ratingCommentRemoveDiv = document.createElement("div");
    ratingCommentRemoveDiv.className = "rating-comment-remove";

    const ratingDiv = document.createElement("div");
    ratingDiv.className = "rating";
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.textContent = "★";
      if (i <= entry.rating) {
        star.classList.add("rated");
      }
      star.onclick = () => rateEntry(index, i);
      ratingDiv.appendChild(star);
    }

    const commentBtn = document.createElement("button");
    commentBtn.textContent = "Comment";
    commentBtn.onclick = () => toggleComment(entryDiv);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        `;
    removeBtn.onclick = () => removeEntry(index);

    ratingCommentRemoveDiv.appendChild(ratingDiv);
    ratingCommentRemoveDiv.appendChild(commentBtn);
    ratingCommentRemoveDiv.appendChild(removeBtn);

    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    const commentTextarea = document.createElement("textarea");
    commentTextarea.maxLength = 500;
    commentTextarea.placeholder = "How did it make you feel?";
    commentTextarea.value = entry.comment;
    commentDiv.appendChild(commentTextarea);

    entryDiv.appendChild(topRow);
    entryDiv.appendChild(timerCheckbox);
    entryDiv.appendChild(timerLabel);
    entryDiv.appendChild(timerControlsDiv);
    entryDiv.appendChild(ratingCommentRemoveDiv);
    entryDiv.appendChild(commentDiv);

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

  const toggleComment = (entryDiv) => {
    const commentDiv = entryDiv.querySelector(".comment");
    commentDiv.style.display =
      commentDiv.style.display === "block" ? "none" : "block";
  };

  const updateComment = (index, comment) => {
    currentEntries[index].comment = comment;
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
