# Move — Comer Fora (B2C)

React web app implementing the structure of the **"Comer Fora"** wireframe
(Figma frame `3:1655` in `cMhyOvWvhsuRtOjTLvFvDH`).

## Stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- Plain CSS with design tokens (no UI framework / no Tailwind yet)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Structure

```
src/
├── styles/
│   ├── tokens.css          # design tokens lifted from the wireframe (colors, radius, spacing)
│   └── global.css          # resets + base styles
├── App.tsx                 # page composition (brand block → merchant rail → sections)
└── components/
    ├── Skeleton/           # gray placeholder box (reused for title/"see all" bars)
    ├── BrandHeader/        # top brand block with the "Comer Fora" logo
    ├── MerchantRail/       # "Categorias" rail – 56px category circles (Figma 2:8356)
    ├── SectionHeader/      # section title + "see all" action row
    ├── StoreCard/          # placeholder store card (height 200 | 310)
    └── ContentSection/     # reusable section: header + responsive card grid
```

## Building on this

- **Design tokens** live in [src/styles/tokens.css](src/styles/tokens.css).
  Swap the placeholder values for the final brand palette.
- **Section titles / "see all" links** render as gray skeleton bars by default.
  Pass `title` and `actionLabel` to `ContentSection` to render real text.
- **Cards and merchant logos** are plain gray placeholders – replace them with
  the real card/logo components and data as the screens come in.
- The app frame is capped at the wireframe width (834px); the layout already
  scrolls/adapts below it.
