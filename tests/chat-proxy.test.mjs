import {it} from 'node:test'
import assert from 'node:assert/strict'
import proxy from '../netlify/edge-functions/chat-proxy.js'
const origin='https://deploy-preview-16--tomvsaji.netlify.app'
const request=(path='/api/chat/stream', headers={}, body='{"question":"hello"}') => new Request(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body})
it('streams the fixed upstream and isolates the chat cookie from site authentication',async()=>{
  const token='a'.repeat(64); let target, options
  const result=await proxy(request(undefined,{Cookie:`auth=secret; site_chat_session=${token}`,Authorization:'secret','X-Forwarded-For':'1.2.3.4'}),{},async(url, init)=>{
    target=url;options=init
    return new Response('event: status\ndata: {"message":"Working"}\n\n',{headers:{'Content-Type':'text/event-stream','Set-Cookie':`site_chat_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,'Retry-After':'15'}})
  })
  assert.equal(target,'https://chat.srv1619516.hstgr.cloud/api/chat/stream')
  assert.equal(options.headers.get('Cookie'),`site_chat_session=${token}`)
  assert.equal(options.headers.get('Authorization'),null);assert.equal(options.headers.get('X-Forwarded-For'),null)
  assert.match(result.headers.get('Set-Cookie'),/HttpOnly; Secure; SameSite=Strict/)
  assert.equal(result.headers.get('Retry-After'),'15');assert.match(await result.text(),/Working/)
})
it('rejects cross-origin requests, arbitrary routes, non-JSON and oversized bodies before forwarding',async()=>{
  const never=()=>{throw new Error('must not forward')}
  for(const [req,status] of [[request(undefined,{Origin:'https://evil.test'}),403],[request('/api/anything'),404],[request('/api/chat/stream?target=evil'),404],[request(undefined,{'Content-Type':'text/plain'}),415],[request(undefined,{},'x'.repeat(10001)),413]]) assert.equal((await proxy(req,{},never)).status,status)
})
it('preserves busy responses and reports upstream failures clearly without retries',async()=>{
  assert.equal((await proxy(request('/api/conversation/reset'),{},async()=>new Response('{}',{status:503}))).status,503)
  let calls=0
  assert.equal((await proxy(request(),{},async()=>{calls++;throw new Error('private detail')})).status,502)
  assert.equal(calls,1)
})
