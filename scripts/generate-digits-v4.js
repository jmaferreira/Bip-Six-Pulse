const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const outputDir = path.join(__dirname, '..', 'assets', 'bip-6', 'images', 'digits-v4')
const digitWidth = 52
const digitHeight = 165
const stroke = 13

const glyphs = {
  0: '<rect x="9" y="7" width="34" height="151" rx="17"/>',
  1: '<path d="M4 33L24 7V158M4 158H46"/>',
  2: '<path d="M8 30A23 23 0 0 1 31 7H33A12 12 0 0 1 45 19V45L7 158H46"/>',
  3: '<path d="M8 10H30A15 15 0 0 1 45 25V65A15 15 0 0 1 30 80H16M16 80H30A15 15 0 0 1 45 95V140A18 18 0 0 1 27 158H8"/>',
  4: '<path d="M41 158V7M7 100H46M7 100L34 7"/>',
  5: '<path d="M45 7H9V76H30A15 15 0 0 1 45 91V140A18 18 0 0 1 27 158H8"/>',
  6: '<path d="M44 20A17 17 0 0 0 27 7H23A14 14 0 0 0 9 21V141A17 17 0 0 0 26 158H29A16 16 0 0 0 45 142V96A17 17 0 0 0 28 79H9"/>',
  7: '<path d="M7 7H46L19 158"/>',
  8: '<rect x="9" y="7" width="34" height="151" rx="17"/><path d="M9 82H43"/>',
  9: '<path d="M7 81H31A14 14 0 0 0 45 67V24A17 17 0 0 0 28 7H24A17 17 0 0 0 7 24V64A17 17 0 0 0 24 81H45V141A17 17 0 0 1 28 158"/>',
}

function render(svg, destination) {
  const result = spawnSync('rsvg-convert', ['-w', String(svg.width), '-h', String(svg.height)], {
    input: svg.body,
    encoding: null,
  })

  if (result.status !== 0) {
    throw new Error(result.stderr ? result.stderr.toString() : 'rsvg-convert failed')
  }

  fs.writeFileSync(destination, result.stdout)
}

function digitSvg(glyph) {
  return {
    width: digitWidth,
    height: digitHeight,
    body: `<svg xmlns="http://www.w3.org/2000/svg" width="${digitWidth}" height="${digitHeight}" viewBox="0 0 ${digitWidth} ${digitHeight}" shape-rendering="geometricPrecision"><g fill="none" stroke="#FFFFFF" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${glyph}</g></svg>`,
  }
}

function colonSvg(opacity) {
  return {
    width: 24,
    height: digitHeight,
    body: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="${digitHeight}" viewBox="0 0 24 ${digitHeight}" shape-rendering="geometricPrecision"><g fill="#FFFFFF" opacity="${opacity}"><circle cx="12" cy="51" r="10"/><circle cx="12" cy="115" r="10"/></g></svg>`,
  }
}

fs.mkdirSync(outputDir, { recursive: true })

// Keep generated assets reproducible when the animation cadence changes.
fs.readdirSync(outputDir)
  .filter((name) => /^colon-\d+\.png$/.test(name))
  .forEach((name) => fs.unlinkSync(path.join(outputDir, name)))

Object.keys(glyphs).forEach((digit) => {
  render(digitSvg(glyphs[digit]), path.join(outputDir, `${digit}.png`))
})

;[
  ['100', 1], ['95', 0.95], ['90', 0.9], ['85', 0.85], ['80', 0.8],
  ['75', 0.75], ['70', 0.7], ['65', 0.65], ['60', 0.6], ['55', 0.55],
  ['50', 0.5], ['45', 0.45], ['40', 0.4], ['35', 0.35], ['30', 0.3],
  ['25', 0.25], ['20', 0.2], ['15', 0.15], ['10', 0.1], ['5', 0.05], ['0', 0],
].forEach(([name, opacity]) => {
  render(colonSvg(opacity), path.join(outputDir, `colon-${name}.png`))
})

console.log(`Generated rounded digital glyphs in ${outputDir}`)
