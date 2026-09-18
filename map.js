function esc(s){
  return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

var SIZE_OPTIONS = [["tiny","Tiny",0.5],["small","Small",1],["medium","Medium",1],["large","Large",2],["huge","Huge",3],["gargantuan","Gargantuan",4]];
function sizeGridSpan(size){
  var found = SIZE_OPTIONS.find(function(s){ return s[0]===size; });
  return found ? found[2] : 1;
}

var mapCampaignSlug = null;
var mapBoardMap = {image:"", gridCols:20, gridRows:15};
var mapBoardTokens = [];
var mapShapes = [];
var mapLastKnownTokensUpdatedAt = 0;
var mapLastKnownShapesUpdatedAt = 0;
var mapPollGeneration = 0;
var mapBoardNaturalW = 0;
var mapBoardNaturalH = 0;
var mapBoardZoom = 1;
var mapBoardPanX = 0;
var mapBoardPanY = 0;
var mapBoardPanning = false;
var mapBoardPanStart = null;

function mapTokenColorForKind(kind){
  if(kind==="pc") return "#4f8fc9";
  if(kind==="enemy") return "#c1666a";
  return "#d4b23c";
}

function mapTokenPixelSize(size){
  var cols = Math.max(1, mapBoardMap.gridCols||20);
  var rows = Math.max(1, mapBoardMap.gridRows||15);
  var cellSize = ((mapBoardNaturalW/cols) + (mapBoardNaturalH/rows)) / 2;
  var mult = sizeGridSpan(size);
  return Math.max(16, (cellSize||38)*mult*0.94);
}

function mapCellPixelSize(){
  var cols = Math.max(1, mapBoardMap.gridCols||20);
  var rows = Math.max(1, mapBoardMap.gridRows||15);
  return ((mapBoardNaturalW/cols) + (mapBoardNaturalH/rows)) / 2;
}

function mapFeetForPixels(pixelDist){
  var cellSize = mapCellPixelSize();
  if(!cellSize) return 0;
  var feet = (pixelDist/cellSize)*5;
  return Math.max(5, Math.round(feet/5)*5);
}

function mapConeBasePoints(x1,y1,x2,y2){
  var dx = x2-x1, dy = y2-y1;
  var angle = Math.atan2(dy,dx);
  var len = Math.sqrt(dx*dx+dy*dy);
  var half = Math.atan(0.5);
  return [
    [x1+len*Math.cos(angle-half), y1+len*Math.sin(angle-half)],
    [x1+len*Math.cos(angle+half), y1+len*Math.sin(angle+half)]
  ];
}

function mapShapeSvgMarkup(s){
  var x1 = s.x1*mapBoardNaturalW, y1 = s.y1*mapBoardNaturalH;
  var x2 = s.x2*mapBoardNaturalW, y2 = s.y2*mapBoardNaturalH;
  var dist = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  var feet = mapFeetForPixels(dist);
  var color = s.color || "#e2b878";
  var initials = s.initials ? '<g transform="translate('+x1+','+y1+')"><circle r="10" fill="'+color+'" stroke="#000" stroke-width="1.5"/>'+
    '<text x="0" y="4" text-anchor="middle" font-size="10" font-weight="700" fill="#0a0a0a">'+esc(s.initials)+'</text></g>' : '';
  if(s.kind==="ruler"){
    var mx=(x1+x2)/2, my=(y1+y2)/2;
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="3"/>'+
      initials+
      '<text x="'+mx+'" y="'+(my-8)+'" text-anchor="middle" font-size="14" fill="'+color+'" font-weight="700" stroke="#000" stroke-width="3" paint-order="stroke">'+feet+' ft</text>';
  }
  if(s.kind==="circle"){
    return '<circle cx="'+x1+'" cy="'+y1+'" r="'+dist+'" fill="'+color+'" fill-opacity="0.22" stroke="'+color+'" stroke-width="2.5"/>'+
      initials+
      '<text x="'+x1+'" y="'+(y1-dist-8)+'" text-anchor="middle" font-size="14" fill="'+color+'" font-weight="700" stroke="#000" stroke-width="3" paint-order="stroke">'+feet+' ft radius</text>';
  }
  if(s.kind==="cone"){
    var base = mapConeBasePoints(x1,y1,x2,y2);
    var pts = x1+','+y1+' '+base[0][0]+','+base[0][1]+' '+base[1][0]+','+base[1][1];
    return '<polygon points="'+pts+'" fill="'+color+'" fill-opacity="0.22" stroke="'+color+'" stroke-width="2.5"/>'+
      initials+
      '<text x="'+x2+'" y="'+(y2-10)+'" text-anchor="middle" font-size="14" fill="'+color+'" font-weight="700" stroke="#000" stroke-width="3" paint-order="stroke">'+feet+' ft</text>';
  }
  if(s.kind==="mark"){
    var half = mapCellPixelSize()*0.32 || 14;
    return '<g transform="translate('+x1+','+y1+')">'+
      '<line x1="'+(-half)+'" y1="'+(-half)+'" x2="'+half+'" y2="'+half+'" stroke="'+color+'" stroke-width="5" stroke-linecap="round"/>'+
      '<line x1="'+half+'" y1="'+(-half)+'" x2="'+(-half)+'" y2="'+half+'" stroke="'+color+'" stroke-width="5" stroke-linecap="round"/>'+
      '</g>'+
      (s.initials ? '<g transform="translate('+(x1-half)+','+(y1-half)+')"><circle r="9" fill="'+color+'" stroke="#000" stroke-width="1.5"/>'+
        '<text x="0" y="3" text-anchor="middle" font-size="9" font-weight="700" fill="#0a0a0a">'+esc(s.initials)+'</text></g>' : '');
  }
  if(s.kind==="ping"){
    var r = mapCellPixelSize()*0.4 || 18;
    return '<g class="board-ping">'+
      '<circle cx="'+x1+'" cy="'+y1+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="4" class="ping-ring"/>'+
      '<circle cx="'+x1+'" cy="'+y1+'" r="'+(r*0.35)+'" fill="'+color+'"/>'+
      (s.initials ? '<text x="'+x1+'" y="'+(y1-r-6)+'" text-anchor="middle" font-size="12" font-weight="700" fill="'+color+'" stroke="#000" stroke-width="3" paint-order="stroke">'+esc(s.initials)+'</text>' : '')+
      '</g>';
  }
  return "";
}

function mapRenderBoardShapes(){
  var svg = document.getElementById("battle-map-shapes-svg");
  if(!svg) return;
  svg.setAttribute("width", mapBoardNaturalW);
  svg.setAttribute("height", mapBoardNaturalH);
  svg.setAttribute("viewBox", "0 0 "+mapBoardNaturalW+" "+mapBoardNaturalH);
  svg.innerHTML = mapShapes.map(mapShapeSvgMarkup).join("");
}

function mapRenderBoardTokens(){
  var el = document.getElementById("battle-map-tokens");
  if(!el) return;
  el.innerHTML = mapBoardTokens.map(function(t){
    var initials = (t.name||"?").trim().split(/\s+/).map(function(w){ return w[0]; }).slice(0,2).join("").toUpperCase();
    var inner = t.image ? '<img src="'+t.image+'" alt="">' : '<span>'+esc(initials)+'</span>';
    var px = mapTokenPixelSize(t.size);
    var fontSize = Math.max(10, Math.round(px*0.32));
    return '<div class="battle-map-token" style="left:'+(t.x*100)+'%;top:'+(t.y*100)+'%;width:'+px+'px;height:'+px+'px;margin:'+(-px/2)+'px 0 0 '+(-px/2)+'px;font-size:'+fontSize+'px;background:'+(t.image?"transparent":esc(mapTokenColorForKind(t.kind)))+';" title="'+esc(t.name||"")+'">'+inner+'</div>';
  }).join("");
}

function mapApplyBoardTransform(){
  var world = document.getElementById("battle-map-world");
  if(!world) return;
  world.style.transform = "translate("+mapBoardPanX+"px,"+mapBoardPanY+"px) scale("+mapBoardZoom+")";
}

function mapZoomBoard(factor, clientX, clientY){
  var viewport = document.getElementById("battle-map-viewport");
  if(!viewport) return;
  var rect = viewport.getBoundingClientRect();
  var mx = clientX!==undefined ? clientX-rect.left : rect.width/2;
  var my = clientY!==undefined ? clientY-rect.top : rect.height/2;
  var worldX = (mx-mapBoardPanX)/mapBoardZoom;
  var worldY = (my-mapBoardPanY)/mapBoardZoom;
  var newZoom = Math.min(5, Math.max(0.25, mapBoardZoom*factor));
  mapBoardPanX = mx - worldX*newZoom;
  mapBoardPanY = my - worldY*newZoom;
  mapBoardZoom = newZoom;
  mapApplyBoardTransform();
}

function mapResetBoardView(){
  var viewport = document.getElementById("battle-map-viewport");
  if(!viewport || !mapBoardNaturalW){ mapBoardZoom=1; mapBoardPanX=0; mapBoardPanY=0; mapApplyBoardTransform(); return; }
  var rect = viewport.getBoundingClientRect();
  mapBoardZoom = Math.min(rect.width/mapBoardNaturalW, rect.height/mapBoardNaturalH, 1) || 1;
  mapBoardPanX = (rect.width - mapBoardNaturalW*mapBoardZoom)/2;
  mapBoardPanY = (rect.height - mapBoardNaturalH*mapBoardZoom)/2;
  mapApplyBoardTransform();
}

function mapSetupViewportInteractions(){
  var viewport = document.getElementById("battle-map-viewport");
  if(!viewport || viewport.dataset.wired) return;
  viewport.dataset.wired = "1";
  viewport.addEventListener("wheel", function(e){
    e.preventDefault();
    mapZoomBoard(e.deltaY<0 ? 1.12 : 1/1.12, e.clientX, e.clientY);
  }, {passive:false});
  viewport.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  viewport.addEventListener("pointerdown", function(e){
    mapBoardPanning = true;
    mapBoardPanStart = {x:e.clientX, y:e.clientY, panX:mapBoardPanX, panY:mapBoardPanY};
    viewport.classList.add("panning");
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", function(e){
    if(!mapBoardPanning || !mapBoardPanStart) return;
    mapBoardPanX = mapBoardPanStart.panX + (e.clientX-mapBoardPanStart.x);
    mapBoardPanY = mapBoardPanStart.panY + (e.clientY-mapBoardPanStart.y);
    mapApplyBoardTransform();
  });
  function stopPan(){
    mapBoardPanning = false; mapBoardPanStart = null; viewport.classList.remove("panning");
  }
  viewport.addEventListener("pointerup", stopPan);
  viewport.addEventListener("pointercancel", stopPan);
}

function mapRenderBoardMap(){
  var viewport = document.getElementById("battle-map-viewport");
  var world = document.getElementById("battle-map-world");
  var img = document.getElementById("battle-map-image");
  var overlay = document.getElementById("battle-map-grid-overlay");
  var hint = document.getElementById("battle-map-empty-hint");
  if(!viewport) return;
  mapSetupViewportInteractions();
  var cols = Math.max(1, mapBoardMap.gridCols||20);
  var rows = Math.max(1, mapBoardMap.gridRows||15);
  var cellW = 100/cols, cellH = 100/rows;
  overlay.style.backgroundImage =
    'repeating-linear-gradient(to right, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 1px, transparent 1px, transparent '+cellW+'%),'+
    'repeating-linear-gradient(to bottom, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 1px, transparent 1px, transparent '+cellH+'%)';
  if(mapBoardMap.image){
    hint.style.display = "none";
    if(img.src !== mapBoardMap.image){
      img.onload = function(){
        mapBoardNaturalW = img.naturalWidth;
        mapBoardNaturalH = img.naturalHeight;
        world.style.width = mapBoardNaturalW+"px";
        world.style.height = mapBoardNaturalH+"px";
        mapResetBoardView();
        mapRenderBoardTokens();
        mapRenderBoardShapes();
      };
      img.src = mapBoardMap.image;
    }
  }else{
    hint.style.display = "flex";
    img.removeAttribute("src");
    mapBoardNaturalW = 0; mapBoardNaturalH = 0;
    world.style.width = "100%"; world.style.height = "100%";
  }
  mapRenderBoardTokens();
  mapRenderBoardShapes();
}

function mapLoadBoardMap(){
  fetch("/api/campaign/"+encodeURIComponent(mapCampaignSlug)+"/board-map", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(data){
    mapBoardMap = {
      image: (data && data.image) || "",
      gridCols: (data && Number(data.gridCols)) || 20,
      gridRows: (data && Number(data.gridRows)) || 15
    };
    mapRenderBoardMap();
  }).catch(function(){
    mapRenderBoardMap();
  });
}

function mapLoadBoardState(){
  mapPollGeneration++;
  var generation = mapPollGeneration;
  var tokensLoaded = fetch("/api/campaign/"+encodeURIComponent(mapCampaignSlug)+"/board-tokens", {cache:"no-store"}).then(function(r){
    mapLastKnownTokensUpdatedAt = parseFloat(r.headers.get("X-Updated-At"))||0;
    return r.json();
  }).then(function(data){
    mapBoardTokens = (data && Array.isArray(data.tokens)) ? data.tokens : [];
    mapRenderBoardTokens();
  }).catch(function(){
    mapBoardTokens = [];
    mapRenderBoardTokens();
  });
  var shapesLoaded = fetch("/api/campaign/"+encodeURIComponent(mapCampaignSlug)+"/board-shapes", {cache:"no-store"}).then(function(r){
    mapLastKnownShapesUpdatedAt = parseFloat(r.headers.get("X-Updated-At"))||0;
    return r.json();
  }).then(function(data){
    mapShapes = (data && Array.isArray(data.shapes)) ? data.shapes : [];
    mapRenderBoardShapes();
  }).catch(function(){
    mapShapes = [];
    mapRenderBoardShapes();
  });
  Promise.all([tokensLoaded, shapesLoaded]).then(function(){
    mapPollNext(generation);
  });
}

function mapPollNext(generation){
  if(generation!==mapPollGeneration) return;
  var since = Math.max(mapLastKnownTokensUpdatedAt, mapLastKnownShapesUpdatedAt);
  fetch("/api/campaign/"+encodeURIComponent(mapCampaignSlug)+"/board-state/wait?since="+since, {cache:"no-store"})
    .then(function(resp){
      if(generation!==mapPollGeneration) return null;
      if(resp.status===200){ return resp.json(); }
      return null;
    })
    .then(function(data){
      if(generation!==mapPollGeneration) return;
      if(data){
        mapBoardTokens = Array.isArray(data.tokens) ? data.tokens : mapBoardTokens;
        mapRenderBoardTokens();
        mapLastKnownTokensUpdatedAt = Number(data.tokensUpdatedAt)||mapLastKnownTokensUpdatedAt;
        mapShapes = Array.isArray(data.shapes) ? data.shapes : mapShapes;
        mapRenderBoardShapes();
        mapLastKnownShapesUpdatedAt = Number(data.shapesUpdatedAt)||mapLastKnownShapesUpdatedAt;
      }
      mapPollNext(generation);
    })
    .catch(function(){
      if(generation!==mapPollGeneration) return;
      setTimeout(function(){ mapPollNext(generation); }, 3000);
    });
}

function mapLoadCampaignTitle(){
  fetch("/api/campaigns", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(list){
    var match = (Array.isArray(list) ? list : []).find(function(c){ return c.slug===mapCampaignSlug; });
    document.getElementById("map-campaign-title").textContent = match ? match.name : "Battle Map";
  }).catch(function(){});
}

function init(){
  var params = new URLSearchParams(location.search);
  mapCampaignSlug = params.get("campaign");
  if(!mapCampaignSlug){
    location.href = "index.html";
    return;
  }
  mapLoadCampaignTitle();
  mapLoadBoardMap();
  mapLoadBoardState();

  document.getElementById("btn-map-zoom-in").addEventListener("click", function(){ mapZoomBoard(1.25); });
  document.getElementById("btn-map-zoom-out").addEventListener("click", function(){ mapZoomBoard(1/1.25); });
  document.getElementById("btn-map-zoom-reset").addEventListener("click", mapResetBoardView);
  window.addEventListener("resize", mapResetBoardView);
}

document.addEventListener("DOMContentLoaded", init);
