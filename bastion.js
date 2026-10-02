// Bastion builder: rooms, corridors, stairs and multiple floors on a grid. Shared by everyone in the campaign.

var basSlug = null;
var basEmbed = false;
var basIsDm = false;
(function(){
  var params = new URLSearchParams(location.search);
  basEmbed = !!params.get("embed");
  basIsDm = params.get("dm")==="1";
  if(basEmbed) document.documentElement.classList.add("bas-embed");
  basSlug = params.get("campaign");
  if(!basSlug){ location.href = "index.html"; }
})();

function esc(s){
  return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

var BAS_ROOM_TYPES = [
  {group:"Basic facilities", items:[
    {id:"bedroom", name:"Bedroom", color:"#7a8fb5", blurb:"A place to rest. Every bastion starts with one."},
    {id:"dining", name:"Dining Room", color:"#b5875a", blurb:"Meals for the household and guests."},
    {id:"parlor", name:"Parlor", color:"#a07aa8", blurb:"A sitting room for receiving visitors."},
    {id:"courtyard", name:"Courtyard", color:"#7fa872", blurb:"Open ground inside the walls."},
    {id:"kitchen", name:"Kitchen", color:"#c9885a", blurb:"Food preparation and stores."},
    {id:"storage", name:"Storage", color:"#8a8170", blurb:"General goods and supplies."}
  ]},
  {group:"Special facilities", items:[
    {id:"arcane-study", name:"Arcane Study", color:"#8c7ae0", order:"Craft", blurb:"Spellcasting research and arcane crafting."},
    {id:"armory", name:"Armory", color:"#a0a4ab", order:"Trade", blurb:"Weapons and armor for the household."},
    {id:"barrack", name:"Barrack", color:"#b5674f", order:"Recruit", blurb:"Housing for bastion defenders."},
    {id:"garden", name:"Garden", color:"#6fae5f", order:"Harvest", blurb:"Herbs, produce and other growing things."},
    {id:"library", name:"Library", color:"#c2a56a", order:"Empower", blurb:"Books, research and lore."},
    {id:"sanctuary", name:"Sanctuary", color:"#e0d58a", order:"Empower", blurb:"A holy or reflective space."},
    {id:"smithy", name:"Smithy", color:"#d0704a", order:"Craft", blurb:"Forge and anvil."},
    {id:"storehouse", name:"Storehouse", color:"#a48b5f", order:"Trade", blurb:"Goods held for trade."},
    {id:"workshop", name:"Workshop", color:"#5fa4a0", order:"Craft", blurb:"Tools and benches for making things."}
  ]},
  {group:"Other", items:[
    {id:"custom", name:"Custom", color:"#9a9a9a", blurb:"Anything else."}
  ]}
];

var bas = null;
var basFloorIdx = 0;
var basSelId = null;
var basTool = "select";
var basZ = 28;
var basUndoStack = [];
var basDrag = null;
var basShowBelow = true;
var basSaveTimer = null;
var basLoaded = false;
var basLastUpdatedAt = 0;
var basSaving = false;

function basId(){ return "b"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function basKey(x,y){ return x+","+y; }
function basNewFloor(name){ return {id:basId(), name:name, cols:40, rows:30, rooms:[], corridors:{}, stairs:{}}; }
function basNewBastion(){ return {name:"Our Bastion", floors:[basNewFloor("Ground Floor")]}; }
function basFloor(){ return bas.floors[basFloorIdx]; }
function basClamp(v,lo,hi){ return Math.max(lo, Math.min(hi, v)); }

function basTypeInfo(id){
  for(var g=0; g<BAS_ROOM_TYPES.length; g++){
    for(var i=0; i<BAS_ROOM_TYPES[g].items.length; i++){
      if(BAS_ROOM_TYPES[g].items[i].id===id) return BAS_ROOM_TYPES[g].items[i];
    }
  }
  return BAS_ROOM_TYPES[2].items[0];
}

function basSizeCategory(w,h){
  var a = w*h;
  if(a<=4) return "Cramped";
  if(a<=16) return "Roomy";
  if(a<=36) return "Vast";
  return "Oversized";
}

function basNormalize(data){
  if(!data || !Array.isArray(data.floors) || !data.floors.length) return basNewBastion();
  data.name = data.name || "Our Bastion";
  data.floors.forEach(function(f){
    f.id = f.id || basId();
    f.name = f.name || "Floor";
    f.cols = basClamp(Number(f.cols)||40, 10, 100);
    f.rows = basClamp(Number(f.rows)||30, 10, 100);
    f.rooms = Array.isArray(f.rooms) ? f.rooms : [];
    f.corridors = (f.corridors && typeof f.corridors==="object") ? f.corridors : {};
    f.stairs = (f.stairs && typeof f.stairs==="object") ? f.stairs : {};
    f.rooms.forEach(function(r){
      r.id = r.id || basId();
      r.type = r.type || "custom";
      r.name = r.name || "Room";
      r.color = r.color || basTypeInfo(r.type).color;
    });
  });
  return data;
}

/* ---------- persistence ---------- */

function basSetStatus(text){
  var el = document.getElementById("bas-status");
  if(el) el.textContent = text;
}

function basScheduleSave(){
  if(!basLoaded) return;
  basSetStatus("Saving…");
  if(basSaveTimer) clearTimeout(basSaveTimer);
  basSaveTimer = setTimeout(basSave, 500);
}

function basSave(){
  basSaveTimer = null;
  if(!basSlug || !bas) return;
  basSaving = true;
  fetch("/api/campaign/"+encodeURIComponent(basSlug)+"/bastion", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(bas)
  }).then(function(r){
    if(!r.ok) throw new Error("save failed");
    return r.json();
  }).then(function(res){
    if(res && res.updatedAt) basLastUpdatedAt = res.updatedAt;
    basSaving = false;
    basSetStatus(basSaveTimer ? "Saving…" : "Saved");
  }).catch(function(){ basSaving = false; basSetStatus("Save failed"); });
}

function basFetch(){
  return fetch("/api/campaign/"+encodeURIComponent(basSlug)+"/bastion", {cache:"no-store"}).then(function(r){
    if(!r.ok) throw new Error("bastion fetch failed");
    var updatedAt = parseFloat(r.headers.get("X-Updated-At"))||0;
    return r.json().then(function(data){ return {data:data, updatedAt:updatedAt}; });
  });
}

function basLoad(){
  if(!basSlug) return;
  basFetch().then(function(res){
    bas = basNormalize(res.data);
    basLastUpdatedAt = res.updatedAt;
    basLoaded = true;
    basRenderAll();
    setInterval(basPoll, 3000);
  }).catch(function(){
    basSetStatus("Could not load bastion");
  });
}

// Pick up changes other players made. Skipped while we are mid-edit so we never clobber local work.
function basPoll(){
  if(!basLoaded || basDrag || basSaveTimer || basSaving) return;
  var active = document.activeElement;
  if(active && document.getElementById("bas-panel").contains(active)) return;
  basFetch().then(function(res){
    if(res.updatedAt<=basLastUpdatedAt || basDrag || basSaveTimer || basSaving) return;
    basLastUpdatedAt = res.updatedAt;
    bas = basNormalize(res.data);
    basFloorIdx = Math.min(basFloorIdx, bas.floors.length-1);
    if(!basFindRoom(basSelId)) basSelId = null;
    basUndoStack = [];
    basRenderAll();
  }).catch(function(){});
}

/* ---------- undo ---------- */

function basPushUndo(){
  basUndoStack.push(JSON.stringify(bas));
  if(basUndoStack.length>60) basUndoStack.shift();
}

function basUndo(){
  if(!basUndoStack.length) return;
  bas = JSON.parse(basUndoStack.pop());
  basFloorIdx = Math.min(basFloorIdx, bas.floors.length-1);
  if(!basFindRoom(basSelId)) basSelId = null;
  basRenderAll();
  basScheduleSave();
}

/* ---------- geometry ---------- */

function basFindRoom(id){
  if(!id || !bas) return null;
  for(var i=0; i<bas.floors.length; i++){
    for(var j=0; j<bas.floors[i].rooms.length; j++){
      if(bas.floors[i].rooms[j].id===id) return {room:bas.floors[i].rooms[j], floorIdx:i};
    }
  }
  return null;
}

function basRoomAt(f,x,y){
  for(var i=f.rooms.length-1; i>=0; i--){
    var r = f.rooms[i];
    if(x>=r.x && x<r.x+r.w && y>=r.y && y<r.y+r.h) return r;
  }
  return null;
}

function basRectFree(f, x, y, w, h, ignoreId){
  if(x<0 || y<0 || x+w>f.cols || y+h>f.rows) return false;
  for(var i=0; i<f.rooms.length; i++){
    var r = f.rooms[i];
    if(r.id===ignoreId) continue;
    if(x<r.x+r.w && x+w>r.x && y<r.y+r.h && y+h>r.y) return false;
  }
  return true;
}

function basClearRect(f, x, y, w, h){
  for(var yy=y; yy<y+h; yy++){
    for(var xx=x; xx<x+w; xx++){
      delete f.corridors[basKey(xx,yy)];
      delete f.stairs[basKey(xx,yy)];
    }
  }
}

function basCellFromEvent(e){
  var svg = document.getElementById("bas-svg");
  var rect = svg.getBoundingClientRect();
  var f = basFloor();
  return {
    x: basClamp(Math.floor((e.clientX-rect.left)/basZ), 0, f.cols-1),
    y: basClamp(Math.floor((e.clientY-rect.top)/basZ), 0, f.rows-1)
  };
}

function basLine(x0,y0,x1,y1){
  var pts = [];
  var dx = Math.abs(x1-x0), dy = Math.abs(y1-y0);
  var sx = x0<x1 ? 1 : -1, sy = y0<y1 ? 1 : -1;
  var err = dx-dy;
  for(;;){
    pts.push([x0,y0]);
    if(x0===x1 && y0===y1) break;
    var e2 = 2*err;
    if(e2>-dy){ err -= dy; x0 += sx; }
    if(e2<dx){ err += dx; y0 += sy; }
  }
  return pts;
}

/* ---------- canvas rendering ---------- */

function basRenderCanvas(){
  if(!bas) return;
  var f = basFloor();
  var Z = basZ;
  var W = f.cols*Z, H = f.rows*Z;
  var svg = document.getElementById("bas-svg");
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.setAttribute("viewBox", "0 0 "+W+" "+H);
  var out = [];
  out.push('<defs><pattern id="bas-grid" width="'+Z+'" height="'+Z+'" patternUnits="userSpaceOnUse"><path d="M '+Z+' 0 L 0 0 0 '+Z+'" class="bas-grid-line"/></pattern></defs>');
  out.push('<rect width="'+W+'" height="'+H+'" class="bas-bg"/>');
  out.push('<rect width="'+W+'" height="'+H+'" fill="url(#bas-grid)"/>');

  if(basShowBelow && basFloorIdx>0){
    bas.floors[basFloorIdx-1].rooms.forEach(function(r){
      out.push('<rect x="'+r.x*Z+'" y="'+r.y*Z+'" width="'+r.w*Z+'" height="'+r.h*Z+'" class="bas-ghost"/>');
    });
  }

  Object.keys(f.corridors).forEach(function(k){
    var p = k.split(",");
    out.push('<rect x="'+p[0]*Z+'" y="'+p[1]*Z+'" width="'+Z+'" height="'+Z+'" class="bas-corridor"/>');
  });

  f.rooms.forEach(function(r){
    var sel = r.id===basSelId;
    var x = r.x*Z, y = r.y*Z, w = r.w*Z, h = r.h*Z;
    out.push('<clipPath id="bc-'+r.id+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"/></clipPath>');
    out.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+esc(r.color)+'" fill-opacity="0.38" stroke="'+esc(r.color)+'" stroke-width="2" class="bas-room"/>');
    var fs = basClamp(Math.floor(Z*0.42), 9, 15);
    var lines = [r.name||"Room"];
    if(r.h>=2 && r.type!=="custom") lines.push(basTypeInfo(r.type).name);
    var ty = y + h/2 - (lines.length-1)*fs*0.6;
    out.push('<g clip-path="url(#bc-'+r.id+')" class="bas-room-label">');
    lines.forEach(function(t,i){
      out.push('<text x="'+(x+w/2)+'" y="'+(ty+i*fs*1.2)+'" font-size="'+(i===0?fs:fs-2)+'" text-anchor="middle" dominant-baseline="middle" class="'+(i===0?"bas-label-main":"bas-label-sub")+'">'+esc(t)+'</text>');
    });
    out.push('</g>');
    if(sel){
      out.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" class="bas-selected"/>');
      out.push('<rect x="'+(x+w-8)+'" y="'+(y+h-8)+'" width="12" height="12" class="bas-handle"/>');
    }
  });

  Object.keys(f.stairs).forEach(function(k){
    var p = k.split(",");
    var d = f.stairs[k];
    var glyph = d==="up" ? "▲" : (d==="down" ? "▼" : "↕");
    out.push('<g class="bas-stairs"><rect x="'+(p[0]*Z+2)+'" y="'+(p[1]*Z+2)+'" width="'+(Z-4)+'" height="'+(Z-4)+'" rx="3"/><text x="'+(p[0]*Z+Z/2)+'" y="'+(p[1]*Z+Z/2)+'" font-size="'+Math.floor(Z*0.5)+'" text-anchor="middle" dominant-baseline="central">'+glyph+'</text></g>');
  });

  if(basDrag && basDrag.mode==="draw"){
    var d = basDrag;
    var x0 = Math.min(d.sx,d.cx), y0 = Math.min(d.sy,d.cy);
    var w0 = Math.abs(d.cx-d.sx)+1, h0 = Math.abs(d.cy-d.sy)+1;
    var ok = basRectFree(f,x0,y0,w0,h0);
    out.push('<rect x="'+x0*Z+'" y="'+y0*Z+'" width="'+w0*Z+'" height="'+h0*Z+'" class="bas-preview'+(ok?"":" bas-preview-bad")+'"/>');
    out.push('<text x="'+(x0*Z+4)+'" y="'+(y0*Z-5)+'" font-size="11" class="bas-dim-label">'+w0+'×'+h0+'</text>');
  }
  svg.innerHTML = out.join("");
}

/* ---------- pointer interaction ---------- */

function basPointerDown(e){
  if(!bas || e.button!==0) return;
  var f = basFloor();
  var c = basCellFromEvent(e);
  var svg = document.getElementById("bas-svg");

  if(basTool==="select"){
    var sel = basFindRoom(basSelId);
    if(sel && sel.floorIdx===basFloorIdx){
      var r = sel.room;
      var rect = svg.getBoundingClientRect();
      var px = e.clientX-rect.left, py = e.clientY-rect.top;
      if(px>=(r.x+r.w)*basZ-12 && px<=(r.x+r.w)*basZ+6 && py>=(r.y+r.h)*basZ-12 && py<=(r.y+r.h)*basZ+6){
        basPushUndo();
        basDrag = {mode:"resize", room:r, moved:false};
        svg.setPointerCapture(e.pointerId);
        return;
      }
    }
    var hit = basRoomAt(f,c.x,c.y);
    if(hit){
      basSelId = hit.id;
      basPushUndo();
      basDrag = {mode:"move", room:hit, ox:c.x-hit.x, oy:c.y-hit.y, moved:false};
      svg.setPointerCapture(e.pointerId);
    } else {
      basSelId = null;
    }
    basRenderCanvas();
    basRenderPanel();
    return;
  }

  svg.setPointerCapture(e.pointerId);
  if(basTool==="room"){
    basDrag = {mode:"draw", sx:c.x, sy:c.y, cx:c.x, cy:c.y};
    basRenderCanvas();
  } else if(basTool==="corridor" || basTool==="erase"){
    basPushUndo();
    basDrag = {mode:basTool, lx:c.x, ly:c.y, changed:false};
    basPaint(c.x,c.y);
    basRenderCanvas();
  } else if(basTool==="stairs"){
    if(basRoomAt(f,c.x,c.y)) return;
    basPushUndo();
    var k = basKey(c.x,c.y);
    var next = {undefined:"up", up:"down", down:"both", both:null}[f.stairs[k]];
    if(next) f.stairs[k] = next; else delete f.stairs[k];
    if(next) delete f.corridors[k];
    basRenderCanvas();
    basRenderPanel();
    basScheduleSave();
  }
}

function basPaint(x,y){
  var f = basFloor();
  var k = basKey(x,y);
  if(basTool==="corridor"){
    if(basRoomAt(f,x,y) || f.stairs[k]) return;
    if(!f.corridors[k]){ f.corridors[k] = 1; basDrag.changed = true; }
  } else {
    if(f.corridors[k]){ delete f.corridors[k]; basDrag.changed = true; }
    if(f.stairs[k]){ delete f.stairs[k]; basDrag.changed = true; }
  }
}

function basPointerMove(e){
  if(!basDrag || !bas) return;
  var f = basFloor();
  var c = basCellFromEvent(e);
  var d = basDrag;
  if(d.mode==="draw"){
    if(c.x!==d.cx || c.y!==d.cy){ d.cx = c.x; d.cy = c.y; basRenderCanvas(); }
  } else if(d.mode==="corridor" || d.mode==="erase"){
    if(c.x!==d.lx || c.y!==d.ly){
      basLine(d.lx,d.ly,c.x,c.y).forEach(function(p){ basPaint(p[0],p[1]); });
      d.lx = c.x; d.ly = c.y;
      basRenderCanvas();
    }
  } else if(d.mode==="move"){
    var nx = basClamp(c.x-d.ox, 0, f.cols-d.room.w);
    var ny = basClamp(c.y-d.oy, 0, f.rows-d.room.h);
    if((nx!==d.room.x || ny!==d.room.y) && basRectFree(f,nx,ny,d.room.w,d.room.h,d.room.id)){
      d.room.x = nx; d.room.y = ny; d.moved = true;
      basRenderCanvas();
    }
  } else if(d.mode==="resize"){
    var nw = basClamp(c.x-d.room.x+1, 1, f.cols-d.room.x);
    var nh = basClamp(c.y-d.room.y+1, 1, f.rows-d.room.y);
    if((nw!==d.room.w || nh!==d.room.h) && basRectFree(f,d.room.x,d.room.y,nw,nh,d.room.id)){
      d.room.w = nw; d.room.h = nh; d.moved = true;
      basRenderCanvas();
    }
  }
}

function basPointerUp(){
  if(!basDrag || !bas) return;
  var d = basDrag;
  basDrag = null;
  var f = basFloor();
  if(d.mode==="draw"){
    var x0 = Math.min(d.sx,d.cx), y0 = Math.min(d.sy,d.cy);
    var w0 = Math.abs(d.cx-d.sx)+1, h0 = Math.abs(d.cy-d.sy)+1;
    if(w0===1 && h0===1){ w0 = 2; h0 = 2; }
    if(basRectFree(f,x0,y0,w0,h0)){
      basPushUndo();
      basClearRect(f,x0,y0,w0,h0);
      var room = {id:basId(), x:x0, y:y0, w:w0, h:h0, name:"New Room", type:"custom", color:basTypeInfo("custom").color,
        orders:"", hirelings:"", description:"", notes:""};
      f.rooms.push(room);
      basSelId = room.id;
      basScheduleSave();
    }
    basRenderAll();
    return;
  }
  if(d.mode==="move" || d.mode==="resize"){
    if(d.moved){
      basClearRect(f,d.room.x,d.room.y,d.room.w,d.room.h);
      basScheduleSave();
    } else {
      basUndoStack.pop();
    }
    basRenderAll();
    return;
  }
  if(d.mode==="corridor" || d.mode==="erase"){
    if(d.changed) basScheduleSave(); else basUndoStack.pop();
    basRenderPanel();
  }
}

/* ---------- toolbar and floors ---------- */

function basRenderFloors(){
  var el = document.getElementById("bas-floors");
  var html = bas.floors.map(function(f,i){
    return '<button type="button" class="bas-floor-tab'+(i===basFloorIdx?" bas-floor-active":"")+'" data-floor="'+i+'">'+esc(f.name)+'</button>';
  }).join("");
  html += '<button type="button" class="btn" id="bas-floor-add" title="Add a floor above">+ Floor</button>';
  html += '<button type="button" class="btn" id="bas-floor-rename">Rename</button>';
  html += '<button type="button" class="btn" id="bas-floor-delete">Delete Floor</button>';
  if(basFloorIdx>0){
    html += '<label class="bas-check"><input type="checkbox" id="bas-show-below"'+(basShowBelow?" checked":"")+'> Show floor below</label>';
  }
  el.innerHTML = html;
}

function basRenderToolbar(){
  var f = basFloor();
  var nameEl = document.getElementById("bas-name");
  if(document.activeElement!==nameEl) nameEl.value = bas.name;
  document.getElementById("bas-cols").value = f.cols;
  document.getElementById("bas-rows").value = f.rows;
  document.querySelectorAll("#bas-tools .battlemap-tool-btn").forEach(function(b){
    b.classList.toggle("battlemap-tool-active", b.dataset.tool===basTool);
  });
}

function basRenderAll(){
  if(!bas) return;
  basRenderToolbar();
  basRenderFloors();
  basRenderCanvas();
  basRenderPanel();
}

function basSetTool(tool){
  basTool = tool;
  document.querySelectorAll("#bas-tools .battlemap-tool-btn").forEach(function(b){
    b.classList.toggle("battlemap-tool-active", b.dataset.tool===tool);
  });
  document.getElementById("bas-canvas").dataset.tool = tool;
}

function basSwitchFloor(i){
  basFloorIdx = basClamp(i, 0, bas.floors.length-1);
  var sel = basFindRoom(basSelId);
  if(!sel || sel.floorIdx!==basFloorIdx) basSelId = null;
  basRenderAll();
}

function basAddFloor(){
  basPushUndo();
  var f = basNewFloor("Floor "+(bas.floors.length+1));
  var cur = basFloor();
  f.cols = cur.cols; f.rows = cur.rows;
  bas.floors.push(f);
  basFloorIdx = bas.floors.length-1;
  basSelId = null;
  basRenderAll();
  basScheduleSave();
}

function basRenameFloor(){
  var f = basFloor();
  var name = prompt("Floor name:", f.name);
  if(name===null || !name.trim()) return;
  basPushUndo();
  f.name = name.trim();
  basRenderFloors();
  basScheduleSave();
}

function basDeleteFloor(){
  if(bas.floors.length<=1){ alert("A bastion needs at least one floor."); return; }
  var f = basFloor();
  if(!confirm('Delete "'+f.name+'" and everything on it?')) return;
  basPushUndo();
  bas.floors.splice(basFloorIdx,1);
  basFloorIdx = Math.min(basFloorIdx, bas.floors.length-1);
  basSelId = null;
  basRenderAll();
  basScheduleSave();
}

function basResizeGrid(){
  var f = basFloor();
  var cols = basClamp(Number(document.getElementById("bas-cols").value)||f.cols, 10, 100);
  var rows = basClamp(Number(document.getElementById("bas-rows").value)||f.rows, 10, 100);
  var minCols = 10, minRows = 10;
  f.rooms.forEach(function(r){ minCols = Math.max(minCols, r.x+r.w); minRows = Math.max(minRows, r.y+r.h); });
  cols = Math.max(cols, minCols); rows = Math.max(rows, minRows);
  if(cols===f.cols && rows===f.rows){ basRenderToolbar(); return; }
  basPushUndo();
  f.cols = cols; f.rows = rows;
  [f.corridors, f.stairs].forEach(function(m){
    Object.keys(m).forEach(function(k){
      var p = k.split(",");
      if(Number(p[0])>=cols || Number(p[1])>=rows) delete m[k];
    });
  });
  basRenderAll();
  basScheduleSave();
}

function basZoom(step){
  basZ = basClamp(basZ+step, 12, 64);
  basRenderCanvas();
}

/* ---------- info panel ---------- */

function basRenderPanel(){
  var el = document.getElementById("bas-panel");
  if(!bas) return;
  var found = basFindRoom(basSelId);
  if(found && found.floorIdx===basFloorIdx){
    basRenderRoomPanel(el, found.room);
  } else {
    basRenderOverview(el);
  }
}

function basRenderOverview(el){
  var total = 0;
  var html = '<div class="section-title" style="margin:0 0 8px;">'+esc(bas.name)+'</div>';
  bas.floors.forEach(function(f,i){
    total += f.rooms.length;
    html += '<div class="bas-ov-floor">'+esc(f.name)+' <span class="footer-line" style="margin:0;">'+f.rooms.length+(f.rooms.length===1?" room":" rooms")+'</span></div>';
    if(!f.rooms.length) html += '<div class="footer-line">No rooms yet.</div>';
    f.rooms.forEach(function(r){
      html += '<button type="button" class="bas-ov-room" data-floor="'+i+'" data-room="'+r.id+'"><span class="bas-swatch" style="background:'+esc(r.color)+'"></span>'+esc(r.name)+
        ' <span class="footer-line" style="margin:0;">'+r.w+'×'+r.h+'</span></button>';
    });
  });
  html += '<div class="footer-line" style="margin-top:12px;">Click a room to see and edit its details. Use the Room tool to drag out a new room, Corridor to paint paths, and Stairs to mark links between floors.</div>';
  el.innerHTML = html;
}

function basRenderRoomPanel(el, r){
  var info = basTypeInfo(r.type);
  var f = basFloor();
  var opts = BAS_ROOM_TYPES.map(function(g){
    return '<optgroup label="'+esc(g.group)+'">'+g.items.map(function(t){
      return '<option value="'+t.id+'"'+(t.id===r.type?" selected":"")+'>'+esc(t.name)+'</option>';
    }).join("")+'</optgroup>';
  }).join("");
  el.innerHTML =
    '<div class="bas-field"><label>Name</label><input type="text" data-field="name" value="'+esc(r.name)+'" maxlength="80"></div>'+
    '<div class="bas-row2">'+
      '<div class="bas-field"><label>Type</label><select data-field="type">'+opts+'</select></div>'+
      '<div class="bas-field bas-field-color"><label>Colour</label><input type="color" data-field="color" value="'+esc(r.color)+'"></div>'+
    '</div>'+
    '<div class="footer-line bas-blurb" id="bas-blurb">'+esc(info.blurb)+(info.order?' Suggested order: '+esc(info.order)+'.':'')+'</div>'+
    '<div class="bas-row2">'+
      '<div class="bas-field"><label>Width</label><input type="number" data-field="w" min="1" max="'+f.cols+'" value="'+r.w+'"></div>'+
      '<div class="bas-field"><label>Height</label><input type="number" data-field="h" min="1" max="'+f.rows+'" value="'+r.h+'"></div>'+
    '</div>'+
    '<div class="footer-line" id="bas-size-line">'+basSizeLine(r)+'</div>'+
    '<div class="bas-field"><label>Current order</label><input type="text" data-field="orders" value="'+esc(r.orders||"")+'" placeholder="e.g. Craft: healing potions (7 days)"></div>'+
    '<div class="bas-field"><label>Hirelings / occupants</label><input type="text" data-field="hirelings" value="'+esc(r.hirelings||"")+'" placeholder="Who works or lives here"></div>'+
    '<div class="bas-field"><label>Description</label><textarea data-field="description" rows="4" placeholder="What is this room like? What does it do?">'+esc(r.description||"")+'</textarea></div>'+
    '<div class="bas-field"><label>Notes</label><textarea data-field="notes" rows="4" placeholder="Upgrades, plot hooks, anything else…">'+esc(r.notes||"")+'</textarea></div>'+
    '<div class="bas-panel-actions"><button type="button" class="btn" id="bas-room-close">Done</button><button type="button" class="btn" id="bas-room-delete">Delete Room</button></div>';
}

function basSizeLine(r){
  return 'Floor: '+esc(basFloor().name)+' · Position: ('+r.x+', '+r.y+') · '+r.w+'×'+r.h+' = '+(r.w*r.h)+' squares · '+basSizeCategory(r.w,r.h);
}

function basPanelInput(e){
  var t = e.target;
  var field = t.dataset && t.dataset.field;
  var found = basFindRoom(basSelId);
  if(!field || !found) return;
  var r = found.room;
  var f = bas.floors[found.floorIdx];
  if(field==="w" || field==="h"){
    if(e.type!=="change") return;
    var nw = field==="w" ? Number(t.value) : r.w;
    var nh = field==="h" ? Number(t.value) : r.h;
    nw = Math.round(nw); nh = Math.round(nh);
    if(nw>=1 && nh>=1 && basRectFree(f,r.x,r.y,nw,nh,r.id)){
      basPushUndo();
      r.w = nw; r.h = nh;
      basClearRect(f,r.x,r.y,r.w,r.h);
      basRenderCanvas();
      basScheduleSave();
    }
    t.value = field==="w" ? r.w : r.h;
    document.getElementById("bas-size-line").innerHTML = basSizeLine(r);
    return;
  }
  if(e.type==="change" && field!=="type") return;
  if(field==="type"){
    if(e.type!=="change") return;
    basPushUndo();
    var oldInfo = basTypeInfo(r.type);
    r.type = t.value;
    var ni = basTypeInfo(r.type);
    if(r.color===oldInfo.color) r.color = ni.color;
    if(r.name==="New Room" || r.name===oldInfo.name) r.name = ni.name;
    basRenderCanvas();
    basRenderPanel();
    basScheduleSave();
    return;
  }
  r[field] = t.value;
  basRenderCanvas();
  basScheduleSave();
}

function basPanelClick(e){
  var t = e.target.closest("button");
  if(!t) return;
  if(t.classList.contains("bas-ov-room")){
    basSelId = t.dataset.room;
    basFloorIdx = Number(t.dataset.floor);
    basSetTool("select");
    basRenderAll();
    return;
  }
  if(t.id==="bas-room-close"){ basSelId = null; basRenderAll(); return; }
  if(t.id==="bas-room-delete"){ basDeleteSelected(); }
}

function basDeleteSelected(){
  var found = basFindRoom(basSelId);
  if(!found) return;
  var r = found.room;
  if((r.description||r.notes) && !confirm('Delete "'+r.name+'"? Its description and notes will be lost (Ctrl+Z can undo).')) return;
  basPushUndo();
  var f = bas.floors[found.floorIdx];
  f.rooms = f.rooms.filter(function(x){ return x.id!==r.id; });
  basSelId = null;
  basRenderAll();
  basScheduleSave();
}

/* ---------- init ---------- */

function basKeydown(e){
  if(!bas) return;
  var tag = (e.target.tagName||"").toLowerCase();
  var typing = tag==="input" || tag==="textarea" || tag==="select";
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="z" && !(typing && tag!=="select")){
    e.preventDefault(); basUndo(); return;
  }
  if(typing || e.ctrlKey || e.metaKey || e.altKey) return;
  var keys = {v:"select", r:"room", c:"corridor", s:"stairs", e:"erase"};
  if(keys[e.key.toLowerCase()]){ basSetTool(keys[e.key.toLowerCase()]); return; }
  if(e.key==="Delete" || e.key==="Backspace"){ e.preventDefault(); basDeleteSelected(); }
  else if(e.key==="Escape"){ basSelId = null; basRenderAll(); }
}

