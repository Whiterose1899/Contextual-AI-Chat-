
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "CONTEXTUAL_AI_ASK") {
    return;
  }

  (async () => {
    try {
      const response = await fetch("http://localhost:3001/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: message.question,
          highlightedContext: message.highlightedContext
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Backend returned HTTP ${response.status}`
        );
      }

      if (typeof data.answer !== "string") {
        throw new Error("Backend response did not contain an answer.");
      }

      sendResponse({
        ok: true,
        answer: data.answer
      });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error.message || "Failed to contact the backend."
      });
    }
  })();

  // Keep the message channel open for the asynchronous response.
  return true;
});
