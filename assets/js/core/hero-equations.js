// hero equation wallpaper: click an equation to make it glow
(function(){
  const host=document.getElementById('hero-eqs');
  if(!host) return;
  host.addEventListener('click', function(e){
    let d=e.target;
    while(d && d!==host && !(d.parentElement && d.parentElement.classList && d.parentElement.classList.contains('hero-eq-col'))) d=d.parentElement;
    if(d && d!==host && d.parentElement && d.parentElement.classList.contains('hero-eq-col')) d.classList.toggle('eq-glow');
  });
})();
