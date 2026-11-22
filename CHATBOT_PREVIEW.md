# Preview chatbot frontend

The browser posts to `/api/chat/stream` on the same origin. Netlify's `chat-proxy`
edge function forwards only this route and `/api/conversation/reset` to the fixed
HTTPS chatbot service. No browser API origin or API keys are required.

Only the `site_chat_session` cookie is forwarded; portfolio authentication cookies,
Authorization and browser-supplied forwarding headers are excluded. The upstream's
host-only Secure, HttpOnly, SameSite=Strict cookie becomes a cookie on the preview
host. Requests must have the exact same Origin as the destination, and the route
allowlist includes production portfolio domains and preview 16 only. Other previews
need an explicit review of both the edge and backend origin allowlists.

Conversation history, rolling compression and searchable memories are maintained
by the backend. The browser sends the question and optional verification token,
never its local transcript. Local successful history is bounded to eight messages;
the UI shows at most 24 messages. Closing/unmounting cancels a request without
resetting server memory. Clear calls the backend reset route and clears the UI only
after success. Failed resets remain visible and preserve the local transcript.
Server sessions survive reloads, but the UI transcript is not persisted or restored.

The client deadline is 120 seconds (reset: 15 seconds), with Stop, no automatic
retries, bounded SSE parsing, and clear capacity/rate-limit/network errors. Netlify
edge forwarding preserves streaming without the rewrite-proxy 26-second timeout
or standard function 60-second execution limit. Upstream headers arrive before
inference; Netlify edge functions have a 40-second response-header timeout.
See https://docs.netlify.com/build/edge-functions/limits/ .

The backend still enforces its own quotas. Proxy egress may share an IP quota
between visitors; client forwarding headers are deliberately not trusted. Deploying
this preview does not change backend proxy trust, quotas, authentication or models.

## Build and deploy

Use Node 22.21.1 and the committed package-lock.json:

```sh
npm ci --legacy-peer-deps
npm test
npm run build
```

Next 15.5.29, React 18.3.1, react-markdown 10.1.0 and remark-gfm 4.0.1 are pinned.
The optional public `NEXT_PUBLIC_TURNSTILE_SITE_KEY` must only be configured with
its matching secret on the backend. `NEXT_PUBLIC_CHATBOT_API_BASE_URL` is obsolete
and ignored. Secrets belong only on the backend. Current backend metrics may be
unavailable; the widget displays measured client round-trip time independently.

PR #16 uses `feat/native-chatbot`. Pushing to that existing branch triggers Netlify
at https://deploy-preview-16--tomvsaji.netlify.app . Do not merge main to update
this preview. netlify.toml declares both edge routes and the existing Next build.

After deployment, open Ask about Tom, ask a factual question, ask a follow-up and
ask for a conversation summary. Confirm the same HttpOnly session cookie is used
on successive requests. Clear should rotate that cookie. Test a blocked origin,
busy/rate-limit responses, Stop, and unavailable upstream without automatic retries.