function basRenderLocked(){
  var layout = document.getElementById("bas-layout");
  if(layout){
    layout.innerHTML = '<div class="bas-locked"><div class="section-title">Bastion Locked</div>'+
      '<div class="footer-line">Your DM has not unlocked the Bastion for this campaign yet. Ask them to flip it on from the Bastion tab of the DM Screen.</div></div>';
  }
}

function basInit(){
  if(basIsDm){ basInitEditor(); return; }
  fetch("/api/campaign/"+encodeURIComponent(basSlug)+"/settings", {cache:"no-store"}).then(function(r){ return r.json(); }).catch(function(){ return {}; }).then(function(data){
    if(data && data.bastionEnabled) basInitEditor(); else basRenderLocked();
  });
}

function basInitEditor(){
  var svg = document.getElementById("bas-svg");
  if(!svg) return;
  svg.addEventListener("pointerdown", basPointerDown);
  svg.addEventListener("pointermove", basPointerMove);
  svg.addEventListener("pointerup", basPointerUp);
  svg.addEventListener("pointercancel", basPointerUp);
  document.getElementById("bas-canvas").dataset.tool = basTool;
  document.getElementById("bas-tools").addEventListener("click", function(e){
    var b = e.target.closest(".battlemap-tool-btn");
    if(b) basSetTool(b.dataset.tool);
  });
  document.getElementById("bas-name").addEventListener("input", function(e){
    if(!bas) return;
    bas.name = e.target.value;
    basScheduleSave();
  });
  document.getElementById("bas-undo").addEventListener("click", basUndo);
  document.getElementById("bas-cols").addEventListener("change", basResizeGrid);
  document.getElementById("bas-rows").addEventListener("change", basResizeGrid);
  document.getElementById("bas-zoom-in").addEventListener("click", function(){ basZoom(4); });
  document.getElementById("bas-zoom-out").addEventListener("click", function(){ basZoom(-4); });
  document.getElementById("bas-floors").addEventListener("click", function(e){
    var tab = e.target.closest(".bas-floor-tab");
    if(tab){ basSwitchFloor(Number(tab.dataset.floor)); return; }
    if(e.target.id==="bas-floor-add") basAddFloor();
    else if(e.target.id==="bas-floor-rename") basRenameFloor();
    else if(e.target.id==="bas-floor-delete") basDeleteFloor();
  });
  document.getElementById("bas-floors").addEventListener("change", function(e){
    if(e.target.id==="bas-show-below"){ basShowBelow = e.target.checked; basRenderCanvas(); }
  });
  var panel = document.getElementById("bas-panel");
  panel.addEventListener("input", basPanelInput);
  panel.addEventListener("change", basPanelInput);
  panel.addEventListener("click", basPanelClick);
  document.addEventListener("keydown", basKeydown);
  if(!basEmbed){
    fetch("/api/campaigns", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(list){
      var match = (Array.isArray(list)?list:[]).find(function(c){ return c.slug===basSlug; });
      if(match) document.getElementById("bas-campaign-title").textContent = "Bastion — "+match.name;
    }).catch(function(){});
  }
  basLoad();
}

document.addEventListener("DOMContentLoaded", basInit);
