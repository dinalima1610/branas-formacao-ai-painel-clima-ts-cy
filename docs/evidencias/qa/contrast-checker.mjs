const checks = [
  {
    id: "BUG-01-before-language-selected",
    foreground: "#ffffff",
    background: "#cc785c",
    note: "Before: selected language text on original coral.",
  },
  {
    id: "BUG-01-after-language-selected",
    foreground: "#ffffff",
    background: "#a9583e",
    note: "After: selected language text on darker coral.",
  },
  {
    id: "BUG-01-after-retry-button",
    foreground: "#ffffff",
    background: "#a9583e",
    note: "After: small retry button text on darker coral.",
  },
  {
    id: "BUG-01-before-search-hint",
    foreground: "#6c6a64",
    background: "#efe9de",
    note: "Before: search hint text on search panel.",
  },
  {
    id: "BUG-01-after-search-hint",
    foreground: "#5f5b54",
    background: "#efe9de",
    note: "After: search hint text on search panel.",
  },
  {
    id: "BUG-01-after-placeholder",
    foreground: "#5f5b54",
    background: "#faf9f5",
    note: "After: search placeholder/status text on input canvas.",
  },
  {
    id: "BUG-01-after-cy-primary-text",
    foreground: hslToHex(15, 46, 45),
    background: "#faf9f5",
    note: "After: painel_clima_cy small primary text on canvas.",
  },
  {
    id: "BUG-01-after-cy-primary-button",
    foreground: "#ffffff",
    background: hslToHex(15, 46, 45),
    note: "After: painel_clima_cy primary button text on primary background.",
  },
  {
    id: "BUG-01-after-cy-muted-text",
    foreground: hslToHex(45, 6, 35),
    background: hslToHex(37, 39, 94),
    note: "After: painel_clima_cy muted text on soft surface.",
  },
];

const results = checks.map((check) => {
  const ratio = contrastRatio(check.foreground, check.background);

  return {
    ...check,
    ratio: Number(ratio.toFixed(2)),
    wcagAaNormalText: ratio >= 4.5 ? "PASS" : "FAIL",
  };
});

console.log(JSON.stringify(results, null, 2));

function contrastRatio(foreground, background) {
  const fg = relativeLuminance(hexToRgb(foreground));
  const bg = relativeLuminance(hexToRgb(background));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);

  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance([red, green, blue]) {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function hslToHex(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return `#${[r, g, b]
    .map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}
