var dmCampaignSlug = null;
var dmToken = null;
var dmRosterList = [];

(function(){
  var params = new URLSearchParams(location.search);
  dmCampaignSlug = params.get("campaign");
  if(!dmCampaignSlug){ location.href = "index.html"; return; }
  try{ dmToken = localStorage.getItem("dmToken:"+dmCampaignSlug); }catch(e){ dmToken = null; }
  if(!dmToken){ location.href = "index.html"; }
})();

function dmLogout(){
  try{ localStorage.removeItem("dmToken:"+dmCampaignSlug); }catch(e){}
  location.href = "index.html";
}

function computeDisplayStatsFor(charState){
  var savedState = state;
  state = charState;
  var lvl = totalLevel();
  var pb = profBonus(lvl) + effectBonusTotal("profBonus");
  var acSet = effectSetValue("ac");
  var acBase = acSet!==undefined ? acSet : (10 + mod(effAbilityScore("dex")));
  var ac = acBase + (Number(state.combat.acBonus)||0) + effectBonusTotal("ac");
  var hpMax = effectiveHpMax();
  var hpCurrent = Number(state.combat.hpCurrent)||0;
  state = savedState;
  return {level: lvl, pb: pb, ac: ac, hpMax: hpMax, hpCurrent: hpCurrent};
}

var dmPartyFullCache = {};

function dmLoadParty(slug){
  var el = document.getElementById("dm-party-list");
  el.innerHTML = '<div class="footer-line">Loading…</div>';
  var members = dmRosterList.filter(function(c){
    return campaignSlug((c.meta&&c.meta.campaign)||"")===slug;
  });
  Promise.all(members.map(function(c){
    return fetch("/api/character/"+encodeURIComponent(c.id), {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(full){
      return {id:c.id, fallbackName:c.name, full:full};
    }).catch(function(){ return {id:c.id, fallbackName:c.name, full:null}; });
  })).then(function(results){
    results.forEach(function(r){ if(r.full) dmPartyFullCache[r.id] = r.full; });
    dmRenderParty(results);
    dmRenderBattleMapAddRow();
  });
}

function dmRenderParty(results){
  var el = document.getElementById("dm-party-list");
  var countEl = document.getElementById("dm-party-count");
  if(countEl) countEl.textContent = results.length ? (results.length+(results.length===1?" character":" characters")) : "";
  if(!results.length){ el.innerHTML = '<div class="footer-line">No characters found in this campaign.</div>'; return; }
  el.innerHTML = results.map(function(r){
    var full = r.full;
    if(!full || !full.meta){
      return '<div class="dm-party-card"><div class="dm-party-name">'+esc(r.fallbackName||"(unknown)")+'</div><div class="footer-line">Could not load.</div></div>';
    }
    normalizeState(full);
    var stats = computeDisplayStatsFor(full);
    var activeConditions = CONDITIONS.filter(function(c){ return full.combat && full.combat.conditions && full.combat.conditions[c.toLowerCase()]; });
    return '<div class="dm-party-card">'+
      '<div class="dm-party-name">'+esc(full.meta.name||r.fallbackName||"(unnamed)")+' <span class="dm-party-level">Lv '+stats.level+'</span></div>'+
      '<div class="dm-party-stats">'+
        '<span>HP <b>'+stats.hpCurrent+'/'+stats.hpMax+'</b></span>'+
        '<span>AC <b>'+stats.ac+'</b></span>'+
        (full.combat && Number(full.combat.exhaustion) ? '<span>Exh <b>'+full.combat.exhaustion+'</b></span>' : '')+
      '</div>'+
      (activeConditions.length ? '<div class="dm-party-conditions">'+esc(activeConditions.join(", "))+'</div>' : '')+
      '</div>';
  }).join("");
}

function dmLoadNotes(slug){
  var ta = document.getElementById("dm-notes-textarea");
  ta.value = "";
  fetch("/api/dm/notes/"+encodeURIComponent(slug), {headers:{"X-DM-Token":dmToken}, cache:"no-store"}).then(function(r){
    if(!r.ok) throw new Error("notes fetch failed");
    return r.json();
  }).then(function(data){
    ta.value = data.text||"";
    autoGrow(ta);
  }).catch(function(){});
}

var dmNotesSaveTimer = null;
function scheduleDmNotesSave(){
  if(dmNotesSaveTimer) clearTimeout(dmNotesSaveTimer);
  dmNotesSaveTimer = setTimeout(dmSaveNotes, 400);
}
function dmSaveNotes(){
  if(!dmCampaignSlug || !dmToken) return;
  var ta = document.getElementById("dm-notes-textarea");
  fetch("/api/dm/notes/"+encodeURIComponent(dmCampaignSlug), {
    method:"POST", headers:{"Content-Type":"application/json","X-DM-Token":dmToken}, body:JSON.stringify({text:ta.value})
  }).catch(function(){});
}

var dmInitiativeState = {round:1, currentId:null, entries:[]};
var dmInitiativePollGeneration = 0;
var dmLastKnownInitiativeUpdatedAt = 0;

function dmSortedInitiativeEntries(){
  return dmInitiativeState.entries.slice().sort(function(a,b){
    var d = (Number(b.init)||0)-(Number(a.init)||0);
    if(d!==0) return d;
    return String(a.name||"").localeCompare(String(b.name||""));
  });
}

function dmRenderInitiative(){
  var el = document.getElementById("dm-initiative-list");
  if(!el) return;
  var sorted = dmSortedInitiativeEntries();
  el.innerHTML = sorted.map(function(entry){
    var isCurrent = entry.id===dmInitiativeState.currentId;
    return '<div class="initiative-row'+(isCurrent?" current-turn":"")+'">'+
      '<input type="number" class="init-val-input mono" value="'+(Number(entry.init)||0)+'" onchange="dmUpdateInitiativeValue(\''+entry.id+'\', this.value)">'+
      '<span class="init-name">'+esc(entry.name||"Unnamed")+(entry.characterId?' <span class="init-pc-badge" title="Player character">PC</span>':'')+'</span>'+
      '<button class="row-del" onclick="dmRemoveInitiativeEntry(\''+entry.id+'\')" title="Remove">&times;</button>'+
      '</div>';
  }).join("");
  setText("dm-initiative-round", dmInitiativeState.round);
  dmRenderInitiativeCampaignPicker();
}

var dmPendingInitiativeCharacterId = null;

function dmRenderInitiativeCampaignPicker(){
  var el = document.getElementById("dm-initiative-campaign-picker");
  if(!el) return;
  var addedIds = {};
  dmInitiativeState.entries.forEach(function(e){ if(e.characterId) addedIds[e.characterId] = true; });
  var mates = dmCampaignMembers().filter(function(c){ return !addedIds[c.id]; });
  if(!mates.length){
    el.innerHTML = '<div class="campaign-chip-hint">No available party members to add.</div>';
    return;
  }
  el.innerHTML = mates.map(function(c){
    var name = (c.name && c.name.trim()) ? c.name : "(unnamed)";
    return '<button type="button" class="campaign-chip" data-cid="'+esc(c.id)+'" data-cname="'+esc(name)+'" onclick="dmPickInitiativeCandidate(this)">'+
      esc(name)+'</button>';
  }).join("");
}

function dmPickInitiativeCandidate(btn){
  dmPendingInitiativeCharacterId = btn.dataset.cid;
  var nameInput = document.getElementById("dm-initiative-name-input");
  var valueInput = document.getElementById("dm-initiative-value-input");
  nameInput.value = btn.dataset.cname;
  valueInput.focus();
  valueInput.select();
}

function dmLoadInitiative(slug){
  dmInitiativePollGeneration++;
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/initiative", {cache:"no-store"}).then(function(r){
    dmLastKnownInitiativeUpdatedAt = parseFloat(r.headers.get("X-Updated-At"))||0;
    return r.json();
  }).then(function(data){
    dmInitiativeState = (data && Array.isArray(data.entries)) ? data : {round:1, currentId:null, entries:[]};
    dmRenderInitiative();
    dmStartInitiativePolling(slug);
  }).catch(function(){
    dmInitiativeState = {round:1, currentId:null, entries:[]};
    dmRenderInitiative();
  });
}

function dmStartInitiativePolling(slug){
  dmInitiativePollNext(dmInitiativePollGeneration, slug);
}

