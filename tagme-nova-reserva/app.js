// ============================================================================
// Tagme — Protótipo navegável do fluxo de Nova Reserva
// Vanilla JS, sem dependências externas (deploy estático direto na Vercel).
// ============================================================================

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // Dados de exemplo
  // ---------------------------------------------------------------------
  const SAMPLE_CLIENTS = [
    { name: "Anna Cabral", phone: "5521969773856", phoneLabel: "11 96977-3856" },
    { name: "Renato Gabriel", phone: "5511987654321", phoneLabel: "11 98765-4321" },
    { name: "Bianca Souza", phone: "5511911112222", phoneLabel: "11 91111-2222" },
    { name: "Marcos Vinícius", phone: "5521933334444", phoneLabel: "21 93333-4444" },
    { name: "Fernanda Lima", phone: "5511955556666", phoneLabel: "11 95555-6666" },
  ];

  const SALOES = ["Salão principal", "Terraço", "Área externa"];

  const TIME_SLOTS_SHORT = ["18:00","18:15","18:30","18:45","19:00","19:15","19:30","19:45","20:00","20:15"];
  const TIME_SLOTS_FULL = [
    "18:00","18:15","18:30","18:45","19:00","19:15","19:30","19:45","20:00","20:15",
    "20:30","20:45","21:00","21:15","21:30","21:45","22:00","22:15","22:30","22:45"
  ];

  let reservations = [
    { name: "Anna Cabral", code: "QUT9DFHB", horario: "14:00", pessoas: 1, status: "checkout", statusLabel: "CHECK-OUT", tagPrimary: "Telefone", tagSecondary: "Belgian", mesa: "71", action: "checkout" },
    { name: "Renato Gabriel", code: "QUMBXU24", horario: "18:30", pessoas: 1, status: "novo", statusLabel: "NOVO", tagPrimary: "Reserva online", tagSecondary: "Belgian", mesa: "71", action: "rsvp" },
    { name: "Renato Gabriel", code: "QUY27BG8", horario: "18:30", pessoas: 4, status: "novo", statusLabel: "NOVO", tagPrimary: "Reserva online", tagSecondary: "Belgian", mesa: "74", action: "rsvp" },
  ];

  // ---------------------------------------------------------------------
  // Estado do fluxo "Adicionar reserva"
  // ---------------------------------------------------------------------
  const state = {
    searchMode: "phone",
    selectedClient: null,
    pessoas: 2,
    prioridade: false,
    status: "Novo",
    date: new Date(2026, 8, 11), // 11 set. 2026 — mesma data do design
    calendarMonth: new Date(2026, 8, 1),
    salao: "",
    origem: "Reserva online",
    horario: null,
    showAllTimes: false,
    mesa: null, // { type: 'mesas', nums: [..] } | { type: 'temp' } | null
    responsavel: "",
    tagEvento: "",
    notas: "",
    obsInterna: "",
    pendingMesaSelection: [],
    editingCode: null,
    pendingPresetMesa: null,
  };

  function resetDrawerState() {
    state.editingCode = null;
    state.pendingPresetMesa = null;
    document.getElementById("drawer-title").textContent = "Adicionar reserva";
    state.selectedClient = null;
    state.pessoas = 2;
    state.prioridade = false;
    state.status = "Novo";
    state.date = null;
    state.salao = "";
    state.origem = "Reserva online";
    state.horario = null;
    state.showAllTimes = false;
    state.mesa = null;
    state.responsavel = "";
    state.tagEvento = "";
    state.notas = "";
    state.obsInterna = "";
    document.getElementById("f-responsavel").value = "";
    document.getElementById("f-tag-evento").value = "";
    document.getElementById("f-notas").value = "";
    document.getElementById("f-obs-interna").value = "";
    document.getElementById("qty-pessoas").value = "2";
    document.getElementById("btn-prioridade").classList.remove("active");
    document.getElementById("f-status").value = "Novo";
    document.getElementById("f-salao").value = "";
    document.getElementById("f-origem").value = "Reserva online";
    document.getElementById("mesa-chip-row").innerHTML = "";
    document.getElementById("mesa-btn-label").textContent = "Escolher mesa(s)";
    state.calendarMonth = new Date(2026, 8, 1);
    renderCalendar();
    renderTimeGrid();
    clearInvalid();
  }

  function clearInvalid() {
    document.querySelectorAll(".field-row.invalid").forEach((el) => el.classList.remove("invalid"));
  }

  // ---------------------------------------------------------------------
  // Utilidades de overlay
  // ---------------------------------------------------------------------
  function openOverlay(id) {
    document.getElementById(id).classList.add("open");
  }
  function closeOverlay(id) {
    document.getElementById(id).classList.remove("open");
  }
  document.querySelectorAll(".overlay").forEach((ov) => {
    ov.addEventListener("click", (e) => {
      if (e.target === ov) closeOverlay(ov.id);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".overlay.open").forEach((ov) => closeOverlay(ov.id));
    }
  });

  // ---------------------------------------------------------------------
  // Lista de reservas
  // ---------------------------------------------------------------------
  const listEl = document.getElementById("reservations-list");
  const countEl = document.getElementById("res-count");

  function statusBarClass(status) {
    return {
      novo: "res-status-novo",
      checkout: "res-status-checkout",
      cancelado: "res-status-cancelado",
      aguardando: "res-status-aguardando",
      sentado: "res-status-sentado",
    }[status] || "res-status-novo";
  }

  function actionButtonsHtml(r) {
    if (r.action === "sentado") {
      return `
        <button class="btn-disabled" title="Enviar mensagem" disabled><svg class="icon-svg" style="width:22px;height:22px"><use href="#i-message"/></svg></button>
        <button class="btn-disabled" title="Remover" disabled><svg class="icon-svg" style="width:22px;height:22px"><use href="#i-x"/></svg></button>
        <button class="btn-table sentado-action" data-act="checkout" title="Fazer check-out"><svg class="icon-svg" style="width:22px;height:22px"><use href="#i-check"/></svg> ${r.mesa}</button>`;
    }
    if (r.action === "checkout") {
      return `<button class="btn-table checkout" data-act="finalizar" title="Reserva finalizada"><svg class="icon-svg" style="width:22px;height:22px"><use href="#i-check"/></svg> ${r.mesa}</button>`;
    }
    if (r.action === "cancelado") {
      return `<div class="btn-disabled" style="grid-column:1/span 2;min-height:40px;border-radius:4px;opacity:.6;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--text-muted);">Reserva cancelada</div>`;
    }
    return `<button class="btn-rsvp" data-act="rsvp">RSVP</button><button class="btn-close" data-act="cancelar" title="Cancelar reserva"><svg class="icon-svg" style="width:22px;height:22px"><use href="#i-x"/></svg></button><button class="btn-table" data-act="sentar" title="Sentar cliente"><svg class="icon-svg" style="width:22px;height:22px"><use href="#i-chair"/></svg> ${r.mesa}</button>`;
  }

  function renderReservationRow(r, isNew) {
    const row = document.createElement("div");
    row.className = "res-row" + (isNew ? " new" : "");
    row.dataset.code = r.code;

    row.innerHTML = `
      <div class="res-status-bar ${statusBarClass(r.status)}"><span>${r.statusLabel}</span></div>
      <div class="res-body">
        <div class="res-main">
          <div class="res-id-block">
            <div class="res-name-row">
              <button class="res-name" data-act="editar">${r.name}</button>
              <span class="res-code">${r.code}</span>
            </div>
            <button class="res-add-tag"><svg class="icon-svg" style="width:16px;height:16px"><use href="#i-tag"/></svg>Adicionar tag</button>
            <div class="res-meta">
              <span class="res-meta-item"><svg class="icon-svg" style="width:14px;height:14px"><use href="#i-clock"/></svg>${r.horario}</span>
              <span class="res-meta-item"><svg class="icon-svg" style="width:14px;height:14px"><use href="#i-users"/></svg>${r.pessoas}</span>
            </div>
          </div>
          <div class="res-tags">
            <span class="res-tag-pill res-tag-blue">${r.tagPrimary}</span>
            <span class="res-tag-pill res-tag-grey">${r.tagSecondary}</span>
          </div>
        </div>
        <div class="res-side">
          <div class="res-obs">Escrever observação<svg class="icon-svg" style="width:18px;height:18px"><use href="#i-edit"/></svg></div>
          <div class="res-actions">${actionButtonsHtml(r)}</div>
        </div>
      </div>`;
    return row;
  }

  let filterStatus = "todos";

  function visibleReservations() {
    if (filterStatus === "aguardando") return reservations.filter((r) => r.status === "aguardando");
    if (filterStatus === "aberto") return reservations.filter((r) => r.status === "novo" || r.status === "sentado");
    return reservations;
  }

  function renderList() {
    listEl.innerHTML = "";
    const visible = visibleReservations();
    visible.forEach((r, i) => {
      const row = renderReservationRow(r, r._justAdded);
      listEl.appendChild(row);
      if (i < visible.length - 1) {
        const hr = document.createElement("div");
        hr.style.padding = "0 16px";
        hr.innerHTML = '<div class="res-divider"></div>';
        listEl.appendChild(hr);
      }
      r._justAdded = false;
    });
    if (visible.length === 0) {
      listEl.innerHTML = '<div class="dialog-empty" style="padding:32px;">Nenhuma reserva para este filtro.</div>';
    }
    countEl.textContent = `${visible.length} / ${reservations.length} Reservas`;
  }
  renderList();

  document.querySelectorAll(".chip[data-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      filterStatus = chip.dataset.filter;
      document.querySelectorAll(".chip[data-filter]").forEach((c) => c.classList.toggle("active", c === chip));
      renderList();
    });
  });

  // ---------------------------------------------------------------------
  // Ações das linhas: RSVP, Sentar cliente, Cancelar, Check-out, Editar
  // (delegação de eventos: os botões são recriados a cada renderList())
  // ---------------------------------------------------------------------
  let currentActionRes = null;

  function findRes(code) {
    return reservations.find((r) => r.code === code);
  }

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const rowEl = e.target.closest(".res-row");
    if (!rowEl) return;
    const r = findRes(rowEl.dataset.code);
    if (!r) return;
    const act = btn.dataset.act;
    if (act === "rsvp") openRsvpDialog(r);
    else if (act === "cancelar") openCancelarDialog(r);
    else if (act === "sentar") openSentarDialog(r);
    else if (act === "checkout") doCheckout(r);
    else if (act === "finalizar") showToast("Reserva já finalizada — check-out concluído.");
    else if (act === "editar") openEditDrawer(r);
  });

  function doCheckout(r) {
    r.status = "checkout";
    r.statusLabel = "CHECK-OUT";
    r.action = "checkout";
    renderList();
    showToast(`Check-out de ${r.name} realizado com sucesso.`);
  }

  // --- RSVP ---------------------------------------------------------------
  function openRsvpDialog(r) {
    currentActionRes = r;
    document.getElementById("rsvp-name").textContent = r.name;
    document.getElementById("rsvp-date").textContent = "11 de setembro de 2026";
    document.getElementById("rsvp-pessoas").textContent = r.pessoas;
    document.getElementById("rsvp-horario").textContent = r.horario;
    document.getElementById("rsvp-salao").textContent = r.tagSecondary;
    openOverlay("overlay-rsvp");
  }
  document.getElementById("btn-close-rsvp").addEventListener("click", () => closeOverlay("overlay-rsvp"));
  document.getElementById("btn-rsvp-cancelar").addEventListener("click", () => closeOverlay("overlay-rsvp"));
  document.getElementById("btn-rsvp-whatsapp").addEventListener("click", () => {
    closeOverlay("overlay-rsvp");
    showToast(`RSVP de ${currentActionRes.name} enviado por WhatsApp.`);
  });
  document.getElementById("btn-rsvp-enviar").addEventListener("click", () => {
    closeOverlay("overlay-rsvp");
    showToast(`RSVP de ${currentActionRes.name} enviado por e-mail.`);
  });

  // --- Sentar cliente -------------------------------------------------------
  function openSentarDialog(r) {
    currentActionRes = r;
    document.getElementById("sentar-name").textContent = r.name;
    document.getElementById("sentar-date").textContent = `11 de setembro de 2026 às ${r.horario} h`;
    document.getElementById("sentar-pessoas").textContent = `${r.pessoas} ${r.pessoas === 1 ? "pessoa" : "pessoas"}`;
    document.getElementById("sentar-mesa").textContent = r.mesa;
    document.getElementById("sentar-obs").value = "";
    openOverlay("overlay-sentar");
  }
  document.getElementById("btn-close-sentar").addEventListener("click", () => closeOverlay("overlay-sentar"));
  document.getElementById("btn-sentar-cancelar").addEventListener("click", () => closeOverlay("overlay-sentar"));
  document.getElementById("btn-sentar-confirmar").addEventListener("click", () => {
    const r = currentActionRes;
    r.status = "sentado";
    r.statusLabel = "SENTADO";
    r.action = "sentado";
    closeOverlay("overlay-sentar");
    renderList();
    showToast(`${r.name} foi sentado(a) na mesa ${r.mesa} com sucesso.`);
  });

  // --- Cancelar reserva -----------------------------------------------------
  function openCancelarDialog(r) {
    currentActionRes = r;
    document.getElementById("cancelar-mesa").textContent = r.mesa;
    document.getElementById("cancelar-name").textContent = r.name;
    const sel = document.getElementById("cancelar-motivo");
    sel.value = "";
    document.getElementById("btn-cancelar-excluir").disabled = true;
    openOverlay("overlay-cancelar");
  }
  document.getElementById("btn-close-cancelar").addEventListener("click", () => closeOverlay("overlay-cancelar"));
  document.getElementById("btn-cancelar-voltar").addEventListener("click", () => closeOverlay("overlay-cancelar"));
  document.getElementById("cancelar-motivo").addEventListener("change", (e) => {
    document.getElementById("btn-cancelar-excluir").disabled = !e.target.value;
  });
  document.getElementById("btn-cancelar-excluir").addEventListener("click", () => {
    const r = currentActionRes;
    r.status = "cancelado";
    r.statusLabel = "CANCELADO";
    r.action = "cancelado";
    closeOverlay("overlay-cancelar");
    renderList();
    showToast(`Reserva de ${r.name} cancelada.`);
  });

  // --- Editar reserva (abre o mesmo drawer de Nova reserva, pré-preenchido) -
  function openEditDrawer(r) {
    resetDrawerState();
    state.editingCode = r.code;
    document.getElementById("drawer-title").textContent = "Editar reserva";
    selectClient({ name: r.name, phone: "", phoneLabel: "" });
    document.getElementById("client-phone").textContent = "—";
    document.getElementById("qty-pessoas").value = r.pessoas;
    state.pessoas = r.pessoas;
    state.horario = r.horario;
    state.date = new Date(2026, 8, 11);
    renderCalendar();
    renderTimeGrid();
    const salaoSel = document.getElementById("f-salao");
    if (![...salaoSel.options].some((o) => o.value === r.tagSecondary)) {
      const opt = document.createElement("option");
      opt.value = r.tagSecondary;
      opt.textContent = r.tagSecondary;
      salaoSel.appendChild(opt);
    }
    salaoSel.value = r.tagSecondary;
    state.salao = r.tagSecondary;
    const origemSel = document.getElementById("f-origem");
    if ([...origemSel.options].some((o) => o.value === r.tagPrimary)) origemSel.value = r.tagPrimary;
    state.origem = origemSel.value;
    const mesaNum = parseInt(r.mesa, 10);
    if (!isNaN(mesaNum)) {
      state.mesa = { type: "mesas", nums: [mesaNum] };
      applyMesaSelectionToUI();
    }
    document.getElementById("f-status").value = r.status === "aguardando" ? "Aguardando" : "Novo";
    state.status = document.getElementById("f-status").value;
    openOverlay("overlay-drawer");
  }

  // ---------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------
  let toastTimer = null;
  function showToast(text) {
    const t = document.getElementById("toast");
    document.getElementById("toast-text").textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  // ---------------------------------------------------------------------
  // Drawer: passos
  // ---------------------------------------------------------------------
  const steps = ["identify", "add-client", "reservation"];
  function showStep(name) {
    steps.forEach((s) => {
      document.querySelector(`[data-step="${s}"]`).hidden = s !== name;
    });
    const footer = document.getElementById("drawer-footer");
    const saveBtn = document.getElementById("btn-salvar-reserva");
    if (name === "add-client") {
      footer.hidden = false;
      saveBtn.textContent = "Salvar e ir para a reserva";
      saveBtn.onclick = handleSaveNewClient;
    } else if (name === "reservation") {
      footer.hidden = false;
      saveBtn.textContent = "Salvar reserva";
      saveBtn.onclick = handleSaveReservation;
    } else {
      footer.hidden = true;
    }
  }

  document.getElementById("btn-nova-reserva").addEventListener("click", () => {
    resetDrawerState();
    showStep("identify");
    renderDrawerSearchResults("");
    document.getElementById("drawer-search-input").value = "";
    openOverlay("overlay-drawer");
    setTimeout(() => document.getElementById("drawer-search-input").focus(), 150);
  });

  document.getElementById("btn-close-drawer").addEventListener("click", () => {
    closeOverlay("overlay-drawer");
  });

  document.querySelectorAll("[data-back-to]").forEach((btn) => {
    btn.addEventListener("click", () => showStep(btn.dataset.backTo));
  });

  // --- Passo 1: identificar cliente -------------------------------------
  const searchModeBtns = document.querySelectorAll("[data-search-mode]");
  searchModeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.searchMode = btn.dataset.searchMode;
      searchModeBtns.forEach((b) => {
        b.style.background = b === btn ? "var(--brand-05)" : "#fff";
        b.style.borderColor = b === btn ? "rgba(255,90,0,0.25)" : "var(--border)";
        b.style.color = b === btn ? "var(--brand)" : "var(--text-strong)";
      });
      const input = document.getElementById("drawer-search-input");
      input.placeholder = state.searchMode === "phone" ? "11 96123-4567" : "Nome ou e-mail";
      input.value = "";
      renderDrawerSearchResults("");
    });
  });
  searchModeBtns[0].click();

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  }

  function renderDrawerSearchResults(query) {
    const box = document.getElementById("drawer-search-results");
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      box.innerHTML = '<div class="dialog-empty" style="padding:16px 4px;">Digite pelo menos 2 caracteres.</div>';
      return;
    }
    const matches = SAMPLE_CLIENTS.filter((c) =>
      state.searchMode === "phone" ? c.phoneLabel.replace(/\D/g, "").includes(q.replace(/\D/g, "")) : c.name.toLowerCase().includes(q)
    );
    if (matches.length === 0) {
      box.innerHTML = `
        <div class="client-not-found">
          <p>Nenhum cliente encontrado para "<b>${query}</b>".</p>
          <button class="btn btn-primary" id="btn-add-new-client"><svg class="icon-svg" style="width:16px;height:16px"><use href="#i-plus"/></svg>Adicionar novo cliente</button>
        </div>`;
      document.getElementById("btn-add-new-client").addEventListener("click", () => {
        document.getElementById("nc-telefone").value = state.searchMode === "phone" ? query : "";
        document.getElementById("nc-nome").value = state.searchMode === "name" ? query : "";
        showStep("add-client");
      });
    } else {
      box.innerHTML = matches
        .map(
          (c, i) => `
        <button class="client-result" data-idx="${i}">
          <span class="avatar">${initials(c.name)}</span>
          <span class="info"><b>${c.name}</b><span>${c.phoneLabel}</span></span>
        </button>`
        )
        .join("");
      box.querySelectorAll(".client-result").forEach((btn, i) => {
        btn.addEventListener("click", () => selectClient(matches[i]));
      });
    }
  }

  document.getElementById("drawer-search-input").addEventListener("input", (e) => {
    renderDrawerSearchResults(e.target.value);
  });

  function selectClient(client) {
    state.selectedClient = client;
    document.getElementById("client-avatar").textContent = initials(client.name)[0];
    document.getElementById("client-name").textContent = client.name;
    document.getElementById("client-phone").textContent = client.phoneLabel;
    document.getElementById("f-responsavel").value = client.name;
    showStep("reservation");
    if (state.pendingPresetMesa) {
      state.mesa = { type: "mesas", nums: [state.pendingPresetMesa] };
      applyMesaSelectionToUI();
      state.pendingPresetMesa = null;
    }
  }

  // --- Passo 2: adicionar novo cliente -----------------------------------
  document.getElementById("nc-vip").addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("on");
  });

  function handleSaveNewClient() {
    const nome = document.getElementById("nc-nome").value.trim();
    const sobrenome = document.getElementById("nc-sobrenome").value.trim();
    const telefone = document.getElementById("nc-telefone").value.trim();
    const row = document.getElementById("nc-nome").closest(".field-row");
    if (!nome || !telefone) {
      [document.getElementById("nc-telefone"), document.getElementById("nc-nome")].forEach((inp) => {
        if (!inp.value.trim()) inp.style.borderColor = "#c1121f";
      });
      return;
    }
    const fullName = (nome + " " + sobrenome).trim();
    selectClient({ name: fullName, phone: telefone, phoneLabel: telefone });
  }

  // --- Passo 3: dados da reserva ------------------------------------------
  document.getElementById("qty-pessoas").addEventListener("change", (e) => {
    let v = parseInt(e.target.value, 10) || 1;
    v = Math.max(1, Math.min(30, v));
    e.target.value = v;
    state.pessoas = v;
  });
  document.querySelectorAll("[data-step-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById("qty-pessoas");
      let v = (parseInt(input.value, 10) || 1) + parseInt(btn.dataset.stepQty, 10);
      v = Math.max(1, Math.min(30, v));
      input.value = v;
      state.pessoas = v;
    });
  });

  document.getElementById("btn-prioridade").addEventListener("click", (e) => {
    state.prioridade = !state.prioridade;
    e.currentTarget.classList.toggle("active", state.prioridade);
  });

  document.getElementById("f-status").addEventListener("change", (e) => (state.status = e.target.value));
  document.getElementById("f-salao").addEventListener("change", (e) => (state.salao = e.target.value));
  document.getElementById("f-origem").addEventListener("change", (e) => (state.origem = e.target.value));
  document.getElementById("f-responsavel").addEventListener("input", (e) => (state.responsavel = e.target.value));
  document.getElementById("f-tag-evento").addEventListener("input", (e) => (state.tagEvento = e.target.value));
  document.getElementById("f-notas").addEventListener("input", (e) => (state.notas = e.target.value));
  document.getElementById("f-obs-interna").addEventListener("input", (e) => (state.obsInterna = e.target.value));

  // --- Calendário -----------------------------------------------------
  const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const DOWS_PT = ["D","S","T","Q","Q","S","S"];

  function renderCalendar() {
    const grid = document.getElementById("cal-grid");
    const y = state.calendarMonth.getFullYear();
    const m = state.calendarMonth.getMonth();
    document.getElementById("cal-month-label").textContent = `${MONTHS_PT[m]}, ${y}`;
    let html = DOWS_PT.map((d) => `<div class="dow">${d}</div>`).join("");
    const firstDow = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();
    for (let i = 0; i < firstDow; i++) {
      html += `<button type="button" class="day muted" disabled>${daysInPrevMonth - firstDow + i + 1}</button>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected = state.date && state.date.getFullYear() === y && state.date.getMonth() === m && state.date.getDate() === d;
      html += `<button type="button" class="day${isSelected ? " selected" : ""}" data-day="${d}">${d}</button>`;
    }
    grid.innerHTML = html;
    grid.querySelectorAll(".day[data-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.date = new Date(y, m, parseInt(btn.dataset.day, 10));
        const row = document.getElementById("row-data");
        row.classList.remove("invalid");
        renderCalendar();
      });
    });
  }
  document.getElementById("cal-prev").addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById("cal-next").addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  renderCalendar();

  // --- Horário ----------------------------------------------------------
  function renderTimeGrid() {
    const grid = document.getElementById("time-grid");
    const list = state.showAllTimes ? TIME_SLOTS_FULL : TIME_SLOTS_SHORT;
    grid.innerHTML = list
      .map((t) => `<button type="button" class="time-pill${state.horario === t ? " selected" : ""}" data-time="${t}">${t}</button>`)
      .join("");
    grid.querySelectorAll(".time-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.horario = btn.dataset.time;
        document.getElementById("row-horario").classList.remove("invalid");
        renderTimeGrid();
      });
    });
    document.getElementById("time-toggle-more").textContent = state.showAllTimes ? "Ver menos horários" : "Ver mais horários";
  }
  document.getElementById("time-toggle-more").addEventListener("click", () => {
    state.showAllTimes = !state.showAllTimes;
    renderTimeGrid();
  });
  renderTimeGrid();

  // --- Mesa ---------------------------------------------------------------
  const TABLE_NUMBERS = [60, 61, 62, 63, 64, 65, 70, 71, 72, 73, 74, 75, 80, 81, 82, 83, 84, 90];

  function openMesaPicker() {
    state.pendingMesaSelection = state.mesa && state.mesa.type === "mesas" ? [...state.mesa.nums] : [];
    renderMesaPickerRoot("options");
    openOverlay("overlay-mesa");
  }
  document.getElementById("btn-escolher-mesa").addEventListener("click", openMesaPicker);

  function renderMesaPickerRoot(view) {
    const root = document.getElementById("mesa-picker-root");
    if (view === "options") {
      root.innerHTML = `
        <div class="mesa-options">
          <button class="mesa-option-btn" id="mesa-opt-existing"><svg class="icon-svg" style="width:20px;height:20px"><use href="#i-table"/></svg>Selecionar mesas existentes</button>
          <button class="mesa-option-btn" id="mesa-opt-temp"><svg class="icon-svg" style="width:20px;height:20px"><use href="#i-plus"/></svg>Criar mesa temporária</button>
          <button class="mesa-option-btn" id="mesa-opt-skip"><svg class="icon-svg" style="width:20px;height:20px"><use href="#i-x"/></svg>Agora não</button>
        </div>`;
      document.getElementById("mesa-opt-existing").addEventListener("click", () => renderMesaPickerRoot("grid"));
      document.getElementById("mesa-opt-temp").addEventListener("click", () => {
        state.mesa = { type: "temp" };
        applyMesaSelectionToUI();
        closeOverlay("overlay-mesa");
      });
      document.getElementById("mesa-opt-skip").addEventListener("click", () => {
        state.mesa = null;
        applyMesaSelectionToUI();
        closeOverlay("overlay-mesa");
      });
    } else {
      root.innerHTML = `
        <div class="mesa-grid">${TABLE_NUMBERS.map((n) => `<button type="button" class="mesa-num-btn${state.pendingMesaSelection.includes(n) ? " selected" : ""}" data-num="${n}">${n}</button>`).join("")}</div>
        <div style="display:flex; gap:8px; margin-top:16px; justify-content:flex-end;">
          <button class="btn btn-outline" id="mesa-grid-back">Voltar</button>
          <button class="btn-save" id="mesa-grid-confirm" style="padding:8px 16px;">Confirmar</button>
        </div>`;
      root.querySelectorAll(".mesa-num-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const n = parseInt(btn.dataset.num, 10);
          const idx = state.pendingMesaSelection.indexOf(n);
          if (idx >= 0) state.pendingMesaSelection.splice(idx, 1);
          else state.pendingMesaSelection.push(n);
          btn.classList.toggle("selected");
        });
      });
      document.getElementById("mesa-grid-back").addEventListener("click", () => renderMesaPickerRoot("options"));
      document.getElementById("mesa-grid-confirm").addEventListener("click", () => {
        if (state.pendingMesaSelection.length === 0) {
          state.mesa = null;
        } else {
          state.mesa = { type: "mesas", nums: [...state.pendingMesaSelection] };
        }
        applyMesaSelectionToUI();
        closeOverlay("overlay-mesa");
      });
    }
  }

  function applyMesaSelectionToUI() {
    const row = document.getElementById("mesa-chip-row");
    const btnLabel = document.getElementById("mesa-btn-label");
    document.getElementById("row-mesa").classList.remove("invalid");
    if (!state.mesa) {
      row.innerHTML = "";
      btnLabel.textContent = "Escolher mesa(s)";
      return;
    }
    btnLabel.textContent = "Alterar mesa(s)";
    if (state.mesa.type === "temp") {
      row.innerHTML = `<span class="mesa-chip"><span class="num">T</span>Mesa temporária<button data-remove-mesa><svg class="icon-svg"><use href="#i-x"/></svg></button></span>`;
    } else {
      row.innerHTML = state.mesa.nums
        .map((n) => `<span class="mesa-chip"><span class="num">${n}</span>Mesa ${n}<button data-remove-mesa="${n}"><svg class="icon-svg"><use href="#i-x"/></svg></button></span>`)
        .join("");
    }
    row.querySelectorAll("[data-remove-mesa]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.mesa.type === "temp") {
          state.mesa = null;
        } else {
          const n = parseInt(btn.dataset.removeMesa, 10);
          state.mesa.nums = state.mesa.nums.filter((x) => x !== n);
          if (state.mesa.nums.length === 0) state.mesa = null;
        }
        applyMesaSelectionToUI();
      });
    });
  }

  // --- Validação e salvamento ------------------------------------------
  function validateReservation() {
    clearInvalid();
    let ok = true;
    if (!state.date) {
      document.getElementById("row-data").classList.add("invalid");
      ok = false;
    }
    if (!state.salao) {
      document.getElementById("row-salao").classList.add("invalid");
      ok = false;
    }
    if (!state.horario) {
      document.getElementById("row-horario").classList.add("invalid");
      ok = false;
    }
    return ok;
  }

  function handleSaveReservation() {
    if (!validateReservation()) {
      showToast("Corrija os campos destacados para continuar.");
      const firstInvalid = document.querySelector(".field-row.invalid");
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const mesaLabel = state.mesa ? (state.mesa.type === "temp" ? "T" : state.mesa.nums[0]) : "—";
    const status = state.status === "Aguardando" ? "aguardando" : "novo";
    const statusLabel = state.status === "Aguardando" ? "AGUARDANDO" : "NOVO";

    if (state.editingCode) {
      const existing = findRes(state.editingCode);
      if (existing) {
        existing.name = state.selectedClient.name;
        existing.horario = state.horario;
        existing.pessoas = state.pessoas;
        existing.status = status;
        existing.statusLabel = statusLabel;
        existing.tagPrimary = state.origem;
        existing.tagSecondary = state.salao;
        existing.mesa = mesaLabel;
        existing.action = status === "aguardando" ? "rsvp" : "rsvp";
        existing._justAdded = true;
      }
      renderList();
      closeOverlay("overlay-drawer");
      showToast(`Reserva de ${state.selectedClient.name} atualizada com sucesso.`);
      return;
    }

    const code = "QU" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const newRes = {
      name: state.selectedClient.name,
      code,
      horario: state.horario,
      pessoas: state.pessoas,
      status,
      statusLabel,
      tagPrimary: state.origem,
      tagSecondary: state.salao,
      mesa: mesaLabel,
      action: "rsvp",
      _justAdded: true,
    };
    reservations.unshift(newRes);
    renderList();
    closeOverlay("overlay-drawer");
    showToast(
      state.status === "Aguardando"
        ? `Reserva de ${newRes.name} enviada para aprovação.`
        : `Reserva de ${newRes.name} criada com sucesso.`
    );
  }

  // ---------------------------------------------------------------------
  // Dialog "Buscar cliente" (atalho da toolbar)
  // ---------------------------------------------------------------------
  document.getElementById("btn-buscar-cliente").addEventListener("click", () => {
    document.getElementById("search-input").value = "";
    renderQuickSearchResults("");
    openOverlay("overlay-search");
    setTimeout(() => document.getElementById("search-input").focus(), 150);
  });

  function renderQuickSearchResults(query) {
    const box = document.getElementById("search-results");
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      box.innerHTML = '<div class="dialog-empty">Digite pelo menos 2 caracteres.</div>';
      return;
    }
    const matches = SAMPLE_CLIENTS.filter((c) => c.name.toLowerCase().includes(q) || c.phoneLabel.includes(q));
    if (matches.length === 0) {
      box.innerHTML = `<div class="dialog-empty">Nenhum cliente encontrado.</div>`;
      return;
    }
    box.innerHTML = matches
      .map((c, i) => `
        <button class="client-result" data-idx="${i}">
          <span class="avatar">${initials(c.name)}</span>
          <span class="info"><b>${c.name}</b><span>${c.phoneLabel}</span></span>
        </button>`)
      .join("");
    box.querySelectorAll(".client-result").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        closeOverlay("overlay-search");
        resetDrawerState();
        selectClient(matches[i]);
        openOverlay("overlay-drawer");
      });
    });
  }
  document.getElementById("search-input").addEventListener("input", (e) => renderQuickSearchResults(e.target.value));

  // ---------------------------------------------------------------------
  // Aba "Salão" — Mapa de mesa (grade de mesas por capacidade)
  // ---------------------------------------------------------------------
  const TABLE_GROUPS = [
    { label: "1 a 2 pessoas", nums: [60, 61, 62, 63, 64, 65] },
    { label: "3 a 5 pessoas", nums: [70, 71, 72, 73, 74, 75] },
    { label: "6 a 8 pessoas", nums: [80, 81, 82, 83, 84, 90] },
  ];

  function statusColor(status) {
    return (
      { novo: "var(--status-novo)", aguardando: "var(--status-aguardando)", sentado: "var(--status-sentado)", checkout: "var(--status-checkout)" }[
        status
      ] || null
    );
  }

  function renderSalaoPanel() {
    const body = document.getElementById("salao-body");
    body.innerHTML = TABLE_GROUPS.map(
      (g) => `
      <div>
        <span class="salao-group-label">${g.label}</span>
        <div class="salao-tables">
          ${g.nums
            .map((n) => {
              const matches = reservations.filter((r) => parseInt(r.mesa, 10) === n && r.status !== "cancelado");
              const occ = matches.length > 0;
              const color = occ ? statusColor(matches[0].status) : null;
              return `<button type="button" class="salao-table-btn${occ ? " occupied" : ""}" data-mesa="${n}"${
                color ? ` style="background:${color}"` : ""
              }>${n}${matches.length > 1 ? `<span class="badge">${matches.length}</span>` : ""}</button>`;
            })
            .join("")}
        </div>
      </div>`
    ).join("");
    body.querySelectorAll(".salao-table-btn").forEach((btn) => {
      btn.addEventListener("click", () => openMesaInfo(parseInt(btn.dataset.mesa, 10)));
    });
  }

  function openMesaInfo(n) {
    document.getElementById("mesa-info-title").textContent = `Mesa ${n}`;
    const body = document.getElementById("mesa-info-body");
    const matches = reservations.filter((r) => parseInt(r.mesa, 10) === n && r.status !== "cancelado");
    if (matches.length === 0) {
      body.innerHTML = `
        <div class="mesa-info-row">
          <p>Sem reservas nesta mesa para o dia selecionado.</p>
          <button class="btn btn-primary" id="mesa-info-nova"><svg class="icon-svg" style="width:16px;height:16px"><use href="#i-plus"/></svg>Nova reserva</button>
        </div>`;
      document.getElementById("mesa-info-nova").addEventListener("click", () => {
        closeOverlay("overlay-mesa-info");
        resetDrawerState();
        showStep("identify");
        renderDrawerSearchResults("");
        document.getElementById("drawer-search-input").value = "";
        state.pendingPresetMesa = n;
        openOverlay("overlay-drawer");
        setTimeout(() => document.getElementById("drawer-search-input").focus(), 150);
      });
    } else {
      body.innerHTML = matches
        .map(
          (r) => `
        <div class="mesa-info-row">
          <div class="dlg-info-row" style="padding:0;border:none;">
            <span class="icon"><svg class="icon-svg"><use href="#i-user"/></svg></span>
            <div><div class="dlg-info-value">${r.name}</div><div class="dlg-info-label">${r.horario} · ${r.pessoas} pessoa(s) · ${r.statusLabel}</div></div>
          </div>
          <button class="btn btn-outline" data-open-res="${r.code}">Ver reserva</button>
        </div>`
        )
        .join("");
      body.querySelectorAll("[data-open-res]").forEach((btn) => {
        btn.addEventListener("click", () => {
          closeOverlay("overlay-mesa-info");
          openEditDrawer(findRes(btn.dataset.openRes));
        });
      });
    }
    openOverlay("overlay-mesa-info");
  }
  document.getElementById("btn-close-mesa-info").addEventListener("click", () => closeOverlay("overlay-mesa-info"));

  document.getElementById("tab-salao").addEventListener("click", () => {
    document.getElementById("tab-salao").classList.add("active");
    document.getElementById("tab-reserva").classList.remove("active");
    document.getElementById("reservations-panel").hidden = true;
    document.getElementById("salao-panel").hidden = false;
    renderSalaoPanel();
  });
  document.getElementById("tab-reserva").addEventListener("click", () => {
    document.getElementById("tab-reserva").classList.add("active");
    document.getElementById("tab-salao").classList.remove("active");
    document.getElementById("salao-panel").hidden = true;
    document.getElementById("reservations-panel").hidden = false;
  });
  document.getElementById("salao-toggle").addEventListener("click", (e) => {
    const body = document.getElementById("salao-body");
    const collapsed = body.style.display === "none";
    body.style.display = collapsed ? "" : "none";
    e.currentTarget.classList.toggle("collapsed", !collapsed);
  });

  // ---------------------------------------------------------------------
  // Sidebar — alternar entre recolhida (rail de ícones) e expandida (menu
  // com rótulos e navegação aninhada Produto > Reservas > Gestão)
  // ---------------------------------------------------------------------
  function setSidebarExpanded(expanded) {
    document.getElementById("sidebar").classList.toggle("expanded", expanded);
    document.getElementById("sidebar-rail").hidden = expanded;
    document.getElementById("sidebar-full").hidden = !expanded;
  }
  document.getElementById("btn-sidebar-expand").addEventListener("click", () => setSidebarExpanded(true));
  document.getElementById("btn-sidebar-collapse").addEventListener("click", () => setSidebarExpanded(false));

  // ---------------------------------------------------------------------
  // Relógio da data flutuante (decorativo)
  // ---------------------------------------------------------------------
  // mantém a data fixa do design (11 set. 2026) — apenas visual
})();
