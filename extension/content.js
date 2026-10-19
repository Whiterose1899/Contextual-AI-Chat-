
(() => {
  // Prevent duplicate initialization.
  if (window.__contextualAIExtensionLoaded) return;
  window.__contextualAIExtensionLoaded = true;

  let selectedText = "";
  let popupMode = "button";

  const host = document.createElement("div");
  host.id = "contextual-ai-extension-root";
  host.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2147483647;
  `;

  // Shadow DOM isolates our UI from ChatGPT's page styles.
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      * {
        box-sizing: border-box;
      }

      #ask-button {
        position: fixed;
        display: none;
        background: #202123;
        color: white;
        border: 1px solid #555;
        border-radius: 9px;
        padding: 9px 13px;
        font: 13px/1.2 system-ui, sans-serif;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 14px #0003;
        white-space: nowrap;
      }

      #ask-button:hover {
        background: #343541;
      }

      #question-panel {
        position: fixed;
        display: none;
        width: 320px;
        max-width: calc(100vw - 24px);
        padding: 14px;
        border: 1px solid #444;
        border-radius: 14px;
        background: #202123;
        color: #ececf1;
        box-shadow: 0 8px 30px #0005;
        font: 13px/1.5 system-ui, sans-serif;
      }

      .heading {
        font-weight: 650;
        font-size: 14px;
        margin-bottom: 9px;
      }

      #context-preview {
        color: #c5c5d2;
        background: #2c2d32;
        padding: 8px;
        border-radius: 7px;
        margin-bottom: 10px;
        overflow-wrap: anywhere;
        max-height: 76px;
        overflow: auto;
      }

      #question-input {
        display: block;
        width: 100%;
        min-height: 76px;
        resize: vertical;
        border: 1px solid #565869;
        border-radius: 8px;
        background: #343541;
        color: white;
        padding: 9px;
        font: inherit;
        outline: none;
      }

      #question-input:focus {
        border-color: #8e8ea0;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
      }

      .actions button {
        border: 0;
        border-radius: 7px;
        padding: 8px 11px;
        font: inherit;
        cursor: pointer;
      }

      #cancel-button {
        background: #343541;
        color: white;
      }

      #submit-button {
        background: #10a37f;
        color: white;
        font-weight: 600;
      }

      #submit-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    </style>

    <button id="ask-button" type="button">✦ Ask about this</button>

    <section id="question-panel">
      <div class="heading">Ask a contextual question</div>
      <div id="context-preview"></div>
      <textarea
        id="question-input"
        placeholder="What would you like to understand?"
      ></textarea>
      <div id="ai-answer" role="status" aria-live="polite"
     style="display:none; margin-top:12px; white-space:pre-wrap;
            overflow-wrap:anywhere; max-height:240px; overflow:auto;">
       </div>
      <div class="actions">
        <button id="cancel-button" type="button">Cancel</button>
        <button id="submit-button" type="button">Continue →</button>
      </div>
    </section>
  `;

  document.documentElement.appendChild(host);

  const askButton = shadow.querySelector("#ask-button");
  const panel = shadow.querySelector("#question-panel");
  const contextPreview = shadow.querySelector("#context-preview");
  const questionInput = shadow.querySelector("#question-input");
  const cancelButton = shadow.querySelector("#cancel-button");
  const submitButton = shadow.querySelector("#submit-button");
  const answerBox = shadow.querySelector("#ai-answer");

  function hideUI() {
    askButton.style.display = "none";
    panel.style.display = "none";
    popupMode = "button";
  }

  function positionElement(element, x, y) {
    element.style.display = "block";

    const rect = element.getBoundingClientRect();
    const margin = 12;

    const left = Math.max(
      margin,
      Math.min(x, window.innerWidth - rect.width - margin)
    );

    const top = Math.max(
      margin,
      Math.min(y, window.innerHeight - rect.height - margin)
    );

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

    function openQuestionPanel() {
    if (!selectedText) return;

    const buttonRect = askButton.getBoundingClientRect();

    popupMode = "panel";
    askButton.style.display = "none";

    contextPreview.textContent =
        selectedText.length > 400
        ? selectedText.slice(0, 400) + "…"
        : selectedText;

    panel.style.display = "block";

    const rect = panel.getBoundingClientRect();

    const x = Math.min(
        buttonRect.left,
        window.innerWidth - rect.width - 12
    );

    const y =
        buttonRect.top + rect.height + 8 <= window.innerHeight
        ? buttonRect.top
        : buttonRect.top - rect.height - 8;

    positionElement(panel, x, y);
    questionInput.focus();
  }

  document.addEventListener("mouseup", (event) => {
    // Ignore mouse selections inside our own UI.
    if (host.contains(event.target)) return;

    // Allow the browser to finish updating the selection.
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";

      if (!text) {
        hideUI();
        return;
      }

      selectedText = text;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (!rect.width && !rect.height) {
        hideUI();
        return;
      }

      popupMode = "button";
      panel.style.display = "none";

      positionElement(
        askButton,
        rect.left + rect.width / 2 - 65,
        rect.bottom + 8
      );
    }, 0);
  });

  // Preserve the browser selection when clicking the popup.
  askButton.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });

  askButton.addEventListener("click", openQuestionPanel);

  cancelButton.addEventListener("click", hideUI);

    submitButton.addEventListener("click", async () => {
    const question = questionInput.value.trim();

    if (!selectedText || !question) {
        questionInput.focus();
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Thinking...";
    answerBox.style.display = "block";
    answerBox.textContent = "Generating your answer...";

    try {
        const result = await chrome.runtime.sendMessage({
        type: "CONTEXTUAL_AI_ASK",
        question: question,
        highlightedContext: selectedText
        });

        if (!result || !result.ok) {
        throw new Error(
            result?.error || "Unknown extension error"
        );
        }

        answerBox.textContent = result.answer;
        questionInput.value = "";

    } catch (error) {
        answerBox.textContent = `Error: ${error.message}`;
        console.error("Contextual AI request failed:", error);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Continue →";
    }
    });

  document.addEventListener("mousedown", (event) => {
    if (host.contains(event.target)) return;
    hideUI();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideUI();
  });

  window.addEventListener("scroll", hideUI, true);
  window.addEventListener("resize", hideUI);

  console.log("Contextual AI extension initialized.");
})();