function dmInitiativePollNext(generation, slug){
  if(generation!==dmInitiativePollGeneration || slug!==dmCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/initiative/wait?since="+dmLastKnownInitiativeUpdatedAt, {cache:"no-store"})
    .then(function(resp){
      if(generation!==dmInitiativePollGeneration) return null;
      var updatedHeader = parseFloat(resp.headers.get("X-Updated-At"));
      if(resp.status===200){
        return resp.json().then(function(data){
          return {data:data, updatedAt: isNaN(updatedHeader)?dmLastKnownInitiativeUpdatedAt:updatedHeader};
        });
      }
      if(!isNaN(updatedHeader)){ dmLastKnownInitiativeUpdatedAt = updatedHeader; }
      return null;
    })
    .then(function(result){
      if(generation!==dmInitiativePollGeneration) return;
      if(result){
        dmInitiativeState = (result.data && Array.isArray(result.data.entries)) ? result.data : dmInitiativeState;
        dmLastKnownInitiativeUpdatedAt = result.updatedAt;
        dmRenderInitiative();
      }
      dmInitiativePollNext(generation, slug);
    })
    .catch(function(){
      if(generation!==dmInitiativePollGeneration) return;
      setTimeout(function(){ dmInitiativePollNext(generation, slug); }, 3000);
    });
}

function dmSaveInitiative(){
  if(!dmCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(dmCampaignSlug)+"/initiative", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(dmInitiativeState)
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res && res.updatedAt){ dmLastKnownInitiativeUpdatedAt = res.updatedAt; }
  }).catch(function(){});
}

