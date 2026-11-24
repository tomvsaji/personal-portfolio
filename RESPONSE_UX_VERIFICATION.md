> Historical verification record. Current session transport and preview deployment instructions are in [CHATBOT_PREVIEW.md](CHATBOT_PREVIEW.md). Older direct-CORS and browser-history descriptions below are superseded.

# Native chatbot response UX verification

Date: 2026-11-15. Checkout: `/home/hermes/projects/personal-portfolio`, branch `feat/native-chatbot`, existing PR #16. Thread: `01a1de84-aa86-7751-98fa-f65cc58cc76d`.

## Changes

- `lib/chat-response.mjs` renders untrusted assistant Markdown through React elements using exact `react-markdown@10.1.0` and `remark-gfm@4.0.1`. Paragraphs, ordered/unordered lists, emphasis, inline/fenced code, tables and allowed links are structured elements. Partial Markdown remains safe text/content. Raw HTML is skipped; images become alt text. There is no raw HTML renderer, image request, embed, or chatbot iframe. User messages remain plain React text.
- Every model-authored hyperlink uses the existing explicit portfolio/profile HTTPS-origin allowlist. Relative, protocol-relative, credential-bearing, arbitrary-domain, javascript and data URLs are not clickable. URLs are bounded to 2,048 characters. A trusted, locally generated Sources fragment link is separate from model links.
- Completed assistant responses retain bounded source number/title/heading/URL metadata. A visible `Sources (N)` link precedes long answers and jumps to a labelled, full-size source section underneath. Only unique returned positive source numbers with allowed URLs make inline `[N]` clickable. Numeric Markdown links, including formatted labels, follow the same matching rule. Code stays literal. Unmatched, unsafe and ambiguous numbers stay text. Source entries remain independently usable even when the prose has no inline references. No references are generated from retrieval matches or prose URLs. Empty sources show `No sources supplied for this response`.
- SSE accepts both legacy `claim` text and current `delta` text, with shared cumulative bounds. Delta text appends directly; legacy claims retain paragraph separation. The final event replaces partial text and remains authoritative.
- Native `<details><summary>Geek stats</summary>` follows every completed assistant response and starts closed. It has an aligned definition list and theme variables, with keyboard focus styling and wrapping for narrow screens. No stats appear on user or in-progress messages. Stable message keys prevent native disclosure state being reused for a different response when the transcript cap shifts.
- Stats are stored per response. Client round trip uses `performance.now()` around the request and stream, independently of server processing. Server values are optional and allowlisted: short recognised public model-family names (including runtime tags such as `qwen2.5:3b`), finite nonnegative timing, safe integer counts, nullable tokens, explicit usage completeness/source, and finite nullable throughput. Metrics objects over 4,096 serialized characters or malformed objects are discarded; extra properties are never displayed. Unknown public model families currently fail closed and need a deliberate allowlist update. Incomplete/unavailable runtime usage suppresses all token totals and throughput. There are no token estimates or fabricated zeroes. Throughput is labelled `Overall model throughput`, with its full-model-call wall-time meaning explained.
- Existing successful role/content history stays bounded and excludes sources, metrics, client timing and UI keys. Cancel, Clear, duplicate prevention, focus policy, timeout, question recovery, rate limiting and verification behavior retain their existing paths. No session/auth/cookie/API credential design was changed.

## TDD evidence

Behavior tests were added before implementation and observed failing, then run again after their corresponding changes:

1. Plain-text baseline renderer: two SSR tests failed, including missing `<strong>bold</strong>`; structured Markdown and safe rendering then passed.
2. Source-aware SSR response: failed before the response component/source section existed; passed with a top source count, independent source list, matched-only inline links, and empty-source notice.
3. Parser metadata/current events: three new tests failed (metrics missing, result normalizer missing, invalid delta accepted); passed after the shared result normalizer and delta validation.
4. Geek stats SSR: two tests failed because details/metrics were absent; passed with native default-closed details and validated label/value output.
5. Client timing/cancel session tests: two failed because `clientElapsedMs` was absent; passed after monotonic measurement. Further regression coverage checks distinct valid/invalid server metrics across turns and exact role/content-only outgoing history.
6. Under Node 22.21.1, a formatted `[9]` link initially rendered an anchor without matching metadata; the actual SSR assertion failed, then passed after recursively checking the link's visible label.
7. A valid `qwen2.5:3b` public model tag initially failed validation; its regression failed, then passed after narrowly allowing runtime tags.
8. Object-valued source number initially threw `Cannot convert object to primitive value`; the regression failed, then passed after primitive-only validation and bounded source URLs.

All renderer assertions inspect real `react-dom/server` output from the components used by the widget; they do not inspect source-code patterns. Fixtures are synthetic and are not represented as live model results.

## Final executed checks

Runtime: **Node v22.21.1**, using `/home/hermes/.npm/_npx/938d4c0e63b51281/node_modules/node/bin` prepended to PATH. System Node was not changed. Initial focused RED/GREEN runs used system Node 18; final regression RED/GREEN runs and all final checks used the declared Node 22 runtime.

- Full `npm test`: **PASS**, all four test files, no failures. This environment's outer test reporter aggregates by file; running the same files directly gives **61 passing tests**, zero failures: parser/client **34**, focus **9**, actual SSR response rendering **6**, session **12**.
- `npm run build`: **PASS** under Node 22.21.1, Next **15.5.29**, all 10 static pages generated, no build warnings. The **PostCSS 8.5.32** override remains. Parent-installed dependency and lockfile changes were preserved.
- `git diff --check`: **PASS**.
- Logs: `/tmp/response-ux-tests-final.log`, `/tmp/response-ux-build-final.log`, and `/tmp/response-ux-chat-*.test.mjs.log` for individual counts.

## Backward compatibility and remaining verification

Old successful responses without server metrics still show their measured client round trip; server processing, token usage/counts and throughput say `Unavailable`. Metrics missing from pre-existing in-memory data are also safe; if client timing itself is absent it says `Unavailable`. Errors and aborted requests never become completed responses or publish successful stats. Existing SSE completion/framing requirements and stream-only transport are unchanged; the shared result normalizer also validates JSON result objects without introducing a transport fallback.

The reported raw `**bold**` formatting is explained by the former `<p>{message.content}</p>` rendering. Missing source metadata cannot be recovered from a screenshot: if the backend sends an empty `sources` array, the frontend cannot establish citations and now says so. A backend worker is investigating source delivery separately. This pass did not make a live model request or establish that the screenshot's missing citations had a backend cause.

**Backend metrics are not claimed deployed.** The frontend is ready for the optional contract; live requests may continue to show only client timing until the separate backend worker publishes metrics.

A sandbox-enabled Chromium launch was attempted for browser QA and failed with host `setsockopt: Operation not permitted`. No sandbox bypass was used. Desktop/mobile layout, light/dark appearance, native keyboard disclosure interaction and physical-device overflow therefore need parent browser verification; SSR/tests/build do not establish those visual results.

No commit, push, deploy, merge, auth change or publication was performed. Parent handles reviewed publication of the frontend branch preview; website main is outside this task.
