const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const outputDir = path.join(__dirname, '..', 'assets', 'bip-6', 'images', 'ring-v2')
const size = 92
const center = 46
const radius = 42
const stroke = 8
const trackColor = '#333333'
const completeColor = '#808080'
const corners = {
  tr: [-90, 0],
  br: [0, 90],
  bl: [90, 180],
  tl: [180, 270],
}

function point(angle) {
  const radians = angle * Math.PI / 180
  return [center + radius * Math.cos(radians), center + radius * Math.sin(radians)]
}

function svgFor(corner, fraction, color) {
  if (!fraction) return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"/>`

  const [start, finish] = corners[corner]
  const end = start + (finish - start) * fraction
  const [startX, startY] = point(start)
  const [endX, endY] = point(end)
  const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision"><path d="${pathData}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"/></svg>`
}

function render(svg, destination) {
  const result = spawnSync('rsvg-convert', ['-w', String(size), '-h', String(size)], {
    input: svg,
    encoding: null,
  })
  if (result.status !== 0) {
    throw new Error(result.stderr ? result.stderr.toString() : 'rsvg-convert failed')
  }
  fs.writeFileSync(destination, result.stdout)
}

fs.mkdirSync(outputDir, { recursive: true })

Object.keys(corners).forEach((corner) => {
  render(svgFor(corner, 1, trackColor), path.join(outputDir, `corner-track-${corner}.png`))
  for (let step = 0; step <= 16; step += 1) {
    render(svgFor(corner, step / 16, completeColor), path.join(outputDir, `corner-${corner}-${step}.png`))
  }
})

console.log(`Generated continuous corner assets in ${outputDir}`)