function dmAddInitiativeEntry(){
  var nameInput = document.getElementById("dm-initiative-name-input");
  var valueInput = document.getElementById("dm-initiative-value-input");
  var name = nameInput.value.trim();
  if(!name) return;
  var init = Number(valueInput.value)||0;
  var entry = {id:"init-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), name:name, init:init};
  if(dmPendingInitiativeCharacterId) entry.characterId = dmPendingInitiativeCharacterId;
  dmPendingInitiativeCharacterId = null;
  dmInitiativeState.entries.push(entry);
  if(dmInitiativeState.currentId===null){ dmInitiativeState.currentId = entry.id; }
  nameInput.value = "";
  valueInput.value = "";
  dmRenderInitiative();
  dmSaveInitiative();
}

function dmUpdateInitiativeValue(id, val){
  var entry = dmInitiativeState.entries.find(function(e){ return e.id===id; });
  if(!entry) return;
  entry.init = Number(val)||0;
  dmRenderInitiative();
  dmSaveInitiative();
}

function dmRemoveInitiativeEntry(id){
  var sorted = dmSortedInitiativeEntries();
  var wasCurrent = dmInitiativeState.currentId===id;
  var idx = sorted.findIndex(function(e){ return e.id===id; });
  dmInitiativeState.entries = dmInitiativeState.entries.filter(function(e){ return e.id!==id; });
  if(wasCurrent){
    var remaining = dmSortedInitiativeEntries();
    dmInitiativeState.currentId = remaining.length ? (remaining[idx]||remaining[0]).id : null;
  }
  dmRenderInitiative();
  dmSaveInitiative();
}

function dmNextTurn(){
  var sorted = dmSortedInitiativeEntries();
  if(!sorted.length) return;
  var idx = sorted.findIndex(function(e){ return e.id===dmInitiativeState.currentId; });
  var nextIdx = idx===-1 ? 0 : idx+1;
  if(nextIdx>=sorted.length){ nextIdx=0; dmInitiativeState.round=(Number(dmInitiativeState.round)||1)+1; }
  dmInitiativeState.currentId = sorted[nextIdx].id;
  dmRenderInitiative();
  dmSaveInitiative();
}

function dmPrevTurn(){
  var sorted = dmSortedInitiativeEntries();
  if(!sorted.length) return;
  var idx = sorted.findIndex(function(e){ return e.id===dmInitiativeState.currentId; });
  var prevIdx = idx===-1 ? sorted.length-1 : idx-1;
  if(prevIdx<0){ prevIdx=sorted.length-1; dmInitiativeState.round=Math.max(1,(Number(dmInitiativeState.round)||1)-1); }
  dmInitiativeState.currentId = sorted[prevIdx].id;
  dmRenderInitiative();
  dmSaveInitiative();
}

function dmResetInitiative(){
  if(!confirm("Clear the SHARED initiative tracker for everyone in this campaign?")) return;
  dmInitiativeState = {round:1, currentId:null, entries:[]};
  dmRenderInitiative();
  dmSaveInitiative();
}

var dmTreasure = [];
var dmTreasureSaveTimer = null;
var dmLootExpanded = {};
var LOOT_COIN_KEYS = ["cp","sp","ep","gp","pp"];

function dmCampaignMembers(){
  return dmRosterList.filter(function(c){
    return campaignSlug((c.meta&&c.meta.campaign)||"")===dmCampaignSlug;
  });
}

function dmLootSummary(c){
  var parts = [];
  var cur = c.currency||{};
  LOOT_COIN_KEYS.forEach(function(key){
    var amt = Number(cur[key])||0;
    if(amt) parts.push(amt+" "+key);
  });
  var items = c.items||[];
  if(items.length) parts.push(items.length+" item"+(items.length===1?"":"s"));
  return parts.length ? parts.join(", ") : "empty";
}

function dmRenderTreasure(){
  var el = document.getElementById("dm-loot-list");
  if(!el) return;
  if(!dmTreasure.length){ el.innerHTML = '<div class="footer-line">No loot containers yet.</div>'; return; }
  var members = dmCampaignMembers();
  el.innerHTML = dmTreasure.map(function(c,i){
    var name = (c.name&&c.name.trim()) ? c.name : "(unnamed container)";
    var options = '<option value="">Give to…</option>'+members.map(function(m){
      var mname = (m.name&&m.name.trim()) ? m.name : "(unnamed)";
      return '<option value="'+esc(m.id)+'">'+esc(mname)+'</option>';
    }).join("");
    var expanded = !!dmLootExpanded[c.id];
    var html = '<div class="loot-container-card">'+
      '<div class="loot-container-head">'+
      '<button type="button" class="loot-container-toggle" onclick="dmToggleLootExpanded(\''+c.id+'\')">'+
      '<span class="caret">'+(expanded?"&#9662;":"&#9656;")+'</span> '+
      '<input type="text" value="'+esc(c.name)+'" placeholder="Container name (e.g. Chest, Goblin’s pack)" onchange="dmUpdateLootField(\''+c.id+'\',\'name\',this.value)" onclick="event.stopPropagation()">'+
      '</button>'+
      '<div class="footer-line loot-container-summary">'+esc(dmLootSummary(c))+'</div>'+
      '<div class="loot-container-actions">'+
      '<select id="dm-loot-target-'+c.id+'">'+options+'</select>'+
      '<button class="btn resource-btn" onclick="dmGiveLootContainer(\''+c.id+'\')" title="Give this entire container to the selected character">Give</button>'+
      '<button class="row-del" onclick="dmRemoveLootContainer(\''+c.id+'\')">&times;</button>'+
      '</div>'+
      '</div>';
    if(expanded){
      html += '<div class="loot-container-body">'+
        '<div class="loot-currency-row">'+
        LOOT_COIN_KEYS.map(function(key){
          return '<label class="loot-currency-field">'+key.toUpperCase()+'<input type="number" min="0" value="'+(Number((c.currency||{})[key])||0)+'" onchange="dmUpdateLootCurrency(\''+c.id+'\',\''+key+'\',this.value)"></label>';
        }).join("")+
        '</div>'+
        '<div class="loot-item-list">'+
        (c.items||[]).map(function(it,ii){
          return '<div class="loot-item-row">'+
            '<input type="text" value="'+esc(it.name)+'" placeholder="Item name" onchange="dmUpdateLootItem(\''+c.id+'\','+ii+',\'name\',this.value)">'+
            '<input type="number" class="no-spin" min="1" value="'+(it.qty||1)+'" title="Qty" onchange="dmUpdateLootItem(\''+c.id+'\','+ii+',\'qty\',this.value)">'+
            '<input type="text" value="'+esc(it.notes||"")+'" placeholder="Notes" onchange="dmUpdateLootItem(\''+c.id+'\','+ii+',\'notes\',this.value)">'+
            '<button class="row-del" onclick="dmRemoveLootItem(\''+c.id+'\','+ii+')">&times;</button>'+
            '</div>';
        }).join("")+
        '</div>'+
        '<button class="btn" onclick="dmAddLootItem(\''+c.id+'\')">+ Add Item</button>'+
        '</div>';
    }
    return html+'</div>';
  }).join("");
}

function dmFindLoot(id){
  return dmTreasure.filter(function(c){ return c.id===id; })[0];
}

function dmToggleLootExpanded(id){
  dmLootExpanded[id] = !dmLootExpanded[id];
  dmRenderTreasure();
}

function dmUpdateLootField(id, field, val){
  var c = dmFindLoot(id);
  if(!c) return;
  c[field] = val;
  dmRenderTreasure();
  dmScheduleSaveTreasure();
}

function dmUpdateLootCurrency(id, key, val){
  var c = dmFindLoot(id);
  if(!c) return;
  c.currency = c.currency || {};
  c.currency[key] = Math.max(0, Number(val)||0);
  dmRenderTreasure();
  dmScheduleSaveTreasure();
}

function dmAddLootItem(id){
  var c = dmFindLoot(id);
  if(!c) return;
  c.items = c.items || [];
  c.items.push({name:"", qty:1, weight:0, notes:""});
  dmRenderTreasure();
  dmScheduleSaveTreasure();
}

function dmUpdateLootItem(id, ii, field, val){
  var c = dmFindLoot(id);
  if(!c || !c.items || !c.items[ii]) return;
  c.items[ii][field] = field==="qty" ? Math.max(1, Number(val)||1) : val;
  dmRenderTreasure();
  dmScheduleSaveTreasure();
}

function dmRemoveLootItem(id, ii){
  var c = dmFindLoot(id);
  if(!c || !c.items) return;
  c.items.splice(ii,1);
  dmRenderTreasure();
  dmScheduleSaveTreasure();
}

function dmAddLootContainer(){
  var c = {id:"trs-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), name:"", currency:{cp:0,sp:0,ep:0,gp:0,pp:0}, items:[]};
  dmTreasure.push(c);
  dmLootExpanded[c.id] = true;
  dmRenderTreasure();
  dmScheduleSaveTreasure();
}

function dmRemoveLootContainer(id){
  dmTreasure = dmTreasure.filter(function(c){ return c.id!==id; });
  delete dmLootExpanded[id];
  dmRenderTreasure();
  dmScheduleSaveTreasure();
}

function dmGiveLootContainer(id){
  var c = dmFindLoot(id);
  if(!c) return;
  var sel = document.getElementById("dm-loot-target-"+id);
  var targetId = sel && sel.value;
  if(!targetId){ alert("Choose who to give it to first."); return; }
  fetch("/api/inbox/"+encodeURIComponent(targetId), {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({container:{name:c.name, currency:c.currency||{}, items:(c.items||[]).map(function(it){ return {name:it.name, qty:it.qty||1, weight:it.weight||0, notes:it.notes||""}; }), from:"Dungeon Master"}})
  }).then(function(r){
    if(!r.ok) throw new Error("give failed");
    dmRemoveLootContainer(id);
  }).catch(function(){
    alert("Could not give container — is the server running?");
  });
}

function dmScheduleSaveTreasure(){
  if(dmTreasureSaveTimer) clearTimeout(dmTreasureSaveTimer);
  dmTreasureSaveTimer = setTimeout(dmSaveTreasure, 400);
}

function dmSaveTreasure(){
  if(!dmCampaignSlug || !dmToken) return;
  fetch("/api/dm/treasure/"+encodeURIComponent(dmCampaignSlug), {
    method:"POST", headers:{"Content-Type":"application/json","X-DM-Token":dmToken}, body:JSON.stringify({items:dmTreasure})
  }).catch(function(){});
}

function dmLoadTreasure(slug){
  fetch("/api/dm/treasure/"+encodeURIComponent(slug), {headers:{"X-DM-Token":dmToken}, cache:"no-store"}).then(function(r){ return r.json(); }).then(function(data){
    dmTreasure = (data && Array.isArray(data.items)) ? data.items : [];
    dmRenderTreasure();
  }).catch(function(){
    dmTreasure = [];
    dmRenderTreasure();
  });
}

var dmBoardMap = {image:"", gridCols:20, gridRows:15};
var dmBoardTokens = [];
var dmBoardStatePollGeneration = 0;
var dmLastKnownBoardTokensUpdatedAt = 0;
var dmBoardDragTokenId = null;
var dmBoardNaturalW = 0;
var dmBoardNaturalH = 0;
var dmBoardZoom = 1;
var dmBoardPanX = 0;
var dmBoardPanY = 0;
var dmBoardPanning = false;
var dmBoardPanStart = null;

function dmApplyBoardTransform(){
  var world = document.getElementById("battle-map-world");
  if(!world) return;
  world.style.transform = "translate("+dmBoardPanX+"px,"+dmBoardPanY+"px) scale("+dmBoardZoom+")";
}

function dmZoomBoard(factor, clientX, clientY){
  var viewport = document.getElementById("battle-map-viewport");
  if(!viewport) return;
  var rect = viewport.getBoundingClientRect();
  var mx = clientX!==undefined ? clientX-rect.left : rect.width/2;
  var my = clientY!==undefined ? clientY-rect.top : rect.height/2;
  var worldX = (mx-dmBoardPanX)/dmBoardZoom;
  var worldY = (my-dmBoardPanY)/dmBoardZoom;
  var newZoom = Math.min(5, Math.max(0.25, dmBoardZoom*factor));
  dmBoardPanX = mx - worldX*newZoom;
  dmBoardPanY = my - worldY*newZoom;
  dmBoardZoom = newZoom;
  dmApplyBoardTransform();
}

function dmResetBoardView(){
  var viewport = document.getElementById("battle-map-viewport");
  if(!viewport || !dmBoardNaturalW){ dmBoardZoom=1; dmBoardPanX=0; dmBoardPanY=0; dmApplyBoardTransform(); return; }
  var rect = viewport.getBoundingClientRect();
  dmBoardZoom = Math.min(rect.width/dmBoardNaturalW, rect.height/dmBoardNaturalH, 1) || 1;
  dmBoardPanX = (rect.width - dmBoardNaturalW*dmBoardZoom)/2;
  dmBoardPanY = (rect.height - dmBoardNaturalH*dmBoardZoom)/2;
  dmApplyBoardTransform();
}

function dmSwitchView(view){
  document.querySelectorAll(".dmscreen-view-btn").forEach(function(btn){
    btn.classList.toggle("dmscreen-view-active", btn.dataset.view===view);
  });
  document.getElementById("dmscreen-view-dashboard").style.display = view==="dashboard" ? "" : "none";
  document.getElementById("dmscreen-view-battlemap").style.display = view==="battlemap" ? "" : "none";
  if(view==="battlemap"){
    setTimeout(dmResetBoardView, 0);
  }
}

var dmActiveTool = "pan";
var dmShapes = [];
var dmLastKnownShapesUpdatedAt = 0;
var dmDraftShape = null;

function dmSetActiveTool(tool){
  dmActiveTool = tool;
  document.querySelectorAll(".battlemap-tool-btn").forEach(function(btn){
    btn.classList.toggle("battlemap-tool-active", btn.dataset.tool===tool);
  });
  var viewport = document.getElementById("battle-map-viewport");
  if(viewport) viewport.classList.toggle("drawing", tool!=="pan");
}

function dmFeetForPixels(pixelDist){
  var cols = Math.max(1, dmBoardMap.gridCols||20);
  var rows = Math.max(1, dmBoardMap.gridRows||15);
  var cellSize = ((dmBoardNaturalW/cols) + (dmBoardNaturalH/rows)) / 2;
  if(!cellSize) return 0;
  var feet = (pixelDist/cellSize)*5;
  return Math.max(5, Math.round(feet/5)*5);
}

function dmCellPixelSize(){
  var cols = Math.max(1, dmBoardMap.gridCols||20);
  var rows = Math.max(1, dmBoardMap.gridRows||15);
  return ((dmBoardNaturalW/cols) + (dmBoardNaturalH/rows)) / 2;
}

function dmConeBasePoints(x1,y1,x2,y2){
  var dx = x2-x1, dy = y2-y1;
  var angle = Math.atan2(dy,dx);
  var len = Math.sqrt(dx*dx+dy*dy);
  var half = Math.atan(0.5);
  return [
    [x1+len*Math.cos(angle-half), y1+len*Math.sin(angle-half)],
    [x1+len*Math.cos(angle+half), y1+len*Math.sin(angle+half)]
  ];
}

function dmShapeSvgMarkup(s){
  var x1 = s.x1*dmBoardNaturalW, y1 = s.y1*dmBoardNaturalH;
  var x2 = s.x2*dmBoardNaturalW, y2 = s.y2*dmBoardNaturalH;
  var dist = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  var feet = dmFeetForPixels(dist);
  var color = s.color || "#e2b878";
  var delBtn = s.id ? '<g class="shape-del" transform="translate('+x2+','+y2+')" onclick="dmRemoveBoardShape(\''+s.id+'\')" style="pointer-events:auto;cursor:pointer;">'+
    '<circle r="9" fill="var(--ember)" stroke="var(--ink)"/><text x="0" y="3" text-anchor="middle" font-size="11" fill="#fff">&#215;</text></g>' : '';
  var initials = s.initials ? '<g transform="translate('+x1+','+y1+')"><circle r="10" fill="'+color+'" stroke="#000" stroke-width="1.5"/>'+
    '<text x="0" y="4" text-anchor="middle" font-size="10" font-weight="700" fill="#0a0a0a">'+esc(s.initials)+'</text></g>' : '';
  if(s.kind==="ruler"){
    var mx=(x1+x2)/2, my=(y1+y2)/2;
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="3"/>'+
      initials+
      '<text x="'+mx+'" y="'+(my-8)+'" text-anchor="middle" font-size="14" fill="'+color+'" font-weight="700" stroke="#000" stroke-width="3" paint-order="stroke">'+feet+' ft</text>'+
      delBtn;
  }
  if(s.kind==="circle"){
    return '<circle cx="'+x1+'" cy="'+y1+'" r="'+dist+'" fill="'+color+'" fill-opacity="0.22" stroke="'+color+'" stroke-width="2.5"/>'+
      initials+
      '<text x="'+x1+'" y="'+(y1-dist-8)+'" text-anchor="middle" font-size="14" fill="'+color+'" font-weight="700" stroke="#000" stroke-width="3" paint-order="stroke">'+feet+' ft radius</text>'+
      delBtn;
  }
  if(s.kind==="cone"){
    var base = dmConeBasePoints(x1,y1,x2,y2);
    var pts = x1+','+y1+' '+base[0][0]+','+base[0][1]+' '+base[1][0]+','+base[1][1];
    return '<polygon points="'+pts+'" fill="'+color+'" fill-opacity="0.22" stroke="'+color+'" stroke-width="2.5"/>'+
      initials+
      '<text x="'+x2+'" y="'+(y2-10)+'" text-anchor="middle" font-size="14" fill="'+color+'" font-weight="700" stroke="#000" stroke-width="3" paint-order="stroke">'+feet+' ft</text>'+
      delBtn;
  }
  if(s.kind==="mark"){
    var half = dmCellPixelSize()*0.32 || 14;
    var markDel = s.id ? '<g class="shape-del" transform="translate('+(x1+half)+','+(y1-half)+')" onclick="dmRemoveBoardShape(\''+s.id+'\')" style="pointer-events:auto;cursor:pointer;">'+
      '<circle r="9" fill="var(--ember)" stroke="var(--ink)"/><text x="0" y="3" text-anchor="middle" font-size="11" fill="#fff">&#215;</text></g>' : '';
    return '<g transform="translate('+x1+','+y1+')">'+
      '<line x1="'+(-half)+'" y1="'+(-half)+'" x2="'+half+'" y2="'+half+'" stroke="'+color+'" stroke-width="5" stroke-linecap="round"/>'+
      '<line x1="'+half+'" y1="'+(-half)+'" x2="'+(-half)+'" y2="'+half+'" stroke="'+color+'" stroke-width="5" stroke-linecap="round"/>'+
      '</g>'+
      (s.initials ? '<g transform="translate('+(x1-half)+','+(y1-half)+')"><circle r="9" fill="'+color+'" stroke="#000" stroke-width="1.5"/>'+
        '<text x="0" y="3" text-anchor="middle" font-size="9" font-weight="700" fill="#0a0a0a">'+esc(s.initials)+'</text></g>' : '')+
      markDel;
  }
  if(s.kind==="ping"){
    var r = dmCellPixelSize()*0.4 || 18;
    return '<g class="board-ping">'+
      '<circle cx="'+x1+'" cy="'+y1+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="4" class="ping-ring"/>'+
      '<circle cx="'+x1+'" cy="'+y1+'" r="'+(r*0.35)+'" fill="'+color+'"/>'+
      (s.initials ? '<text x="'+x1+'" y="'+(y1-r-6)+'" text-anchor="middle" font-size="12" font-weight="700" fill="'+color+'" stroke="#000" stroke-width="3" paint-order="stroke">'+esc(s.initials)+'</text>' : '')+
      '</g>';
  }
  return "";
}

var dmPingCleanupScheduled = {};

function dmRenderBoardShapes(){
  var svg = document.getElementById("battle-map-shapes-svg");
  if(!svg) return;
  svg.setAttribute("width", dmBoardNaturalW);
  svg.setAttribute("height", dmBoardNaturalH);
  svg.setAttribute("viewBox", "0 0 "+dmBoardNaturalW+" "+dmBoardNaturalH);
  var html = dmShapes.map(dmShapeSvgMarkup).join("");
  if(dmDraftShape) html += dmShapeSvgMarkup(dmDraftShape);
  svg.innerHTML = html;
  dmShapes.forEach(function(s){
    if(s.kind==="ping" && s.id && !dmPingCleanupScheduled[s.id]){
      dmPingCleanupScheduled[s.id] = true;
      setTimeout(function(){
        delete dmPingCleanupScheduled[s.id];
        dmShapes = dmShapes.filter(function(x){ return x.id!==s.id; });
        dmRenderBoardShapes();
        dmDeleteBoardShapeRemote(s.id);
      }, 2200);
    }
  });
}

function dmRemoveBoardShape(id){
  dmShapes = dmShapes.filter(function(s){ return s.id!==id; });
  dmRenderBoardShapes();
  dmDeleteBoardShapeRemote(id);
}

function dmClearBoardShapes(){
  if(!confirm("Clear all measurement shapes for everyone?")) return;
  dmShapes = [];
  dmRenderBoardShapes();
  dmSaveBoardShapes();
}

function dmSaveBoardShapes(){
  if(!dmCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(dmCampaignSlug)+"/board-shapes", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({shapes:dmShapes})
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res && res.updatedAt){ dmLastKnownShapesUpdatedAt = res.updatedAt; }
  }).catch(function(){});
}

