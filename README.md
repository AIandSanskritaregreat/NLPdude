# MathCore

**The visual mathematics of machine learning and linguistics.**

MathCore is an interactive course on the mathematics behind language models. Each chapter works through the derivations step by step and pairs them with live, in-browser visualizations and quizzes. It is a static website: no build step, no backend, no dependencies to install.

## Curriculum

| Chapter | Topic |
| ------- | ----- |
| 01 | Introduction to NLP |
| 02 | Words and Tokens |
| 03 | N-gram Language Models |
| 04 | Logistic Regression & Text Classification |
| 05 | Embeddings |
| 06 | Neural Networks |
| 07 | Large Language Models |
| 08 | Transformers |
| 09 | Post-Training: RLHF & Alignment |
| 10 | Masked Language Models |
| 11 | Information Retrieval & RAG |
| 12 | Machine Translation |
| 13 | RNNs and LSTMs |
| 14 | Phonetics & Speech Feature Extraction |
| 15 | Automatic Speech Recognition |
| 16 | Text-to-Speech |

## Running locally

Serve the repository root with any static file server, then open the printed address:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

You can also open `index.html` directly in a browser. Everything works that way except the live GPT-2 demo in Chapter 7, which needs to be served over `http(s)://` (the page tells you when this is the case).

## Deploying to GitHub Pages

1. Go to **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick the branch, and set the folder to **`/ (root)`**.

`index.html` is the entry point. The `.nojekyll` file tells Pages to serve the files as they are.

## Project structure

```
.
├── index.html                  Page markup; loads everything below
└── assets/
    ├── css/
    │   ├── main.css            Design system: tokens, layout, components
    │   ├── accessibility.css   Focus styles, skip link, reduced motion
    │   ├── responsive.css      Small-screen layout for the full-screen explorers
    │   └── gallery.css         Classroom photo gallery
    ├── js/
    │   ├── core/
    │   │   ├── lesson-engine.js    Math rendering, lesson and section views, quizzes
    │   │   ├── hero-equations.js   Clickable equation wallpaper on the home page
    │   │   ├── shell.js            Tabs, curriculum cards, lesson navigation
    │   │   ├── navigation.js       Shared navigation, focus, and cleanup helpers
    │   │   └── photo-gallery.js    Photo lightbox
    │   └── chapters/
    │       ├── 02-words-and-tokens.js
    │       ├── ...                 One file per chapter: section pages,
    │       └── 16-text-to-speech.js    visualizations, and quizzes
    ├── images/
    │   ├── favicon.svg
    │   └── classroom/          Photos from teaching sessions
    └── vendor/
        └── katex/              KaTeX 0.16.9 (math typesetting), with its license
```

### How the scripts fit together

The JavaScript files are plain (non-module) scripts that share one global scope. `index.html` loads them in a fixed order, and **that order matters**: later chapters reuse helpers that earlier chapters define. For example, the canvas and figure helpers in Chapter 4 (`lr*`) are used again in Chapters 5 to 7, and the drawing helpers in Chapter 12 (`mt*`) are shared by Chapters 12 to 16. When you add a file, add its `<script>` tag after the files it depends on.

Chapter 1 has no interactive instruments, so its text lives with the lesson registry in `core/lesson-engine.js`.

## Third-party software

- [KaTeX](https://katex.org/) 0.16.9, MIT license. It is bundled in `assets/vendor/katex/` so math renders offline. The JavaScript and fonts are the unmodified release files; the stylesheet only loads the `.woff2` fonts.
- [Google Fonts](https://fonts.google.com/): Bricolage Grotesque, Schibsted Grotesk, and IBM Plex Mono, loaded from Google's CDN.
- [Transformers.js](https://github.com/huggingface/transformers.js), loaded from jsDelivr only when you open the live model demo in Chapter 7.
