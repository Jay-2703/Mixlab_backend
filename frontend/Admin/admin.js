(function () {
  // Data model - initial sample rows
  const STORAGE_KEY = "mixlab_admin_activity_v1";
  const defaultData = [
    { user: "Guitarkid01", lesson: "Chord Theory I Quiz", score: "+500 XP", time: "5 mins ago" },
    { user: "DrummerDude", lesson: "Percussion Rhythms Module", score: "Completed", time: "1 hour ago" },
    { user: "PianoProdigy", lesson: "Melody Composition Quest", score: "+1200 XP", time: "3 hours ago" },
    { user: "BassBoss", lesson: "Basslines 101", score: "+300 XP", time: "2 days ago" },
    { user: "SynthSam", lesson: "Synth Patch Design", score: "Completed", time: "4 hours ago" },
    { user: "VocalVera", lesson: "Vocal Warmups", score: "+150 XP", time: "30 mins ago" },
    { user: "LoopLord", lesson: "Looping Techniques", score: "+80 XP", time: "yesterday" },
    { user: "HarmonyHank", lesson: "Advanced Harmony", score: "+950 XP", time: "6 hours ago" },
    { user: "RhythmRita", lesson: "Polyrhythms Practice", score: "Completed", time: "2 hours ago" },
    { user: "KidCoder", lesson: "Music & Code Integration", score: "+60 XP", time: "3 days ago" },
    { user: "DJNova", lesson: "Mixing Basics", score: "+420 XP", time: "1 day ago" },
    { user: "SamplerSue", lesson: "Creative Sampling", score: "+200 XP", time: "5 hours ago" },
  ];

  // Elements
  const searchInput = document.getElementById("searchInput");
  const table = document.getElementById("activityTable");
  const tbody = table.tBodies[0];
  const exportBtn = document.getElementById("exportCsvBtn");
  const statusFilter = document.getElementById("statusFilter");
  const pageSizeSelect = document.getElementById("pageSizeSelect");
  const paginationEl = document.getElementById("pagination");
  const runTestBtn = document.getElementById("runTestBtn");

  // Modal
  const editModal = document.getElementById("editModal");
  const modalClose = editModal?.querySelector(".modal-close");
  const modalCancel = document.getElementById("modalCancel");
  const editForm = document.getElementById("editForm");
  const modalUser = document.getElementById("modalUser");
  const modalLesson = document.getElementById("modalLesson");
  const modalScore = document.getElementById("modalScore");

  // Sidebar
  const sidebar = document.querySelector(".sidebar");
  const collapseBtn = document.querySelector(".collapse-btn");

  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Responsive
  const MOBILE_WIDTH = 800;
  let isMobileView = window.innerWidth <= MOBILE_WIDTH;

  // State
  let data = load();
  let filtered = data.slice();
  let currentPage = 1;
  let pageSize = parseInt(pageSizeSelect.value, 10) || 10;

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Load or generate test data
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);

      const lessons = [
        "Chord Theory I Quiz",
        "Percussion Rhythms Module",
        "Melody Composition Quest",
        "Basslines 101",
        "Synth Patch Design",
        "Vocal Warmups",
        "Looping Techniques",
        "Advanced Harmony",
        "Polyrhythms Practice",
        "Music & Code Integration",
        "Mixing Basics",
        "Creative Sampling",
        "Songwriting Lab",
        "Stage Performance",
        "Ear Training",
        "Music Production Basics",
        "Sound Design",
        "Arrangement Tips",
      ];

      const nameSeeds = [
        "Aero",
        "Beat",
        "Chord",
        "Drum",
        "Echo",
        "Fret",
        "Groove",
        "Harmony",
        "Ion",
        "Jive",
        "Kick",
        "Loop",
        "Muse",
        "Nova",
        "Pulse",
        "Quint",
        "Riff",
        "Sync",
        "Tone",
        "Vibe",
      ];

      const extra = [];
      const base = defaultData.slice();
      const target = 60;

      for (let i = 0; i < target - base.length; i++) {
        const name = nameSeeds[i % nameSeeds.length] + (Math.floor(i / nameSeeds.length) + 1);
        const lesson = lessons[i % lessons.length];
        const isCompleted = i % 7 === 0;
        const xp = isCompleted ? "Completed" : "+" + ((i * 37) % 1300 + 20) + " XP";

        const times = [
          "now",
          "5 mins ago",
          "30 mins ago",
          "1 hour ago",
          "2 hours ago",
          "6 hours ago",
          "yesterday",
          "2 days ago",
          "3 days ago",
          "1 week ago",
        ];
        const time = times[i % times.length];

        extra.push({ user: name, lesson, score: xp, time });
      }

      return base.concat(extra);
    } catch {
      return defaultData.slice();
    }
  }

  // Escape HTML
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Rendering
  function renderTable() {
    const q = (searchInput.value || "").toLowerCase().trim();
    const status = statusFilter.value;

    filtered = data.filter((r) => {
      const text = (r.user + " " + r.lesson + " " + r.score + " " + r.time).toLowerCase();

      if (q && !text.includes(q)) return false;
      if (status === "completed" && !r.score.toLowerCase().includes("completed")) return false;
      if (status === "xp" && !/\d+/.test(r.score)) return false;

      return true;
    });

    pageSize = parseInt(pageSizeSelect.value, 10) || 10;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    isMobileView = window.innerWidth <= MOBILE_WIDTH;

    const mobileListId = "mobileActivityList";
    let mobileList = document.getElementById(mobileListId);

    // MOBILE RENDERING
    if (isMobileView) {
      table.style.display = "none";

      if (!mobileList) {
        mobileList = document.createElement("div");
        mobileList.id = mobileListId;
        mobileList.style.display = "grid";
        mobileList.style.gap = "12px";
        table.parentNode.insertBefore(mobileList, table.nextSibling);
      }

      mobileList.innerHTML = "";

      pageRows.forEach((r) => {
        const card = document.createElement("div");
        card.className = "mobile-card";
        card.dataset.index = data.indexOf(r);

        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${escapeHtml(r.user)}</strong>
            <small style="color:#bbb">${escapeHtml(r.time)}</small>
          </div>

          <div style="margin:6px 0">
            <em style="color:#ddd">${escapeHtml(r.lesson)}</em>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="color:var(--accent)">${escapeHtml(r.score)}</span>
            <span class="action-buttons-mobile">
              <button class="btn-small btn-edit">Edit</button>
              <button class="btn-small btn-remove">Delete</button>
            </span>
          </div>
        `;

        mobileList.appendChild(card);
      });
    } else {
      table.style.display = "";
      if (mobileList) mobileList.remove();

      tbody.innerHTML = "";

      pageRows.forEach((r) => {
        const tr = document.createElement("tr");
        tr.dataset.index = data.indexOf(r);

        tr.innerHTML = `
          <td>${escapeHtml(r.user)}</td>
          <td>${escapeHtml(r.lesson)}</td>
          <td>${escapeHtml(r.score)}</td>
          <td>${escapeHtml(r.time)}</td>
        `;

        const tdAct = document.createElement("td");
        tdAct.className = "action-buttons";

        const editBtn = document.createElement("button");
        editBtn.className = "btn-small btn-edit";
        editBtn.textContent = "Edit";

        const delBtn = document.createElement("button");
        delBtn.className = "btn-small btn-remove";
        delBtn.textContent = "Delete";

        tdAct.appendChild(editBtn);
        tdAct.appendChild(delBtn);

        tr.appendChild(tdAct);
        tbody.appendChild(tr);
      });
    }

    renderPagination(totalPages);
  }

  // Pagination
  function renderPagination(totalPages) {
    paginationEl.innerHTML = "";
    if (totalPages <= 1) return;

    const prev = document.createElement("button");
    prev.textContent = "‹ Prev";
    prev.className = "btn-small";
    prev.disabled = currentPage === 1;
    prev.onclick = () => {
      currentPage = Math.max(1, currentPage - 1);
      renderTable();
    };

    const info = document.createElement("span");
    info.className = "muted";
    info.textContent = `Page ${currentPage} of ${totalPages}`;

    const next = document.createElement("button");
    next.textContent = "Next ›";
    next.className = "btn-small";
    next.disabled = currentPage === totalPages;
    next.onclick = () => {
      currentPage = Math.min(totalPages, currentPage + 1);
      renderTable();
    };

    paginationEl.appendChild(prev);
    paginationEl.appendChild(info);
    paginationEl.appendChild(next);
  }

  // Table actions
  tbody.addEventListener("click", (e) => {
    const edit = e.target.closest(".btn-edit");
    const del = e.target.closest(".btn-remove");

    if (edit) {
      const idx = parseInt(edit.closest("tr").dataset.index, 10);
      openEditModal(idx);
    }

    if (del) {
      const idx = parseInt(del.closest("tr").dataset.index, 10);
      if (confirm("Delete activity for " + data[idx].user + "?")) {
        data.splice(idx, 1);
        save();
        renderTable();
      }
    }
  });

  // Mobile actions
  document.addEventListener("click", (e) => {
    const edit = e.target.closest(".mobile-card .btn-edit");
    const del = e.target.closest(".mobile-card .btn-remove");

    if (edit || del) {
      const card = e.target.closest(".mobile-card");
      const idx = parseInt(card.dataset.index, 10);

      if (edit) openEditModal(idx);
      if (del && confirm("Delete activity for " + data[idx].user + "?")) {
        data.splice(idx, 1);
        save();
        renderTable();
      }
    }
  });

  // Search/filter/page size
  [searchInput, statusFilter, pageSizeSelect].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", () => {
      currentPage = 1;
      renderTable();
    });
  });

  if (searchInput)
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      renderTable();
    });

  // Sidebar close on outside click
  document.addEventListener("click", (e) => {
    if (!isMobileView) return;
    if (!sidebar.classList.contains("open")) return;

    const insideSidebar = e.composedPath().includes(sidebar);
    const toggle = e.target.closest(".collapse-btn");

    if (!insideSidebar && !toggle) sidebar.classList.remove("open");
  });

  // Resize re-render
  window.addEventListener(
    "resize",
    debounce(() => {
      const wasMobile = isMobileView;
      isMobileView = window.innerWidth <= MOBILE_WIDTH;

      if (wasMobile !== isMobileView) renderTable();
    }, 150)
  );

  // Debounce
  function debounce(fn, wait = 120) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // CSV export
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const rows = [["User", "Lesson", "Score/XP", "Time"]].concat(
        data.map((r) => [r.user, r.lesson, r.score, r.time])
      );

      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "activity-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Modal
  let editingIndex = null;

  function openEditModal(idx) {
    editingIndex = idx;
    const item = data[idx];

    modalUser.textContent = item.user;
    modalLesson.value = item.lesson;
    modalScore.value = item.score;

    showModal();
  }

  let lastFocused = null;

  function showModal() {
    lastFocused = document.activeElement;
    editModal.classList.add("open");
    modalLesson.focus();
  }

  function closeModal() {
    editModal.classList.remove("open");
    editingIndex = null;
    if (lastFocused) lastFocused.focus();
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCancel) modalCancel.addEventListener("click", closeModal);

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (editingIndex === null) return;

    data[editingIndex].lesson = modalLesson.value;
    data[editingIndex].score = modalScore.value;

    save();
    renderTable();
    closeModal();
  });

  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) closeModal();
  });

  // Self test
  if (runTestBtn) {
    runTestBtn.addEventListener("click", () => {
      data.push({ user: "TestUser", lesson: "Auto Test", score: "+1 XP", time: "now" });
      save();

      if (data[0]) data[0].score += " [edited]";
      save();

      data = data.filter((d) => d.user !== "TestUser");
      save();

      renderTable();
      alert("Self-test completed.");
    });
  }

  // Init
  renderTable();
})();









