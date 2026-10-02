const catalog = document.getElementById("catalog");
const pf = document.getElementById("peopleFilter");
const cf = document.getElementById("categoryFilter");
const params = new URLSearchParams(location.search);
if(params.get("people")) pf.value=params.get("people");
if(params.get("category")) cf.value=params.get("category");

function render(){
 const list=objects.filter(o=>(!pf.value||o.people===pf.value)&&(!cf.value||o.category===cf.value));
 catalog.innerHTML=list.map(o=>`<article class="card">
   <div class="card-art">${o.people[0]}</div>
   <div class="card-body"><span class="tag">${o.people} · ${o.category}</span><h2>${o.name}</h2><p>${o.short}</p>
   <div class="card-actions"><button onclick="add(${o.id})">＋ В коллекцию</button><a href="#" onclick="show(${o.id});return false">Подробнее →</a></div></div>
 </article>`).join("") || "<p>Ничего не найдено.</p>";
}
function add(id){let a=JSON.parse(localStorage.getItem("collection")||"[]");if(!a.includes(id))a.push(id);localStorage.setItem("collection",JSON.stringify(a));alert("Добавлено в коллекцию");}
function show(id){const o=objects.find(x=>x.id===id);alert(`${o.name}\n\n${o.people} · ${o.category}\n\n${o.short}\n\n${o.meaning}\n\nИсточник: ${o.source}`);}
pf.onchange=cf.onchange=render; render();