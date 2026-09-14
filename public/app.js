const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("text");

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function render(messages) {
  messagesEl.innerHTML = "";
  for (const message of messages) {
    const li = document.createElement("li");
    li.className = "message";
    li.innerHTML = `
      <p class="message__text"></p>
      <p class="message__meta"></p>
    `;
    li.querySelector(".message__text").textContent = message.text;
    li.querySelector(".message__meta").textContent = `#${message.id} · ${formatTime(message.createdAt)}`;
    messagesEl.appendChild(li);
  }
}

async function loadMessages({ scrollToLatest = false } = {}) {
  const res = await fetch("/api/messages");
  render(await res.json());
  if (scrollToLatest && messagesEl.lastElementChild) {
    messagesEl.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  inputEl.value = "";
  await loadMessages({ scrollToLatest: true });
  inputEl.focus();
});

loadMessages();
