# Euijong Song

Personal academic homepage: https://euijongsong.github.io/

GitHub Pages serves the repository root from `main`. The checked-in `index.html`,
`assets/` and `fonts/` are generated from `site/`. The HTML is pre-rendered so the
introduction, graph links, CV and publications are present before JavaScript runs.

## Edit and build

Requires Node.js 22 or later.

```sh
cd site
npm ci
npm run dev
```

Edit `site/src/App.jsx` for content and `site/src/styles.css` for presentation.
Then run `npm run build` from `site/` and commit the source and generated root
files together. A push to `main` triggers the existing GitHub Pages deployment.

The graph uses native anchors and retains compatibility with the former
`#sec-about`, `#sec-research`, `#sec-cv`, `#sec-papers`, `#sec-contact`, and
`#sec-unobserved` links. Self-hosted Lato is distributed under the license in
`fonts/OFL.txt`.
