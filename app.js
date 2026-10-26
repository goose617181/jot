(function () {
  "use strict";

  const STORAGE_KEY = "jot.notes.v1";
  const THEME_KEY = "jot.theme.v1";

  const form = document.getElementById("noteForm");
  const input = document.getElementById("noteInput");
  const list = document.getElementById("noteList");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");
  const hint = document.getElementById("hint");
  const themeToggle = document.getElementById("themeToggle");

  let notes = loadNotes();

  function loadNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function currentTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function formatTime(timestamp) {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const visible = notes.filter((note) =>
      note.text.toLowerCase().includes(query)
    );

    list.innerHTML = "";
    emptyState.hidden = visible.length !== 0;

    visible.forEach((note) => {
      const item = document.createElement("li");
      item.className = "note";

      const text = document.createElement("p");
      text.className = "note-text";
      text.textContent = note.text;

      const meta = document.createElement("div");
      meta.className = "note-meta";

      const time = document.createElement("span");
      time.textContent = formatTime(note.createdAt);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "note-delete";
      del.textContent = "删除";
      del.addEventListener("click", function () {
        notes = notes.filter((n) => n.id !== note.id);
        saveNotes();
        render();
      });

      meta.append(time, del);
      item.append(text, meta);
      list.appendChild(item);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      hint.textContent = "内容不能为空";
      return;
    }
    notes.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      text,
      createdAt: Date.now(),
    });
    saveNotes();
    input.value = "";
    hint.textContent = "已保存";
    render();
    setTimeout(function () {
      hint.textContent = "";
    }, 1800);
  });

  input.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      form.requestSubmit();
    }
  });

  searchInput.addEventListener("input", render);

  clearBtn.addEventListener("click", function () {
    if (notes.length === 0) return;
    if (window.confirm("确定要清空所有便签吗？此操作不可撤销。")) {
      notes = [];
      saveNotes();
      render();
    }
  });

  themeToggle.addEventListener("click", function () {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    applyTheme(next);
  });

  applyTheme(currentTheme());
  render();
})();
