var timeoutID = -1;
var timeout = 1500;
var countdown = 0;
function startSearch() {
  clearTimeout(timeoutID);
  countdown = timeout / 100;
  ids.countdown.classList.add("counting");
  timeoutID = setTimeout(performSearch, timeout);
}
document.body.addEventListener("click", (event) => {
  if (!MPCKeyboard.hideNativeIME) {
    return;
  }
  if (event.target instanceof HTMLInputElement) {
    MPCKeyboard.UX.show();
  } else if (event.target instanceof HTMLElement) {
    MPCKeyboard.UX.hide();
  }
})
function createHeaderRow() {
  var tr = document.createElement("tr");
  tr.addEventListener("click", () => {
    results.scrollIntoView();
  });
  ids.results_header.appendChild(tr);
  var th = document.createElement("th");
  th.textContent = "#";
  th.classList.add("column-index");
  tr.appendChild(th);

  var tr2 = document.createElement("tr");
  ids.results_header.appendChild(tr2);
  var td = document.createElement("td");
  ids.results_count = td;
  td.id = "results_count";
  td.textContent = "0";
  td.classList.add("column-index");
  tr2.appendChild(td);

  entry_head.forEach(a => {
    th = document.createElement("th");
    th.textContent = a.label;
    th.classList.add("column-" + a.class.replace(/[^a-z]/i, "-"));
    tr.appendChild(th);
    td = document.createElement("td");
    td.classList.add("column-" + a.class.replace(/[^a-z]/i, "-"));
    var input = document.createElement("input");
    input.lang = a.lang;
    input.setAttribute("placeholder", a.input.placeholder);
    input.addEventListener("focus", () => {
      console.log(MPCKeyboard.hideNativeIME);
      MPCKeyboard.UX.isVisible() && MPCKeyboard.setActiveKeyboard(input.lang.toUpperCase());
    });
    input.addEventListener("input", () => {
      a.input.oninput(input.value);
      startSearch();
    });
    td.appendChild(input);
    tr2.appendChild(td);
  });
}
function createRow(data, index) {
  var tr = document.createElement("tr");
  var td = document.createElement("td");
  td.classList.add("column-index");
  td.textContent = index + 1;
  tr.appendChild(td);
  data.forEach((a, index) => {
    var td = document.createElement("td");
    if (entry_head[index].type == "html") {
      td.appendChild(a);
    } else {
      td.textContent = a;
    }
    td.classList.add("column-" + entry_head[index].class.replace(/[^a-z]/i, "-"));
    if (a == "") {
      td.classList.add("empty-column");
    }
    tr.appendChild(td);
  });
  // ids.results_body.appendChild(tr);
  return tr;
}
function search(s = []) {
  var push;
  var count = 0;
  s = s.filter(f => typeof f == "function");
  entries.forEach((a, index) => {
    push = null;
    s.forEach(test => {
      if (push !== false) {
        if (test(index)) {
          push = true;
        } else {
          push = false;
        }
      }
    });
    count += push ? 1 : 0;
    ids.results_count.textContent = count;
    if (push) {
      ids.results_body.appendChild(rows[index]);
    } else if (rows[index].parentNode) {
      ids.results_body.removeChild(rows[index]);
    }
  });
  if (window.innerWidth <= 450) {
    toast("Die Suche ergab " + (count || "keine") + " Treffer!", 1500);
  }
}

function toast(message, delay) {
  var div = document.createElement("div");
  div.classList.add("toast");
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => {
    div.parentNode && div.parentNode.removeChild(div);
  }, delay > 100 ? delay : 100);
}

var ids = {
  results_header: document.getElementById("results_header"),
  results_body: document.getElementById("results_body"),
  results_count: null,
  countdown: document.getElementById("countdown")
};
setInterval(() => {
  if (countdown > 0) {
    if (--countdown <= 0) {
      countdown = 0;
      ids.countdown.classList.remove("counting");
    }
    ids.countdown.textContent = countdown;
  }
}, 100);
var rows = entries.map(createRow);
createHeaderRow();
performSearch();
