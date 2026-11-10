# Native portfolio chat implementation

Implemented locally on `feat/native-chatbot` in `/home/hermes/projects/personal-portfolio`. This worker performed no push, commit, deployment, auth changes, external messages, live inference, or writes to `/srv`. Parent live-inference verification is recorded below. `/srv/site-chatbot/static/style.css` was read only as the requested visual reference. No AGENTS.md was found by the project/parent search. Session: `01a1c484-8463-7bb1-a01e-d90be4c0a814`.

## Changes

- `pages/_app.js`: mounts the native React widget globally; existing pages, navigation, content, and theme handling are preserved.
- `components/chat-widget.js`: launcher, labelled nonmodal panel, close/Escape, initial focus and focus return, clear, stop, Enter/Shift+Enter, suggestions based on published profile/projects, text-only streamed claims and final answers, numbered sources, question retention after errors, countdown and optional lazy Turnstile.
- `styles/ChatWidget.module.css`: isolated charcoal/warm white/lime design, translucent panels, quiet purple/green glow, 24px shell, monospace labels and lime user bubbles; contrasting light palette, safe areas, narrow screens, visual viewport keyboard adjustment and reduced motion. Unrelated styles are unchanged.
- `lib/chat-client.mjs`: validated HTTPS API origin; incremental UTF-8 SSE parser; CRLF, CR and multiline data; bounded protocol and source metadata; source origin allowlist; history bounding and Retry-After parsing.
- `lib/chat-session.mjs`: direct browser requests without credentials or redirects; synchronous duplicate guard, finite 120-second default request deadline (caller overrides preserved), cancellation, reset race protection, successful history only, optional verification requirement and HTTP feedback. No automatic retries or JSON inference fallback.
- `tests/*.test.mjs`, `package.json`: dependency-free Node tests via `npm test`. All fixtures are labelled synthetic tests. No production fallback answers.
- `.env.example`: public configuration example.

Conversation state exists only in React/session memory. Closing/reopening retains the current conversation in that page session; Clear, reload and unmount discard it. Closing leaves an answer running; Stop, Clear, timeout and unmount abort it. Requests send the last eight successful messages, each truncated to 800 characters. The visible transcript is capped at 24 messages. Questions are limited to 800 characters. Answers/claims are capped at 24,000 characters, streams at 256 KiB, individual buffered data at 64 KiB, events at 2,048 and sources at 30.

No chatbot iframe, browser API secret, browser persistence, HTML injection, Markdown rendering or endpoint query parameter exists. React escapes response text. Citation links are HTTPS only and limited to exact origins for tomvsaji.com/www, github.com, linkedin.com/www and twitter.com, reflecting the published profile. Other/unsafe URLs render as source labels without links. External links announce a new tab and use `noopener noreferrer`.

## Test-first evidence and verification

Parent corrected the original environment findings: the declared **Node 22.21.1** was installed via the npm exec cache. Parent network access works; sandbox npm registry DNS does not. The original lockfile was already out of sync (Next 13 / React 18.2 versus package declarations Next 15 / React 18.3.1). Parent `npm install` regenerated the lockfile, upgraded vulnerable Next **15.5.7 → 15.5.29**, ran non-force `npm audit fix` to update sharp, and added the **PostCSS 8.5.32** override. These corrections are preserved; no Next 16 upgrade was made. Parent installed Node **22.21.1** and successfully ran `npm ci --legacy-peer-deps`, reported **0 audit vulnerabilities**, **46 passing tests** before the deadline correction, and a successful production build without warnings. An audit does not prove the absence of bugs.

Earlier implementation RED → GREEN slices covered missing parser/session modules, required verification, and clear/immediate-send controller races. Focused review added:

1. CR-only EOF regression, whole-response and byte-by-byte, alongside LF/CRLF and incomplete-event rejection. Initial `npm test` failed in the parser file and the new focus file. To isolate parser evidence, the staged pre-fix parser was copied with `git show :lib/chat-client.mjs > /tmp/chat-client-before-review.mjs`, the regression test import was redirected to that copy, and `node /tmp/chat-client-red.test.mjs` under cached Node 22 produced **27 passing / 2 failing** tests: precisely the complete CR-only cases. The fix processes a deferred trailing CR at EOF without synthesizing a blank line for incomplete events.
2. Parent's rendered production-build focus RED is captured at `/home/hermes/projects/chatbot-qa/focus-red.json`: answer present, textarea enabled, active element BODY after Enter submission with an explicit TEST FIXTURE final/done response. Added `tests/chat-focus.test.mjs`; initially it failed with missing `lib/chat-focus.mjs`. Implemented the minimal focus lifecycle helper and post-commit React effect. It preserves focus intent across disabled/removed controls, restores after success/cancel/error, revokes intent on outside focus/pointer interaction or window blur, and resets on close. Clear requests focus after commit; reopening retains initial input focus. A completion revision also handles responses batched before a pending render. These are helper unit regressions, not rendered DOM assertions; parent subsequently verified completion focus and outside-page focus behavior in the managed browser, as recorded below.
3. Removed the deprecated `devIndicators.buildActivity` setting responsible for the verified Next 15 build warning. No layout change was needed for these confirmed corrections; styling is preserved.

