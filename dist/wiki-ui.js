import {
  askGuide,
  getRole,
  setRole,
  login,
  logout,
  submitPending,
  listPending,
  publishPending,
  rejectPending,
  uploadRoof,
  getSession,
  fetchPublishedArticles,
  listLocalDrafts,
  isApiReachable
} from "./wiki-api.js";

function $(id) {
  return document.getElementById(id);
}

function esc(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setSheet(el, open) {
  if (!el) return;
  el.hidden = !open;
  el.setAttribute("aria-hidden", open ? "false" : "true");
}

export function closeWikiSheets() {
  setSheet($("askSheet"), false);
  setSheet($("accountSheet"), false);
  setSheet($("contributeSheet"), false);
  $("askBtn")?.setAttribute("aria-expanded", "false");
  $("accountBtn")?.setAttribute("aria-expanded", "false");
}

export function syncRoleChrome() {
  const role = getRole();
  const session = getSession();
  const label = $("accountRoleLabel");
  if (label) {
    const name = session?.displayName || session?.email || "";
    label.textContent = name ? `${name} (${role})` : role;
  }
  document.body.dataset.role = role;
  const live = isApiReachable();
  document.body.dataset.liveAuth = live ? "1" : "0";
  document.querySelectorAll("[data-admin-only]").forEach((node) => {
    node.hidden = role !== "admin";
  });
  document.querySelectorAll("[data-preview-roles]").forEach((node) => {
    node.hidden = live;
  });
}

function renderDrafts() {
  const host = $("accountDrafts");
  if (!host) return;
  const rows = listLocalDrafts();
  if (!rows.length) {
    host.innerHTML =
      "<p class=\"wiki-sheet__hint\">Nothing queued on this device.</p>";
    return;
  }
  host.innerHTML = rows
    .slice(0, 12)
    .map(
      (row) =>
        `<p class="wiki-draft">${esc(row.type || "draft")} · ${esc(row.status || "pending")} · ${esc(row.title || row.targetSlug || "")}</p>`
    )
    .join("");
}

function statusLine(el, msg) {
  if (!el) return;
  if (!msg) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.hidden = false;
  el.textContent = msg;
}

export function initWikiUi(ctx) {
  const askSheet = $("askSheet");
  const accountSheet = $("accountSheet");
  const contributeSheet = $("contributeSheet");
  const askLog = $("askLog");
  const askForm = $("askForm");
  const askInput = $("askInput");
  const contribForm = $("wikiContributeForm");
  const contribStatus = $("wikiContributeStatus");
  const contribType = $("wikiContributeType");
  const loginForm = $("accountLoginForm");
  const loginStatus = $("accountLoginStatus");

  function openAsk() {
    closeWikiSheets();
    setSheet(askSheet, true);
    $("askBtn")?.setAttribute("aria-expanded", "true");
    askInput?.focus();
  }

  function openAccount() {
    closeWikiSheets();
    setSheet(accountSheet, true);
    $("accountBtn")?.setAttribute("aria-expanded", "true");
    syncRoleChrome();
    renderDrafts();
  }

  function openContribute(type, presetTitle = "") {
    closeWikiSheets();
    if (contribType) contribType.value = type;
    const title = $("wikiTitle");
    if (title && presetTitle) title.value = presetTitle;
    const heading = $("wikiContributeHeading");
    if (heading) {
      heading.textContent =
        type === "improve"
          ? "Improve this page"
          : type === "roof"
            ? "Add a roof image"
            : "Add a page";
    }
    const hint = $("wikiContributeHint");
    if (hint) {
      hint.textContent =
        type === "improve"
          ? "Seed paragraphs stay. Your section is queued until an admin publishes it."
          : type === "roof"
            ? "JPEG, PNG, or WebP. Sign in as a contributor so the file can reach Cloudinary."
            : "New architecture pages appear in the Guide after an admin publishes them.";
    }
    const roofRow = $("wikiRoofRow");
    if (roofRow) roofRow.hidden = type !== "roof" && type !== "page";
    setSheet(contributeSheet, true);
    (title || $("wikiLead"))?.focus();
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest?.("[data-wiki]");
    if (!t) return;
    const action = t.dataset.wiki;
    if (action === "ask") {
      e.preventDefault();
      openAsk();
    } else if (action === "account") {
      e.preventDefault();
      openAccount();
    } else if (action === "improve") {
      e.preventDefault();
      openContribute("improve");
    } else if (action === "add-page") {
      e.preventDefault();
      const name = t.dataset.title || "";
      openContribute("page", name);
    } else if (action === "add-roof") {
      e.preventDefault();
      openContribute("roof");
    } else if (action === "admin") {
      e.preventDefault();
      ctx.setView?.("admin");
    } else if (action === "close-sheet") {
      e.preventDefault();
      closeWikiSheets();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (
      !askSheet?.hidden ||
      !accountSheet?.hidden ||
      !contributeSheet?.hidden
    ) {
      e.preventDefault();
      closeWikiSheets();
    }
  });

  askForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = askInput?.value?.trim();
    if (!question) return;
    const userP = document.createElement("p");
    userP.className = "wiki-log__user";
    userP.textContent = question;
    askLog?.appendChild(userP);
    const wait = document.createElement("p");
    wait.className = "wiki-log__wait";
    wait.textContent = "Looking in the guide.";
    askLog?.appendChild(wait);
    askInput.value = "";
    const result = await askGuide(question, ctx.getSlug(), {
      getGuide: ctx.getGuide,
      countryOrder: ctx.countryOrder,
      countries: ctx.countries
    });
    wait.remove();
    const ans = document.createElement("p");
    ans.className = "wiki-log__guide";
    ans.textContent = result.answer || "No answer.";
    askLog?.appendChild(ans);
    if (result.citations?.length) {
      const cite = document.createElement("p");
      cite.className = "wiki-log__cite";
      cite.textContent = result.citations
        .map((c) => c.title || c.slug)
        .join(", ");
      askLog?.appendChild(cite);
    }
    askLog?.scrollTo?.(0, askLog.scrollHeight);
  });

  contribForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = contribType?.value || "page";
    const file = $("wikiRoofFile")?.files?.[0];
    let imagePublicId = "";
    let imageUrl = "";
    if (file) {
      statusLine(contribStatus, "Uploading image.");
      try {
        const up = await uploadRoof(file);
        imagePublicId = up.publicId || "";
        imageUrl =
          up.url && String(up.url).startsWith("https://") ? up.url : "";
      } catch (err) {
        statusLine(
          contribStatus,
          err.message || "Sign in as a contributor to upload a roof."
        );
        return;
      }
    }
    const titleValue = $("wikiTitle")?.value?.trim() || "";
    const payload = {
      type,
      targetSlug: type === "page" ? titleValue : ctx.getSlug(),
      title: titleValue,
      typology: $("wikiTypology")?.value?.trim() || "",
      setting: $("wikiSetting")?.value?.trim() || "",
      lead: $("wikiLead")?.value?.trim() || "",
      sectionHeading: $("wikiSectionHeading")?.value?.trim() || "",
      sectionBody: $("wikiSectionBody")?.value?.trim() || "",
      sourceTitle: $("wikiSourceTitle")?.value?.trim() || "",
      sourceUrl: $("wikiSourceUrl")?.value?.trim() || "",
      displayName: $("wikiDisplayName")?.value?.trim() || "",
      imagePublicId,
      imageUrl
    };
    if (type === "page" && !payload.title) {
      statusLine(contribStatus, "A title is required.");
      return;
    }
    if (type === "improve" && !payload.sectionBody && !payload.lead) {
      statusLine(contribStatus, "Add a lead or a section so there is something to review.");
      return;
    }
    if (type === "roof" && !file) {
      statusLine(contribStatus, "Choose an image file.");
      return;
    }
    try {
      const result = await submitPending(payload);
      contribForm.reset();
      if (contribType) contribType.value = type;
      statusLine(
        contribStatus,
        result.via === "api"
          ? "Queued for review. The live page is unchanged until it is published."
          : "Saved on this device for now. It will POST to /api/pending when the backend is live."
      );
      ctx.refreshAdmin?.();
      renderDrafts();
      if (result.via === "api") ctx.refreshGuide?.();
    } catch (err) {
      statusLine(contribStatus, err.message || "Could not queue that draft.");
    }
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = await login(
      $("accountEmail")?.value?.trim() || "",
      $("accountPassword")?.value || ""
    );
    if (data?.ok === false || data?.error) {
      statusLine(loginStatus, data.error);
      return;
    }
    statusLine(loginStatus, "Signed in.");
    syncRoleChrome();
    ctx.refreshAdmin?.();
  });

  $("accountLogout")?.addEventListener("click", async () => {
    await logout();
    statusLine(loginStatus, "Signed out.");
    syncRoleChrome();
    if (ctx.getView?.() === "admin") ctx.setView?.("guide");
  });

  document.querySelectorAll("[data-preview-role]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setRole(btn.dataset.previewRole);
      statusLine(
        loginStatus,
        `Previewing as ${btn.dataset.previewRole}. Not real security.`
      );
      syncRoleChrome();
      ctx.refreshAdmin?.();
    });
  });

  $("writePageFromCloth")?.addEventListener("click", (e) => {
    e.preventDefault();
    const name = $("contributionsInput")?.value?.trim() || "";
    ctx.setView?.("guide");
    openContribute("page", name);
  });

  syncRoleChrome();

  return {
    openAsk,
    openAccount,
    openContribute,
    closeWikiSheets,
    syncRoleChrome
  };
}

