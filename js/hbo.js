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
    name: "<b>עבר</b>",
    code: "HBO",
    description: "Hebräisch\n(Standard)",
    version: "2019.05.15",
    imports: ["https://fonts.googleapis.com/earlyaccess/notosanshebrew.css"],
    style: 'keyboard{font-family:"Noto Sans","Noto Sans Hebrew",Calibri,Roboto,Arial,sans-serif;}',
    keyMap: {
        AltLeft: ["Alt", "Alt"],
        Backspace: ["\u27f5", "Backspace"],
        Comma: "ת",
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
        KeyA: "ש",
        KeyB: "נ",
        KeyC: "ב",
        KeyD: "ג",
        KeyE: "ק",
        KeyF: "כ",
        KeyG: "ע",
        KeyH: "י",
        KeyI: "ן",
        KeyJ: "ח",
        KeyK: "ל",
        KeyL: "ך",
        KeyM: "צ",
        KeyN: "מ",
        KeyO: "ם",
        KeyP: "פ",
        KeyR: "ר",
        KeyS: "ד",
        KeyT: "א",
        KeyU: "ו",
        KeyV: "ה",
        KeyW: "?",
        KeyX: "ס",
        KeyY: "ז",
        KeyZ: "ט",
        Language: ["עבר", "Language"],
        Minus: "-",
        Period: "ץ",
        Quote: "*",
        Semicolon: "ף",
        Slash: "+",
        Space: ["\u23b5", "Space"]
    },
    keyMaps: {
        ctrlAlt: {
            Digit1: ["◌ְ", "ְ"],
            Digit2: ["◌ֱ", "ֱ"],
            Digit3: ["◌ֲ", "ֲ"],
            Digit4: ["◌ֳ", "ֳ"],
            Digit5: ["◌ִ", "ִ"],
            Digit6: ["◌ֵ", "ֵ"],
            Digit7: ["◌ֶ", "ֶ"],
            Digit8: ["◌ַ", "ַ"],
            Digit9: ["◌ָ", "ָ"],
            Digit0: ["◌ֹ", "ֹ"],
            KeyW: ["◌ֺ", "ֺ"],
            Minus: ["◌ֻ", "ֻ"],
            KeyE: ["◌ּ", "ּ"],
            KeyR: ["◌ֽ", "ֽ"],
            KeyT: "־",
            KeyY: ["◌ֿ", "ֿ"],
            KeyU: ["◌ׁ", "ׁ"],
            KeyI: ["◌ׂ", "ׂ"],
            KeyO: ["◌ׄ", "ׄ"],
            KeyP: ["◌ׅ", "ׅ"],
            KeyS: ["◌ׇ", "ׇ"],
            KeyF: "ײ",
            KeyG: "ױ",
            KeyH: "װ",
            KeyJ: "₪",
            Slash: ["LTR", "\u200e"],
            KeyC: "׀",
            KeyV: "׃",
            KeyB: "׆",
            KeyN: "׳",
            KeyM: "״",
            Quote: ["RTL", "\u200f"],
            ShiftLeft: ["\u21d1", "Shift"],
            Backspace: ["\u27f5", "Backspace"],
            Language: ["עבר", "Language"],
            ControlLeft: ["Strg", "Control"],
            Space: ["\u23b5", "Space"],
            AltLeft: ["Alt", "Alt"],
            Enter: ["\u21b2", "Enter"]
        },
        shiftCtrlAlt: {
            Digit1: ["◌֑", "֑"],
            Digit2: ["◌֒", "֒"],
            Digit3: ["◌֓", "֓"],
            Digit4: ["◌֔", "֔"],
            Digit5: ["◌֕", "֕"],
            Digit6: ["◌֖", "֖"],
            Digit7: ["◌֗", "֗"],
            Digit8: ["◌֘", "֘"],
            Digit9: ["◌֙", "֙"],
            Digit0: ["◌֚", "֚"],
            KeyW: ["◌֙", "֙"],
            Minus: ["◌֚", "֚"],
            KeyE: ["◌֛", "֛"],
            KeyR: ["◌֜", "֜"],
            KeyT: ["◌֝", "֝"],
            KeyY: ["◌֞", "֞"],
            KeyU: ["◌֟", "֟"],
            KeyI: ["◌֠", "֠"],
            KeyO: ["◌֡", "֡"],
            KeyP: ["◌֢", "֢"],
            KeyA: ["◌֣", "֣"],
            KeyS: ["◌֤", "֤"],
            KeyD: ["◌֥", "֥"],
            KeyF: ["◌֦", "֦"],
            KeyG: ["◌֧", "֧"],
            KeyH: ["◌֨", "֨"],
            KeyJ: ["◌֩", "֩"],
            KeyK: ["◌֪", "֪"],
            KeyL: ["◌֫", "֫"],
            Semicolon: ["◌֬", "֬"],
            KeyC: ["◌֭", "֭"],
            KeyV: ["◌֮", "֮"],
            KeyN: ["◌֯", "֯"],
            Comma: ["CGJ", "\u034f"],
            Period: ["ZWNJ", "\u200c"],
            Quote: ["ZWJ", "\u200d"],
            ShiftLeft: ["\u21d1", "Shift"],
            Backspace: ["\u27f5", "Backspace"],
            Language: ["עבר", "Language"],
            ControlLeft: ["Strg", "Control"],
            Space: ["\u23b5", "Space"],
            AltLeft: ["Alt", "Alt"],
            Enter: ["\u21b2", "Enter"]
        }
    },
    layout: [
        "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0",
        "KeyW", "Minus", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
        "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon",
        "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "#Backspace",
        "#Language:3", "#ControlLeft", "Slash", "#Space:6", "Quote", "#AltLeft", "#Enter:3"
    ],
    layouts: {
        ctrlAlt: [
            "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0",
            "KeyW", "Minus", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
            "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon",
            "#ShiftLeft", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "#Backspace",
            "#Language:3", "#ControlLeft", "Slash", "#Space:6", "Quote", "#AltLeft", "#Enter:3"
        ]
    },
    getLayout: function () {
        if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT) == (MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT)) {
            return this.layouts.ctrlAlt;
        }
        return this.layout;
    },
    getKeyMap: function () {
        if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_SHIFT | MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT) == (MPCKeyboard.MODIFIER_SHIFT | MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT)) {
            return this.keyMaps.shiftCtrlAlt;
        }
        else if (MPCKeyboard.hasFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT) == (MPCKeyboard.MODIFIER_CTRL | MPCKeyboard.MODIFIER_ALT)) {
            return this.keyMaps.ctrlAlt;
        }
        MPCKeyboard.UX.setModifiers(MPCKeyboard.removeFlag(MPCKeyboard.UX.getModifiers(), MPCKeyboard.MODIFIER_SHIFT));
        return this.keyMap;
    },
    setModifiers: function (modifiers) {
        this.modifiers = modifiers;
        MPCKeyboard.UX.build();
        return modifiers;
    }
});