Commands run in this focused correction pass:

- `npm test` before fixes, system Node 18.19.1: **RED**, parser and missing focus helper failed; session file passed. Log: `/tmp/chat-review-red.log`.
- Both cached binaries found under `/home/hermes/.npm/_npx/{938d4c0e63b51281,ab6528d33e7343a9}/node_modules/node/bin/node` returned **v22.21.1**. The system Node installation was not changed.
- `PATH=/home/hermes/.npm/_npx/938d4c0e63b51281/node_modules/node/bin:$PATH npm test`: **PASS**, all three test files. Direct runs with the same PATH: `node tests/chat-client.test.mjs` **29/29**, `node tests/chat-focus.test.mjs` **9/9**, `node tests/chat-session.test.mjs` **8/8**.
- `PATH=/home/hermes/.npm/_npx/938d4c0e63b51281/node_modules/node/bin:$PATH npm run build`: **PASS**, Next 15.5.29 optimized compilation, lint/type checks and all 10 static pages; no deprecated buildActivity warning. Rebuilt after final focus wiring.
- `git diff --check`: **PASS**. `git diff --quiet -- package.json package-lock.json` exited **0**: dependency corrections still exactly match the parent staged versions. Review corrections are left unstaged; the existing index is preserved.

Parent final browser/integration verification:

- Managed-browser QA passed: keyboard completion returns focus to the textarea; outside-page focus is not stolen; the composer remains visible at **360×500** with no horizontal overflow. Earlier desktop light/dark and **360×780** checks, duplicate-send guard, XSS text/source safeguards, Clear, Escape focus return and 429 countdown passed with explicit **TEST FIXTURE** responses.
- Actual deployed SSE from the real website origin returned **HTTP 200**, `claim`/`final`/`done`, a cited answer and one source in **60 seconds**. Evidence: `/home/hermes/projects/chatbot-qa/live-browser-model-check.json`. A separate actual CLI check returned **HTTP 200** in **38.86 seconds**: `/home/hermes/projects/chatbot-qa/live-model-check.json`. This correction pass read both captured files; these are actual outputs, not fixtures. Parent also fed the captured deployed browser stream through the new `readChatStream`, which parsed successfully with **1 source**.
- The deployed API model works from the real website origin. The full local native UI uses labelled fixtures because production CORS excludes localhost; this does not establish a deployed end-to-end test of the new native widget.
- A separate standalone Playwright launch with sandbox enabled failed due to host Chromium sandbox restrictions. Parent used the existing managed browser successfully; no sandbox bypass was used. No production deployment was performed.

Final deadline correction: the valid 60-second browser response made the former 60,000ms default too close to real completion times. A controlled timer regression first failed under cached Node **22.21.1**, with **8 passing / 1 failing** session tests and the expected assertion **60000 !== 120000**. Only the default in `createChatSession` changed to **120000ms**. The regression verifies default scheduling and timer cleanup, restoring global timer spies in `finally`. The caller **5ms** override still aborts its request, makes exactly one fetch and leaves history empty. AbortController, Stop, bounded state and no automatic retries are preserved; no other timeout, quota or backend changes were made.

Final correction verification under cached Node **22.21.1** (`/home/hermes/.npm/_npx/938d4c0e63b51281/node_modules/node/bin` prepended to PATH):

- `npm test`: **PASS**, all three test files. Direct runs: parser **29/29**, focus **9/9**, session **9/9**; **47 tests total**.
- `npm run build`: **PASS**, Next **15.5.29**, compilation, lint/type checks, all **10 static pages**, exit **0**, no warnings.
- `git diff --check`: **PASS**. The unstaged diff contains only `lib/chat-session.mjs`, `tests/chat-session.test.mjs` and this report; `package.json` and `package-lock.json` still match the staged versions.