export async function renderAdminList() {
  const host = $("adminList");
  if (!host) return;
  if (getRole() !== "admin") {
    host.innerHTML =
      "<p class=\"admin__empty\">Sign in as admin to see the inbox. Preview roles are local only.</p>";
    return;
  }
  let rows;
  try {
    rows = await listPending();
  } catch (err) {
    host.innerHTML =
      "<p class=\"admin__empty\">The live inbox needs a signed-in admin session.</p>";
    return;
  }
  if (!rows.length) {
    host.innerHTML =
      "<p class=\"admin__empty\">Nothing in the queue.</p>";
    return;
  }
  host.innerHTML = rows
    .map((row) => {
      const title = esc(row.title || row.targetSlug || row.type || "Draft");
      const when = row.createdAt ? String(row.createdAt).slice(0, 16) : "";
      const img = row.imageUrl
        ? `<img src="${esc(row.imageUrl)}" alt="" class="admin__thumb" />`
        : "";
      return `<article class="admin__row" data-id="${esc(row.id)}">
        ${img}
        <div class="admin__meta">
          <p class="admin__type">${esc(row.type || "")} · ${esc(row.status || "pending")}</p>
          <h3 class="admin__name">${title}</h3>
          <p class="admin__who">${esc(row.displayName || "anonymous")} ${esc(when)}</p>
          <p class="admin__body">${esc(row.lead || row.sectionBody || "")}</p>
        </div>
        <div class="admin__actions">
          <button type="button" class="about-btn" data-admin="publish" data-id="${esc(row.id)}">Publish</button>
          <button type="button" class="about-btn" data-admin="reject" data-id="${esc(row.id)}">Reject</button>
        </div>
      </article>`;
    })
    .join("");
}

export function bindAdminList() {
  $("adminList")?.addEventListener("click", async (e) => {
    const btn = e.target.closest?.("[data-admin]");
    if (!btn) return;
    const id = btn.dataset.id;
    try {
      if (btn.dataset.admin === "publish") {
        await publishPending(id);
        await fetchPublishedArticles();
      }
      if (btn.dataset.admin === "reject") await rejectPending(id);
    } catch (err) {
      const list = $("adminList");
      if (list) {
        list.innerHTML = `<p class="admin__empty">${esc(err.message || "Could not update that draft.")}</p>`;
      }
      return;
    }
    await renderAdminList();
  });
}
