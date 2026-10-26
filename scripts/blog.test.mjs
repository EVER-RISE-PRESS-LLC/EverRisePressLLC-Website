import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseArticleCatalog, publishedArticles, articleWordCount } from "../src/lib/blog/model.ts";

const now = Date.parse("2026-10-27T12:00:00Z");
const fixture = () => ({ slug:"local-template-fixture", status:"published", title:"A local article template fixture", description:"This synthetic article exists only to verify publication rules, readable layouts, dates, links, sources, and accessible content blocks.",section:"Local verification",author:{type:"Organization",name:"EverRise Press",url:"/about",confirmed:true},publishedAt:"2026-10-26T10:00:00Z",updatedAt:"2026-10-26T10:00:00Z",review:{by:"Local test fixture",at:"2026-10-26T10:00:00Z"},imageUrl:"/images/og/everrise-default.png",imageAlt:"EverRise Press",blocks:[{type:"paragraph",text:"Synthetic fixture. Not approved editorial content."},{type:"heading",id:"example",text:"An example"},{type:"table",caption:"Fictional dates",columns:["Item","Date"],rows:[["Example","October 1"]]}],sources:[{id:"source-one",title:"Google Article guidance",url:"https://developers.google.com/search/docs/appearance/structured-data/article"}],relatedSlugs:[],editorialNotes:"Local verification only. Never publish this fixture." });

test("only reviewed, confirmed, released content is public", () => {
  const article=fixture(); assert.equal(publishedArticles(parseArticleCatalog([article]),now).length,1);
  for (const patch of [{status:"draft"},{publishedAt:"2026-10-28T10:00:00Z",updatedAt:"2026-10-28T10:00:00Z",review:{by:"Test",at:"2026-10-28T10:00:00Z"}},{review:{by:"Test",at:"2026-10-28T10:00:00Z"}}]) assert.equal(publishedArticles(parseArticleCatalog([{...article,...patch}]),now).length,0);
});
test("publication rejects missing editorial requirements rather than silently publishing", () => {
  for(const patch of [{publishedAt:null},{updatedAt:null},{review:null},{author:{...fixture().author,confirmed:false}},{blocks:[]},{sources:[]}]) assert.throws(()=>parseArticleCatalog([{...fixture(),...patch}]));
});
test("an edit after review requires a new review and dates remain ordered",()=>{
  assert.throws(()=>parseArticleCatalog([{...fixture(),updatedAt:"2026-10-27T10:00:00Z"}]));
  assert.throws(()=>parseArticleCatalog([{...fixture(),updatedAt:"2026-10-25T10:00:00Z"}]));
});
test("duplicate slugs, broken related reading, duplicate anchors and unsourced quotes are rejected",()=>{
  assert.throws(()=>parseArticleCatalog([fixture(),fixture()]));
  assert.throws(()=>parseArticleCatalog([{...fixture(),relatedSlugs:["missing"]}]));
  const original=fixture();
  assert.throws(()=>parseArticleCatalog([{...original,blocks:[...original.blocks,{type:"heading",id:"example",text:"Duplicate"}]}]));
  assert.throws(()=>parseArticleCatalog([{...original,blocks:[...original.blocks,{type:"quote",text:"A quote",attribution:"Example",sourceId:"missing"}]}]));
  assert.throws(()=>parseArticleCatalog([{...original,blocks:[{type:"paragraph",text:"Example"},{type:"table",caption:"Bad row",columns:["One","Two"],rows:[["One"]]}]}]));
});
test("unsafe links are rejected and dates with time-zone offsets sort by time",()=>{
  for(const url of ["javascript:alert(1)","//evil.example","/\\evil.example","/../admin"]) assert.throws(()=>parseArticleCatalog([{...fixture(),author:{...fixture().author,url}}]));
  const earlier={...fixture(),slug:"earlier",publishedAt:"2026-10-26T12:00:00+03:00"};
  const articles=publishedArticles(parseArticleCatalog([earlier,fixture()]),now); assert.equal(articles[0].slug,"local-template-fixture");
  assert.ok(articleWordCount(articles[0])>10);
});
test("the real catalog is valid and drafts stay out of the public set",async()=>{
  const raw=JSON.parse(await readFile(new URL("../src/content/blog/articles.json",import.meta.url),"utf8"));
  const articles=parseArticleCatalog(raw); assert.ok(articles.length > 0); const publicSlugs=new Set(publishedArticles(articles,now).map(article=>article.slug)); assert.ok(articles.filter(article=>article.status==="draft").every(article=>!publicSlugs.has(article.slug)));
});
