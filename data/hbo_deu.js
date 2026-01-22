var dictionary_head = dictionary.shift();
var searchParams = [null, null, null, null];
var entries = dictionary.map(getEntry);
var entry_head = [{
  label: "Count", class: "occurences", type: "plain", lang: "deu", input: {
    type: "text", placeholder: "Filter", oninput(value) {
      if (value == "") {
        searchParams[0] = null;
      } else {
        var rangeSet = value.split(",").map(a => a.split("-").map(Number).sort((a, b) => a > b ? 1 : (a < b) ? -1 : 0));
        searchParams[0] = index => {
          index = entries[index][0];
          var push = false;
          rangeSet.forEach(range => {
            if (index == range[0]) {
              push = true;
            } else if (range.length > 1 && index >= range[0] && index <= range[1]) {
              push = true;
            }
          });
          return push;
        }
      }
    }
  }
}, {
  label: "lex", class: "lex", type: "plain", lang: "deu", input: {
    type: "text", placeholder: "Filter", oninput(value) {
      if (value == "") {
        searchParams[1] = null;
      } else {
        var regexp = new RegExp(value.replace(/([\:\-\/\\\,\.\(\)\[\]\{\}])/g, "\\$1").replace(/([\+\?\*])/g, ".$1"), "i");
        searchParams[1] = index => regexp.test(entries[index][1]);
      }
    }
  }
}, {
  label: "Lexem", class: "lexeme", type: "plain", lang: "hbo", input: {
    type: "text", placeholder: "Filter", oninput(value) {
      if (value == "") {
        searchParams[2] = null;
      } else {
        var regexp = new RegExp(value.replace(/([\:\-\/\\\,\.\(\)\[\]\{\}])/g, "\\$1").replace(/([\+\?\*])/g, ".$1").replace(/([\u05D0-\u05EA])/g, "$1[\\u0591-\\u05C7]*"), "i");
        searchParams[2] = index => regexp.test(entries[index][2]);
      }
    }
  }
}, {
  label: "Varianten", class: "variants", type: "html", lang: "hbo", input: {
    type: "text", placeholder: "Filter", oninput(value) {
      if (value == "") {
        searchParams[3] = null;
      } else {
        var regexp = new RegExp(value.replace(/([\:\-\/\\\,\.\(\)\[\]\{\}])/g, "\\$1").replace(/([\+\?\*])/g, ".$1").replace(/([\u05D0-\u05EA])/g, "$1[\\u0591-\\u05C7]*"), "i");
        searchParams[3] = index => entries[index][3].mpc_data.filter(word => regexp.test(word)).length > 0;
      }
    }
  }
}, {
  label: "Übersetzung", class: "translation", type: "html", lang: "deu", input: {
    type: "text", placeholder: "Filter", oninput(value) {
      if (value == "") {
        searchParams[4] = null;
      } else {
        value = value.split(":");
        var trans = ["", "qal", "nifal", "piel", "pual", "hitpael", "hifil", "hofal", "hishtafal", "passive qal", "etpaal", "nitpael", "hotpaal", "tifal", "hitpoal", "poal", "poel"].indexOf(value[0].toLowerCase());
        var trans2 = ["", "q", "ni", "pi", "pu", "hit", "hi", "ho", "hish", "p.q", "et", "nit", "hot", "ti", "hitp", "poal", "poel"].indexOf(value[0].toLowerCase());
        if (trans >= 0) {
          var regexp = new RegExp((value[1] || "").replace(/([\:\-\/\\\,\.\(\)\[\]\{\}])/g, "\\$1").replace(/([\+\?\*])/g, ".$1"), "i");
          searchParams[4] = index => regexp.test(dictionary[index][trans + 4]);
        } else if (trans2 >= 0) {
          var regexp = new RegExp((value[1] || "").replace(/([\:\-\/\\\,\.\(\)\[\]\{\}])/g, "\\$1").replace(/([\+\?\*])/g, ".$1"), "i");
          searchParams[4] = index => regexp.test(dictionary[index][trans2 + 4]);
        } else {
          var regexp = new RegExp(value.join(":").replace(/([\:\-\/\\\,\.\(\)\[\]\{\}])/g, "\\$1").replace(/([\+\?\*])/g, ".$1"), "i");
          searchParams[4] = index => regexp.test(entries[index][4].textContent);
        }
      }
    }
  }
}];
function getEntry(line) {
  var entry = [
    line[0],
    line[1],
    line[2]
  ];
  var dl = document.createElement("dl");
  var dt;
  var dd;
  if (line[3]) {
    var div = document.createElement("div");
    div.classList.add("column-variants-wrapper");
    div.textContent = line[3];
    div.mpc_data = line[3].split(", ");
    entry.push(div);
  }
  if (line[4]) {
    dt = document.createElement("dt");
    dl.appendChild(dt);
    dd = document.createElement("dd");
    dd.textContent = line[4];
    dl.appendChild(dd);
  } else {
    for (a = 4; a < 21; a++) {
      if (line[a]) {
        dt = document.createElement("dt");
        dt.textContent = dictionary_head[a] + ":";
        dl.appendChild(dt);
        dd = document.createElement("dd");
        dd.textContent = line[a];
        dl.appendChild(dd);
      }
    }
  }
  entry.push(dl);
  return entry;
}
function performSearch() {
  search(searchParams);
}
