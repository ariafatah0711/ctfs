# Markdown Renderer Mini-Tutorial

Welcome to the Markdown playground! This tutorial explains how to write challenge descriptions (or any Markdown content) that works with our custom renderer and hidden-comment syntax.

## 1. Basic Formatting
- Use `#`, `##`, `###` for headings.
- Regular paragraphs just need a blank line between them.
- Lists work with `-`, `*`, or `1.`.

```markdown
# Challenge Title
Describe the puzzle here.
- Step 1
- Step 2
```

The renderer automatically applies Tailwind-based styles, so headings get orange accents and paragraphs keep readable spacing.

## 2. Embedding Images
Use standard Markdown image syntax; the renderer wraps each image with a zoom control powered by `react-medium-image-zoom`:

```markdown
![Exploit diagram](/images/puzzle-diagram.png)
```

Images load lazily and can be clicked to zoom in for a closer look.

## 3. Code Blocks & Inline Code
Inline code: `` use ``{
use `inline` code for flags or commands.

Fenced code blocks get copy/wrap buttons if they overflow:

```markdown
```bash
wget https://example.com/payload -O /tmp/payload
```
```

## 4. Blockquotes & Callouts
Blockquotes show a dark panel with left border and wrap controls if the text is too long:

```markdown
> Hint: try reading the network trace from bottom to top.
```

## 5. Hidden Comments (`$!` syntax)
To hide notes that should not render but can still be extracted by admin tools, prefix a line with `$! ` (dollar + exclamation). The parser trims those lines before rendering and exposes the trimmed text through the optional `onCommentsExtracted` callback.

```markdown
$! FGTE{example-hidden-note}
```

The comment never appears in the visible HTML, but your monitoring/debug tooling can capture it if needed.

## 6. Tips & Tricks
- Use blank lines around code blocks/lists to ensure proper spacing.
- Combine custom comments with rich Markdown to store metadata (e.g., line before a heading describing difficulty).
- If you ever need HTML tags rendered, remember the renderer sanitizes them by default; prefer Markdown instead.

---
Happy writing! Let me know if you want a script that extracts `$!` comments or further extends the renderer.
