# SpeedReader

A personal speed reading web app using **Rapid Serial Visual Presentation (RSVP)** with AI-powered reading preparation.

Built with Next.js, deployable on Vercel.

---

## Quick Deploy (Fork Your Own)

Want your own copy? Here's the fastest path:

1. **Fork this repo** → Click "Fork" on GitHub
2. **Deploy to Vercel** → [vercel.com/new](https://vercel.com/new), import your fork
3. **Add environment variables** in Vercel:
   - `OPENAI_API_KEY` — your OpenAI API key (for AI prep feature)
   - `SITE_PASSWORD` — optional, adds a password gate
4. **Done** — your speed reader is live

No environment variables? The app still works—you just won't have AI prep, and there's no password protection.

---

## What It Does

SpeedReader displays text one word at a time, with the **Optimal Recognition Point (ORP)** highlighted in red. This technique eliminates eye movement during reading, allowing for faster reading speeds.

### Core Features

- **RSVP Reader** — Words displayed one at a time with ORP highlighting
- **Adaptive Speed** — Starts slower and ramps up over configurable number of words
- **Punctuation Pauses** — Natural pauses at periods, commas, and other punctuation
- **Multiple Input Sources** — Upload files, paste URLs, or type/paste text directly
- **AI Reading Prep** — GPT-4o generates summaries, glossaries, and difficulty assessments before reading

### Supported Formats

| Format | Method |
|--------|--------|
| PDF | pdf.js (browser-side) |
| DOCX | mammoth.js (browser-side) |
| EPUB | epub.js (browser-side) |
| Images | Tesseract.js OCR (browser-side) |
| URLs | Mozilla Readability (server-side) |
| Plain text | Direct input |

---

## Development Story

This project was built iteratively:

### Phase 1: Core RSVP Reader
Started with the fundamental speed reading functionality:
- ORP calculation (~30% into each word)
- Word tokenization with timing metadata
- Punctuation-based pauses (`.!?` = long pause, `;:` = medium, `,` = short)
- Speed ramp-up from starting WPM to target WPM
- Keyboard controls (Space, arrows, etc.)

### Phase 2: Multi-Format Support
Added the ability to extract text from various sources:
- PDF extraction using Mozilla's pdf.js
- DOCX parsing with mammoth.js
- EPUB reading with epub.js
- Image OCR with Tesseract.js
- All processing happens client-side to avoid unnecessary backend work

### Phase 3: URL Input
Added the ability to read articles directly from URLs:
- Fetches web pages via server-side API route (to handle CORS)
- Uses Mozilla's Readability library to extract article content
- Strips ads, navigation, and other non-content elements

### Phase 4: AI Reading Preparation
Discovered that RSVP is harder with unfamiliar/dense content—a known limitation in speed reading research. The brain struggles when it can't pause to process new concepts.

**Solution:** Use GPT-4o to prepare the reader before starting:
- **Summary** — 2-3 sentence overview to prime understanding
- **Key Themes** — Main concepts they'll encounter
- **Glossary** — Technical terms with definitions
- **Difficulty Assessment** — Easy/Moderate/Challenging/Dense rating
- **Recommended WPM** — AI-suggested speed based on content complexity

If content is rated "Dense," the app warns that traditional reading may be better for full comprehension.

---

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key (for AI prep feature)

### Installation

```bash
cd SpeedReader
npm install
npm run dev
```

Open http://localhost:3000

### Setting Up AI Prep

1. Click the **gear icon** (⚙️) next to "SpeedReader"
2. Toggle **"AI Reading Prep"** on
3. Paste your OpenAI API key
4. Click **Save**

The key is stored in your browser's localStorage.

---

## Deployment (Vercel)

### Basic Deployment

```bash
npm install -g vercel
vercel
```

Or connect a GitHub repo to Vercel's dashboard.

### API Key Configuration

The app supports two ways to provide the OpenAI API key:

**Option A: Server-side environment variable (recommended for family sharing)**

Set `OPENAI_API_KEY` in Vercel:
1. Go to your Vercel project → Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your key
3. Redeploy

Users won't need to enter a key—the server uses yours automatically. The code handles this with a simple fallback:

```typescript
const openaiKey = apiKey || process.env.OPENAI_API_KEY;
```

**Option B: Per-user keys**

Users enter their own API key in the settings modal. Good if you want separate usage tracking.

### Password Protection

The app has a built-in password gate to limit access to family members.

To enable:
1. Go to your Vercel project → Settings → Environment Variables
2. Add `SITE_PASSWORD` with your chosen password
3. Redeploy

Users will see a password prompt before accessing the app. Once entered correctly, it's stored in their browser so they won't need to re-enter it.

**Note:** If `SITE_PASSWORD` is not set, the app runs without password protection (useful for local development).

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` / `→` | Skip 10 words |
| `Shift` + `←` / `→` | Skip 50 words |
| `↑` / `↓` | Increase / Decrease speed |
| `R` | Reset to beginning |
| `Esc` | Close reader |

---

## Project Structure

```
SpeedReader/
├── app/
│   ├── api/
│   │   ├── analyze-text/     # OpenAI integration
│   │   └── extract-url/      # URL fetching + Readability
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main app with state management
├── components/
│   ├── FileUploader.tsx      # Drag-drop file upload
│   ├── URLInput.tsx          # URL input form
│   ├── TextInput.tsx         # Paste/type text
│   ├── PrepScreen.tsx        # AI prep display
│   ├── RSVPReader.tsx        # Main reader component
│   ├── RSVPControls.tsx      # Playback controls
│   ├── WordDisplay.tsx       # ORP-highlighted word
│   └── SettingsModal.tsx     # API key configuration
├── hooks/
│   ├── useRSVP.ts            # Core playback logic
│   └── useFileExtractor.ts   # File extraction orchestration
├── lib/
│   ├── extractors/           # PDF, DOCX, EPUB, image, text
│   ├── rsvp/                 # ORP, tokenizer, timing
│   └── utils/                # Text normalization
└── package.json
```

---

## Technical Notes

### ORP Calculation

The Optimal Recognition Point is approximately 30% into each word:
- 1 char: position 0
- 2-5 chars: position 1
- 6-9 chars: position 2
- 10-13 chars: position 3
- 14+ chars: position 4

### Timing Multipliers

| Punctuation | Multiplier |
|-------------|------------|
| `.` `!` `?` | 2.5x (sentence end) |
| `;` `:` `—` | 1.8x (clause break) |
| `,` | 1.3x (brief pause) |
| Long words (>10 chars) | 1.2x additional |

### Known Limitations

- RSVP comprehension drops for dense/technical material regardless of preparation
- OCR quality depends on image clarity
- Some paywalled sites won't extract via URL
- EPUB extraction works best with well-structured files

---

## Libraries Used

- [Next.js](https://nextjs.org) — React framework
- [pdf.js](https://github.com/mozilla/pdf.js) — PDF text extraction
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) — DOCX parsing
- [epub.js](https://github.com/futurepress/epub.js) — EPUB reading
- [Tesseract.js](https://github.com/naptha/tesseract.js) — Browser OCR
- [Readability](https://github.com/mozilla/readability) — Article extraction
- [OpenAI SDK](https://github.com/openai/openai-node) — GPT-4o integration

---

## License

Personal project. Do what you want with it.
