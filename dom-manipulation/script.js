const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated API URL

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Success" },
];

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to send new quotes to the simulated server
async function sendQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quote),
    });

    const data = await response.json();
    console.log("Quote successfully sent to server:", data);
  } catch (error) {
    console.error("Failed to send quote to server:", error);
  }
}

// Function to create a new quote
function createAddQuoteForm() {
  const newQuoteText = document.getElementById("newQuoteText").value;
  const newQuoteCategory = document.getElementById("newQuoteCategory").value;

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };

    // Add to local storage
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    alert("New quote added!");

    // Send to simulated server
    sendQuoteToServer(newQuote);

    // Clear input fields
    document.getElementById("newQuoteText").value = '';
    document.getElementById("newQuoteCategory").value = '';
  } else {
    alert("Please fill out both fields.");
  }
}

// Function to fetch new quotes from a simulated server
async function fetchQuotesFromServer() {
  try {
    console.log("Fetching latest quotes from server...");
    
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    const newQuotes = serverQuotes.slice(0, 5).map(item => ({
      text: item.title,  
      category: "General"
    }));

    resolveConflicts(newQuotes);
  } catch (error) {
    console.error("Failed to fetch quotes:", error);
  }
}

// Function to resolve conflicts (server data takes precedence)
function resolveConflicts(serverQuotes) {
  let conflictDetected = false;

  serverQuotes.forEach(serverQuote => {
    const existingQuoteIndex = quotes.findIndex(q => q.text === serverQuote.text);

    if (existingQuoteIndex === -1) {
      quotes.push(serverQuote);
    } else {
      if (quotes[existingQuoteIndex].category !== serverQuote.category) {
        quotes[existingQuoteIndex] = serverQuote;
        conflictDetected = true;
      }
    }
  });

  saveQuotes();
  populateCategories();
  filterQuotes();

  if (conflictDetected) {
    alert("Some conflicts were detected and resolved automatically. Server data was prioritized.");
  }
}

// Function to start auto-sync
function startAutoSync() {
  setInterval(fetchQuotesFromServer, 30000);
}

// Function to display a random quote from the selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes available.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p><em>- ${randomQuote.category}</em></p>
  `;

  localStorage.setItem("lastSelectedCategory", selectedCategory);
}

// Function to populate categories dynamically
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(quote => quote.category))];
  const categoryFilter = document.getElementById("categoryFilter");

  categoryFilter.innerHTML = '';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categoryFilter.appendChild(option);
  });
}

// Function to manually trigger a sync
function syncQuotes() {
  fetchQuotesFromServer();
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", filterQuotes);
document.getElementById("addQuoteButton").addEventListener("click", createAddQuoteForm);
document.getElementById("syncButton").addEventListener("click", syncQuotes);

// Initialize the application
window.onload = function() {
  populateCategories();
  filterQuotes();
  startAutoSync();
};