function dmAddBoardShapeRemote(shape){
  if(!dmCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(dmCampaignSlug)+"/board-shapes/add", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({shape:shape})
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res && res.updatedAt){ dmLastKnownShapesUpdatedAt = res.updatedAt; }
  }).catch(function(){});
}

function dmDeleteBoardShapeRemote(id){
  if(!dmCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(dmCampaignSlug)+"/board-shapes/remove", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id:id})
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res && res.updatedAt){ dmLastKnownShapesUpdatedAt = res.updatedAt; }
  }).catch(function(){});
}

function dmSetupBoardViewportInteractions(){
  var viewport = document.getElementById("battle-map-viewport");
  if(!viewport || viewport.dataset.wired) return;
  viewport.dataset.wired = "1";
  viewport.addEventListener("wheel", function(e){
    e.preventDefault();
    dmZoomBoard(e.deltaY<0 ? 1.1 : 0.9, e.clientX, e.clientY);
  }, {passive:false});
  function worldPointFromEvent(e){
    var rect = viewport.getBoundingClientRect();
    var x = ((e.clientX-rect.left)-dmBoardPanX)/dmBoardZoom;
    var y = ((e.clientY-rect.top)-dmBoardPanY)/dmBoardZoom;
    return {x: dmBoardNaturalW ? x/dmBoardNaturalW : 0, y: dmBoardNaturalH ? y/dmBoardNaturalH : 0};
  }
  viewport.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  viewport.addEventListener("pointerdown", function(e){
    if(e.target.closest(".shape-del")) return;
    if(e.button===1 || e.button===2){
      e.preventDefault();
      dmDraftShape = null;
      dmBoardPanning = true;
      dmBoardPanStart = {x:e.clientX, y:e.clientY, panX:dmBoardPanX, panY:dmBoardPanY};
      viewport.classList.add("panning");
      viewport.setPointerCapture(e.pointerId);
      return;
    }
    if(e.target.closest(".battle-map-token")) return;
    if(dmActiveTool==="mark" || dmActiveTool==="ping"){
      var mp = worldPointFromEvent(e);
      if(dmActiveTool==="mark"){
        var cols = Math.max(1, dmBoardMap.gridCols||20);
        var rows = Math.max(1, dmBoardMap.gridRows||15);
        mp.x = (Math.floor(mp.x*cols)+0.5)/cols;
        mp.y = (Math.floor(mp.y*rows)+0.5)/rows;
      }
      var placedInstant = {kind:dmActiveTool, x1:mp.x, y1:mp.y, x2:mp.x, y2:mp.y, color:"#e2b878", initials:"DM",
        id:"shp-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
      dmShapes.push(placedInstant);
      dmRenderBoardShapes();
      dmAddBoardShapeRemote(placedInstant);
      return;
    }
    if(dmActiveTool!=="pan"){
      var p = worldPointFromEvent(e);
      dmDraftShape = {kind:dmActiveTool, x1:p.x, y1:p.y, x2:p.x, y2:p.y, color:"#e2b878", initials:"DM"};
      viewport.setPointerCapture(e.pointerId);
      return;
    }
    dmBoardPanning = true;
    dmBoardPanStart = {x:e.clientX, y:e.clientY, panX:dmBoardPanX, panY:dmBoardPanY};
    viewport.classList.add("panning");
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", function(e){
    if(dmDraftShape){
      var p = worldPointFromEvent(e);
      dmDraftShape.x2 = p.x; dmDraftShape.y2 = p.y;
      dmRenderBoardShapes();
      return;
    }
    if(!dmBoardPanning || !dmBoardPanStart) return;
    dmBoardPanX = dmBoardPanStart.panX + (e.clientX-dmBoardPanStart.x);
    dmBoardPanY = dmBoardPanStart.panY + (e.clientY-dmBoardPanStart.y);
    dmApplyBoardTransform();
  });
  function stopPan(e){
    if(dmDraftShape){
      dmDraftShape.id = "shp-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
      var placed = dmDraftShape;
      dmShapes.push(placed);
      dmDraftShape = null;
      dmRenderBoardShapes();
      dmAddBoardShapeRemote(placed);
      return;
    }
    dmBoardPanning = false; dmBoardPanStart = null; viewport.classList.remove("panning");
  }
  viewport.addEventListener("pointerup", stopPan);
  viewport.addEventListener("pointercancel", stopPan);
}

function dmLoadBoardMap(slug){
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/board-map", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(data){
    dmBoardMap = {
      image: (data && data.image) || "",
      gridCols: (data && Number(data.gridCols)) || 20,
      gridRows: (data && Number(data.gridRows)) || 15
    };
    dmRenderBoardMap();
  }).catch(function(){
    dmRenderBoardMap();
  });
}

