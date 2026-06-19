const DATA_URL = "./data/reports.json";

const app = document.querySelector("#app");
const homeTemplate = document.querySelector("#home-template");
const archiveTemplate = document.querySelector("#archive-template");
const calendarTemplate = document.querySelector("#calendar-template");

const state = {
  reports: [],
};

function pctClass(value) {
  return String(value).trim().startsWith("-") ? "down" : "up";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00+08:00`));
}

function renderMarketTape(report) {
  return report.indices
    .map(
      (item) => `
        <div class="tape-item">
          <div class="tape-label">${item.name}</div>
          <div class="tape-value">${item.close}</div>
          <div class="${pctClass(item.change)}">${item.change}</div>
        </div>
      `,
    )
    .join("");
}

function renderMetrics(report) {
  return report.indices
    .map(
      (item) => `
        <div class="metric">
          <div class="metric-name">${item.name}</div>
          <div class="metric-value">${item.close}</div>
          <div class="${pctClass(item.change)}">${item.change}</div>
        </div>
      `,
    )
    .join("");
}

function renderSections(report) {
  return report.sections
    .map(
      (section) => `
        <section class="section">
          <h2>${section.title}</h2>
          ${section.body ? `<p>${section.body}</p>` : ""}
          ${section.items ? `<ul>${section.items.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
          ${section.table ? renderTable(section.table) : ""}
        </section>
      `,
    )
    .join("");
}

function renderTable(table) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${table.headers.map((header) => `<th>${header}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSources(report) {
  return report.sources
    .map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>`)
    .join("");
}

function renderReport(report) {
  const node = homeTemplate.content.cloneNode(true);
  node.querySelector(".market-tape").innerHTML = renderMarketTape(report);
  node.querySelector(".report-panel").innerHTML = `
    <div class="report-title">
      <div>
        <p class="eyebrow">${formatDate(report.date)}</p>
        <h1>${report.title}</h1>
        <p class="meta">更新时间：${report.updatedAt} · 数据口径：${report.marketSession}</p>
      </div>
      <span class="badge">${report.status}</span>
    </div>
    <p class="summary">${report.summary}</p>
    <div class="metrics-grid">${renderMetrics(report)}</div>
    ${renderSections(report)}
  `;
  node.querySelector(".side-panel").innerHTML = `
    <div class="card">
      <h3>今日结论</h3>
      <p>${report.takeaway}</p>
      <div class="tag-row">${report.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
    </div>
    <div class="card">
      <h3>关键风险</h3>
      <ul>${report.risks.map((risk) => `<li>${risk}</li>`).join("")}</ul>
    </div>
    <div class="card source-list">
      <h3>来源</h3>
      ${renderSources(report)}
    </div>
  `;
  app.replaceChildren(node);
}

function renderArchive() {
  const node = archiveTemplate.content.cloneNode(true);
  app.replaceChildren(node);

  const list = document.querySelector("#archive-list");
  const search = document.querySelector("#archive-search");

  function paint(query = "") {
    const needle = query.trim().toLowerCase();
    const reports = state.reports.filter((report) => {
      const haystack = [report.date, report.title, report.summary, ...report.tags].join(" ").toLowerCase();
      return haystack.includes(needle);
    });

    list.innerHTML = reports.length
      ? reports
          .map(
            (report) => `
              <a class="card archive-card" href="#/report/${report.date}">
                <p class="eyebrow">${formatDate(report.date)}</p>
                <h2>${report.title}</h2>
                <p>${report.summary}</p>
                <div class="tag-row">${report.tags.slice(0, 4).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
              </a>
            `,
          )
          .join("")
      : `<div class="empty">没有找到匹配的日报。</div>`;
  }

  search.addEventListener("input", () => paint(search.value));
  paint();
}

function renderCalendar() {
  const latest = state.reports[0];
  const node = calendarTemplate.content.cloneNode(true);
  app.replaceChildren(node);
  document.querySelector("#calendar-list").innerHTML = latest.calendar
    .map(
      (item) => `
        <article class="card calendar-card">
          <div class="calendar-date">${item.date}</div>
          <h3>${item.title}</h3>
          <p>${item.note}</p>
        </article>
      `,
    )
    .join("");
}

function renderRoute() {
  const [route, id] = location.hash.replace("#/", "").split("/");
  if (!route) {
    renderReport(state.reports[0]);
    return;
  }
  if (route === "archive") {
    renderArchive();
    return;
  }
  if (route === "calendar") {
    renderCalendar();
    return;
  }
  if (route === "report") {
    const report = state.reports.find((item) => item.date === id);
    report ? renderReport(report) : (app.innerHTML = `<div class="empty">没有找到这一天的日报。</div>`);
    return;
  }
  renderReport(state.reports[0]);
}

async function init() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  state.reports = data.reports.sort((a, b) => b.date.localeCompare(a.date));
  renderRoute();
}

window.addEventListener("hashchange", renderRoute);
init().catch(() => {
  app.innerHTML = `<div class="empty">日报数据加载失败，请稍后刷新。</div>`;
});
