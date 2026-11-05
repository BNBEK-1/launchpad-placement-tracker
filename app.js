const KEYS={apps:'launchpad-applications-v1',tasks:'launchpad-tasks-v1'};
const $=s=>document.querySelector(s);
let applications=read(KEYS.apps,[]),tasks=read(KEYS.tasks,[
  {id:crypto.randomUUID(),text:'Polish your resume for one role',done:false},
  {id:crypto.randomUUID(),text:'Practice one DSA problem',done:false},
  {id:crypto.randomUUID(),text:'Reach out to an alumnus',done:false}
]);
function read(key,fallback){try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch{return fallback}}
function save(){localStorage.setItem(KEYS.apps,JSON.stringify(applications));localStorage.setItem(KEYS.tasks,JSON.stringify(tasks))}
function formatDate(value){if(!value)return '—';const date=new Date(`${value}T00:00:00`);return date.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}
function esc(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function render(){
  const query=$('#search').value.trim().toLowerCase(),filter=$('#filter').value;
  const visible=applications.filter(app=>(filter==='all'||app.status===filter)&&`${app.company} ${app.role}`.toLowerCase().includes(query)).sort((a,b)=>b.created-a.created);
  $('#applicationRows').innerHTML=visible.map(app=>`<tr><td><div class="company-cell"><div class="company-icon">${esc(app.company.trim().charAt(0).toUpperCase())}</div><div><div class="company-name">${esc(app.company)}</div><div class="role-name">${esc(app.role)}</div></div></div></td><td><span class="badge ${esc(app.status)}">${esc(app.status)}</span></td><td>${formatDate(app.date)}</td><td>${esc(app.nextStep||'—')}</td><td><button class="row-actions" data-delete="${app.id}" aria-label="Delete ${esc(app.company)} application" title="Delete application">×</button></td></tr>`).join('');
  $('#totalStat').textContent=applications.length;$('#navCount').textContent=applications.length;
  $('#progressStat').textContent=applications.filter(a=>['Applied','Assessment','Interview'].includes(a.status)).length;
  $('#interviewStat').textContent=applications.filter(a=>a.status==='Interview').length;$('#offerStat').textContent=applications.filter(a=>a.status==='Offer').length;
  $('#empty').style.display=visible.length?'none':'block';$('.table-scroll').style.display=visible.length?'block':'none';
  renderTasks();
}
function renderTasks(){
  $('#taskList').innerHTML=tasks.map(task=>`<div class="task ${task.done?'done':''}"><input type="checkbox" data-toggle="${task.id}" ${task.done?'checked':''} aria-label="Mark ${esc(task.text)} complete"><span>${esc(task.text)}</span><button class="delete-task" data-remove="${task.id}" aria-label="Delete task">×</button></div>`).join('');
  const done=tasks.filter(t=>t.done).length,pct=tasks.length?Math.round(done/tasks.length*100):0;$('#progressLabel').textContent=`${pct}%`;$('#progressBar').style.width=`${pct}%`;
  $('#progressHint').textContent=tasks.length?`${done} of ${tasks.length} tasks complete — keep going.`:'Add a few tasks to get started.';
}
function localDateValue(date=new Date()){const localDate=new Date(date.getTime()-date.getTimezoneOffset()*60000);return localDate.toISOString().slice(0,10)}
function openDialog(){$('#applicationForm').reset();$('#applicationForm [name=date]').value=localDateValue();$('#appDialog').showModal();$('#applicationForm [name=company]').focus()}
$('#today').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
$('#addTop').addEventListener('click',openDialog);$('#addButton').addEventListener('click',openDialog);$('#emptyAdd').addEventListener('click',openDialog);
$('#search').addEventListener('input',render);$('#filter').addEventListener('change',render);
$('#applicationForm').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);applications.push({id:crypto.randomUUID(),company:data.get('company').trim(),role:data.get('role').trim(),status:data.get('status'),date:data.get('date'),nextStep:data.get('nextStep').trim(),created:Date.now()});save();render();$('#appDialog').close()});
$('#applicationRows').addEventListener('click',event=>{const button=event.target.closest('[data-delete]');if(!button)return;applications=applications.filter(a=>a.id!==button.dataset.delete);save();render()});
$('#taskForm').addEventListener('submit',event=>{event.preventDefault();const input=$('#taskInput'),text=input.value.trim();if(!text)return;tasks.push({id:crypto.randomUUID(),text,done:false});input.value='';save();renderTasks()});
$('#taskList').addEventListener('change',event=>{const id=event.target.dataset.toggle;if(!id)return;const task=tasks.find(t=>t.id===id);if(task)task.done=event.target.checked;save();renderTasks()});
$('#taskList').addEventListener('click',event=>{const id=event.target.dataset.remove;if(!id)return;tasks=tasks.filter(t=>t.id!==id);save();renderTasks()});
$('#applicationsNav').addEventListener('click',()=>$('.applications-panel').scrollIntoView({behavior:'smooth'}));$('#prepNav').addEventListener('click',()=>$('#prepPanel').scrollIntoView({behavior:'smooth'}));
render();