function dmSaveBoardMap(){
  if(!dmCampaignSlug || !dmToken) return;
  fetch("/api/campaign/"+encodeURIComponent(dmCampaignSlug)+"/board-map", {
    method:"POST", headers:{"Content-Type":"application/json","X-DM-Token":dmToken}, body:JSON.stringify(dmBoardMap)
  }).catch(function(){});
}

function dmRenderBoardMap(){
  var viewport = document.getElementById("battle-map-viewport");
  var world = document.getElementById("battle-map-world");
  var img = document.getElementById("battle-map-image");
  var overlay = document.getElementById("battle-map-grid-overlay");
  var hint = document.getElementById("battle-map-empty-hint");
  if(!viewport) return;
  dmSetupBoardViewportInteractions();
  var cols = Math.max(1, dmBoardMap.gridCols||20);
  var rows = Math.max(1, dmBoardMap.gridRows||15);
  var cellW = 100/cols, cellH = 100/rows;
  overlay.style.backgroundImage =
    'repeating-linear-gradient(to right, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 1px, transparent 1px, transparent '+cellW+'%),'+
    'repeating-linear-gradient(to bottom, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 1px, transparent 1px, transparent '+cellH+'%)';
  var colsInput = document.getElementById("battlemap-cols-input");
  var rowsInput = document.getElementById("battlemap-rows-input");
  if(colsInput && document.activeElement!==colsInput) colsInput.value = cols;
  if(rowsInput && document.activeElement!==rowsInput) rowsInput.value = rows;
  if(dmBoardMap.image){
    hint.style.display = "none";
    if(img.src !== dmBoardMap.image){
      img.onload = function(){
        dmBoardNaturalW = img.naturalWidth;
        dmBoardNaturalH = img.naturalHeight;
        world.style.width = dmBoardNaturalW+"px";
        world.style.height = dmBoardNaturalH+"px";
        dmResetBoardView();
        dmRenderBoardTokens();
        dmRenderBoardShapes();
      };
      img.src = dmBoardMap.image;
    }
  }else{
    hint.style.display = "flex";
    img.removeAttribute("src");
    dmBoardNaturalW = 0; dmBoardNaturalH = 0;
    world.style.width = "100%"; world.style.height = "100%";
  }
  dmRenderBoardTokens();
  dmRenderBoardShapes();
}

function dmHandleMapFile(file){
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    var img = new Image();
    img.onload = function(){
      var maxDim = 1600;
      var scale = Math.min(1, maxDim/Math.max(img.width, img.height));
      var w = Math.max(1, Math.round(img.width*scale));
      var h = Math.max(1, Math.round(img.height*scale));
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      dmBoardMap.image = canvas.toDataURL("image/jpeg", 0.8);
      dmRenderBoardMap();
      dmSaveBoardMap();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function dmUpdateGridCols(val){
  dmBoardMap.gridCols = Math.max(1, Number(val)||20);
  dmRenderBoardMap();
  dmSaveBoardMap();
}
function dmUpdateGridRows(val){
  dmBoardMap.gridRows = Math.max(1, Number(val)||15);
  dmRenderBoardMap();
  dmSaveBoardMap();
}

function dmTokenColorForKind(kind){
  if(kind==="pc") return "#4f8fc9";
  if(kind==="enemy") return "#c1666a";
  return "#d4b23c";
}

var dmMonsterTokenKind = "enemy";
function dmSetMonsterTokenKind(kind){
  dmMonsterTokenKind = kind;
  document.querySelectorAll(".battlemap-kind-btn").forEach(function(btn){
    btn.classList.toggle("battlemap-kind-active", btn.dataset.kind===kind);
  });
}

function dmTokenPixelSize(size){
  var cols = Math.max(1, dmBoardMap.gridCols||20);
  var rows = Math.max(1, dmBoardMap.gridRows||15);
  var cellSize = ((dmBoardNaturalW/cols) + (dmBoardNaturalH/rows)) / 2;
  var mult = sizeGridSpan(size);
  return Math.max(16, (cellSize||38)*mult*0.94);
}

function dmSnapTokenPosition(x, y, size, cols, rows){
  var mult = Math.round(sizeGridSpan(size));
  if(mult>=2 && mult%2===0){
    return {x: Math.round(x*cols)/cols, y: Math.round(y*rows)/rows};
  }
  return {x: (Math.floor(x*cols)+0.5)/cols, y: (Math.floor(y*rows)+0.5)/rows};
}

function dmRenderBoardTokens(){
  var el = document.getElementById("battle-map-tokens");
  if(!el) return;
  el.innerHTML = dmBoardTokens.map(function(t){
    var initials = (t.name||"?").trim().split(/\s+/).map(function(w){ return w[0]; }).slice(0,2).join("").toUpperCase();
    var inner = t.image ? '<img src="'+t.image+'" alt="">' : '<span>'+esc(initials)+'</span>';
    var px = dmTokenPixelSize(t.size);
    var fontSize = Math.max(10, Math.round(px*0.32));
    return '<div class="battle-map-token" data-tid="'+esc(t.id)+'" style="left:'+(t.x*100)+'%;top:'+(t.y*100)+'%;width:'+px+'px;height:'+px+'px;margin:'+(-px/2)+'px 0 0 '+(-px/2)+'px;font-size:'+fontSize+'px;background:'+(t.image?"transparent":esc(dmTokenColorForKind(t.kind)))+';" title="'+esc(t.name||"")+'">'+inner+
      '<button type="button" class="token-del" onclick="dmRemoveBoardToken(\''+esc(t.id)+'\')">&times;</button>'+
      '</div>';
  }).join("");
  function fractionFromEvent(e){
    var viewport = document.getElementById("battle-map-viewport");
    var rect = viewport.getBoundingClientRect();
    var worldX = ((e.clientX-rect.left)-dmBoardPanX)/dmBoardZoom;
    var worldY = ((e.clientY-rect.top)-dmBoardPanY)/dmBoardZoom;
    var x = dmBoardNaturalW ? worldX/dmBoardNaturalW : 0.5;
    var y = dmBoardNaturalH ? worldY/dmBoardNaturalH : 0.5;
    return {x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y))};
  }
  el.querySelectorAll(".battle-map-token").forEach(function(tokenEl){
    tokenEl.addEventListener("pointerdown", function(e){
      if(e.target.closest(".token-del")) return;
      if(e.button===1 || e.button===2) return;
      e.stopPropagation();
      dmBoardDragTokenId = tokenEl.dataset.tid;
      tokenEl.classList.add("dragging");
      tokenEl.setPointerCapture(e.pointerId);
    });
    tokenEl.addEventListener("pointermove", function(e){
      if(dmBoardDragTokenId!==tokenEl.dataset.tid) return;
      var pos = fractionFromEvent(e);
      tokenEl.style.left = (pos.x*100)+"%";
      tokenEl.style.top = (pos.y*100)+"%";
    });
    tokenEl.addEventListener("pointerup", function(e){
      if(dmBoardDragTokenId!==tokenEl.dataset.tid) return;
      dmBoardDragTokenId = null;
      tokenEl.classList.remove("dragging");
      var pos = fractionFromEvent(e);
      var cols = Math.max(1, dmBoardMap.gridCols||20);
      var rows = Math.max(1, dmBoardMap.gridRows||15);
      var tok = dmBoardTokens.find(function(t){ return t.id===tokenEl.dataset.tid; });
      var snapped = dmSnapTokenPosition(pos.x, pos.y, tok&&tok.size, cols, rows);
      if(tok){ tok.x = snapped.x; tok.y = snapped.y; }
      dmRenderBoardTokens();
      dmSaveBoardTokens();
    });
  });
}

