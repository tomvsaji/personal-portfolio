# Release verification — native portfolio chatbot

## Scope

Branch: `feat/native-chatbot` in `tomvsaji/personal-portfolio`.
Development checkout: `/home/hermes/projects/personal-portfolio`.
The website remains on Netlify. This change adds a native React chat widget calling the deployed chatbot API directly; there is no iframe chatbot, browser API secret or automatic inference retry. Existing site content/navigation are preserved. The widget uses the existing chatbot's charcoal/lime style and adapts to both website themes.

## Executed verification

- Declared Node **22.21.1** used through a user-space cached runtime, not the older system Node.
- Clean `npm ci --legacy-peer-deps`: passed after repairing the pre-existing lockfile/package mismatch.
- Full frontend tests: **47 passed**, covering SSE framing/UTF-8/CR-only EOF, bounded history, safe links, request lifecycle, duplicates, cancellation, retry delays, focus policy and the finite 120-second default deadline. Caller deadlines still override it and cancellation does not retry.
- Production build: passed under Node 22.21.1.
- `npm audit`: **0 reported vulnerabilities** after Next **15.5.29**, updated Sharp lock resolution, and PostCSS **8.5.32** override. This is not a guarantee that the app has no vulnerabilities.
- Independent full implementation review approved after the first parser/focus corrections. Parent verified the corrected rendered behavior separately. Final deadline-only review is recorded in the delivery summary after completion.

## Managed-browser QA of the local production UI

Responses in local UI tests were clearly labelled **TEST FIXTURE**. They are not claimed as real model output. The deployed API deliberately excludes localhost from browser CORS.

Verified desktop light/dark and narrow screens, including 360x780 and a 360x500 reduced viewport: no horizontal overflow; composer remained reachable. Open/close, Escape and launcher focus, clear, duplicate-submit prevention, escaped HTML text, rejection of unsafe citation links, 429 countdown/question retention were exercised. After the focus fix, keyboard completion focused the textarea after DOM commit; moving focus to an outside page link while answering did not steal it back. No chatbot iframe was present. No JavaScript errors were observed in the checked fixture flows. Screenshots and structured results remain local in `/home/hermes/projects/chatbot-qa`.

A separate standalone Playwright launch with Chromium sandbox enabled failed due to the host's Chromium sandbox restriction. No sandbox bypass was used. The existing managed-browser tool worked and was used for rendered checks. A full native-UI-to-live-model run under a locally intercepted production origin was therefore not completed by that standalone harness.

## Real deployed API integration evidence

- Production-origin browser GET and OPTIONS checks succeeded; foreign origin preflight was rejected.
- A real browser POST from `https://tomvsaji.com` returned HTTP 200 with streamed status, claims, cited final answer and done, in approximately **60 seconds**.
- A separate controlled CLI POST completed the same event contract in **38.86 seconds**.
- The new frontend's actual `readChatStream` parsed the captured real browser response successfully, preserving the answer and one source.
- Earlier busy responses and a browser-tool synchronous evaluation timeout were observed, not hidden. Long browser requests were subsequently started asynchronously and their actual results read back.

The small CPU-hosted model can be slow and only serves limited concurrent inference. The default browser deadline is now **120 seconds**, with Stop and cancellation available; no automatic retries are added.

## Production prerequisites and limitations

- These are feature-branch changes, not a production deployment. Main was not changed.
- Coordinate deployment with backend branch `feat/native-widget-security`, particularly browser-readable Retry-After, trusted-proxy configuration, quotas and verification settings.
- Optional Turnstile needs a real public site key at frontend build time and the matching secret, hostnames/action, and required-mode setting on the backend. Live Turnstile was not enabled or tested with real keys. A client key alone is not protection.
- The backend operator must validate actual proxy identity and configure narrow trust. Quotas are single-process/in-memory, not distributed DDoS protection.
- No conversation persistence, auth migration, arbitrary endpoint query parameter, unsafe HTML rendering or public secret was added.
- Mobile viewport emulation is not a substitute for physical-device keyboard/assistive-technology testing. Live Turnstile and final Netlify/proxy production-path checks remain rollout tasks.
- Deploy/merge only after explicit approval, using existing Netlify and chatbot deployment processes. Preserve the previous known-good deployment for rollback.
