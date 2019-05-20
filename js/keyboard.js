window.MPCKeyboardConfiguration = Object.assign({
  keyboardLocation: "https://mpdieckmann.github.io/keyboard",
  keyboardNamespaceURI: "https://mpdieckmann.github.io/keyboard",
  htmlNamespaceURI: "http://www.w3.org/1999/xhtml",
  colors: {},
  layouts: [],
  loadLazy: true,
  hidden: true,
  allowCustomLayouts: true,
  hideNativeIME: true
}, (window.MPCKeyboardConfiguration && typeof window.MPCKeyboardConfiguration == "object") ? window.MPCKeyboardConfiguration : {});
window.MPCKeyboardConfiguration.colors = Object.assign({
  color: "#fff",
  background: "#222",
  keyColor: "#fff",
  keyBackground: "#333",
  specialKeyColor: "#fff",
  specialKeyBackground: "#4d4d4d",
  keyHoldColor: "#fff",
  keyHoldBackground: "#088",
  keyPressColor: "#fff",
  keyPressBackground: "#08a",
  keyLockColor: "#fff",
  keyLockBackground: "#068",
  menuColor: "#fff",
  menuBackground: "#222",
  menuItemColor: "#fff",
  menuItemBackground: "#222",
  menuItemSeparatorColor: "#333",
  menuItemHoverColor: "#fff",
  menuItemHoverBackground: "#333",
  menuItemActiveColor: "#fff",
  menuItemActiveBackground: "#088",
  menuItemPressColor: "#fff",
  menuItemPressBackground: "#08a",
}, window.MPCKeyboardConfiguration.colors);
var MPCKeyboard;
(function (MPCKeyboard) {
  MPCKeyboard.version = "2019.05.17";
  MPCKeyboard.keyboardLocation = MPCKeyboardConfiguration.keyboardLocation;
  MPCKeyboard.keyboards = Object.create(null);
  var _requestKeyboard = Object.create(null);
  var _scripts = Object.create(null);
  MPCKeyboard.window = self;
  MPCKeyboard.document = MPCKeyboard.window.document;
  MPCKeyboard.resolveCodeToLayoutURL = function (code) {
    return "layouts/" + code.toUpperCase() + ".js";
  };
  var _activeKeyboard = null;
  if (MPCKeyboard.window !== top) {
    if (confirm("Append Keyboard to top-window?")) {
      try {
        MPCKeyboard.document = top.document;
        MPCKeyboard.window = top;
      }
      catch (e) {
        console.warn("Failed to append Keyboard to top-window. Keybaord will be appended to current window");
      }
    }
  }
  function getActiveKeyboard() {
    return _activeKeyboard;
  }
  MPCKeyboard.getActiveKeyboard = getActiveKeyboard;
  function setActiveKeyboard(code) {
    if (_activeKeyboard && _activeKeyboard.code == code) {
      return Promise.resolve();
    }
    return Promise.resolve(loadKeyboard(code)).then(function (keyboard) {
      _activeKeyboard = keyboard;
      MPCKeyboard.UX.keyboardStyle.textContent = "";
      if (typeof keyboard.imports == "object" && typeof keyboard.imports.forEach == "function") {
        keyboard.imports.forEach(function (style) { return MPCKeyboard.UX.keyboardStyle.textContent += '@import "' + style + '";'; });
      }
      if (typeof keyboard.style == "string") {
        MPCKeyboard.UX.keyboardStyle.textContent += '@namespace "' + MPCKeyboard.UX.keyboardNamespaceURI + '";' + keyboard.style;
      }
      MPCKeyboard.UX.build();
      MPCKeyboard.element.removeAttribute("hidden");
      MPCKeyboard.UX.updateSize();
    });
  }
  MPCKeyboard.setActiveKeyboard = setActiveKeyboard;
  function loadKeyboard(code, keepVisibility) {
    if (keepVisibility === void 0) { keepVisibility = false; }
    if (typeof code == "object") {
      defineKeyboard(code);
      return Promise.resolve(MPCKeyboard.keyboards[code.code]);
    }
    else {
      if (code in MPCKeyboard.keyboards) {
        return Promise.resolve(MPCKeyboard.keyboards[code]);
      }
      if (code in _requestKeyboard) {
        return _requestKeyboard[code].promise;
      }
      _requestKeyboard[code] = {
        promise: null,
        resolve: null
      };
      var visibility = MPCKeyboard.UX.isVisible();
      return _requestKeyboard[code].promise = new Promise(function (resolve) {
        _requestKeyboard[code].resolve = function (keyboard) {
          if (keepVisibility === true) {
            MPCKeyboard.UX.toggle(visibility);
          }
          resolve(keyboard);
        };
        loadScript(MPCKeyboard.resolveCodeToLayoutURL(code));
      });
    }
  }
  MPCKeyboard.loadKeyboard = loadKeyboard;
  function loadKeyboards(layouts, keepVisibility) {
    if (keepVisibility === void 0) { keepVisibility = false; }
    return new Promise(function (resolve) {
      var length = layouts.length;
      var rslt = [];
      layouts.forEach(function (layout) {
        loadKeyboard(layout, keepVisibility).then(function (keyboard) {
          var index = rslt.indexOf(null);
          if (index == -1) {
            rslt.push(keyboard);
          }
          else {
            rslt.splice(index, 1, keyboard);
          }
          if (rslt.length == length) {
            resolve(rslt);
          }
        });
      });
      if (layouts.length == rslt.length) {
        resolve(rslt);
        MPCKeyboard.UX.updateSize();
      }
      else {
        setTimeout(function () {
          Array(length - rslt.length).forEach(function () { return rslt.push(null); });
          resolve(rslt);
          MPCKeyboard.UX.updateSize();
        }, 10000);
      }
    });
  }
  MPCKeyboard.loadKeyboards = loadKeyboards;
  function lazyLoadKeyboards(layouts, keepVisibility) {
    if (keepVisibility === void 0) { keepVisibility = false; }
    return new Promise(function (resolve) {
      var length = layouts.length;
      var rslt = Array(length);
      (function loadLayout(index) {
        if (index < length) {
          var loadingNext = false;
          var timeout = setTimeout(function () {
            loadLayout(index + 1);
            loadingNext = true;
          }, 5000);
          loadKeyboard(layouts[index], keepVisibility).then(function (keyboard) {
            rslt[index] = keyboard;
            if (loadingNext == false) {
              clearTimeout(timeout);
              loadLayout(index + 1);
            }
          });
        }
        else {
          resolve(rslt);
          MPCKeyboard.UX.updateSize();
        }
      })(0);
    });
  }
  MPCKeyboard.lazyLoadKeyboards = lazyLoadKeyboards;
  function defineKeyboard(keyboard) {
    var code = keyboard.code;
    if (code in MPCKeyboard.keyboards) {
      throw "Cannot re-define a keyboard: " + code;
    }
    MPCKeyboard.keyboards[code] = keyboard;
    if (_activeKeyboard === null) {
      setActiveKeyboard(code);
    }
    if (code in _requestKeyboard) {
      _requestKeyboard[code].resolve(keyboard);
      delete _requestKeyboard[code];
    }
  }
  MPCKeyboard.defineKeyboard = defineKeyboard;
  function loadScript(url) {
    if (!/^https?\:\/*|\/\//.test(url)) {
      if (/^\//.test(url)) {
        url = MPCKeyboard.keyboardLocation + url;
      }
      else {
        url = MPCKeyboard.keyboardLocation + "/js/" + url;
      }
    }
    if (url in _scripts) {
      return _scripts[url];
    }
    var promise = new Promise(function (resolve) {
      var script = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.htmlNamespaceURI, "script");
      script.addEventListener("load", resolve);
      script.src = url;
      script.type = "text/javascript";
      MPCKeyboard.UX.defs.appendChild(script);
    });
    _scripts[url] = promise;
    return promise;
  }
  MPCKeyboard.loadScript = loadScript;
  function showSettingsMenu() {
    var langs = [];
    Object.getOwnPropertyNames(MPCKeyboard.keyboards).forEach(function (code) {
      langs.push({
        name: MPCKeyboard.keyboards[code].name,
        code: MPCKeyboard.keyboards[code].code,
        desc: MPCKeyboard.keyboards[code].description,
        active: _activeKeyboard === MPCKeyboard.keyboards[code]
      });
    });
    MPCKeyboard.Menu.createMenu(langs);
  }
  MPCKeyboard.showSettingsMenu = showSettingsMenu;
})(MPCKeyboard || (MPCKeyboard = {}));
(function (MPCKeyboard) {
  MPCKeyboard.MODIFIER_SHIFT = 1;
  MPCKeyboard.MODIFIER_CTRL = 2;
  MPCKeyboard.MODIFIER_ALT = 4;
  MPCKeyboard.MODIFIER_META = 8;
  MPCKeyboard.MODIFIER_SHIFT_LOCK = 16;
  MPCKeyboard.MODIFIER_CTRL_LOCK = 32;
  MPCKeyboard.MODIFIER_ALT_LOCK = 64;
  MPCKeyboard.MODIFIER_META_LOCK = 128;
  MPCKeyboard.element = MPCKeyboard.document.createElementNS(MPCKeyboardConfiguration.keyboardNamespaceURI, "keyboard");
  function hasFlag(flag1, flag2) {
    return flag1 & flag2;
  }
  MPCKeyboard.hasFlag = hasFlag;
  function combineFlag(flag1, flag2) {
    return flag1 | flag2;
  }
  MPCKeyboard.combineFlag = combineFlag;
  function removeFlag(flag1, flag2) {
    return flag1 & ~flag2;
  }
  MPCKeyboard.removeFlag = removeFlag;
  function toggleFlag(flag1, flag2, force) {
    if (force === true) {
      return combineFlag(flag1, flag2);
    }
    else if (force === false || hasFlag(flag1, flag2)) {
      return removeFlag(flag1, flag2);
    }
    else {
      return combineFlag(flag1, flag2);
    }
  }
  MPCKeyboard.toggleFlag = toggleFlag;
})(MPCKeyboard || (MPCKeyboard = {}));
(function (MPCKeyboard) {
  var UX;
  (function (UX) {
    UX.version = "2019.05.17";
    UX.keyboardNamespaceURI = MPCKeyboardConfiguration.keyboardNamespaceURI;
    UX.htmlNamespaceURI = MPCKeyboardConfiguration.htmlNamespaceURI;
    UX.defs = MPCKeyboard.document.createElementNS(UX.keyboardNamespaceURI, "defs");
    UX.style = MPCKeyboard.document.createElementNS(UX.htmlNamespaceURI, "style");
    UX.keyboardStyle = MPCKeyboard.document.createElementNS(UX.htmlNamespaceURI, "style");
    UX.element = MPCKeyboard.element;
    var _keys = MPCKeyboard.document.createElementNS(UX.keyboardNamespaceURI, "keys");
    var _keyMap = Object.create(null);
    var _spans = [];
    var _spanIndex = 0;
    var _buildMode = false;
    var _activeLayout = null;
    var _updateMode = false;
    MPCKeyboard.document.body.appendChild(UX.element);
    UX.element.setAttribute("hidden", "");
    UX.element.appendChild(UX.defs);
    UX.element.appendChild(_keys);
    UX.style.textContent = '@import "https://fonts.googleapis.com/css?family=Noto+Sans";' +
      '@namespace "' + UX.keyboardNamespaceURI + '";' +
      '@namespace html "' + UX.htmlNamespaceURI + '";' +
      'keyboard{z-index:99999;position:fixed;left:0;right:0;bottom:0;font:20px/3em "Noto Sans",Calibri,Roboto,Arial,sans-serif;caret:default;user-select:none;}' +
      'keyboard[hidden]{display:block!important;right:auto;padding:0.25em 0;font:16px/1.08 sans-serif;box-shadow:0 0 0.5em 0#000;}' +
      'keyboard[hidden]>keys{display:none;}' +
      'keyboard>menuitem{display:none!important;}' +
      'keyboard>menuitem>desc{display:none;}' +
      'keyboard[hidden]>menuitem{display:block!important;}' +
      'keyboard>menuitem:hover>desc{display:inline-block;}' +
      'defs{display:none;}' +
      'keys{z-index:99998;display:grid;grid-template-columns:repeat(20,1fr);grid-template-rows:repeat(5,1fr);grid-gap:2px;margin:0 auto;max-width:900px;}' +
      'key{z-index:99998;display:inline-block;text-align:center;grid-column-start:auto;grid-column-end:span 2;}' +
      'key[width="1"]{grid-column-end:span 1}' +
      'key[width="2"]{grid-column-end:span 2}' +
      'key[width="3"]{grid-column-end:span 3}' +
      'key[width="4"]{grid-column-end:span 4}' +
      'key[width="5"]{grid-column-end:span 5}' +
      'key[width="6"]{grid-column-end:span 6}' +
      'key[width="7"]{grid-column-end:span 7}' +
      'key[width="8"]{grid-column-end:span 8}' +
      'key[width="9"]{grid-column-end:span 9}' +
      'key[width="10"]{grid-column-end:span 10}' +
      'key[width="11"]{grid-column-end:span 11}' +
      'key[width="12"]{grid-column-end:span 12}' +
      'key[width="13"]{grid-column-end:span 13}' +
      'key[width="14"]{grid-column-end:span 14}' +
      'key[width="15"]{grid-column-end:span 15}' +
      'key[width="16"]{grid-column-end:span 16}' +
      'key[width="17"]{grid-column-end:span 17}' +
      'key[width="18"]{grid-column-end:span 18}' +
      'key[width="19"]{grid-column-end:span 19}' +
      'key[width="20"]{grid-column-end:span 20}' +
      'key[disabled]{opacity:0.5;}' +
      'span{display:inline-block;grid-column-start:auto;grid-column-end:span 1;}' +
      '@media(max-width:450px){key[long]{font-size:13px;}key[down]{/*box-shadow:0 0 0.5em#000;position:relative;font-size:1.5em;margin-top:-175%;width:150%;margin-left:-25%;z-index:99999;*/}}' +
      '@media(max-width:350px){key[long]{font-size:10px;}}' +
      '@media(max-height:450px){keyboard{line-height:2.5em;}}' +
      '@media(max-height:350px){keyboard{line-height:2em;}}' +
      '@media print{keyboard{display:none!important;}html|html,html|body{max-height:auto!important;overflow:initial!important;margin-bottom:initial!important;}}';
    UX.defs.appendChild(UX.style);
    UX.defs.appendChild(UX.keyboardStyle);
    MPCKeyboard.window.addEventListener("resize", updateSize);
    function updateSize() {
      var keyboardHeight = UX.element.getBoundingClientRect().height;
      MPCKeyboard.document.documentElement && (MPCKeyboard.document.documentElement.style.overflow = "auto");
      MPCKeyboard.document.documentElement && (MPCKeyboard.document.documentElement.style.maxHeight = (MPCKeyboard.window.innerHeight - keyboardHeight) + "px");
    }
    UX.updateSize = updateSize;
    function build() {
      while (_keys.firstChild) {
        _keys.removeChild(_keys.firstChild);
      }
      _buildMode = true;
      _activeLayout = getLayout();
      var keyMap = getKeyMap();
      _spanIndex = 0;
      _activeLayout.forEach(function (defineKey) { return (_buildMode = true) && _keys.appendChild(_buildKey(defineKey, keyMap)); });
      _buildMode = false;
    }
    UX.build = build;
    function update() {
      _updateMode = true;
      var keyMap = getKeyMap();
      _activeLayout.forEach(function (keyCode) { return _updateKey(keyCode, keyMap); });
      _updateMode = false;
    }
    UX.update = update;
    function updateKey(keyCode, keyMap) {
      if (!_updateMode) {
        throw "Only callable in BuildMode";
      }
      if (keyCode === null) {
        return true;
      }
      var result = /^(#?)([a-z0-9]+)(?:\:([0-9]+))?$/i.exec(keyCode);
      if (result == null) {
        throw "Cannot parse defineKey: " + keyCode;
      }
      var code = result[2];
      var key = getKey(code);
      var value = keyMap[code];
      if (!value) {
        key.textContent = "";
        key.setAttribute("key", "");
        key.setAttribute("disabled", "");
      }
      else if (typeof value == "string") {
        key.textContent = value;
        key.setAttribute("key", value);
        key.removeAttribute("disabled");
      }
      else {
        key.textContent = value[0];
        key.setAttribute("key", value[1] || value[0]);
        key.removeAttribute("disabled");
      }
      if (key.textContent.length > 2) {
        key.setAttribute("long", "");
      }
      else {
        key.removeAttribute("long");
      }
      switch (key.getAttribute("key")) {
        case "Shift":
          if (MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_SHIFT) == MPCKeyboard.MODIFIER_SHIFT) {
            key.setAttribute("lock", MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_SHIFT_LOCK) == MPCKeyboard.MODIFIER_SHIFT_LOCK ? "persistent" : "temporary");
          }
          else {
            key.removeAttribute("lock");
          }
          break;
        case "Control":
          if (MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_CTRL) == MPCKeyboard.MODIFIER_CTRL) {
            key.setAttribute("lock", MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_CTRL_LOCK) == MPCKeyboard.MODIFIER_CTRL_LOCK ? "persistent" : "temporary");
          }
          else {
            key.removeAttribute("lock");
          }
          break;
        case "Alt":
          if (MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_ALT) == MPCKeyboard.MODIFIER_ALT) {
            key.setAttribute("lock", MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_ALT_LOCK) == MPCKeyboard.MODIFIER_ALT_LOCK ? "persistent" : "temporary");
          }
          else {
            key.removeAttribute("lock");
          }
          break;
        case "Meta":
          if (MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_META) == MPCKeyboard.MODIFIER_META) {
            key.setAttribute("lock", MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_META_LOCK) == MPCKeyboard.MODIFIER_META_LOCK ? "persistent" : "temporary");
          }
          else {
            key.removeAttribute("lock");
          }
          break;
      }
      return true;
    }
    UX.updateKey = updateKey;
    function buildKey(keyCode, keyMap) {
      if (!_buildMode) {
        throw "Only callable in BuildMode";
      }
      if (keyCode === null) {
        return getSpan();
      }
      var result = /^(#?)([a-z0-9]+)(?:\:([0-9]+))?$/i.exec(keyCode);
      if (result == null) {
        throw "Cannot parse defineKey: " + keyCode;
      }
      var code = result[2];
      var width = parseInt(result[3] || "2");
      var key = getKey(code, width);
      var special = result[1] == "#";
      if (special) {
        key.setAttribute("special", "");
      }
      else {
        key.removeAttribute("special");
      }
      var value = keyMap[code];
      if (!value) {
        key.textContent = "";
        key.setAttribute("key", "");
        key.setAttribute("disabled", "");
      }
      else if (typeof value == "string") {
        key.textContent = value;
        key.setAttribute("key", value);
        key.removeAttribute("disabled");
      }
      else {
        key.textContent = value[0];
        key.setAttribute("key", value[1] || value[0]);
        key.removeAttribute("disabled");
      }
      if (key.textContent.length > 2) {
        key.setAttribute("long", "");
      }
      else {
        key.removeAttribute("long");
      }
      switch (key.getAttribute("key")) {
        case "Shift":
          if (MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_SHIFT) == MPCKeyboard.MODIFIER_SHIFT) {
            key.setAttribute("lock", MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_SHIFT_LOCK) == MPCKeyboard.MODIFIER_SHIFT_LOCK ? "persistent" : "temporary");
          }
          else {
            key.removeAttribute("lock");
          }
          break;
        case "Control":
          if (MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_CTRL) == MPCKeyboard.MODIFIER_CTRL) {
            key.setAttribute("lock", MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_CTRL_LOCK) == MPCKeyboard.MODIFIER_CTRL_LOCK ? "persistent" : "temporary");
          }
          else {
            key.removeAttribute("lock");
          }
          break;
        case "Alt":
          if (MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_ALT) == MPCKeyboard.MODIFIER_ALT) {
            key.setAttribute("lock", MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_ALT_LOCK) == MPCKeyboard.MODIFIER_ALT_LOCK ? "persistent" : "temporary");
          }
          else {
            key.removeAttribute("lock");
          }
          break;
        case "Meta":
          if (MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_META) == MPCKeyboard.MODIFIER_META) {
            key.setAttribute("lock", MPCKeyboard.hasFlag(getModifiers(), MPCKeyboard.MODIFIER_META_LOCK) == MPCKeyboard.MODIFIER_META_LOCK ? "persistent" : "temporary");
          }
          else {
            key.removeAttribute("lock");
          }
          break;
      }
      return key;
    }
    UX.buildKey = buildKey;
    function getSpan(width) {
      if (width === void 0) { width = 1; }
      if (!_buildMode) {
        throw "Only callable in BuildMode";
      }
      var span;
      if (_spanIndex < _spans.length) {
        span = _spans[_spanIndex++];
      }
      else {
        span = MPCKeyboard.document.createElementNS(UX.keyboardNamespaceURI, "span");
        _spans.push(span);
        _spanIndex++;
      }
      span.setAttribute("width", width.toString());
      return span;
    }
    UX.getSpan = getSpan;
    function getKey(keyCode, width, keyLock) {
      if (width === void 0) { width = 2; }
      if (keyLock === void 0) { keyLock = "none"; }
      var key;
      if (keyCode in _keyMap) {
        key = _keyMap[keyCode];
      }
      else {
        key = MPCKeyboard.document.createElementNS(UX.keyboardNamespaceURI, "key");
        key.setAttribute("code", keyCode);
        _keyMap[keyCode] = key;
      }
      if (_buildMode) {
        key.setAttribute("width", width.toString());
        if (keyLock == "none") {
          key.removeAttribute("lock");
        }
        else {
          key.setAttribute("lock", keyLock);
        }
      }
      return key;
    }
    UX.getKey = getKey;
    function getKeysInKeyMap(key) {
      var keyMap = getKeyMap();
      return Object.getOwnPropertyNames(keyMap).filter(function (code) {
        if (typeof keyMap[code] == "string") {
          if (keyMap[code] == key) {
            return true;
          }
        }
        else {
          if (keyMap[code] && keyMap[code][1] == key) {
            return true;
          }
        }
        return false;
      }).map(function (code) { return getKey(code); });
    }
    UX.getKeysInKeyMap = getKeysInKeyMap;
    function getLayout() {
      if (!_buildMode) {
        throw "Only callable in BuildMode";
      }
      var keyboard = MPCKeyboard.getActiveKeyboard();
      if (typeof keyboard.getLayout == "function") {
        var layout = keyboard.getLayout();
        if (layout) {
          return layout;
        }
      }
      return keyboard.layout;
    }
    UX.getLayout = getLayout;
    function getKeyMap() {
      var keyboard = MPCKeyboard.getActiveKeyboard();
      if (typeof keyboard.getKeyMap == "function") {
        var keyMap = keyboard.getKeyMap();
        if (keyMap) {
          return keyMap;
        }
      }
      return keyboard.keyMap;
    }
    UX.getKeyMap = getKeyMap;
    function getKeyLock(keyCode) {
      if (keyCode in _keyMap) {
        var key = _keyMap[keyCode];
        var lock = key.getAttribute("lock");
        if (lock !== null) {
          return lock;
        }
      }
      return "none";
    }
    UX.getKeyLock = getKeyLock;
    function getBuildMode() {
      return _buildMode;
    }
    UX.getBuildMode = getBuildMode;
    function isVisible() {
      return !UX.element.hasAttribute("hidden");
    }
    UX.isVisible = isVisible;
    function hide() {
      UX.element.setAttribute("hidden", "");
      updateSize();
    }
    UX.hide = hide;
    function show() {
      if (MPCKeyboard.getActiveKeyboard()) {
        UX.element.removeAttribute("hidden");
        updateSize();
      }
      else {
        MPCKeyboard.showSettingsMenu();
      }
    }
    UX.show = show;
    function toggle(force) {
      if (force === false) {
        hide();
        return false;
      }
      else if (force === true || UX.element.hasAttribute("hidden")) {
        show();
        return true;
      }
      else {
        hide();
        return false;
      }
    }
    UX.toggle = toggle;
    function getModifiers() {
      var keyboard = MPCKeyboard.getActiveKeyboard();
      if (keyboard) {
        if (typeof keyboard.getModifiers == "function") {
          var modifiers = keyboard.getModifiers();
          if (modifiers !== false) {
            return modifiers;
          }
        }
        if (typeof keyboard.modifiers != "number") {
          keyboard.modifiers = 0;
        }
        return keyboard.modifiers;
      }
      return null;
    }
    UX.getModifiers = getModifiers;
    function setModifiers(modifiers) {
      var keyboard = MPCKeyboard.getActiveKeyboard();
      if (typeof modifiers == "number" && keyboard && keyboard.modifiers != modifiers) {
        if (typeof keyboard.setModifiers == "function") {
          var result = keyboard.setModifiers(modifiers);
          if (result !== false) {
            return result;
          }
        }
        keyboard.modifiers = modifiers;
      }
      return keyboard.modifiers;
    }
    UX.setModifiers = setModifiers;
    function _updateKey(keyCode, keyMap) {
      var keyboard = MPCKeyboard.getActiveKeyboard();
      if (typeof keyboard.updateKey == "function") {
        var key = keyboard.updateKey(keyCode, keyMap);
        if (key) {
          return key;
        }
      }
      return updateKey(keyCode, keyMap);
    }
    function _buildKey(keyCode, keyMap) {
      var keyboard = MPCKeyboard.getActiveKeyboard();
      if (typeof keyboard.buildKey == "function") {
        var key = keyboard.buildKey(keyCode, keyMap);
        if (key) {
          return key;
        }
      }
      return buildKey(keyCode, keyMap);
    }
  })(UX = MPCKeyboard.UX || (MPCKeyboard.UX = {}));
})(MPCKeyboard || (MPCKeyboard = {}));
(function (MPCKeyboard) {
  var Theme;
  (function (Theme) {
    Theme.version = "2019.05.17";
    Theme.element = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.htmlNamespaceURI, "style");
    var _colorRegexp = /^\#[0-9a-f]{3}|\#[0-9a-f]{6}$/;
    apply(MPCKeyboardConfiguration.colors);
    MPCKeyboard.UX.defs.appendChild(Theme.element);
    function apply(colors) {
      var color = _fallbackColor(colors.color, "#fff");
      var background = _fallbackColor(colors.background, "#222");
      var keyColor = _fallbackColor(colors.keyColor, "#fff");
      var keyBackground = _fallbackColor(colors.keyBackground, "#333");
      var specialKeyColor = _fallbackColor(colors.specialKeyColor, keyColor);
      var specialKeyBackground = _fallbackColor(colors.specialKeyBackground, keyBackground);
      var keyPressColor = _fallbackColor(colors.keyPressColor, keyColor);
      var keyPressBackground = _fallbackColor(colors.keyPressBackground, keyBackground);
      var keyHoldColor = _fallbackColor(colors.keyHoldColor, keyPressColor);
      var keyHoldBackground = _fallbackColor(colors.keyHoldBackground, keyPressBackground);
      var keyLockColor = _fallbackColor(colors.keyLockColor, keyHoldColor);
      var keyLockBackground = _fallbackColor(colors.keyLockBackground, keyHoldBackground);
      var menuColor = _fallbackColor(colors.menuColor, color);
      var menuBackground = _fallbackColor(colors.menuBackground, background);
      var menuItemColor = _fallbackColor(colors.menuItemColor, menuColor);
      var menuItemBackground = _fallbackColor(colors.menuItemBackground, menuBackground);
      var menuItemSeparatorColor = _fallbackColor(colors.menuItemSeparatorColor, menuItemColor);
      var menuItemHoverColor = _fallbackColor(colors.menuItemHoverColor, menuItemColor);
      var menuItemHoverBackground = _fallbackColor(colors.menuItemHoverBackground, menuItemBackground);
      var menuItemPressColor = _fallbackColor(colors.menuItemPressColor, menuItemHoverColor);
      var menuItemPressBackground = _fallbackColor(colors.menuItemPressBackground, menuItemHoverBackground);
      var menuItemActiveColor = _fallbackColor(colors.menuItemActiveColor, menuItemPressColor);
      var menuItemActiveBackground = _fallbackColor(colors.menuItemActiveBackground, menuItemPressBackground);
      Theme.element.textContent = '@namespace "' + MPCKeyboard.UX.keyboardNamespaceURI + '";' +
        '@namespace html "' + MPCKeyboard.UX.htmlNamespaceURI + '";' +
        'keyboard{color:' + color + ';background:' + background + '}' +
        'key{color:' + keyColor + ';background:' + keyBackground + ';}' +
        'key[special]{color:' + specialKeyColor + ';background:' + specialKeyBackground + ';}' +
        'key[lock="temporary"]{color:' + keyHoldColor + ';background:' + keyHoldBackground + ';}' +
        'key[down]{color:' + keyPressColor + ';background:' + keyPressBackground + ';}' +
        'key[lock="persistent"]{color:' + keyLockColor + ';background:' + keyLockBackground + ';}' +
        'menu{color:' + menuColor + ';background:' + menuBackground + ';}' +
        'menuitem{color:' + menuItemColor + ';background:' + menuItemBackground + ';}' +
        'hr{background:' + menuItemSeparatorColor + ';}' +
        'menuitem:hover{color:' + menuItemHoverColor + ';background:' + menuItemHoverBackground + ';}' +
        'menuitem[active]{color:' + menuItemActiveColor + ';background:' + menuItemActiveBackground + ';}' +
        'menuitem:active{color:' + menuItemPressColor + ';background:' + menuItemPressBackground + ';}';
    }
    Theme.apply = apply;
    function _fallbackColor(color, fallback) {
      if (_colorRegexp.test(color)) {
        return color;
      }
      return fallback;
    }
  })(Theme = MPCKeyboard.Theme || (MPCKeyboard.Theme = {}));
})(MPCKeyboard || (MPCKeyboard = {}));
(function (MPCKeyboard) {
  MPCKeyboard.PHASE_DOWN = 1;
  MPCKeyboard.PHASE_HOLD = 2;
  MPCKeyboard.PHASE_UP = 4;
  MPCKeyboard.TYPE_TOUCH = "touch";
  MPCKeyboard.TYPE_POINTER = "pointer";
  MPCKeyboard.TYPE_MOUSE = "mouse";
  MPCKeyboard.keyBindings = [{
    key: "Alt",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (event.phase === MPCKeyboard.PHASE_DOWN) {
        MPCKeyboard.UX.setModifiers(MPCKeyboard.removeFlag(MPCKeyboard.toggleFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT), MPCKeyboard.MODIFIER_ALT_LOCK));
        MPCKeyboard.UX.update();
      }
      if (event.phase === MPCKeyboard.PHASE_HOLD && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT) == MPCKeyboard.MODIFIER_ALT) {
        MPCKeyboard.UX.setModifiers(MPCKeyboard.UX.getModifiers() | MPCKeyboard.MODIFIER_ALT_LOCK);
        MPCKeyboard.UX.update();
      }
      event.preventDefault();
      event.setCommandArgs(null);
    }
  }, {
    key: "Backspace",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      event.setCommandArgs("delete", false, "");
    }
  }, {
    key: "Control",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (event.phase === MPCKeyboard.PHASE_DOWN) {
        MPCKeyboard.UX.setModifiers(MPCKeyboard.removeFlag(MPCKeyboard.toggleFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL), MPCKeyboard.MODIFIER_CTRL_LOCK));
        MPCKeyboard.UX.update();
      }
      if (event.phase === MPCKeyboard.PHASE_HOLD && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL) == MPCKeyboard.MODIFIER_CTRL) {
        MPCKeyboard.UX.setModifiers(MPCKeyboard.UX.getModifiers() | MPCKeyboard.MODIFIER_CTRL_LOCK);
        MPCKeyboard.UX.update();
      }
      event.preventDefault();
      event.setCommandArgs(null);
    }
  }, {
    key: "Enter",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      event.setCommandArgs("insertText", false, "\n");
    }
  }, {
    key: "Language",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (event.phase == MPCKeyboard.PHASE_DOWN) {
        MPCKeyboard.showSettingsMenu();
      }
      event.preventDefault();
      event.setCommandArgs(null);
    }
  }, {
    key: "Meta",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (event.phase === MPCKeyboard.PHASE_DOWN) {
        MPCKeyboard.UX.setModifiers(MPCKeyboard.removeFlag(MPCKeyboard.toggleFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META), MPCKeyboard.MODIFIER_META_LOCK));
        MPCKeyboard.UX.update();
      }
      if (event.phase === MPCKeyboard.PHASE_HOLD && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META) == MPCKeyboard.MODIFIER_META) {
        MPCKeyboard.UX.setModifiers(MPCKeyboard.UX.getModifiers() | MPCKeyboard.MODIFIER_META_LOCK);
        MPCKeyboard.UX.update();
      }
      event.preventDefault();
      event.setCommandArgs(null);
    }
  }, {
    key: "Shift",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (event.phase === MPCKeyboard.PHASE_DOWN) {
        MPCKeyboard.UX.setModifiers(MPCKeyboard.removeFlag(MPCKeyboard.toggleFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_SHIFT), MPCKeyboard.MODIFIER_SHIFT_LOCK));
        MPCKeyboard.UX.update();
      }
      if (event.phase === MPCKeyboard.PHASE_HOLD && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_SHIFT) == MPCKeyboard.MODIFIER_SHIFT) {
        MPCKeyboard.UX.setModifiers(MPCKeyboard.UX.getModifiers() | MPCKeyboard.MODIFIER_SHIFT_LOCK);
        MPCKeyboard.UX.update();
      }
      event.preventDefault();
      event.setCommandArgs(null);
    }
  }, {
    key: "Space",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      event.setCommandArgs("insertText", false, " ");
    }
  }, {
    key: /.*/,
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL) == MPCKeyboard.MODIFIER_CTRL && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT) != MPCKeyboard.MODIFIER_ALT && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META) != MPCKeyboard.MODIFIER_META) {
        event.setCommandArgs(null);
      }
      if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL) != MPCKeyboard.MODIFIER_CTRL && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT) == MPCKeyboard.MODIFIER_ALT && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META) != MPCKeyboard.MODIFIER_META) {
        event.setCommandArgs(null);
      }
      if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL) != MPCKeyboard.MODIFIER_CTRL && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT) != MPCKeyboard.MODIFIER_ALT && MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META) == MPCKeyboard.MODIFIER_META) {
        event.setCommandArgs(null);
      }
    }
  }, {
    key: /.*/,
    phases: MPCKeyboard.PHASE_UP,
    exec: function (event) {
      if (!/Shift|Control|Alt|Meta/.test(event.key)) {
        if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_SHIFT | MPCKeyboard.MODIFIER_SHIFT_LOCK) != (MPCKeyboard.MODIFIER_SHIFT | MPCKeyboard.MODIFIER_SHIFT_LOCK)) {
          MPCKeyboard.UX.setModifiers(MPCKeyboard.removeFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_SHIFT | MPCKeyboard.MODIFIER_SHIFT_LOCK));
          MPCKeyboard.UX.update();
        }
        if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_CTRL_LOCK) != (MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_CTRL_LOCK)) {
          MPCKeyboard.UX.setModifiers(MPCKeyboard.removeFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_CTRL_LOCK));
          MPCKeyboard.UX.update();
        }
        if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT | MPCKeyboard.MODIFIER_ALT_LOCK) != (MPCKeyboard.MODIFIER_ALT | MPCKeyboard.MODIFIER_ALT_LOCK)) {
          MPCKeyboard.UX.setModifiers(MPCKeyboard.removeFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT | MPCKeyboard.MODIFIER_ALT_LOCK));
          MPCKeyboard.UX.update();
        }
        if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META | MPCKeyboard.MODIFIER_META_LOCK) != (MPCKeyboard.MODIFIER_META | MPCKeyboard.MODIFIER_META_LOCK)) {
          MPCKeyboard.UX.setModifiers(MPCKeyboard.removeFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META | MPCKeyboard.MODIFIER_META_LOCK));
          MPCKeyboard.UX.update();
        }
      }
    }
  }, {
    key: "a",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        event.setCommandArgs("selectAll");
      }
    }
  }, {
    key: "c",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        event.setCommandArgs("copy");
      }
    }
  }, {
    key: "v",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        event.setCommandArgs("paste");
      }
    }
  }, {
    key: "x",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        event.setCommandArgs("cut");
      }
    }
  }, {
    key: "z",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        event.setCommandArgs("undo");
      }
    }
  }, {
    key: "y",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        event.setCommandArgs("redo");
      }
    }
  }, {
    key: "b",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        event.setCommandArgs("bold");
      }
    }
  }, {
    key: "i",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        event.setCommandArgs("italic");
      }
    }
  }, {
    key: "u",
    phases: MPCKeyboard.PHASE_DOWN | MPCKeyboard.PHASE_HOLD,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        event.setCommandArgs("underline");
      }
    }
  }, {
    key: "p",
    phases: MPCKeyboard.PHASE_DOWN,
    exec: function (event) {
      if (MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.UX.getModifiers() === MPCKeyboard.MODIFIER_CTRL_LOCK || MPCKeyboard.UX.getModifiers() === MPCKeyboard.combineFlag(MPCKeyboard.MODIFIER_CTRL, MPCKeyboard.MODIFIER_CTRL_LOCK)) {
        print();
      }
    }
  }];
  function addCommand(key, phases, exec) {
    return MPCKeyboard.keyBindings.push({
      key: key,
      phases: phases,
      exec: exec
    });
  }
  MPCKeyboard.addCommand = addCommand;
})(MPCKeyboard || (MPCKeyboard = {}));
(function (MPCKeyboard) {
  var EventManager;
  (function (EventManager) {
    EventManager.version = "2019.05.17";
    var _active = {
      key: null,
      type: null,
      interval: null,
      timeout: null
    };
    var KeyBindingEvent = (function () {
      function KeyBindingEvent(_internal) {
        this._internal = _internal;
        this.code = this._internal.code;
        this.key = this._internal.key;
        this.phase = this._internal.phase;
        this.type = this._internal.type;
        this.target = this._internal.target;
      }
      KeyBindingEvent.prototype.setCommandArgs = function (commandId, showUI, value) {
        if (commandId === void 0) { commandId = null; }
        if (showUI === void 0) { showUI = false; }
        if (value === void 0) { value = ""; }
        if (commandId === null) {
          this._internal.commandArgs = null;
        }
        else {
          this._internal.commandArgs = [commandId, showUI, value];
        }
      };
      KeyBindingEvent.prototype.stopPropagation = function () {
        this._internal.propagationStopped = true;
      };
      KeyBindingEvent.prototype.preventDefault = function () {
        this._internal.defaultPrevented = true;
      };
      KeyBindingEvent.PHASE_DOWN = MPCKeyboard.PHASE_DOWN;
      KeyBindingEvent.PHASE_HOLD = MPCKeyboard.PHASE_HOLD;
      KeyBindingEvent.PHASE_UP = MPCKeyboard.PHASE_UP;
      KeyBindingEvent.TYPE_MOUSE = MPCKeyboard.TYPE_MOUSE;
      KeyBindingEvent.TYPE_POINTER = MPCKeyboard.TYPE_POINTER;
      KeyBindingEvent.TYPE_TOUCH = MPCKeyboard.TYPE_TOUCH;
      return KeyBindingEvent;
    }());
    EventManager.KeyBindingEvent = KeyBindingEvent;
    Object.assign(KeyBindingEvent.prototype, {
      PHASE_DOWN: MPCKeyboard.PHASE_DOWN,
      PHASE_HOLD: MPCKeyboard.PHASE_HOLD,
      PHASE_UP: MPCKeyboard.PHASE_UP,
      TYPE_MOUSE: MPCKeyboard.TYPE_MOUSE,
      TYPE_POINTER: MPCKeyboard.TYPE_POINTER,
      TYPE_TOUCH: MPCKeyboard.TYPE_TOUCH
    });
    MPCKeyboard.element.addEventListener("mousedown", _elementDown);
    MPCKeyboard.element.addEventListener("touchstart", _elementDown);
    MPCKeyboard.element.addEventListener("mouseup", _elementUp);
    MPCKeyboard.element.addEventListener("touchcancel", _elementUp);
    MPCKeyboard.element.addEventListener("touchend", _elementUp);
    MPCKeyboard.window.addEventListener("mouseup", _up);
    MPCKeyboard.window.addEventListener("touchcancel", _up);
    MPCKeyboard.window.addEventListener("touchend", _up);
    MPCKeyboard.window.addEventListener("blur", _up);
    function _executeEvent(phase) {
      var keyboard = MPCKeyboard.getActiveKeyboard();
      var internal = {
        code: _active.key.getAttribute("code"),
        key: _active.key.getAttribute("key"),
        phase: phase,
        target: keyboard,
        type: _active.type,
        commandArgs: ["insertText", false, _active.key.getAttribute("key")],
        propagationStopped: false,
        defaultPrevented: false
      };
      var keyDownEvent = new KeyboardEvent(phase == MPCKeyboard.PHASE_DOWN || phase == MPCKeyboard.PHASE_HOLD ? "keydown" : "keyup", {
        altKey: MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT) == MPCKeyboard.MODIFIER_ALT || MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT_LOCK) == MPCKeyboard.MODIFIER_ALT_LOCK,
        bubbles: true,
        key: internal.key,
        cancelable: true,
        code: internal.code,
        ctrlKey: MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL) == MPCKeyboard.MODIFIER_CTRL || MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL_LOCK) == MPCKeyboard.MODIFIER_CTRL_LOCK,
        metaKey: MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META) == MPCKeyboard.MODIFIER_META || MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META_LOCK) == MPCKeyboard.MODIFIER_META_LOCK,
        repeat: phase == MPCKeyboard.PHASE_HOLD,
        shiftKey: MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_SHIFT) == MPCKeyboard.MODIFIER_SHIFT || MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_SHIFT_LOCK) == MPCKeyboard.MODIFIER_SHIFT_LOCK
      });
      if (!MPCKeyboard.Caret.activeElement.dispatchEvent(keyDownEvent)) {
        return;
      }
      var keyBindingEvent = new KeyBindingEvent(internal);
      keyboard.keyBindings && keyboard.keyBindings.forEach(function (keyBinding) {
        if (MPCKeyboard.hasFlag(keyBinding.phases, phase) && (typeof keyBinding.key == "string" ? keyBinding.key == keyBindingEvent.key : keyBinding.key.test(keyBindingEvent.key))) {
          keyBinding.exec(keyBindingEvent);
        }
      });
      if (internal.propagationStopped === false) {
        MPCKeyboard.keyBindings.forEach(function (keyBinding) {
          if (MPCKeyboard.hasFlag(keyBinding.phases, phase) && (typeof keyBinding.key == "string" ? keyBinding.key == keyBindingEvent.key : keyBinding.key.test(keyBindingEvent.key))) {
            keyBinding.exec(keyBindingEvent);
          }
        });
      }
      if (phase == MPCKeyboard.PHASE_UP) {
        return;
      }
      if (!internal.defaultPrevented) {
        var keyPressEvent = new KeyboardEvent("keypress", {
          altKey: MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_ALT) == MPCKeyboard.MODIFIER_ALT,
          bubbles: true,
          key: keyBindingEvent.key,
          cancelable: true,
          code: keyBindingEvent.code,
          ctrlKey: MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL) == MPCKeyboard.MODIFIER_CTRL,
          metaKey: MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_META) == MPCKeyboard.MODIFIER_META,
          repeat: phase == MPCKeyboard.PHASE_HOLD,
          shiftKey: MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_SHIFT) == MPCKeyboard.MODIFIER_SHIFT
        });
        if (!MPCKeyboard.Caret.activeElement.dispatchEvent(keyPressEvent)) {
          return;
        }
      }
      if (internal.commandArgs === null) {
        return;
      }
      MPCKeyboard.Caret.activeDocument.execCommand.apply(MPCKeyboard.Caret.activeDocument, internal.commandArgs);
      MPCKeyboard.Caret.pauseBlinkCaret();
    }
    function _down(event) {
      var key = _toKey(event.target);
      var type = _toEventTypeGroup(event);
      if (key && type) {
        if (_active.key || _active.type) {
          _up();
        }
        _active.key = key;
        _active.type = type;
        _active.key.setAttribute("down", "");
        _executeEvent(MPCKeyboard.PHASE_DOWN);
        _active.timeout = setTimeout(function () {
          _active.interval = setInterval(_hold, 50);
        }, 300);
      }
    }
    function _hold() {
      if (_active.key && _active.type) {
        _executeEvent(MPCKeyboard.PHASE_HOLD);
      }
      else {
        _up();
      }
    }
    function _up() {
      if (_active.key && _active.type) {
        _executeEvent(MPCKeyboard.PHASE_UP);
      }
      _active.key && _active.key.removeAttribute("down");
      _active.key = null;
      _active.type = null;
      if (typeof _active.timeout == "number") {
        clearTimeout(_active.timeout);
      }
      _active.timeout = null;
      if (typeof _active.interval == "number") {
        clearInterval(_active.interval);
      }
      _active.interval = null;
    }
    function _elementDown(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      _down(event);
    }
    function _elementUp(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      _up();
    }
    function _toKey(target) {
      while (target && target.parentElement && !_isKey(target)) {
        target = target.parentElement;
      }
      if (_isKey(target)) {
        return target;
      }
      return null;
    }
    function _isKey(target) {
      return target.nodeType == target.ELEMENT_NODE && target.namespaceURI == MPCKeyboard.UX.keyboardNamespaceURI && target.nodeName == "key";
    }
    function _toEventTypeGroup(event) {
      if (/mouse/.test(event.type)) {
        return "mouse";
      }
      else if (/touch/.test(event.type)) {
        return "touch";
      }
      else if (/pointer/.test(event.type)) {
        return "pointer";
      }
      else {
        return null;
      }
    }
  })(EventManager = MPCKeyboard.EventManager || (MPCKeyboard.EventManager = {}));
})(MPCKeyboard || (MPCKeyboard = {}));
(function (MPCKeyboard) {
  var _hideNativeIME = MPCKeyboardConfiguration.hideNativeIME;
  Object.defineProperty(MPCKeyboard, "hideNativeIME", {
    set: function (value) {
      _hideNativeIME = !!value;
    },
    get: function () {
      return _hideNativeIME;
    },
    enumerable: true
  });
})(MPCKeyboard || (MPCKeyboard = {}));
(function (MPCKeyboard) {
  var Caret;
  (function (Caret) {
    Caret.version = "2019.05.17";
    Caret.element = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.htmlNamespaceURI, "caret");
    Caret.activeElement = MPCKeyboard.document.activeElement;
    Caret.activeDocument = MPCKeyboard.document;
    Caret.activeWindow = MPCKeyboard.window;
    Caret.activeInputMode = "";
    var _frames = [];
    var _customCaret = false;
    var _blinkCaret = true;
    var _blinkInterval = 150;
    var _blinkTimeout = _blinkInterval;
    MPCKeyboard.UX.style.textContent +=
      'keyboard html|caret{all:initial;z-index:99997;display:none;position:fixed;top:0;left:0;width:1px;background:#000;}' +
      'keyboard html|caret.blink{display:none!important;}';
    MPCKeyboard.element.appendChild(Caret.element);
    setInterval(function () {
      _blinkTimeout--;
      if (_blinkTimeout < 0) {
        _blinkTimeout = _blinkInterval;
        _blinkCaret = !_blinkCaret;
      }
    }, 1);
    _frameChange(MPCKeyboard.window);
    function _setActiveElement(event) {
      if (Caret.activeElement instanceof Caret.activeWindow.HTMLElement && "inputMode" in Caret.activeElement) {
        Caret.activeElement.inputMode = Caret.activeInputMode;
      }
      if (this.document.activeElement instanceof this.HTMLIFrameElement) {
        _frameChange(this.document.activeElement.contentWindow);
        return;
      }
      Caret.activeElement = this.document.activeElement;
      Caret.activeDocument = Caret.activeElement.ownerDocument;
      Caret.activeWindow = Caret.activeDocument.defaultView;
      if (Caret.activeElement instanceof Caret.activeWindow.HTMLElement && "inputMode" in Caret.activeElement) {
        _customCaret = false;
        Caret.activeInputMode = Caret.activeElement.inputMode;
        if (MPCKeyboard.hideNativeIME) {
          Caret.activeElement.inputMode = "none";
        }
      }
      else {
        _customCaret = true;
        requestAnimationFrame(_updateCaret);
      }
    }
    Caret._setActiveElement = _setActiveElement;
    function pauseBlinkCaret() {
      _blinkCaret = false;
      _blinkTimeout = _blinkInterval;
    }
    Caret.pauseBlinkCaret = pauseBlinkCaret;
    function _frameChange(frame) {
      if (_frames.indexOf(frame) == -1) {
        frame.addEventListener("focusin", _setActiveElement, true);
        frame.addEventListener("focusout", _setActiveElement, true);
        frame.addEventListener("focus", _setActiveElement, true);
        frame.addEventListener("blur", _setActiveElement, true);
        _frames.push(frame);
        _setActiveElement.call(frame, { type: "focus" });
      }
    }
    function _updateCaret() {
      if (!MPCKeyboard.hideNativeIME) {
        Caret.element.style.display = "";
        return;
      }
      var frames_top = 0;
      var frames_left = 0;
      var rect;
      var tmp_window = Caret.activeWindow;
      while (tmp_window && tmp_window.frameElement && tmp_window !== MPCKeyboard.window) {
        rect = tmp_window.frameElement.getBoundingClientRect();
        frames_top += rect.top;
        frames_left += rect.left;
        tmp_window = tmp_window.frameElement.ownerDocument.defaultView;
      }
      var selection = Caret.activeDocument.getSelection() || Caret.activeWindow.getSelection();
      if (selection && selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        if (range.collapsed && MPCKeyboard.UX.isVisible()) {
          if (Caret.activeElement instanceof Caret.activeWindow.HTMLInputElement || Caret.activeElement instanceof Caret.activeWindow.HTMLTextAreaElement) {
            Caret.element.style.display = "";
            return;
          }
          rect = range.getBoundingClientRect();
          Caret.element.style.display = "block";
          if (rect.height == 0 && rect.top == 0) {
            var ancestor = range.commonAncestorContainer.nodeType == Caret.activeWindow.document.ELEMENT_NODE ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
            if (ancestor instanceof Caret.activeWindow.HTMLElement && ancestor.isContentEditable === true) {
              rect = ancestor.getBoundingClientRect();
            }
            else {
              Caret.element.style.display = "";
              return;
            }
          }
          Caret.element.style.top = frames_top + rect.top + "px";
          Caret.element.style.left = frames_left + rect.left + "px";
          Caret.element.style.height = rect.height + "px";
          if (Caret.activeElement instanceof Caret.activeWindow.HTMLElement && MPCKeyboard.hideNativeIME) {
            Caret.activeElement.blur();
          }
        }
        else {
          Caret.element.style.display = "";
        }
      }
      if (_customCaret) {
        requestAnimationFrame(_updateCaret);
      }
    }
    (function _blink() {
      Caret.element.classList.toggle("blink", _blinkCaret);
      requestAnimationFrame(_blink);
    })();
  })(Caret = MPCKeyboard.Caret || (MPCKeyboard.Caret = {}));
})(MPCKeyboard || (MPCKeyboard = {}));
(function (MPCKeyboard) {
  var Menu;
  (function (Menu) {
    Menu.version = "2019.05.17";
    Menu.element = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.keyboardNamespaceURI, "menu");
    var _allowCustomLayouts = MPCKeyboardConfiguration.allowCustomLayouts;
    var _toggle = _createCustomItem("\u2328", "Anzeigen", function (event) {
      MPCKeyboard.UX.show();
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
    });
    MPCKeyboard.UX.style.textContent += 'menu{display:none;z-index:99999;position:fixed;left:0;bottom:0;font-size:16px;line-height:1.08;caret:default;user-select:none;padding:0.25em 0;margin:0;box-shadow:0 0 0.5em 0#000;max-height:80%;max-width:100%;overflow:auto;overflow-x:hidden;}' +
      'menu[show]{display:block;}' +
      'menuitem{display:block;padding:0.5em;white-space:nowrap;}' +
      'name{display:inline-block;width:2.5em;vertical-align:top;text-align:center;overflow:hidden;}' +
      'desc{display:inline-block;margin:0 0.5em;}' +
      'br{display:block;}' +
      'hr{display:block;height:1px;background:#333;margin:0.25em 0;}';
    MPCKeyboard.element.appendChild(Menu.element);
    MPCKeyboard.element.appendChild(_toggle);
    function createMenu(langList) {
      _clearMenu();
      if (langList.length > 0) {
        langList.forEach(function (lang) { return Menu.element.appendChild(_createMenuitem(lang)); });
        var hr = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.keyboardNamespaceURI, "hr");
        Menu.element.appendChild(hr);
      }
      if (_allowCustomLayouts) {
        Menu.element.appendChild(_createCustomItem("", "Sprache hinzufügen", _settingsItemDown));
      }
      if (_allowCustomLayouts) {
        Menu.element.appendChild(_createCustomItem(MPCKeyboard.hideNativeIME ? "\u2611" : "\u2610", "Native Eingabegeräte ausblenden", _toggleNativeKeyboard));
      }
      if (MPCKeyboard.UX.isVisible()) {
        Menu.element.appendChild(_createCustomItem("\u2328", "Verstecken", function (event) {
          MPCKeyboard.UX.hide();
          event.preventDefault();
          event.stopImmediatePropagation();
          event.stopPropagation();
        }));
      }
      Menu.element.setAttribute("show", "");
      MPCKeyboard.window.addEventListener("mousedown", _globalDown, true);
      MPCKeyboard.window.addEventListener("touchstart", _globalDown, true);
    }
    Menu.createMenu = createMenu;
    function _globalDown(event) {
      if (!Menu.element.contains(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
      _clearMenu();
      MPCKeyboard.window.removeEventListener("mousedown", _globalDown, true);
      MPCKeyboard.window.removeEventListener("touchstart", _globalDown, true);
    }
    function _createMenuitem(_a) {
      var name = _a.name, code = _a.code, desc = _a.desc, active = _a.active;
      var menuitem = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.keyboardNamespaceURI, "menuitem");
      var langElement = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.keyboardNamespaceURI, "name");
      var descElement = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.keyboardNamespaceURI, "desc");
      if (active === true) {
        menuitem.setAttribute("active", "");
      }
      menuitem.setAttribute("code", code);
      menuitem.addEventListener("mousedown", _menuItemDown, true);
      menuitem.addEventListener("touchstart", _menuItemDown, true);
      langElement.innerHTML = name.replace("\n", "<br/>");
      menuitem.appendChild(langElement);
      descElement.innerHTML = desc.replace("\n", "<br/>");
      menuitem.appendChild(descElement);
      return menuitem;
    }
    function _createCustomItem(name, label, action) {
      var menuitem = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.keyboardNamespaceURI, "menuitem");
      var langElement = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.keyboardNamespaceURI, "name");
      var descElement = MPCKeyboard.document.createElementNS(MPCKeyboard.UX.keyboardNamespaceURI, "desc");
      menuitem.addEventListener("mousedown", action, true);
      menuitem.addEventListener("touchstart", action, true);
      langElement.textContent = name;
      menuitem.appendChild(langElement);
      descElement.textContent = label;
      menuitem.appendChild(descElement);
      return menuitem;
    }
    function _clearMenu() {
      while (Menu.element.firstChild) {
        Menu.element.removeChild(Menu.element.firstChild);
      }
      Menu.element.removeAttribute("show");
    }
    function _menuItemDown(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      MPCKeyboard.setActiveKeyboard(this.getAttribute("code"));
    }
    function _settingsItemDown(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var value = prompt("Setze eine Sprache:");
      if (value) {
        MPCKeyboard.setActiveKeyboard(value);
      }
    }
    function _toggleNativeKeyboard(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      MPCKeyboard.hideNativeIME = !MPCKeyboard.hideNativeIME;
      MPCKeyboard.Caret._setActiveElement.call(MPCKeyboard.Caret.activeWindow, { type: "hideNativeIMEchange" });
    }
  })(Menu = MPCKeyboard.Menu || (MPCKeyboard.Menu = {}));
})(MPCKeyboard || (MPCKeyboard = {}));
if (MPCKeyboardConfiguration.loadLazy) {
  MPCKeyboard.lazyLoadKeyboards(MPCKeyboardConfiguration.layouts, MPCKeyboardConfiguration.hidden);
}
else {
  MPCKeyboard.loadKeyboards(MPCKeyboardConfiguration.layouts, MPCKeyboardConfiguration.hidden);
}