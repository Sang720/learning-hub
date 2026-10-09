(() => {
  'use strict';
  const KEY = 'sang720-learning-hub-v1';
  const $ = selector => document.querySelector(selector);
  const palette = ['#147765','#5b77a4','#b37b43','#9a6593','#b56a64','#63834f'];
  const categoriesBase = ['编程开发','开源项目','数据与建模','学术写作','开发工具'];
  const icons = {'编程开发':'code-2','开源项目':'git-fork','数据与建模':'chart-no-axes-combined','学术写作':'notebook-pen','开发工具':'wrench'};
  const escapes = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  const esc = value => String(value).replace(/[&<>"']/g, c => escapes[c]);
  const icon = name => `<i data-lucide="${name}"></i>`;
  function safeURL(value) { const url = new URL(value); if (!['https:','http:'].includes(url.protocol)) throw new Error('请填写以 https:// 或 http:// 开头的链接'); return url.href; }
  function validate(item) {
    if (!item || typeof item !== 'object' || typeof item.title !== 'string' || !item.title.trim() || typeof item.category !== 'string' || !item.category.trim()) throw new Error('资料缺少名称或分类');
    return {id:typeof item.id === 'string' ? item.id : crypto.randomUUID(),title:item.title.trim().slice(0,80),description:String(item.description || '').slice(0,240),url:safeURL(item.url),category:item.category.trim().slice(0,30),kind:['文档','项目','课程','工具','笔记'].includes(item.kind)?item.kind:'文档',tags:Array.isArray(item.tags)?item.tags.slice(0,8).map(t=>String(t).slice(0,24)):[],favorite:Boolean(item.favorite),added:Number.isFinite(item.added)?item.added:Date.now(),visited:Number.isFinite(item.visited)?item.visited:0};
  }
  let items = window.STARTER_RESOURCES.map((item,i)=>validate({...item,added:1760000000000-i}));
  let loadError = false;
  try { const data = JSON.parse(localStorage.getItem(KEY)); if (data !== null) { if (!Array.isArray(data)) throw new Error(); items = data.map(validate); } } catch { loadError = true; }
  let view = 'all',category = '',query = '',layout = 'grid',editing = null,pendingDelete = null,timer;
  function notify(message) { clearTimeout(timer); $('#toast').textContent=message; $('#toast').hidden=false; timer=setTimeout(()=>$('#toast').hidden=true,4000); }
  function save(next) { try { localStorage.setItem(KEY,JSON.stringify(next)); items=next; return true; } catch { notify('无法保存：浏览器存储不可用或空间不足'); return false; } }
  function categories() { return [...new Set([...categoriesBase,...items.map(r=>r.category)])]; }
  function paintIcons() { window.lucide?.createIcons(); }
  function render() {
    const cats = categories();
    $('#all-count').textContent=items.length; $('#total-stat').textContent=items.length;
    $('#fav-count').textContent=items.filter(r=>r.favorite).length;
    $('#favorite-stat').textContent=items.filter(r=>r.favorite).length;
    $('#category-stat').textContent=new Set(items.map(r=>r.category)).size;
    $('#category-nav').innerHTML=cats.map((c,i)=>`<button class="nav-item ${category===c?'active':''}" data-category="${esc(c)}"><span class="category-dot" style="background:${palette[i%palette.length]}"></span>${esc(c)}<span>${items.filter(r=>r.category===c).length}</span></button>`).join('');
    $('#chips').innerHTML=['',...cats].map(c=>`<button class="chip ${category===c?'active':''}" data-category="${esc(c)}" aria-pressed="${category===c}">${esc(c || '全部')}</button>`).join('');
    $('#category-options').innerHTML=cats.map(c=>`<option value="${esc(c)}"></option>`).join('');
    document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',b.dataset.view===view);});
    $('#view-title').textContent=category || ({all:'全部资料',favorites:'我的收藏',recent:'最近访问'}[view]);
    let shown=items.filter(r=>(view!=='favorites'||r.favorite)&&(view!=='recent'||r.visited)&&(!category||r.category===category)&&`${r.title} ${r.description} ${r.tags.join(' ')} ${r.category}`.toLocaleLowerCase().includes(query));
    const sort=$('#sort').value;
    if (sort==='name') shown.sort((a,b)=>a.title.localeCompare(b.title,'zh-CN'));
    else if (view==='recent') shown.sort((a,b)=>b.visited-a.visited);
    else if(sort==='newest') shown.sort((a,b)=>b.added-a.added);
    $('#result-count').textContent=`${shown.length} 项资料`;
    $('#resources').className=`resources ${layout==='list'?'list':''}`;
    $('#resources').innerHTML=shown.map(r=>{
      const tone=palette[cats.indexOf(r.category)%palette.length];
      return `<article class="resource" style="--tone:${tone};--tint:${tone}12"><div class="resource-top"><span class="resource-icon">${icon(icons[r.category]||'book-open')}</span><span class="kind">${esc(r.kind)}</span><button class="icon-button favorite ${r.favorite?'is-favorite':''}" data-action="favorite" data-id="${esc(r.id)}" aria-label="${r.favorite?'取消收藏':'收藏'} ${esc(r.title)}" aria-pressed="${r.favorite}" title="${r.favorite?'取消收藏':'收藏'}">${icon('star')}</button></div><h3><a href="${esc(r.url)}" data-visit="${esc(r.id)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a></h3><p class="description">${esc(r.description)}</p><div class="tags">${r.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div><div class="resource-bottom"><a href="${esc(r.url)}" data-visit="${esc(r.id)}" target="_blank" rel="noopener noreferrer">${esc(new URL(r.url).hostname)}</a><div class="resource-actions"><button class="icon-button" data-action="edit" data-id="${esc(r.id)}" aria-label="编辑 ${esc(r.title)}" title="编辑">${icon('pencil')}</button><button class="icon-button" data-action="delete" data-id="${esc(r.id)}" aria-label="删除 ${esc(r.title)}" title="删除">${icon('trash-2')}</button><a class="icon-button" href="${esc(r.url)}" data-visit="${esc(r.id)}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${esc(r.title)}" title="打开">${icon('arrow-up-right')}</a></div></div></article>`;
    }).join('');
    $('#empty').hidden=shown.length>0;
    $('#empty-title').textContent=query?'没有找到匹配的资料':view==='favorites'?'还没有收藏的资料':view==='recent'?'还没有访问记录':'这个分类还没有资料';
    $('#empty-action').textContent=query||view!=='all'?'查看全部资料':'添加资料';
    paintIcons();
  }
  function openEditor(id=null) {
    editing=id; const form=$('#resource-form'); form.reset(); $('#form-error').textContent='';
    $('#editor-title').textContent=id?'编辑资料':'添加资料';
    const item=items.find(r=>r.id===id);
    if(item) { for(const field of ['title','url','description','category','kind'])form.elements[field].value=item[field]; form.elements.tags.value=item.tags.join(', '); form.elements.favorite.checked=item.favorite; }
    else form.elements.category.value=category||'编程开发';
    $('#editor').showModal(); form.elements.title.focus();
  }
  $('#add').onclick=()=>openEditor();
  $('#search').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase();render();});
  $('#sort').onchange=render;
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(button?.dataset.close) $('#'+button.dataset.close).close();
    if(button?.hasAttribute('data-category')) {category=button.dataset.category;render();}
    if(button?.dataset.view) {view=button.dataset.view;category='';render();}
    if(button?.dataset.action) {
      const item=items.find(r=>r.id===button.dataset.id); if(!item)return;
      if(button.dataset.action==='favorite') {if(save(items.map(r=>r.id===item.id?{...r,favorite:!r.favorite}:r)))render();}
      if(button.dataset.action==='edit')openEditor(item.id);
      if(button.dataset.action==='delete'){pendingDelete=item.id;$('#delete-description').textContent=`确定删除「${item.title}」吗？`;$('#delete-dialog').showModal();}
    }
    const link=event.target.closest('[data-visit]');
    if(link)save(items.map(r=>r.id===link.dataset.visit?{...r,visited:Date.now()}:r));
  });
  $('#resource-form').onsubmit=event=>{
    event.preventDefault(); const form=event.target;
    try {
      const old=items.find(r=>r.id===editing);
      const item=validate({...old,id:editing||crypto.randomUUID(),title:form.elements.title.value,url:form.elements.url.value,description:form.elements.description.value,category:form.elements.category.value,kind:form.elements.kind.value,tags:form.elements.tags.value.split(/[,，]/).map(t=>t.trim()).filter(Boolean),favorite:form.elements.favorite.checked,added:old?.added||Date.now()});
      const next=editing?items.map(r=>r.id===editing?item:r):[item,...items];
      if(save(next)) {$('#editor').close();category='';view='all';query='';$('#search').value='';render();notify('资料已保存');}
    } catch(error){$('#form-error').textContent=error.message;}
  };
  $('#confirm-delete').onclick=()=>{if(save(items.filter(r=>r.id!==pendingDelete))){$('#delete-dialog').close();render();notify('资料已删除');}};
  $('#empty-action').onclick=()=>{if(query||view!=='all'){query='';category='';view='all';$('#search').value='';render();}else openEditor();};
  for(const type of ['grid','list'])$('#'+type+'-view').onclick=()=>{layout=type;for(const t of ['grid','list']){$('#'+t+'-view').classList.toggle('selected',t===type);$('#'+t+'-view').setAttribute('aria-pressed',t===type);}render();};
  $('#export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,resources:items},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='learning-hub-resources.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('资料已导出');};
  $('#import').onclick=()=>$('#import-file').click();
  $('#import-file').onchange=async event=>{
    const file=event.target.files[0];if(!file)return;
    try {
      if(file.size>2000000)throw new Error('请选择小于 2 MB 的资料文件');
      const raw=JSON.parse(await file.text()),list=Array.isArray(raw)?raw:raw.resources;
      if(!Array.isArray(list)||list.length>2000)throw new Error('资料文件格式不正确');
      const imported=list.map(validate),byURL=new Map(items.map(r=>[r.url,r]));
      for(const r of imported)if(!byURL.has(r.url))byURL.set(r.url,{...r,id:crypto.randomUUID()});
      const next=[...byURL.values()],count=next.length-items.length;
      if(save(next)){render();notify(`已导入 ${count} 项新资料`);}
    } catch(error){notify(error instanceof SyntaxError?'无法读取 JSON 文件':error.message);}
    event.target.value='';
  };
  render();if(loadError)notify('本地数据无法读取，已显示默认资料');
})();