function dmRenderBattleMapAddRow(){
  var el = document.getElementById("battlemap-add-pc-row");
  var monsterSel = document.getElementById("battlemap-monster-select");
  if(el){
    var addedIds = {};
    dmBoardTokens.forEach(function(t){ if(t.characterId) addedIds[t.characterId] = true; });
    var mates = dmCampaignMembers().filter(function(c){ return !addedIds[c.id]; });
    el.innerHTML = mates.length ? mates.map(function(c){
      var name = (c.name && c.name.trim()) ? c.name : "(unnamed)";
      return '<button type="button" class="campaign-chip" onclick="dmAddPcToken(\''+esc(c.id)+'\')">'+esc(name)+'</button>';
    }).join("") : '<div class="campaign-chip-hint">All party members are already on the map.</div>';
  }
  if(monsterSel){
    monsterSel.innerHTML = '<option value="">+ Add monster token…</option>' +
      dmStatblocks.map(function(s,i){ return '<option value="'+i+'">'+esc(s.name||"(unnamed)")+'</option>'; }).join("");
  }
  var summonSel = document.getElementById("battlemap-summon-select");
  if(summonSel){
    var options = [];
    dmCampaignMembers().forEach(function(c){
      var full = dmPartyFullCache[c.id];
      var summons = (full && full.summons) || [];
      summons.forEach(function(s, si){
        if(!s.name) return;
        options.push('<option value="'+esc(c.id)+':'+si+'">'+esc(s.name)+' ('+esc(c.name||"?")+')</option>');
      });
    });
    summonSel.innerHTML = '<option value="">+ Add summon token…</option>' + options.join("");
  }
}

function dmAddSummonToken(){
  var sel = document.getElementById("battlemap-summon-select");
  var val = sel.value;
  if(!val) return;
  var parts = val.split(":");
  var full = dmPartyFullCache[parts[0]];
  var summon = full && full.summons && full.summons[Number(parts[1])];
  if(!summon) return;
  dmBoardTokens.push({
    id:"tok-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    name:summon.name||"Summon", x:0.5, y:0.5, image:"", size:summon.size||"medium",
    kind:"pc", ownerCharacterId:parts[0]
  });
  sel.value = "";
  dmRenderBoardTokens();
  dmSaveBoardTokens();
}

function dmAddPcToken(charId){
  var member = dmRosterList.find(function(c){ return c.id===charId; });
  var full = dmPartyFullCache[charId];
  var name = (member && member.name) || (full && full.meta && full.meta.name) || "Character";
  var portrait = full && full.meta && full.meta.portrait;
  var size = (full && full.meta && full.meta.size) || "medium";
  dmBoardTokens.push({
    id:"tok-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    name:name, x:0.5, y:0.5, image:portrait||"", size:size,
    kind:"pc", characterId:charId
  });
  dmRenderBoardTokens();
  dmRenderBattleMapAddRow();
  dmSaveBoardTokens();
}

function dmAddMonsterToken(){
  var sel = document.getElementById("battlemap-monster-select");
  var idx = sel.value;
  if(idx==="") return;
  var block = dmStatblocks[Number(idx)];
  if(!block) return;
  dmBoardTokens.push({
    id:"tok-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    name:block.name||"Monster", x:0.5, y:0.5, image:"", size:block.size||"medium",
    kind:dmMonsterTokenKind
  });
  sel.value = "";
  dmRenderBoardTokens();
  dmSaveBoardTokens();
}

function dmRemoveBoardToken(id){
  dmBoardTokens = dmBoardTokens.filter(function(t){ return t.id!==id; });
  dmRenderBoardTokens();
  dmRenderBattleMapAddRow();
  dmSaveBoardTokens();
}

function dmSaveBoardTokens(){
  if(!dmCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(dmCampaignSlug)+"/board-tokens", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({tokens:dmBoardTokens})
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res && res.updatedAt){ dmLastKnownBoardTokensUpdatedAt = res.updatedAt; }
  }).catch(function(){});
}

function dmLoadBoardTokens(slug){
  dmBoardStatePollGeneration++;
  var generation = dmBoardStatePollGeneration;
  var tokensLoaded = fetch("/api/campaign/"+encodeURIComponent(slug)+"/board-tokens", {cache:"no-store"}).then(function(r){
    dmLastKnownBoardTokensUpdatedAt = parseFloat(r.headers.get("X-Updated-At"))||0;
    return r.json();
  }).then(function(data){
    dmBoardTokens = (data && Array.isArray(data.tokens)) ? data.tokens : [];
    dmRenderBoardTokens();
    dmRenderBattleMapAddRow();
  }).catch(function(){
    dmBoardTokens = [];
    dmRenderBoardTokens();
  });
  var shapesLoaded = fetch("/api/campaign/"+encodeURIComponent(slug)+"/board-shapes", {cache:"no-store"}).then(function(r){
    dmLastKnownShapesUpdatedAt = parseFloat(r.headers.get("X-Updated-At"))||0;
    return r.json();
  }).then(function(data){
    dmShapes = (data && Array.isArray(data.shapes)) ? data.shapes : [];
    dmRenderBoardShapes();
  }).catch(function(){
    dmShapes = [];
    dmRenderBoardShapes();
  });
  Promise.all([tokensLoaded, shapesLoaded]).then(function(){
    dmBoardStatePollNext(generation, slug);
  });
}

function dmBoardStatePollNext(generation, slug){
  if(generation!==dmBoardStatePollGeneration || slug!==dmCampaignSlug) return;
  var since = Math.max(dmLastKnownBoardTokensUpdatedAt, dmLastKnownShapesUpdatedAt);
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/board-state/wait?since="+since, {cache:"no-store"})
    .then(function(resp){
      if(generation!==dmBoardStatePollGeneration) return null;
      if(resp.status===200){ return resp.json(); }
      return null;
    })
    .then(function(data){
      if(generation!==dmBoardStatePollGeneration) return;
      if(data){
        if(dmBoardDragTokenId===null){
          dmBoardTokens = Array.isArray(data.tokens) ? data.tokens : dmBoardTokens;
          dmRenderBoardTokens();
          dmRenderBattleMapAddRow();
        }
        dmLastKnownBoardTokensUpdatedAt = Number(data.tokensUpdatedAt)||dmLastKnownBoardTokensUpdatedAt;
        if(!dmDraftShape){
          dmShapes = Array.isArray(data.shapes) ? data.shapes : dmShapes;
          dmRenderBoardShapes();
        }
        dmLastKnownShapesUpdatedAt = Number(data.shapesUpdatedAt)||dmLastKnownShapesUpdatedAt;
      }
      dmBoardStatePollNext(generation, slug);
    })
    .catch(function(){
      if(generation!==dmBoardStatePollGeneration) return;
      setTimeout(function(){ dmBoardStatePollNext(generation, slug); }, 3000);
    });
}

var dmStatblocks = [];
var dmStatblocksPollGeneration = 0;
var dmLastKnownStatblocksUpdatedAt = 0;
var dmStatblocksSaveTimer = null;

function dmDefaultStatblock(){
  return defaultSummon();
}

function dmStatblockAbilityBoxHtml(i, key, label){
  var score = dmStatblocks[i].abilities[key];
  return '<div class="summon-ability-chip">'+
    '<div class="summon-ability-seal"><span class="summon-ability-mod mono" id="dm-statblock-mod-'+i+'-'+key+'">'+fmt(mod(score))+'</span></div>'+
    '<div class="summon-ability-name">'+label+'</div>'+
    '<input type="number" class="summon-ability-score mono no-spin" value="'+score+'" oninput="dmUpdateStatblockAbility('+i+',\''+key+'\',this.value)">'+
    '</div>';
}

function dmStatblockShortFieldHtml(i, key, label){
  var s = dmStatblocks[i];
  return '<div class="field"><label>'+label+'</label>'+
    '<textarea rows="1" class="auto-grow" placeholder="'+label+'" oninput="dmUpdateStatblockField('+i+',\''+key+'\',this.value);autoGrow(this);">'+esc(s[key])+'</textarea></div>';
}

function dmStatblockTextFieldHtml(i, key, label, hideIfEmpty){
  var s = dmStatblocks[i];
  if(hideIfEmpty && !s[key]) return "";
  return '<div class="field"><label>'+label+'</label>'+
    '<textarea rows="1" class="tall auto-grow" placeholder="'+label+'" oninput="dmUpdateStatblockField('+i+',\''+key+'\',this.value);autoGrow(this);">'+esc(s[key])+'</textarea></div>';
}

