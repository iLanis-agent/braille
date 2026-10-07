# Braille

Grade 1 braille translator and dot-pattern trainer. Static, no build, no dependencies. Open `app.html` or visit the GitHub Pages site.

## What it does

- **Encode**: text to Unicode braille patterns, with the standard capital prefix (dot 6) and number prefix (dots 3-4-5-6; digits reuse a-j).
- **Decode**: pasted braille patterns back to text.
- **Practice**: recognition quiz on dot cells with a running score.
- **Reference**: full alphabet as dot cells with dot numbers.

## Standards

Dot numbering follows the braille standard (dots 1-2-3 down the left, 4-5-6 down the right). Unicode mapping uses the braille patterns block: U+2800 plus one bit per dot. Grade 1 only - no contracted (Grade 2) forms.

## Limits

Number mode ends at a space or at any letter beyond j, matching common Grade 1 practice; literary braille has additional rules for mixed letter-digit strings.

## Development

Pure JS engine (`engine.js`), browser and Node compatible. Tests run the engine against a python oracle plus fixed standard codepoints (`tests/build_corpus.py` generates `tests/expected.json`):

```
python3 tests/build_corpus.py
node tests/run_tests.js
```

Built as app #399 of the app factory.
