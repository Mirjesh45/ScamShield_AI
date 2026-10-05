// ⚠️ UPDATE THIS before publishing to Chrome Web Store
const EXT_API = "https://YOUR_BACKEND_URL/api/extension";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scan_text",
    title: "Scan text with ScamShield AI",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "scan_link",
    title: "Scan link with ScamShield AI",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // EXT_API is defined at the top of this file

  if (info.menuItemId === "scan_text" && info.selectionText) {
    scanWithAPI(`${EXT_API}/scan-text`, { content: info.selectionText });
  } else if (info.menuItemId === "scan_link" && info.linkUrl) {
    scanWithAPI(`${EXT_API}/scan-url`, { url: info.linkUrl });
  }
});

async function scanWithAPI(endpoint, bodyData) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData)
    });
    const data = await res.json();
    if (res.ok) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        title: `ScamShield AI: ${data.classification}`,
        message: `Risk Score: ${data.risk_score}/100\n${data.category}`,
        priority: 2
      });
    } else {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        title: "ScamShield AI Error",
        message: data.message || "Failed to analyze.",
        priority: 2
      });
    }
  } catch (e) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      title: "ScamShield AI Error",
      message: "Network error connecting to backend.",
      priority: 2
    });
  }
}
