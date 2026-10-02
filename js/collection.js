const ids=JSON.parse(localStorage.getItem("collection")||"[]");
const selected=objects.filter(o=>ids.includes(o.id));
const el=document.getElementById("collection");
if(!selected.length){el.innerHTML='<div class="empty"><h2>Коллекция пока пуста</h2><p>Перейди в каталог и добавь первые культурные объекты.</p><a class="button" href="catalog.html">Открыть каталог</a></div>';}
else {
 const peoples=[...new Set(selected.map(o=>o.people))];
 el.innerHTML=`<div class="code-card"><p class="eyebrow">Твой результат</p><h2>Мой культурный код</h2><p>Я познакомился с культурами: <b>${peoples.join(" · ")}</b></p><div class="mini-grid">${selected.map(o=>`<div><span>${o.people[0]}</span><b>${o.name}</b><small>${o.category}</small></div>`).join("")}</div><p class="stats">${selected.length} объектов · ${peoples.length} культуры</p></div>
 <button class="button" onclick="share()">Поделиться культурным кодом</button>`;
}
function share(){const text=`Мой культурный код: я познакомился с культурами ${[...new Set(selected.map(o=>o.people))].join(", ")} и выбрал ${selected.length} культурных объектов.`; if(navigator.share) navigator.share({title:"Мой культурный код",text}); else navigator.clipboard?.writeText(text).then(()=>alert("Текст скопирован"))}