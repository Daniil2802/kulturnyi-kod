(function(){
 const areaTabs=[...document.querySelectorAll(".path-tab")];
 const image=document.getElementById("pathImage");
 const kicker=document.getElementById("pathKicker");
 const title=document.getElementById("pathTitle");
 const description=document.getElementById("pathDescription");
 const count=document.getElementById("pathCount");
 const link=document.getElementById("pathLink");
 if(typeof areas==="undefined"||typeof places==="undefined")return;
 if(areaTabs.length&&image&&kicker&&title&&description&&count&&link){
 function updatePath(id){
  const area=areas.find(x=>x.id===id)||areas[0];
  const picks=places.filter(x=>x.areaId===area.id);
  const lead=picks[0];
  areaTabs.forEach(tab=>{
   const active=tab.dataset.area===area.id;
   tab.classList.toggle("is-active",active);
   tab.setAttribute("aria-selected",String(active));
  });
  if(!lead)return;
  image.style.opacity="0";
  window.setTimeout(()=>{
   image.src=lead.image;
   image.alt=lead.imageAlt||lead.title;
   image.onload=()=>{image.style.opacity="1"};
   if(image.complete)image.style.opacity="1";
  },140);
  kicker.textContent="Город / район · "+area.title;
  title.textContent=area.title;
  description.textContent=area.short;
  const n=picks.length, word=n===1?"место":(n>=2&&n<=4?"места":"мест");
  count.textContent=String(n).padStart(2,"0")+" "+word+" · "+lead.kind;
  link.href="area.html?area="+encodeURIComponent(area.id);
 }
 areaTabs.forEach((tab,index)=>{
  tab.addEventListener("click",()=>updatePath(tab.dataset.area));
  tab.addEventListener("keydown",event=>{
   if(event.key!=="ArrowRight"&&event.key!=="ArrowLeft")return;
   event.preventDefault();
   const step=event.key==="ArrowRight"?1:-1;
   const next=areaTabs[(index+step+areaTabs.length)%areaTabs.length];
   next.focus();next.click();
  });
 });
 updatePath("tashtagol");
 }


 const track=document.getElementById("stopsTrack");
 if(track){
  const data=places;
  track.innerHTML=data.map(place=>
   '<a class="stop-card reveal" href="place.html?id='+encodeURIComponent(place.id)+'">'+
    '<img src="'+place.image+'" alt="'+(place.imageAlt||place.title).replace(/"/g,"&quot;")+'" loading="lazy">'+
    '<div class="stop-card-top"><span>'+place.kind+'</span></div>'+
    '<div class="stop-card-copy"><h3>'+place.title+'</h3><p>'+place.address+'</p><span>Открыть историю ↗</span></div></a>'
  ).join("");
  const progress=document.getElementById("stopsProgress");
  const updateProgress=()=>{
   const max=track.scrollWidth-track.clientWidth;
   progress.style.width=(max<=0?100:Math.max(25,((track.scrollLeft+track.clientWidth)/track.scrollWidth)*100))+"%";
  };
  track.addEventListener("scroll",updateProgress,{passive:true});
  document.getElementById("stopsPrev").addEventListener("click",()=>track.scrollBy({left:-track.clientWidth*.75,behavior:"smooth"}));
  document.getElementById("stopsNext").addEventListener("click",()=>track.scrollBy({left:track.clientWidth*.75,behavior:"smooth"}));
  updateProgress();
 }
 const reveals=[...document.querySelectorAll(".home-section,.home-culture-section,.home-endnote,.stop-card")];
 if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}
  }),{threshold:.12});
  reveals.forEach(el=>{el.classList.add("reveal");observer.observe(el)});
 }

 const mapSection=document.getElementById("choosePath");
 if(mapSection&&"IntersectionObserver" in window){
  const mapBlurObserver=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    document.body.classList.toggle("map-background-blurred",entry.isIntersecting);
   });
  },{threshold:0.01});
  mapBlurObserver.observe(mapSection);
 }
})();