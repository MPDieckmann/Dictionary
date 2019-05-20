(function (global, keyboard) {
  if (global.MPCKeyboard && typeof global.MPCKeyboard.defineKeyboard == "function") {
      global.MPCKeyboard.defineKeyboard(keyboard);
  }
  else {
      if (!global.MPCKeyboardConfiguration) {
          global.MPCKeyboardConfiguration = {};
      }
      if (!global.MPCKeyboardConfiguration.layouts) {
          global.MPCKeyboardConfiguration.layouts = [];
      }
      global.MPCKeyboardConfiguration.layouts.push(keyboard);
  }
})(self, {
  name: "<b>DEU</b>",
  code: "DEU",
  description: "Deutsch\n(Standard)",
  version: "2019.05.15",
  keyMaps: {
      shift: {
          AltLeft: ["Alt", "Alt"],
          Backspace: ["\u27f5", "Backspace"],
          Comma: ";",
          ControlLeft: ["Strg", "Control"],
          Digit0: "=",
          Digit1: "!",
          Digit2: "\"",
          Digit3: "§",
          Digit4: "?",
          Digit5: "%",
          Digit6: "&",
          Digit7: "/",
          Digit8: "(",
          Digit9: ")",
          Enter: ["\u21b2", "Enter"],
          KeyA: "A",
          KeyB: "B",
          KeyC: "C",
          KeyD: "D",
          KeyE: "E",
          KeyF: "F",
          KeyG: "G",
          KeyH: "H",
          KeyI: "I",
          KeyJ: "J",
          KeyK: "K",
          KeyL: "L",
          KeyM: "M",
          KeyN: "N",
          KeyO: "O",
          KeyP: "P",
          KeyQ: "Q",
          KeyR: "R",
          KeyS: "S",
          KeyT: "T",
          KeyU: "U",
          KeyV: "V",
          KeyW: "W",
          KeyX: "X",
          KeyY: "Z",
          KeyZ: "Y",
          Language: ["DEU", "Language"],
          Period: ":",
          ShiftLeft: ["\u21d1", "Shift"],
          Space: ["\u23b5", "Space"]
      },
      ctrlAlt: {
          AltLeft: ["Alt", "Alt"],
          Backspace: ["\u27f5", "Backspace"],
          ControlLeft: ["Strg", "Control"],
          Digit1: "$",
          Digit2: "²",
          Digit3: "³",
          Digit4: "^",
          Digit5: "°",
          Digit6: "|",
          Digit7: "{",
          Digit8: "[",
          Digit9: "]",
          Digit0: "}",
          Enter: ["\u21b2", "Enter"],
          KeyA: "ä",
          KeyD: "#",
          KeyE: "€",
          KeyF: "*",
          KeyG: "+",
          KeyH: "-",
          KeyI: "<",
          KeyJ: "_",
          KeyK: "~",
          KeyM: "µ",
          KeyO: "ö",
          KeyP: ">",
          KeyQ: "@",
          KeyR: "`",
          KeyS: "ß",
          KeyT: "'",
          KeyU: "ü",
          KeyW: "\\",
          KeyY: "´",
          Language: ["DEU", "Language"],
          ShiftLeft: ["\u21d1", "Shift"],
          Space: ["\u23b5", "Space"]
      },
      shiftCtrlAlt: {
          AltLeft: ["Alt", "Alt"],
          Backspace: ["\u27f5", "Backspace"],
          ControlLeft: ["Strg", "Control"],
          Enter: ["\u21b2", "Enter"],
          KeyA: "Ä",
          KeyO: "Ö",
          KeyS: "ẞ",
          KeyU: "Ü",
          Language: ["DEU", "Language"],
          ShiftLeft: ["\u21d1", "Shift"],
          Space: ["\u23b5", "Space"]
      }
  },
  keyMap: {
      AltLeft: ["Alt", "Alt"],
      Backspace: ["\u27f5", "Backspace"],
      Comma: ",",
      ControlLeft: ["Strg", "Control"],
      Digit0: "0",
      Digit1: "1",
      Digit2: "2",
      Digit3: "3",
      Digit4: "4",
      Digit5: "5",
      Digit6: "6",
      Digit7: "7",
      Digit8: "8",
      Digit9: "9",
      Enter: ["\u21b2", "Enter"],
      KeyA: "a",
      KeyB: "b",
      KeyC: "c",
      KeyD: "d",
      KeyE: "e",
      KeyF: "f",
      KeyG: "g",
      KeyH: "h",
      KeyI: "i",
      KeyJ: "j",
      KeyK: "k",
      KeyL: "l",
      KeyM: "m",
      KeyN: "n",
      KeyO: "o",
      KeyP: "p",
      KeyQ: "q",
      KeyR: "r",
      KeyS: "s",
      KeyT: "t",
      KeyU: "u",
      KeyV: "v",
      KeyW: "w",
      KeyX: "x",
      KeyY: "z",
      KeyZ: "y",
      Language: ["DEU", "Language"],
      Period: ".",
      ShiftLeft: ["\u21d1", "Shift"],
      Space: ["\u23b5", "Space"]
  },
  layout: [
      "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0",
      "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
      null, "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", null,
      "#ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "#Backspace:4",
      "#Language:3", "#ControlLeft", "Comma", "#Space:6", "Period", "#AltLeft", "#Enter:3"
  ],
  getKeyMap: function () {
      if (MPCKeyboard.hasFlag(this.modifiers, MPCKeyboard.MODIFIER_SHIFT | MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT) == (MPCKeyboard.MODIFIER_SHIFT | MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT)) {
          return this.keyMaps.shiftCtrlAlt;
      }
      else if (MPCKeyboard.hasFlag(this.modifiers, MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT) == (MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT)) {
          return this.keyMaps.ctrlAlt;
      }
      else if (MPCKeyboard.hasFlag(this.modifiers, MPCKeyboard.MODIFIER_SHIFT) == MPCKeyboard.MODIFIER_SHIFT) {
          return this.keyMaps.shift;
      }
      else {
          return this.keyMap;
      }
  },
  keyBindings: []
});