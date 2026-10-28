import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {browserConsent,PRIVACY_CHANGE_EVENT} from '../src/lib/privacy-consent.ts';
import {canTrackPage,subscribeTrackingPageGuard} from '../src/lib/tracking-page.ts';
const require=createRequire(import.meta.url);
function harness({complete=false,fallback=false}={}){
  const previous={window:globalThis.window,document:globalThis.document,location:globalThis.location};
  const browser=new EventTarget(),idle=[];let loads=0,inits=0,optedOut=false;const options=[];
  browser.location=new URL('https://everrisepress.com/blog/public-article');
  browser.setTimeout=callback=>{idle.push(callback);return idle.length;};
  if(!fallback)browser.requestIdleCallback=callback=>{idle.push(callback);return idle.length;};
  globalThis.window=browser;globalThis.location=browser.location;globalThis.document={readyState:complete?'complete':'loading',cookie:''};
  const client={init(_key,config){inits++;options.push(config);},has_opted_out_capturing(){return optedOut;},opt_out_capturing(){optedOut=true;},opt_in_capturing(){optedOut=false;},identify(){},capture(){}};
  const source=readFileSync(new URL('../src/components/providers/PostHogProvider.tsx',import.meta.url),'utf8')+'\nexport {initPostHog as testInitialize};';
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const compiledModule={exports:{}};const injected={'@/lib/env':{env:{NEXT_PUBLIC_POSTHOG_KEY:'test-only',NEXT_PUBLIC_POSTHOG_HOST:'https://example.invalid'}},'next/navigation':{usePathname(){}},'@/lib/privacy-consent':{browserConsent,PRIVACY_CHANGE_EVENT},'@/lib/tracking-page':{canTrackPage,subscribeTrackingPageGuard}};
  new Function('require','module','exports',compiled)(name=>{if(name==='posthog-js/dist/module.no-external'){loads++;return{__esModule:true,default:client};}return name in injected?injected[name]:require(name);},compiledModule,compiledModule.exports);
  return {init:compiledModule.exports.testInitialize,idle,options,client,get loads(){return loads;},get inits(){return inits;},load(){document.readyState='complete';browser.dispatchEvent(new Event('load'));},flush(){assert.ok(idle.length,'idle work queued');idle.shift()();},close(){for(const key of ['window','document','location']){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key];}}};
}

test('automatic analytics waits for page load and idle, sharing one SDK initialization queue',async()=>{const h=harness();try{const first=h.init(),second=h.init();assert.equal(first,second);assert.equal(h.loads,0);assert.equal(h.idle.length,0);h.load();assert.equal(h.loads,0);assert.equal(h.idle.length,1);h.flush();assert.equal(await first,h.client);assert.equal(h.loads,1);assert.equal(h.inits,1);assert.equal(await h.init(),h.client);assert.equal(h.loads,1);assert.equal(h.options[0].disable_surveys,true);assert.equal(h.options[0].disable_external_dependency_loading,true);assert.equal(h.options[0].disable_session_recording,true);}finally{h.close();}});

test('withdrawing analytics while queued prevents SDK loading and permits a later authorized start',async()=>{const h=harness();try{const pending=h.init();document.cookie='everrise_privacy=v1.0.1';h.load();h.flush();assert.equal(await pending,null);assert.equal(h.loads,0);document.cookie='everrise_privacy=v1.1.1';const enabled=h.init();h.flush();assert.equal(await enabled,h.client);assert.equal(h.loads,1);document.cookie='everrise_privacy=v1.0.1';assert.equal(h.options[0].before_send({event:'queued'}),null);assert.equal(await h.init(),null);assert.equal(h.client.has_opted_out_capturing(),true);}finally{h.close();}});

test('navigation into the staff workspace while queued prevents SDK loading',async()=>{const h=harness();try{const pending=h.init();globalThis.location=window.location=new URL('https://everrisepress.com/admin/articles/private-draft');h.load();h.flush();assert.equal(await pending,null);assert.equal(h.loads,0);}finally{h.close();}});

test('browsers without idle callbacks still initialize after page load',async()=>{const h=harness({complete:true,fallback:true});try{const pending=h.init();assert.equal(h.loads,0);assert.equal(h.idle.length,1);h.flush();assert.equal(await pending,h.client);assert.equal(h.inits,1);}finally{h.close();}});