Remaining validation: screen-reader behavior, configured Turnstile lifecycle, and full native widget integration against the live API from an allowed origin. Other checklist cases below remain optional follow-up unless explicitly reported as passed. No new audit/network request was attempted in this correction pass; audit and installation results are parent evidence. Existing staged work and dependency fixes are preserved; this correction is left unstaged for parent review.

## Configuration and backend prerequisites

Both variables are public **build-time** Next.js configuration; rebuild after changing them:

- `NEXT_PUBLIC_CHATBOT_API_BASE_URL`: optional; defaults exactly to `https://chat.srv1619516.hstgr.cloud`. Must be a complete HTTPS origin with no credentials, non-root path, query or fragment. Invalid configuration fails on submission without fetching. No query parameter can override it.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: optional public site key. Leave absent when Turnstile is not configured. No challenge script loads until chat opens, and none loads without a configured key. The widget uses the official Cloudflare script with explicit rendering, `action: 'site_chat'`, callbacks for expiry/error/timeout and fresh single-use tokens. Sending is disabled until a token is ready; the request layer also requires a token when configured. Tokens are consumed/reset on submission and reset after completion/clear. Expiry clears readiness. Load failure blocks submission and gives reopen guidance.

The backend must verify the matching secret, hostname/action and token validity server-side; never put its secret in any `NEXT_PUBLIC_` variable. A frontend key alone does not establish active protection. Configure permitted Turnstile hostnames and ensure Cloudflare script/frame/connect resources are permitted if a CSP is added. Cloudflare may create its own challenge iframe; there is no iframe chatbot.

The backend must support the documented SSE `status`, `claim`, `final`, `done` and `error` contract, terminate successful streams with `done`, allow direct POST/OPTIONS from `https://tomvsaji.com` and `https://www.tomvsaji.com`, and expose **`Retry-After`** with `Access-Control-Expose-Headers` so browser countdowns can read it. Error responses also need CORS headers. The frontend does not fix backend limits, trusted proxies, global budgets or abuse protection. Those remain backend worker responsibilities. Requests preserve the direct browser-to-service path without a Netlify proxy.

## Local preview and integration checklist

For a fresh checkout on a network-enabled machine (the current checkout already has dependencies and cached Node 22):

```sh
nvm install 22.21.1
nvm use 22.21.1
npm ci --legacy-peer-deps
npm test
npm run build
npm run dev
```

Open `http://localhost:3000`. The site and panel can be previewed locally, but the deployed API's production CORS allowlist excludes localhost. A browser request to the production API from localhost is expected to fail; this is not evidence that the production origin fails. A Netlify branch preview origin is also not automatically allowed.

For isolated local UI integration, use browser request interception or a separate local mock server with CORS explicitly allowing localhost. Intercept the exact `/api/chat/stream` request and label responses **TEST FIXTURE**, with SSE headers and the documented event schema. The HTTPS-only origin validation intentionally prevents a plain HTTP mock endpoint override; request interception avoids changing that production invariant. No mock server or fixture mode is shipped in the production widget. Automated protocol/request tests already mock fetch locally without network calls.

Live integration requires an authorized origin in the backend CORS allowlist (and Turnstile hostname configuration when enabled). Coordinate a temporary review origin with the backend owner, or test the production origin after separately authorized deployment. Do not disable CORS or verification to make a preview work. A CLI POST does not verify browser CORS or actual browser client identity.

Parent browser checklist: 360px and desktop; dark/light; keyboard-only open, Tab/Shift+Tab, Escape and focus return; navigate page controls while an answer finishes; mobile keyboard and safe areas; source link safety; plain text escaping; Clear/Stop midstream; double submit and repeated suggestions; offline, invalid API config, malformed/truncated stream, 429/503 and countdown; configured Turnstile ready/expiry/error/blocked script and no request before verification. Confirm no automatic retries and no stale cancelled turn in subsequent request history. The managed-browser results above cover completion/outside focus and narrow viewport composition; unreported checklist cases remain follow-up validation.

## Deployment and rollback plan (not executed)

After independent review, complete the remaining native-widget integration and accessibility/Turnstile checks above and review current advisories before release. Parent may push only a separate feature branch; never push main/production from this worker. Review the focused diff and public build variables in the existing Netlify workflow. Deploy only with separate authorization under that workflow. No new hosting service, auth change or proxy route is required.

Rollback by restoring the previously approved Netlify deploy, or reverting the widget integration and associated added files in the normal reviewed source workflow and rebuilding. Preserve existing public site configuration/content. Turnstile configuration must remain coordinated with backend enforcement; removing only the frontend key while the backend requires verification will block chat. No stored conversation migration or cleanup is needed.
