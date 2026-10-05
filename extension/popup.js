// ⚠️ UPDATE THIS before publishing to Chrome Web Store
const EXT_API = "https://YOUR_BACKEND_URL/api/extension";

document.addEventListener("DOMContentLoaded", () => {
  const tabUrl = document.getElementById("tab-url");
  const tabText = document.getElementById("tab-text");
  const contentUrl = document.getElementById("content-url");
  const contentText = document.getElementById("content-text");
  const currentUrlEl = document.getElementById("current-url");
  const textInput = document.getElementById("text-input");
  
  const scanUrlBtn = document.getElementById("scan-url-btn");
  const scanTextBtn = document.getElementById("scan-text-btn");
  
  const loadingDiv = document.getElementById("loading");
  const resultContainer = document.getElementById("result-container");
  const errorContainer = document.getElementById("error-container");
  
  const badge = document.getElementById("classification-badge");
  const scoreVal = document.getElementById("score-val");
  const explanation = document.getElementById("explanation");
  const resetBtn = document.getElementById("reset-btn");
  const resetErrorBtn = document.getElementById("reset-error-btn");

  let activeUrl = "";

  if (chrome && chrome.tabs) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length > 0) {
        activeUrl = tabs[0].url;
        currentUrlEl.textContent = activeUrl;
      }
    });
  } else {
    currentUrlEl.textContent = "Extension environment not detected.";
  }

  tabUrl.addEventListener("click", () => switchTab('url'));
  tabText.addEventListener("click", () => switchTab('text'));

  function switchTab(tab) {
    tabUrl.classList.toggle("active", tab === 'url');
    tabText.classList.toggle("active", tab === 'text');
    contentUrl.classList.toggle("active", tab === 'url');
    contentText.classList.toggle("active", tab === 'text');
    hideResults();
  }

  function showLoading() {
    contentUrl.classList.add("hidden");
    contentText.classList.add("hidden");
    resultContainer.classList.add("hidden");
    errorContainer.classList.add("hidden");
    loadingDiv.classList.remove("hidden");
  }

  function hideResults() {
    loadingDiv.classList.add("hidden");
    resultContainer.classList.add("hidden");
    errorContainer.classList.add("hidden");
    if (tabUrl.classList.contains("active")) {
      contentUrl.classList.remove("hidden");
    } else {
      contentText.classList.remove("hidden");
    }
  }

  function displayResult(data) {
    loadingDiv.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    
    badge.textContent = data.classification;
    badge.className = "badge"; 
    if (data.classification === "Likely Safe") badge.classList.add("safe");
    else if (data.classification === "Suspicious") badge.classList.add("suspicious");
    else badge.classList.add("scam");

    scoreVal.textContent = data.risk_score;
    
    if (data.risk_score < 30) scoreVal.style.color = "#4ade80";
    else if (data.risk_score < 70) scoreVal.style.color = "#facc15";
    else scoreVal.style.color = "#f87171";

    explanation.textContent = data.explanation;
  }

  function displayError(msg) {
    loadingDiv.classList.add("hidden");
    errorContainer.classList.remove("hidden");
    document.getElementById("error-message").textContent = msg;
  }

  scanUrlBtn.addEventListener("click", async () => {
    if (!activeUrl || activeUrl.startsWith("chrome://") || activeUrl.startsWith("about:")) {
      displayError("Cannot scan internal browser pages.");
      return;
    }
    showLoading();
    try {
      const res = await fetch(`${EXT_API}/scan-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: activeUrl, save_to_history: false })
      });
      const data = await res.json();
      if (res.ok) displayResult(data);
      else displayError(data.message || "Failed to analyze URL.");
    } catch (e) {
      displayError("Network error. Is the ScamShield server running?");
    }
  });

  scanTextBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (!text) {
      displayError("Please enter some text.");
      return;
    }
    showLoading();
    try {
      const res = await fetch(`${EXT_API}/scan-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, save_to_history: false })
      });
      const data = await res.json();
      if (res.ok) displayResult(data);
      else displayError(data.message || "Failed to analyze text.");
    } catch (e) {
      displayError("Network error. Is the ScamShield server running?");
    }
  });

  resetBtn.addEventListener("click", hideResults);
  resetErrorBtn.addEventListener("click", hideResults);
});
