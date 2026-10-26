import assert from "node:assert/strict";
const base=(process.argv[2]??"https://everrisepress.com").replace(/\/$/,"");
const fixtureMode=process.argv.includes("--published-fixture");
async function get(path,options={}) {const response=await fetch(base+path,{headers:{'user-agent':'EverRisePress-Blog-Check/1.0'},...options}); return {status:response.status,headers:response.headers,body:await response.text()};}
function nodes(body) {return [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const g=JSON.parse(m[1]);return g['@graph']??[g];});}
const index=await get('/blog');assert.equal(index.status,200);assert.equal((index.body.match(/<h1[\s>]/g)??[]).length,1);
const sitemap=await get('/sitemap.xml'); const llms=await get('/llms.txt'); const schema=JSON.parse((await get('/schema/articles.json')).body);const home=await get('/');
const publishedNodes=schema['@graph'].filter(node=>node['@type']==='BlogPosting');
const publishedPaths=publishedNodes.map(node=>new URL(node.url).pathname);
const positive=publishedPaths.length > 0;
if(fixtureMode) assert.ok(publishedPaths.includes('/blog/local-template-fixture') && publishedPaths.includes('/blog/local-related-fixture'));
else assert.ok(!publishedPaths.some(path=>path.includes('local-') && path.includes('fixture')), 'local fixtures must not be deployed');
if(positive) {
  assert.ok(!/name="robots" content="noindex/.test(index.body));
  assert.match(index.body,/href="https:\/\/everrisepress.com\/blog"/);
  assert.ok(nodes(index.body).some(n=>n['@type']==='CollectionPage'));
  for(const path of publishedPaths){const response=await get(path);assert.equal(response.status,200,path);
    assert.equal((response.body.match(/<h1[\s>]/g)??[]).length,1);
    assert.ok(response.body.includes(`href="https://everrisepress.com${path}"`));
    const graph=nodes(response.body);const article=graph.find(n=>n['@type']==='BlogPosting');assert.ok(article);
    assert.ok(Date.parse(article.datePublished)<=Date.now()); assert.ok(Date.parse(article.dateModified)>=Date.parse(article.datePublished));
    const author=graph.find(n=>n['@id']===article.author['@id']);assert.ok(['Person','Organization'].includes(author['@type']));assert.ok(author.name);
    const crumbs=graph.find(n=>n['@type']==='BreadcrumbList');assert.equal(crumbs.itemListElement.length,3);assert.ok(crumbs.itemListElement.every(c=>c.item));
    assert.match(response.body,/property="article:published_time"/);assert.match(response.body,/property="article:modified_time"/);
    assert.ok(sitemap.body.includes(`<loc>https://everrisepress.com${path}</loc>`));assert.ok(llms.body.includes(path));
    if(publishedPaths.slice(0,2).includes(path)) assert.ok(home.body.includes(`href="${path}"`));assert.ok(schema['@graph'].some(n=>n['@id']===article['@id']));
  }
  assert.ok((index.body.match(/<a\b[^>]*>/g)??[]).some(tag=>tag.includes('href="/blog"') && tag.includes('aria-current="page"')), "active blog navigation link");
  assert.ok(sitemap.body.includes('<loc>https://everrisepress.com/blog</loc>'));
  if(fixtureMode) {const article=await get('/blog/local-template-fixture');assert.match(article.body,/<table>/);assert.match(article.body,/<caption>/);assert.match(article.body,/scope="row"/);assert.match(article.body,/href="\/blog\/local-related-fixture"/);
  assert.ok(!article.body.includes('</script><script>unsafe()'));}
} else {
  assert.match(index.body,/name="robots" content="noindex, follow"/);
  assert.ok(!index.body.includes('rel="canonical"'));
  assert.ok(!sitemap.body.includes('/blog'));assert.ok(!llms.body.includes('/blog'));
  assert.ok(!home.body.includes('href="/blog"'));
  assert.ok(!schema['@graph'].some(n=>['Blog','BlogPosting'].includes(n['@type'])));
  assert.ok(!index.body.includes('Obtain the author'));
}
for(const slug of ['payday-spending-patterns','weekly-cash-flow-calendar','unknown-blog-check']){
  if(publishedPaths.includes('/blog/'+slug)) continue;
  const response=await get('/blog/'+slug);assert.equal(response.status,404,slug);
  assert.ok(!response.body.includes('Brief only.'));assert.ok(!nodes(response.body).some(n=>n['@type']==='BlogPosting'));
}
for(const path of ['/admin/articles','/admin/articles/payday-spending-patterns']){
  const response=await get(path,{redirect:'manual'});assert.ok([303,307].includes(response.status));assert.match(response.headers.get('location'),/\/admin\/login/);assert.ok(!response.body.includes('Obtain the author'));
}
assert.ok(!sitemap.body.includes('/admin/'));
if(!fixtureMode) for(const slug of ['local-template-fixture','local-related-fixture']) assert.equal((await get('/blog/'+slug)).status,404,'no local fixture exposed');
console.log(JSON.stringify({base,publishedFixture:fixtureMode, publishedArticles:publishedPaths.length,passed:true,checkedAt:new Date().toISOString()},null,2));