function dmStatblockResourceHtml(i,j,r){
  return '<div class="resource-card">'+
    '<div class="top">'+
    '<input class="resource-name" value="'+esc(r.name)+'" placeholder="Charge name" oninput="dmUpdateStatblockResourceField('+i+','+j+',\'name\',this.value)">'+
    '<button class="row-del" onclick="dmRemoveStatblockResource('+i+','+j+')">&times;</button>'+
    '</div>'+
    '<div class="resource-vals">'+
    '<button class="btn resource-btn" onclick="dmAdjustStatblockResource('+i+','+j+',-1)">-</button>'+
    '<input type="number" min="0" value="'+(r.current||0)+'" onchange="dmUpdateStatblockResourceField('+i+','+j+',\'current\',this.value)">'+
    '<span class="hp-sep">/</span>'+
    '<input type="number" min="0" value="'+(r.max||0)+'" onchange="dmUpdateStatblockResourceField('+i+','+j+',\'max\',this.value)">'+
    '<button class="btn resource-btn" onclick="dmAdjustStatblockResource('+i+','+j+',1)">+</button>'+
    '</div>'+
    '<textarea rows="1" class="resource-notes auto-grow" placeholder="Notes" oninput="dmUpdateStatblockResourceField('+i+','+j+',\'notes\',this.value);autoGrow(this);">'+esc(r.notes)+'</textarea>'+
    '</div>';
}

function dmStatblockCardHtml(i){
  var s = dmStatblocks[i];
  return '<div class="panel summon-card">'+
    '<div class="entry-top summon-name-row">'+
    '<textarea rows="1" class="entry-name auto-grow" placeholder="Name" oninput="dmUpdateStatblockField('+i+',\'name\',this.value);autoGrow(this);">'+esc(s.name)+'</textarea>'+
    '<button class="btn" onclick="dmAddStatblockToInitiative('+i+')" title="Roll initiative and add to the tracker">+ Initiative</button>'+
    '<button class="row-del" onclick="dmRemoveStatblock('+i+')">&times;</button>'+
    '</div>'+
    '<div class="summon-details-grid" style="margin-bottom:var(--sp-2);">'+
    '<div class="field"><label>Type</label><textarea rows="1" class="auto-grow" placeholder="e.g. Large Elemental" oninput="dmUpdateStatblockField('+i+',\'meta\',this.value);autoGrow(this);">'+esc(s.meta)+'</textarea></div>'+
    '<div class="field"><label>Size (map token)</label><select onchange="dmUpdateStatblockField('+i+',\'size\',this.value)">'+sizeSelectOptionsHtml(s.size)+'</select></div>'+
    '</div>'+

    '<div class="summon-stat-row">'+
    '<div class="summon-mini-stat"><input value="'+esc(s.ac)+'" oninput="dmUpdateStatblockField('+i+',\'ac\',this.value)"><div class="lbl">AC</div></div>'+
    '<div class="summon-mini-stat"><input value="'+esc(s.initiative)+'" oninput="dmUpdateStatblockField('+i+',\'initiative\',this.value)"><div class="lbl">Initiative</div></div>'+
    '<div class="summon-mini-stat"><input value="'+esc(s.speed)+'" oninput="dmUpdateStatblockField('+i+',\'speed\',this.value)"><div class="lbl">Speed</div></div>'+
    '<div class="summon-mini-stat summon-hp-box">'+
    '<div class="resource-vals">'+
    '<button class="btn resource-btn" onclick="dmAdjustStatblockHp('+i+',-1)">-</button>'+
    '<input type="number" class="no-spin" style="width:34px;text-align:center;" value="'+(s.hpCurrent||0)+'" onchange="dmUpdateStatblockField('+i+',\'hpCurrent\',Number(this.value)||0)">'+
    '<span class="hp-sep">/</span>'+
    '<input type="number" class="no-spin" style="width:34px;text-align:center;" value="'+(s.hpMax||0)+'" onchange="dmUpdateStatblockField('+i+',\'hpMax\',Number(this.value)||0)">'+
    '<button class="btn resource-btn" onclick="dmAdjustStatblockHp('+i+',1)">+</button>'+
    '</div>'+
    '<div class="lbl">HP'+(s.hpFormula?' <span class="mono">'+esc(s.hpFormula)+'</span>':'')+'</div>'+
    '</div>'+
    '<div class="summon-mini-stat summon-hp-box">'+
    '<input type="number" class="no-spin" style="width:44px;text-align:center;" id="dm-statblock-hpdelta-'+i+'" placeholder="0">'+
    '<div class="resource-vals" style="margin-top:3px;">'+
    '<button class="btn resource-btn" onclick="dmQuickDamageStatblock('+i+')">Dmg</button>'+
    '<button class="btn resource-btn" onclick="dmQuickHealStatblock('+i+')">Heal</button>'+
    '</div>'+
    '</div>'+
    '</div>'+

    '<div class="summon-abilities">'+
    ["str","dex","con","int","wis","cha"].map(function(k){ return dmStatblockAbilityBoxHtml(i,k,k.toUpperCase()); }).join("")+
    '</div>'+

    '<div class="summon-details-grid">'+
    dmStatblockShortFieldHtml(i,"saves","Saving Throws")+
    dmStatblockShortFieldHtml(i,"vulnerabilities","Vulnerabilities")+
    dmStatblockShortFieldHtml(i,"resistances","Resistances")+
    dmStatblockShortFieldHtml(i,"immunities","Damage Immunities")+
    dmStatblockShortFieldHtml(i,"conditionImmunities","Condition Immunities")+
    dmStatblockShortFieldHtml(i,"senses","Senses")+
    '</div>'+

    (function(){
      var blocks = [
        dmStatblockTextFieldHtml(i,"traits","Traits",true),
        dmStatblockTextFieldHtml(i,"actions","Actions",true),
        dmStatblockTextFieldHtml(i,"bonusActions","Bonus Actions",true),
        dmStatblockTextFieldHtml(i,"reactions","Reactions",true)
      ].filter(function(h){ return h; });
      return blocks.length ? '<div class="summon-text-grid">'+blocks.join("")+'</div>' : '';
    })()+
    dmStatblockTextFieldHtml(i,"legendary","Legendary Actions",true)+

    '<div class="section-title">Charges / Resources</div>'+
    '<div class="resources-row">'+
    s.resources.map(function(r,j){ return dmStatblockResourceHtml(i,j,r); }).join("")+
    '</div>'+
    '<button class="btn add-row-btn" onclick="dmAddStatblockResource('+i+')">+ Add Charge</button>'+

    dmStatblockTextFieldHtml(i,"notes","Notes")+
    '</div>';
}

function dmRenderStatblocks(){
  var el = document.getElementById("dm-statblock-list");
  if(!el) return;
  var countEl = document.getElementById("dm-statblock-count");
  if(countEl) countEl.textContent = dmStatblocks.length ? (dmStatblocks.length+(dmStatblocks.length===1?" tracked":" tracked")) : "";
  el.innerHTML = dmStatblocks.map(function(_,i){ return dmStatblockCardHtml(i); }).join("");
  el.querySelectorAll("textarea.auto-grow").forEach(autoGrow);
  dmRenderBattleMapAddRow();
}

function dmUpdateStatblockField(i, field, val){
  if(!dmStatblocks[i]) return;
  dmStatblocks[i][field] = val;
  dmScheduleSaveStatblocks();
}

function dmUpdateStatblockAbility(i, key, val){
  if(!dmStatblocks[i]) return;
  var score = Number(val)||0;
  dmStatblocks[i].abilities[key] = score;
  var modEl = document.getElementById("dm-statblock-mod-"+i+"-"+key);
  if(modEl) modEl.textContent = fmt(mod(score));
  dmScheduleSaveStatblocks();
}

function dmAdjustStatblockHp(i, delta){
  var s = dmStatblocks[i];
  var max = Number(s.hpMax)||0;
  var cur = (Number(s.hpCurrent)||0) + delta;
  if(cur<0) cur = 0;
  if(max>0 && cur>max) cur = max;
  s.hpCurrent = cur;
  dmRenderStatblocks();
  dmScheduleSaveStatblocks();
}

function dmQuickDamageStatblock(i){ dmApplyQuickHpToStatblock(i, -1); }
function dmQuickHealStatblock(i){ dmApplyQuickHpToStatblock(i, 1); }
function dmApplyQuickHpToStatblock(i, sign){
  var input = document.getElementById("dm-statblock-hpdelta-"+i);
  var amount = Math.abs(Number(input.value)||0);
  if(!amount) return;
  input.value = "";
  dmAdjustStatblockHp(i, sign*amount);
}

