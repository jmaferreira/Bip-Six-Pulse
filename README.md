# Bip Six Pulse

Bip Six Pulse is a minimal digital watch face for the **Amazfit Bip 6** (390 × 450). It pairs tall, smooth custom numerals with a restrained activity ring.

## Features

- Tall anti-aliased 24-hour digits.
- A centred `:` that fades out for one second and back in for one second.
- Rounded perimeter step progress: 50% grey for completed progress and 20% grey for the remaining goal.
- Date and step count that fade in over four seconds whenever the display wakes.
- Native layout for every Bip 6 variant configured in `app.json`.

## Build

Install Node.js 18 or newer, then run:

```sh
npm install
npm run generate:digits
npm run generate:ring
npm run build
```

The release package is written to `dist/`. Use `npm run preview` to generate a Zepp OS preview build, or `npm run bridge` to install through the Zepp developer bridge.

## Project structure

- `app.json` — Zepp package metadata and Bip 6 targets.
- `watchface/default-target/index.js` — watch face layout, animation, sensors, and display lifecycle.
- `assets/bip-6/` — packaged store icon, cover, and generated watch-face assets.
- `design/bip-six-pulse-thumbnail.svg` — editable source for the store cover image.
- `scripts/` — generators for the numeral and rounded-ring bitmap assets.

## Metadata and support

- **Author / vendor:** Miguel Ferreira
- **Support:** [jmaferreira+zepp@gmail.com](mailto:jmaferreira+zepp@gmail.com)
- **Source and homepage:** [github.com/jmaferreira/Bip-Six-Pulse](https://github.com/jmaferreira/Bip-Six-Pulse)

## License

Copyright (C) 2026 Miguel Ferreira. This project is licensed under [GNU GPL v3.0 only](LICENSE).