function dmAddStatblockToInitiative(i){
  var s = dmStatblocks[i];
  var bonusMatch = String(s.initiative||"").match(/[+\-−]?\d+/);
  var bonus = bonusMatch ? Number(bonusMatch[0].replace("−","-")) : 0;
  var roll = Math.floor(Math.random()*20)+1;
  var entry = {id:"init-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), name:s.name||"Monster", init:roll+bonus};
  dmInitiativeState.entries.push(entry);
  if(dmInitiativeState.currentId===null){ dmInitiativeState.currentId = entry.id; }
  dmRenderInitiative();
  dmSaveInitiative();
}

function dmAddStatblockResource(i){
  dmStatblocks[i].resources.push({name:"",current:0,max:0,notes:""});
  dmRenderStatblocks();
  dmScheduleSaveStatblocks();
}
function dmRemoveStatblockResource(i,j){
  dmStatblocks[i].resources.splice(j,1);
  dmRenderStatblocks();
  dmScheduleSaveStatblocks();
}
function dmAdjustStatblockResource(i,j,delta){
  var r = dmStatblocks[i].resources[j];
  var max = Number(r.max)||0;
  var cur = (Number(r.current)||0) + delta;
  if(cur<0) cur = 0;
  if(max>0 && cur>max) cur = max;
  r.current = cur;
  dmRenderStatblocks();
  dmScheduleSaveStatblocks();
}
function dmUpdateStatblockResourceField(i,j,field,val){
  var r = dmStatblocks[i].resources[j];
  r[field] = (field==="current"||field==="max") ? (Number(val)||0) : val;
  dmScheduleSaveStatblocks();
}

function dmRemoveStatblock(i){
  if(!confirm("Remove this stat block?")) return;
  dmStatblocks.splice(i,1);
  dmRenderStatblocks();
  dmScheduleSaveStatblocks();
}

function dmAddBlankStatblock(){
  dmStatblocks.push(dmDefaultStatblock());
  dmRenderStatblocks();
  dmScheduleSaveStatblocks();
}

function dmImportStatblock(){
  var ta = document.getElementById("dm-statblock-import-text");
  var text = ta.value.trim();
  if(!text) return;
  var block = parseStatblock(text);
  dmStatblocks.push(block);
  ta.value = "";
  dmRenderStatblocks();
  dmScheduleSaveStatblocks();
}

function dmScheduleSaveStatblocks(){
  if(dmStatblocksSaveTimer) clearTimeout(dmStatblocksSaveTimer);
  dmStatblocksSaveTimer = setTimeout(function(){ dmStatblocksSaveTimer = null; dmSaveStatblocks(); }, 400);
}

function dmSaveStatblocks(){
  if(!dmCampaignSlug || !dmToken) return;
  fetch("/api/dm/statblocks/"+encodeURIComponent(dmCampaignSlug), {
    method:"POST", headers:{"Content-Type":"application/json","X-DM-Token":dmToken}, body:JSON.stringify({blocks:dmStatblocks})
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res && res.updatedAt){ dmLastKnownStatblocksUpdatedAt = res.updatedAt; }
  }).catch(function(){});
}

function dmLoadStatblocks(slug){
  dmStatblocksPollGeneration++;
  fetch("/api/dm/statblocks/"+encodeURIComponent(slug), {headers:{"X-DM-Token":dmToken}, cache:"no-store"}).then(function(r){
    dmLastKnownStatblocksUpdatedAt = parseFloat(r.headers.get("X-Updated-At"))||0;
    return r.json();
  }).then(function(data){
    dmStatblocks = (data && Array.isArray(data.blocks)) ? data.blocks : [];
    dmRenderStatblocks();
    dmStartStatblocksPolling(slug);
  }).catch(function(){
    dmStatblocks = [];
    dmRenderStatblocks();
  });
}

function dmStartStatblocksPolling(slug){
  dmStatblocksPollNext(dmStatblocksPollGeneration, slug);
}

function dmStatblocksPollNext(generation, slug){
  if(generation!==dmStatblocksPollGeneration || slug!==dmCampaignSlug) return;
  fetch("/api/dm/statblocks/"+encodeURIComponent(slug)+"/wait?since="+dmLastKnownStatblocksUpdatedAt, {headers:{"X-DM-Token":dmToken}, cache:"no-store"})
    .then(function(resp){
      if(generation!==dmStatblocksPollGeneration) return null;
      var updatedHeader = parseFloat(resp.headers.get("X-Updated-At"));
      if(resp.status===200){
        return resp.json().then(function(data){
          return {data:data, updatedAt: isNaN(updatedHeader)?dmLastKnownStatblocksUpdatedAt:updatedHeader};
        });
      }
      if(!isNaN(updatedHeader)){ dmLastKnownStatblocksUpdatedAt = updatedHeader; }
      return null;
    })
    .then(function(result){
      if(generation!==dmStatblocksPollGeneration) return;
      if(result){
        if(!dmStatblocksSaveTimer){
          dmStatblocks = (result.data && Array.isArray(result.data.blocks)) ? result.data.blocks : dmStatblocks;
          dmRenderStatblocks();
        }
        dmLastKnownStatblocksUpdatedAt = result.updatedAt;
      }
      dmStatblocksPollNext(generation, slug);
    })
    .catch(function(){
      if(generation!==dmStatblocksPollGeneration) return;
      setTimeout(function(){ dmStatblocksPollNext(generation, slug); }, 3000);
    });
}

function dmInit(){
  if(!dmToken || !dmCampaignSlug) return;
  document.getElementById("btn-dm-logout").addEventListener("click", dmLogout);
  document.getElementById("btn-dm-add-initiative").addEventListener("click", dmAddInitiativeEntry);
  document.getElementById("dm-initiative-name-input").addEventListener("keydown", function(e){
    if(e.key==="Enter"){ e.preventDefault(); document.getElementById("dm-initiative-value-input").focus(); }
  });
  document.getElementById("dm-initiative-value-input").addEventListener("keydown", function(e){
    if(e.key==="Enter"){ e.preventDefault(); dmAddInitiativeEntry(); }
  });
  document.getElementById("btn-dm-initiative-prev").addEventListener("click", dmPrevTurn);
  document.getElementById("btn-dm-initiative-next").addEventListener("click", dmNextTurn);
  document.getElementById("btn-dm-initiative-reset").addEventListener("click", dmResetInitiative);
  document.getElementById("dm-notes-textarea").addEventListener("input", function(e){ autoGrow(e.target); scheduleDmNotesSave(); });
  document.getElementById("btn-dm-statblock-import").addEventListener("click", dmImportStatblock);
  document.getElementById("btn-dm-statblock-add-blank").addEventListener("click", dmAddBlankStatblock);
  document.getElementById("btn-dm-loot-add").addEventListener("click", dmAddLootContainer);
  document.getElementById("battlemap-upload-input").addEventListener("change", function(e){
    dmHandleMapFile(e.target.files[0]);
    e.target.value = "";
  });
  document.getElementById("battlemap-cols-input").addEventListener("change", function(e){ dmUpdateGridCols(e.target.value); });
  document.getElementById("battlemap-rows-input").addEventListener("change", function(e){ dmUpdateGridRows(e.target.value); });
  document.getElementById("battlemap-monster-select").addEventListener("change", dmAddMonsterToken);
  document.getElementById("battlemap-summon-select").addEventListener("change", dmAddSummonToken);
  document.querySelectorAll(".battlemap-kind-btn").forEach(function(btn){
    btn.addEventListener("click", function(){ dmSetMonsterTokenKind(btn.dataset.kind); });
  });
  document.getElementById("btn-battlemap-zoom-in").addEventListener("click", function(){ dmZoomBoard(1.25); });
  document.getElementById("btn-battlemap-zoom-out").addEventListener("click", function(){ dmZoomBoard(0.8); });
  document.getElementById("btn-battlemap-zoom-reset").addEventListener("click", dmResetBoardView);
  document.querySelectorAll(".dmscreen-view-btn").forEach(function(btn){
    btn.addEventListener("click", function(){ dmSwitchView(btn.dataset.view); });
  });
  document.querySelectorAll(".battlemap-tool-btn").forEach(function(btn){
    btn.addEventListener("click", function(){ dmSetActiveTool(btn.dataset.tool); });
  });
  document.getElementById("btn-battlemap-clear-shapes").addEventListener("click", dmClearBoardShapes);

  fetch("/api/campaigns", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(list){
    var match = (Array.isArray(list)?list:[]).find(function(c){ return c.slug===dmCampaignSlug; });
    document.getElementById("dm-campaign-title").textContent = match ? ("DM Screen — "+match.name) : "DM Screen";
  }).catch(function(){});

  fetch("/api/characters", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(list){
    dmRosterList = list;
    dmLoadParty(dmCampaignSlug);
    dmLoadTreasure(dmCampaignSlug);
    dmRenderInitiativeCampaignPicker();
  }).catch(function(){
    document.getElementById("dm-party-list").innerHTML = '<div class="footer-line">Could not load characters — is the server running?</div>';
  });

  dmLoadNotes(dmCampaignSlug);
  dmLoadInitiative(dmCampaignSlug);
  dmLoadStatblocks(dmCampaignSlug);
  dmLoadBoardMap(dmCampaignSlug);
  dmLoadBoardTokens(dmCampaignSlug);
}

document.addEventListener("DOMContentLoaded", dmInit);
