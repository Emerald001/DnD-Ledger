var ABILITIES = [["str","Strength"],["dex","Dexterity"],["con","Constitution"],["int","Intelligence"],["wis","Wisdom"],["cha","Charisma"]];
var SKILLS = [
  ["acrobatics","Acrobatics","dex"],
  ["animalHandling","Animal Handling","wis"],
  ["arcana","Arcana","int"],
  ["athletics","Athletics","str"],
  ["deception","Deception","cha"],
  ["history","History","int"],
  ["insight","Insight","wis"],
  ["intimidation","Intimidation","cha"],
  ["investigation","Investigation","int"],
  ["medicine","Medicine","wis"],
  ["nature","Nature","int"],
  ["perception","Perception","wis"],
  ["performance","Performance","cha"],
  ["persuasion","Persuasion","cha"],
  ["religion","Religion","int"],
  ["sleightOfHand","Sleight of Hand","dex"],
  ["stealth","Stealth","dex"],
  ["survival","Survival","wis"]
];
var CONDITIONS = ["Blinded","Charmed","Deafened","Frightened","Grappled","Incapacitated","Invisible","Paralyzed","Petrified","Poisoned","Prone","Restrained","Stunned","Unconscious"];
var ATTUNEMENT_MAX = 3;
var SETTINGS_DEFS = [
  ["spellcasting","Spellcasting","Spell slots, save DC/attack bonus, concentration, the Spells tab, and the Combat Spells panel. Turn off for non-casters."],
  ["summons","Summons","The Summons tab, for characters who don't use summoned creatures, companions, or wildshape statblocks."],
  ["deathSaves","Death Saves","The death save success/failure tracker on the dashboard."],
  ["inspiration","Inspiration","The Inspiration toggle on the dashboard."],
  ["exhaustion","Exhaustion","The exhaustion counter next to Conditions."],
  ["encumbrance","Encumbrance","Item weight tracking, carrying capacity, and total weight on the Inventory tab."],
  ["currency","Currency","The coin purse (CP/SP/EP/GP/PP) tracker on the Inventory tab."],
  ["initiative","Initiative Tracker","The initiative/turn-order tracker widget on the dashboard."],
  ["portraitBackground","Portrait Background","Shows the character's portrait faintly behind the name and stats. Turn off for a plain background."],
  ["effects","Effects Engine","Structured feats, traits, class features, and per-item mechanical bonuses (AC, abilities, saves, skills, HP, speed, resistances). Turn off to compute the sheet using only manual fields."],
  ["flySpeed","Fly Speed","A Fly Speed field next to your normal Speed, for characters with a flying speed."],
  ["swimSpeed","Swim Speed","A Swim Speed field next to your normal Speed, for characters with a swimming speed."]
];
var EFFECT_TARGETS = [["ac","Armor Class","Combat"],["hpMax","Max HP","Combat"],["speed","Speed","Combat"],["initiative","Initiative","Combat"]]
  .concat([["spellDC","Spell Save DC","Spellcasting"],["spellAttack","Spell Attack Roll","Spellcasting"]])
  .concat([["saveAll","All Saving Throws","General"],["skillAll","All Skill Checks","General"],["profBonus","Proficiency Bonus","General"]])
  .concat(ABILITIES.map(function(a){ return ["ability."+a[0], a[1]+" Score", "Ability Scores"]; }))
  .concat(ABILITIES.map(function(a){ return ["save."+a[0], a[1]+" Save Bonus", "Saving Throws"]; }))
  .concat(ABILITIES.map(function(a){ return ["saveProficiency."+a[0], a[1]+" Save Proficiency", "Saving Throws"]; }))
  .concat(ABILITIES.map(function(a){ return ["checkAll."+a[0], a[1]+" Checks (all)", "Ability Checks"]; }))
  .concat(SKILLS.map(function(s){ return ["skill."+s[0], s[1]+" Bonus", "Skills"]; }))
  .concat(SKILLS.map(function(s){ return ["skillProficiency."+s[0], s[1]+" Proficiency", "Skills"]; }))
  .concat(SKILLS.map(function(s){ return ["skillExpertise."+s[0], s[1]+" Expertise", "Skills"]; }))
  .concat([["resistance","Damage Resistance","Resistances"],["immunity","Damage Immunity","Resistances"],["vulnerability","Damage Vulnerability","Resistances"],["other","Other (note only)","Other"]]);
var EFFECT_TYPES = [["bonus","Bonus (+/-)"],["set","Set To"],["grant","Grant"],["note","Note Only"]];
var EFFECT_CONDITIONS = [["always","Always"],["equipped","While Equipped"],["attuned","While Attuned"],["manual","Manual Toggle"]];
var VALUE_SOURCES = [["custom","Custom Value"],["pb","Proficiency Bonus"],["level","Character Level"]];
var FEATURE_SOURCES = ["Feat","Racial Trait","Class Feature","Background","Other"];
var CLASSES = ["Artificer","Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"];
var SIZE_OPTIONS = [["tiny","Tiny",0.5],["small","Small",1],["medium","Medium",1],["large","Large",2],["huge","Huge",3],["gargantuan","Gargantuan",4]];
function sizeGridSpan(size){
  var found = SIZE_OPTIONS.find(function(s){ return s[0]===size; });
  return found ? found[2] : 1;
}
function sizeSelectOptionsHtml(selected){
  return SIZE_OPTIONS.map(function(s){ return '<option value="'+s[0]+'"'+(s[0]===(selected||"medium")?" selected":"")+'>'+s[1]+'</option>'; }).join("");
}
var RACES = ["Aasimar","Dragonborn","Dwarf","Elf","Firbolg","Gnome","Goliath","Half-Elf","Half-Orc","Halfling","Human","Orc","Tabaxi","Tiefling"];
var BACKGROUNDS = ["Acolyte","Charlatan","Criminal","Entertainer","Folk Hero","Guild Artisan","Hermit","Noble","Outlander","Sage","Sailor","Soldier","Urchin"];
var ALIGNMENTS = ["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil"];
var BACKGROUND_ABILITIES = {
  Acolyte:["int","wis","cha"],
  Charlatan:["dex","con","cha"],
  Criminal:["dex","con","int"],
  Entertainer:["str","dex","cha"],
  "Folk Hero":["str","con","wis"],
  "Guild Artisan":["str","dex","int"],
  Hermit:["con","wis","cha"],
  Noble:["str","int","cha"],
  Outlander:["str","con","wis"],
  Sage:["con","int","wis"],
  Sailor:["str","dex","wis"],
  Soldier:["str","dex","con"],
  Urchin:["dex","con","int"]
};

var CLASS_SAVES = {
  Barbarian:["str","con"], Bard:["dex","cha"], Cleric:["wis","cha"], Druid:["int","wis"],
  Fighter:["str","con"], Monk:["str","dex"], Paladin:["wis","cha"], Ranger:["str","dex"],
  Rogue:["dex","int"], Sorcerer:["con","cha"], Warlock:["wis","cha"], Wizard:["int","wis"],
  Artificer:["con","int"]
};
var CLASS_SPELL_ABILITY = {
  Bard:"cha", Cleric:"wis", Druid:"wis", Paladin:"cha", Ranger:"wis",
  Sorcerer:"cha", Warlock:"cha", Wizard:"int", Artificer:"int"
};
var FULL_CASTER_CLASSES = ["Bard","Cleric","Druid","Sorcerer","Wizard"];
var HALF_CASTER_CLASSES = ["Paladin","Ranger"];
var FULL_SLOTS = [
  [2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]
];
var PACT_TABLE = [
  [1,1],[1,2],[2,2],[2,2],[3,2],[3,2],[4,2],[4,2],[5,2],[5,2],
  [5,3],[5,3],[5,3],[5,3],[5,3],[5,3],[5,4],[5,4],[5,4],[5,4]
];

function zeroSlots(){ return [0,0,0,0,0,0,0,0,0]; }

function defaultConditions(){
  var o = {};
  CONDITIONS.forEach(function(c){ o[c.toLowerCase()] = false; });
  return o;
}

function matchClass(str){
  if(!str) return null;
  var t = String(str).trim().toLowerCase();
  var found = CLASSES.find(function(c){ return c.toLowerCase()===t; });
  return found || null;
}

var CLASS_HIT_DIE = {
  Barbarian:12, Bard:8, Cleric:8, Druid:8, Fighter:10, Monk:8, Paladin:10,
  Ranger:10, Rogue:8, Sorcerer:6, Warlock:8, Wizard:6, Artificer:8
};
var ASI_LEVELS = {
  Fighter:[4,6,8,12,14,16,19],
  Rogue:[4,8,10,12,16,19],
  default:[4,8,12,16,19]
};
var STANDARD_ARRAY = [15,14,13,12,10,8];

function totalLevel(){
  var sum = (state.meta.classes||[]).reduce(function(s,c){ return s+(Number(c.level)||0); }, 0);
  return Math.max(1, Math.min(20, sum));
}

function classSummaryText(){
  var parts = (state.meta.classes||[]).filter(function(c){ return c.class; })
    .map(function(c){ return c.class+" "+(Number(c.level)||1); });
  return parts.join(" / ");
}

function castingClassesInfo(){
  return (state.meta.classes||[]).map(function(c){
    return {cls: matchClass(c.class), level: Number(c.level)||0};
  }).filter(function(x){ return x.cls && CLASS_SPELL_ABILITY[x.cls]; });
}

function combinedCasterLevel(){
  var total = 0;
  (state.meta.classes||[]).forEach(function(c){
    var cls = matchClass(c.class);
    var lvl = Number(c.level)||0;
    if(!cls) return;
    if(FULL_CASTER_CLASSES.indexOf(cls)!==-1) total += lvl;
    else if(HALF_CASTER_CLASSES.indexOf(cls)!==-1) total += Math.floor(lvl/2);
    else if(cls==="Artificer") total += Math.ceil(lvl/2);
  });
  return total;
}

function warlockLevel(){
  var w = (state.meta.classes||[]).find(function(c){ return matchClass(c.class)==="Warlock"; });
  return w ? (Number(w.level)||0) : 0;
}

function autoFillSaves(){
  var primary = (state.meta.classes||[])[0];
  var cls = primary ? matchClass(primary.class) : null;
  var saves = {str:false,dex:false,con:false,int:false,wis:false,cha:false};
  if(cls && CLASS_SAVES[cls]){ CLASS_SAVES[cls].forEach(function(k){ saves[k]=true; }); }
  state.saves = saves;
}

function autoFillSpellAbility(){
  var abilities = castingClassesInfo().map(function(x){ return CLASS_SPELL_ABILITY[x.cls]; });
  if(abilities.length && abilities.indexOf(state.spellcasting.ability)===-1){
    state.spellcasting.ability = abilities[0];
  }
}

function autoFillSlots(){
  var lvl = combinedCasterLevel();
  var arr = lvl<1 ? zeroSlots() : FULL_SLOTS[Math.min(20,lvl)-1].slice();
  arr.forEach(function(total,i){
    var prevTotal = state.spellcasting.slots[i] ? Number(state.spellcasting.slots[i].total)||0 : 0;
    var prevCurrent = state.spellcasting.slots[i] && state.spellcasting.slots[i].current!==undefined
      ? Number(state.spellcasting.slots[i].current)||0 : prevTotal;
    var newCurrent = prevCurrent + (total - prevTotal);
    if(newCurrent<0) newCurrent = 0;
    if(newCurrent>total) newCurrent = total;
    state.spellcasting.slots[i] = {total: total, current: newCurrent};
  });

  var wlvl = warlockLevel();
  var pt = wlvl>0 ? PACT_TABLE[Math.min(20,wlvl)-1] : null;
  var newSlots = pt ? pt[1] : 0;
  var newPactLevel = pt ? pt[0] : 0;
  var prevPact = state.spellcasting.pact || {level:0, slots:0, current:0};
  var prevPactCurrent = prevPact.current!==undefined ? Number(prevPact.current)||0 : (Number(prevPact.slots)||0);
  var newPactCurrent = prevPactCurrent + (newSlots - (Number(prevPact.slots)||0));
  if(newPactCurrent<0) newPactCurrent = 0;
  if(newPactCurrent>newSlots) newPactCurrent = newSlots;
  state.spellcasting.pact = {level:newPactLevel, slots:newSlots, current:newPactCurrent};
}

function syncHitDicePools(){
  var prevPools = state.combat.hitDicePools || [];
  state.combat.hitDicePools = (state.meta.classes||[]).map(function(c, i){
    var cls = matchClass(c.class);
    var die = (cls && CLASS_HIT_DIE[cls]) || 8;
    var total = Math.max(1, Number(c.level)||1);
    var prev = prevPools[i];
    var used = (prev && prev.class===c.class) ? Math.min(Number(prev.used)||0, total) : 0;
    return {class:c.class, die:die, total:total, used:used};
  });
}

function syncBind(path){
  var v = byPath(state, path);
  document.querySelectorAll('[data-bind="'+path+'"]').forEach(function(el){
    if(el.type==="checkbox"){ el.checked = !!v; }
    else{ el.value = v; }
  });
}

function onClassesChanged(){
  autoFillSaves();
  renderSaves();
  autoFillSpellAbility();
  autoFillSlots();
  renderSlots();
  syncHitDicePools();
  renderHitDice();
  renderClasses();
  renderComputed();
  scheduleSave();
}

function addClassRow(){
  state.meta.classes.push({class:"", level:1});
  onClassesChanged();
}
function removeClassRow(i){
  if(state.meta.classes.length<=1) return;
  state.meta.classes.splice(i,1);
  onClassesChanged();
}

var STORAGE_PREFIX = "dndCharacterLedgerAutosave:";
var ACTIVE_ID_KEY = "dndCharacterLedgerActiveId";
var currentId = "default";
var state = null;
var saveTimer = null;
var serverAvailable = false;
var lastKnownUpdatedAt = 0;
var pollGeneration = 0;
var initiativeCampaignSlug = null;
var initiativePollGeneration = 0;
var initiativeServerAvailable = false;
var lastKnownInitiativeUpdatedAt = 0;
var initiativeSaveTimer = null;
var expandedFeatures = {};
var expandedEquipment = {};
var expandedSpellEffects = {};
var expandedSendPickers = {};

function reindexAfterRemoval(map, removedIndex){
  var result = {};
  Object.keys(map).forEach(function(k){
    var idx = Number(k);
    if(idx<removedIndex) result[idx] = map[idx];
    else if(idx>removedIndex) result[idx-1] = map[idx];
  });
  return result;
}

function defaultSettings(){
  var s = {};
  SETTINGS_DEFS.forEach(function(d){ s[d[0]] = true; });
  return s;
}

function defaultState(){
  var skills = {};
  SKILLS.forEach(function(s){ skills[s[0]] = {prof:false, exp:false}; });
  return {
    meta:{name:"",classes:[{class:"",level:1}],race:"",background:"",alignment:"",playerName:"",xp:0,portrait:"",campaign:"",color:"",size:"medium"},
    settings:defaultSettings(),
    abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10},
    saves:{str:false,dex:false,con:false,int:false,wis:false,cha:false},
    skills:skills,
    combat:{acBonus:0,initMisc:0,speed:30,speedMod:0,speedModPrev:0,flySpeed:0,flySpeedMod:0,flySpeedModPrev:0,swimSpeed:0,swimSpeedMod:0,swimSpeedModPrev:0,spellDcMisc:0,spellAtkMisc:0,hpMax:10,hpCurrent:10,hpTemp:0,hitDicePools:[{class:"",die:8,total:1,used:0}],deathSuccess:[false,false,false],deathFail:[false,false,false],inspiration:false,exhaustion:0,concentration:{active:false,spell:""},conditions:defaultConditions(),spellEffects:[]},
    attacks:[],
    resources:[],
    currency:{cp:0,sp:0,ep:0,gp:0,pp:0},
    equipment:[],
    features:[],
    spellcasting:{ability:"int",slots:Array.from({length:9},function(){return {total:0,current:0};}),pact:{level:0,slots:0,current:0}},
    spells:[],
    summons:[],
    notes:{profLang:"",features:"",personality:"",ideals:"",bonds:"",flaws:"",backstory:"", spellNotes:"", quickNote:""}
  };
}

function mergeDefaults(target, def){
  for(var k in def){
    if(target[k]===undefined){ target[k]=def[k]; }
    else if(def[k]!==null && typeof def[k]==="object" && !Array.isArray(def[k])){
      mergeDefaults(target[k], def[k]);
    }
  }
}

function migrateMulticlass(s){
  if(!s.meta.classes || !s.meta.classes.length){
    s.meta.classes = [{class: s.meta.class||"", level: Number(s.meta.level)||1}];
  }
  delete s.meta.class;
  delete s.meta.level;
}

function migrateHitDice(s){
  if(!s.combat.hitDicePools || !s.combat.hitDicePools.length){
    var legacyUsed = Number(s.combat.hitDiceUsed)||0;
    s.combat.hitDicePools = s.meta.classes.map(function(c,i){
      var cls = matchClass(c.class);
      var die = (cls && CLASS_HIT_DIE[cls]) || 8;
      return {class:c.class, die:die, total:Math.max(1,Number(c.level)||1), used:(i===0?legacyUsed:0)};
    });
  }
  delete s.combat.hitDice;
  delete s.combat.hitDiceUsed;
}

function migrateEffects(s){
  if(!Array.isArray(s.features)) s.features = [];
  (s.equipment||[]).forEach(function(it){
    if(!Array.isArray(it.effects)) it.effects = [];
    if(it.equipped===undefined) it.equipped = false;
  });
  ((s.combat && s.combat.spellEffects) || []).forEach(function(e){
    if(!Array.isArray(e.effects)) e.effects = [];
  });
}

function normalizeState(s){
  migrateMulticlass(s);
  migrateHitDice(s);
  migrateEffects(s);
  mergeDefaults(s, defaultState());
}

function byPath(obj, path){
  return path.split(".").reduce(function(o,k){ return o==null?undefined:o[k]; }, obj);
}
function setByPath(obj, path, val){
  var keys = path.split(".");
  var o = obj;
  for(var i=0;i<keys.length-1;i++){ o = o[keys[i]]; }
  o[keys[keys.length-1]] = val;
}

function esc(s){
  return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function mod(score){ return Math.floor((((Number(score)||0)-10))/2); }
function fmt(n){ n = Math.round(n); return (n>=0?"+":"")+n; }
function profBonus(level){ return 2 + Math.floor((Math.max(1,Number(level)||1)-1)/4); }
function setText(id,val){ var el=document.getElementById(id); if(el) el.textContent=val; }

function getStoredActiveId(){
  try{ return localStorage.getItem(ACTIVE_ID_KEY) || null; }catch(e){ return null; }
}
function setStoredActiveId(id){
  try{ localStorage.setItem(ACTIVE_ID_KEY, id); }catch(e){}
}

function loadState(){
  currentId = getStoredActiveId() || "default";
  pollGeneration++;
  return fetch("/api/character/"+encodeURIComponent(currentId), {cache:"no-store"}).then(function(resp){
    if(!resp.ok) throw new Error("no server");
    lastKnownUpdatedAt = parseFloat(resp.headers.get("X-Updated-At")) || 0;
    return resp.json();
  }).then(function(loaded){
    state = (loaded && Object.keys(loaded).length) ? loaded : defaultState();
    normalizeState(state);
    serverAvailable = true;
    startPolling();
  }).catch(function(){
    try{
      var raw = localStorage.getItem(STORAGE_PREFIX+currentId);
      state = raw ? JSON.parse(raw) : defaultState();
    }catch(e){
      state = defaultState();
    }
    normalizeState(state);
    serverAvailable = false;
  });
}

function startPolling(){
  pollNext(pollGeneration);
}

function checkInbox(){
  if(!currentId) return;
  fetch("/api/inbox/"+encodeURIComponent(currentId), {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(data){
    var items = (data && data.items) || [];
    if(!items.length) return;
    var ids = [];
    var labels = [];
    items.forEach(function(it){
      if(it.kind==="container"){
        (it.items||[]).forEach(function(sub){
          state.equipment.push({name:sub.name||"", qty:sub.qty||1, weight:sub.weight||0, notes:sub.notes||"", attuned:false, equipped:false, effects:[]});
        });
        var cur = it.currency||{};
        Object.keys(COIN_VALUE_IN_GP).forEach(function(key){
          var amt = Number(cur[key])||0;
          if(amt){
            state.currency[key] = (Number(state.currency[key])||0) + amt;
            syncBind("currency."+key);
          }
        });
        var label = (it.name&&it.name.trim()) ? it.name : "a loot container";
        labels.push(label+(it.from?" (from "+it.from+")":""));
      }else{
        state.equipment.push({name:it.name||"", qty:it.qty||1, weight:it.weight||0, notes:it.notes||"", attuned:false, equipped:false, effects:[]});
        labels.push((it.name||"item")+(Number(it.qty)>1?" x"+it.qty:"")+(it.from?" (from "+it.from+")":""));
      }
      ids.push(it.id);
    });
    renderEquipment();
    renderComputed();
    scheduleSave();
    setText("save-status", "Received: "+labels.join(", "));
    fetch("/api/inbox/"+encodeURIComponent(currentId)+"/claim", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ids:ids})
    }).catch(function(){});
  }).catch(function(){});
}

function pollNext(generation){
  if(generation !== pollGeneration) return;
  fetch("/api/character/"+encodeURIComponent(currentId)+"/wait?since="+lastKnownUpdatedAt, {cache:"no-store"})
    .then(function(resp){
      if(generation !== pollGeneration) return null;
      var updatedHeader = parseFloat(resp.headers.get("X-Updated-At"));
      if(resp.status === 200){
        return resp.json().then(function(data){
          return {data: data, updatedAt: isNaN(updatedHeader) ? lastKnownUpdatedAt : updatedHeader};
        });
      }
      if(!isNaN(updatedHeader)){ lastKnownUpdatedAt = updatedHeader; }
      return null;
    })
    .then(function(result){
      if(generation !== pollGeneration) return;
      var applied = result ? applyRemoteUpdate(result.data, result.updatedAt) : Promise.resolve();
      applied.then(function(){
        if(generation !== pollGeneration) return;
        pollNext(generation);
      });
    })
    .catch(function(){
      if(generation !== pollGeneration) return;
      setTimeout(function(){ pollNext(generation); }, 3000);
    });
}

function applyRemoteUpdate(data, updatedAt){
  return new Promise(function(resolve){
    (function attempt(){
      if(saveTimer || isEditingField()){
        setTimeout(attempt, 500);
        return;
      }
      state = (data && Object.keys(data).length) ? data : defaultState();
      normalizeState(state);
      lastKnownUpdatedAt = updatedAt;
      rebuildAll();
      try{ localStorage.setItem(STORAGE_PREFIX+currentId, JSON.stringify(state)); }catch(e){}
      setText("save-status", "Updated from another device · "+timeNow());
      resolve();
    })();
  });
}

function isEditingField(){
  var el = document.activeElement;
  if(!el) return false;
  var tag = el.tagName;
  return tag==="INPUT" || tag==="TEXTAREA" || tag==="SELECT";
}

function scheduleSave(){
  if(saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 350);
}

function postToServer(){
  return fetch("/api/character/"+encodeURIComponent(currentId), {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(state)
  }).then(function(r){
    serverAvailable = !!(r && r.ok);
    if(serverAvailable){
      return r.json().then(function(res){
        if(res && res.updatedAt){ lastKnownUpdatedAt = res.updatedAt; }
        return true;
      }).catch(function(){ return true; });
    }
    return false;
  }).catch(function(){
    serverAvailable = false;
    return false;
  });
}

function save(){
  try{
    localStorage.setItem(STORAGE_PREFIX+currentId, JSON.stringify(state));
  }catch(e){}
  postToServer().then(function(serverOk){
    var parts = ["Saved locally"];
    parts.push(serverOk ? "synced to server" : "server offline");
    setText("save-status", parts.join(" · ")+" · "+timeNow());
    if(serverOk){ refreshCharacterList(); }
  });
}

function toggleCharactersView(){
  var dash = document.getElementById("dashboard");
  var btn = document.getElementById("btn-toggle-characters");
  dash.classList.remove("showing-trash");
  var showing = dash.classList.toggle("showing-characters");
  btn.textContent = showing ? "Back to Sheet" : "Characters";
  if(showing){
    refreshCharacterList();
    if(phoneLayoutActive){
      var dashboardTabBtn = document.getElementById("tab-btn-dashboard");
      if(dashboardTabBtn) activateTab(dashboardTabBtn);
    }
  }
}

function closeCharactersView(){
  document.getElementById("dashboard").classList.remove("showing-characters");
  document.getElementById("dashboard").classList.remove("showing-trash");
  document.getElementById("btn-toggle-characters").textContent = "Characters";
}

function openTrashView(){
  var dash = document.getElementById("dashboard");
  dash.classList.remove("showing-characters");
  dash.classList.add("showing-trash");
  refreshTrashList();
}

function closeTrashView(){
  var dash = document.getElementById("dashboard");
  dash.classList.remove("showing-trash");
  dash.classList.add("showing-characters");
  refreshCharacterList();
}

function refreshTrashList(){
  fetch("/api/trash", {cache:"no-store"}).then(function(r){
    if(!r.ok) throw new Error("no server");
    return r.json();
  }).then(function(list){
    renderTrashRoster(list);
  }).catch(function(){
    var el = document.getElementById("trash-roster");
    if(el) el.innerHTML = '<div class="footer-line">Could not load Trash — is the server running?</div>';
  });
}

function renderTrashRoster(list){
  var el = document.getElementById("trash-roster");
  if(!el) return;
  if(!list.length){ el.innerHTML = '<div class="footer-line">Trash is empty.</div>'; return; }
  var sorted = list.slice().sort(function(a,b){ return (b.deletedAt||0)-(a.deletedAt||0); });
  el.innerHTML = '<table class="data-table roster-table"><thead><tr>'+
    '<th>Character</th><th>Class / Level</th><th style="width:150px;">Deleted</th><th style="width:150px;"></th>'+
    '</tr></thead><tbody>'+
    sorted.map(function(c){
      var meta = c.meta || {};
      var deleted = c.deletedAt ? new Date(c.deletedAt*1000).toLocaleString() : "—";
      return '<tr>'+
        '<td>'+esc(c.name && c.name.trim() ? c.name : "(unnamed)")+'</td>'+
        '<td>'+esc(classSummaryFromMeta(meta))+' <span class="mono">(Lv '+totalLevelFromMeta(meta)+')</span></td>'+
        '<td>'+esc(deleted)+'</td>'+
        '<td class="roster-actions">'+
          '<button class="btn" onclick="restoreCharacter(\''+c.id+'\')">Restore</button>'+
          '<button class="row-del" onclick="permanentlyDeleteCharacter(\''+c.id+'\')" title="Delete forever">&times;</button>'+
        '</td>'+
        '</tr>';
    }).join("")+
    '</tbody></table>';
}

function restoreCharacter(id){
  fetch("/api/trash/"+encodeURIComponent(id)+"/restore", {method:"POST"}).then(function(r){
    if(!r.ok) throw new Error("restore failed");
    refreshTrashList();
    refreshCharacterList();
  }).catch(function(){ alert("Could not restore — is the server running?"); });
}

function permanentlyDeleteCharacter(id){
  if(!confirm("Permanently delete this character? This cannot be undone.")) return;
  fetch("/api/trash/"+encodeURIComponent(id), {method:"DELETE"}).then(function(r){
    if(!r.ok) throw new Error("delete failed");
    refreshTrashList();
  }).catch(function(){ alert("Could not delete — is the server running?"); });
}

function emptyTrash(){
  if(!confirm("Permanently delete everything in the Trash? This cannot be undone.")) return;
  fetch("/api/trash", {method:"DELETE"}).then(function(r){
    if(!r.ok) throw new Error("empty failed");
    refreshTrashList();
  }).catch(function(){ alert("Could not empty Trash — is the server running?"); });
}

var lastRosterList = [];

function refreshCharacterList(){
  fetch("/api/characters", {cache:"no-store"}).then(function(r){
    if(!r.ok) throw new Error("no server");
    return r.json();
  }).then(function(list){
    var hasCurrent = list.some(function(c){ return c.id===currentId; });
    if(!hasCurrent){
      var ownSummons = (state.summons||[]).map(function(s){ return s.name; }).filter(Boolean);
      list = list.concat([{id:currentId, name:state.meta.name, meta:state.meta, summons:ownSummons, updatedAt:0}]);
    }
    lastRosterList = list;
    var player = getCurrentPlayerName().trim().toLowerCase();
    var scoped = player ? list.filter(function(c){ return ((c.meta&&c.meta.playerName)||"").trim().toLowerCase()===player; }) : list;
    renderCharacterRoster(scoped);
    renderInitiativeCampaignPicker();
    renderPlayerColorPicker();
  }).catch(function(){});
}

var knownCampaigns = [];

function loadKnownCampaigns(){
  return fetch("/api/campaigns", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(list){
    knownCampaigns = Array.isArray(list) ? list : [];
    return ensureCurrentCampaignRegistered();
  }).then(function(){
    populateCampaignSelects();
  }).catch(function(){});
}

function ensureCurrentCampaignRegistered(){
  var current = (state.meta.campaign||"").trim();
  if(!current) return Promise.resolve();
  var already = knownCampaigns.some(function(c){ return c.slug===campaignSlug(current); });
  if(already) return Promise.resolve();
  return fetch("/api/campaigns", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name:current})})
    .then(function(){ return fetch("/api/campaigns", {cache:"no-store"}); })
    .then(function(r){ return r.json(); })
    .then(function(list){ knownCampaigns = Array.isArray(list) ? list : knownCampaigns; })
    .catch(function(){});
}

function campaignSelectOptionsHtml(selected){
  var options = '<option value="">— none —</option>';
  options += knownCampaigns.map(function(c){
    return '<option value="'+esc(c.name)+'"'+(c.name===selected?" selected":"")+'>'+esc(c.name)+'</option>';
  }).join("");
  return options;
}

function populateCampaignSelects(){
  var sel = document.getElementById("meta-campaign-select");
  if(sel){ sel.innerHTML = campaignSelectOptionsHtml(state.meta.campaign); }
  if(wizardState && wizardState.step==="identity"){ renderWizardStep(); }
}

function populateSizeSelect(){
  var sel = document.getElementById("meta-size-select");
  if(sel){ sel.innerHTML = sizeSelectOptionsHtml(state.meta.size); }
}

var PLAYER_COLORS = ["#4f8fc9","#c1666a","#7fae5f","#d4b23c","#8f7fe0","#c76fa0","#5aa3c7","#e0793c","#4fc9a8","#c9c94f"];

function takenPlayerColors(){
  var campaign = (state.meta.campaign||"").trim().toLowerCase();
  if(!campaign) return {};
  var taken = {};
  lastRosterList.forEach(function(c){
    if(c.id===currentId) return;
    if(((c.meta&&c.meta.campaign)||"").trim().toLowerCase()!==campaign) return;
    var color = c.meta && c.meta.color;
    if(color) taken[color] = true;
  });
  return taken;
}

function renderPlayerColorPicker(){
  var el = document.getElementById("player-color-swatches");
  if(!el) return;
  var taken = takenPlayerColors();
  var current = state.meta.color || "";
  el.innerHTML = PLAYER_COLORS.map(function(c){
    var isTaken = taken[c] && c!==current;
    var isActive = c===current;
    return '<button type="button" class="player-color-swatch'+(isActive?" player-color-active":"")+(isTaken?" player-color-taken":"")+'" '+
      'style="background:'+c+';" '+(isTaken?'disabled title="Already taken by another character in this campaign"':'onclick="pickPlayerColor(\''+c+'\')"')+'></button>';
  }).join("");
}

function pickPlayerColor(color){
  state.meta.color = state.meta.color===color ? "" : color;
  renderPlayerColorPicker();
  scheduleSave();
}

function classSummaryFromMeta(meta){
  if(meta && meta.classes && meta.classes.length){
    var parts = meta.classes.filter(function(c){ return c.class; }).map(function(c){ return c.class+" "+(Number(c.level)||1); });
    return parts.join(" / ") || "—";
  }
  if(meta && meta.class){ return meta.class+" "+(Number(meta.level)||1); }
  return "—";
}
function totalLevelFromMeta(meta){
  if(meta && meta.classes && meta.classes.length){
    var sum = meta.classes.reduce(function(s,c){ return s+(Number(c.level)||0); }, 0);
    return sum || 1;
  }
  return (meta && Number(meta.level)) || 1;
}

function renderCharacterRoster(list){
  var el = document.getElementById("characters-roster");
  if(!el) return;
  if(!list.length){ el.innerHTML = '<div class="footer-line">No characters yet.</div>'; return; }
  var sorted = list.slice().sort(function(a,b){
    var ca = ((a.meta&&a.meta.campaign)||"").trim().toLowerCase();
    var cb = ((b.meta&&b.meta.campaign)||"").trim().toLowerCase();
    if(!ca && cb) return 1;
    if(ca && !cb) return -1;
    if(ca!==cb) return ca.localeCompare(cb);
    var pa = ((a.meta&&a.meta.playerName)||"").toLowerCase();
    var pb = ((b.meta&&b.meta.playerName)||"").toLowerCase();
    if(pa!==pb) return pa.localeCompare(pb);
    return String(a.name||"").localeCompare(String(b.name||""));
  });
  el.innerHTML = '<table class="data-table roster-table"><thead><tr>'+
    '<th>Character</th><th style="width:90px;">Player</th><th>Class / Level</th><th style="width:110px;">Campaign</th><th style="width:88px;"></th>'+
    '</tr></thead><tbody>'+
    sorted.map(function(c){
      var meta = c.meta || {};
      var isActive = c.id===currentId;
      var updated = c.updatedAt ? "Last updated "+new Date(c.updatedAt*1000).toLocaleString() : "Never saved";
      return '<tr'+(isActive?' class="roster-row-active"':'')+'>'+
        '<td title="'+esc(updated)+'">'+esc(c.name && c.name.trim() ? c.name : "(unnamed)")+'</td>'+
        '<td>'+esc(meta.playerName||"—")+'</td>'+
        '<td>'+esc(classSummaryFromMeta(meta))+' <span class="mono">(Lv '+totalLevelFromMeta(meta)+')</span></td>'+
        '<td>'+esc(meta.campaign||"—")+'</td>'+
        '<td class="roster-actions">'+
          (isActive?'':'<button class="btn" onclick="switchToCharacter(\''+c.id+'\')">Open</button>')+
          '<button class="row-del" onclick="deleteCharacter(\''+c.id+'\')" title="Delete character">&times;</button>'+
        '</td>'+
        '</tr>';
    }).join("")+
    '</tbody></table>';
}

function deleteCharacter(id){
  if(!confirm("Move this character to Trash? You can restore it later from the Trash view.")) return;
  fetch("/api/character/"+encodeURIComponent(id), {method:"DELETE"}).then(function(r){
    if(!r.ok) throw new Error("delete failed");
    if(id===currentId){ startFreshCharacter(); }
    refreshCharacterList();
  }).catch(function(){ alert("Could not delete — is the server running?"); });
}

function resetExpandedState(){
  expandedFeatures = {};
  expandedEquipment = {};
  expandedSpellEffects = {};
}

function switchToCharacter(id){
  if(id===currentId) return;
  currentId = id;
  setStoredActiveId(id);
  resetExpandedState();
  loadState().then(function(){
    rebuildAll();
    initInitiativeTracker(); initBattleMap();
    refreshCharacterList();
    closeCharactersView();
  });
}

function timeNow(){
  var d = new Date();
  return d.toLocaleTimeString();
}

function buildDatalists(){
  fillDatalist("dl-classes", CLASSES);
  fillDatalist("dl-races", RACES);
  fillDatalist("dl-backgrounds", BACKGROUNDS);
  fillDatalist("dl-alignments", ALIGNMENTS);
}
function fillDatalist(id, arr){
  var dl = document.getElementById(id);
  dl.innerHTML = arr.map(function(v){ return '<option value="'+esc(v)+'"></option>'; }).join("");
}

function renderClasses(){
  var lists = document.querySelectorAll(".classes-list");
  if(!lists.length) return;
  var html = state.meta.classes.map(function(c,i){
    return '<div class="entry-top">'+
      '<input type="text" list="dl-classes" class="entry-mid" data-bind="meta.classes.'+i+'.class" value="'+esc(c.class)+'" placeholder="Class">'+
      '<input type="number" min="1" max="20" class="entry-narrow no-spin" data-bind="meta.classes.'+i+'.level" value="'+(c.level||1)+'" title="Level in this class">'+
      (state.meta.classes.length>1 ? '<button class="row-del" onclick="removeClassRow('+i+')" title="Remove class">&times;</button>' : '')+
      '</div>';
  }).join("");
  lists.forEach(function(el){ el.innerHTML = html; });
  document.querySelectorAll(".classes-total-level").forEach(function(el){ el.textContent = totalLevel(); });
}

function renderPortrait(){
  var img = document.getElementById("portrait-img");
  var placeholder = document.getElementById("portrait-placeholder");
  var removeBtn = document.getElementById("btn-remove-portrait");
  var stickyTop = document.getElementById("sticky-top");
  if(!img) return;
  if(state.meta.portrait){
    img.src = state.meta.portrait;
    img.style.display = "block";
    placeholder.style.display = "none";
    removeBtn.style.display = "";
    if(stickyTop) stickyTop.style.setProperty("--dashboard-portrait", 'url("'+state.meta.portrait+'")');
  }else{
    img.removeAttribute("src");
    img.style.display = "none";
    placeholder.style.display = "";
    removeBtn.style.display = "none";
    if(stickyTop) stickyTop.style.removeProperty("--dashboard-portrait");
  }
}

function handlePortraitFile(file){
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    var img = new Image();
    img.onload = function(){
      var maxDim = 480;
      var scale = Math.min(1, maxDim/Math.max(img.width, img.height));
      var w = Math.max(1, Math.round(img.width*scale));
      var h = Math.max(1, Math.round(img.height*scale));
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      state.meta.portrait = canvas.toDataURL("image/jpeg", 0.82);
      renderPortrait();
      scheduleSave();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function removePortrait(){
  if(!confirm("Remove this portrait?")) return;
  state.meta.portrait = "";
  renderPortrait();
  scheduleSave();
}

function renderAbilities(){
  var el = document.getElementById("abilities-grid");
  el.innerHTML = ABILITIES.map(function(a){
    var key = a[0], label = a[1];
    return '<div class="ability-chip">'+
      '<div class="ability-seal-sm"><span class="mod-sm mono" id="mod-'+key+'">+0</span></div>'+
      '<div class="ability-name-sm">'+label.slice(0,3)+'</div>'+
      '<input type="number" "-moz-appearance=textfield" class="ability-score-sm mono" min="1" max="30" data-bind="abilities.'+key+'" value="'+state.abilities[key]+'">'+
      '</div>';
  }).join("");
}

function renderSaves(){
  var el = document.getElementById("saves-list");
  el.innerHTML = ABILITIES.map(function(a){
    var key = a[0], label = a[1];
    return '<div class="save-chip'+(state.saves[key]?" active":"")+'" title="Set automatically by class">'+
      '<span>'+label.slice(0,3)+'</span>'+
      '<span class="bonus mono" id="save-'+key+'">+0</span>'+
      '</div>';
  }).join("");
}

function renderSkills(){
  var el = document.getElementById("skills-list");
  el.innerHTML = SKILLS.map(function(s){
    var key=s[0], label=s[1], ab=s[2];
    var sk = state.skills[key];
    return '<div class="skill-row-sm">'+
      '<input type="checkbox" class="cb-sm" title="Proficient" data-bind="skills.'+key+'.prof" '+(sk.prof?"checked":"")+'>'+
      '<input type="checkbox" class="exp-sm" title="Expertise" data-bind="skills.'+key+'.exp" '+(sk.exp?"checked":"")+'>'+
      '<span class="lbl">'+label+' <em>'+ab.toUpperCase()+'</em></span>'+
      '<span class="bonus mono" id="skill-'+key+'">+0</span>'+
      '</div>';
  }).join("");
}

function renderConditions(){
  var el = document.getElementById("conditions-list");
  if(!el) return;
  el.innerHTML = CONDITIONS.map(function(c){
    var key = c.toLowerCase();
    return '<div class="condition-row"><input type="checkbox" class="cb-sm" data-bind="combat.conditions.'+key+'" '+(state.combat.conditions[key]?"checked":"")+'><span class="lbl">'+c+'</span></div>';
  }).join("");
  updateConditionsSummary();
}

function updateConditionsSummary(){
  var active = CONDITIONS.filter(function(c){ return state.combat.conditions[c.toLowerCase()]; });
  setText("conditions-summary", active.length ? active.join(", ") : "None active");
}

function renderSpellEffects(){
  var el = document.getElementById("effects-list");
  if(!el) return;
  el.innerHTML = state.combat.spellEffects.map(function(e,i){
    var isOpen = !!expandedSpellEffects[i];
    return '<div class="entry-card'+(isOpen?" expanded":"")+'">'+
      '<div class="entry-top">'+
      '<textarea rows="1" class="entry-name auto-grow" data-bind="combat.spellEffects.'+i+'.name" placeholder="e.g. Mage Armor">'+esc(e.name)+'</textarea>'+
      '<button class="entry-toggle" onclick="toggleSpellEffectCard(this,'+i+')">'+(isOpen?"▾":"▸")+'</button>'+
      '<button class="row-del" onclick="removeSpellEffect('+i+')">&times;</button>'+
      '</div>'+
      effectRowsHtml("spellEffects", i, e.effects)+
      '</div>';
  }).join("");
  el.querySelectorAll(".auto-grow").forEach(autoGrow);
}
function toggleSpellEffectCard(btn, i){
  expandedSpellEffects[i] = !expandedSpellEffects[i];
  var card = btn.closest(".entry-card");
  var expanded = card.classList.toggle("expanded");
  btn.textContent = expanded ? "▾" : "▸";
}

function addSpellEffect(){
  var input = document.getElementById("effect-add-input");
  var name = input.value.trim();
  if(!name) return;
  state.combat.spellEffects.push({name:name, effects:[]});
  input.value = "";
  renderSpellEffects();
  scheduleSave();
}

function removeSpellEffect(i){
  state.combat.spellEffects.splice(i,1);
  expandedSpellEffects = reindexAfterRemoval(expandedSpellEffects, i);
  renderSpellEffects();
  renderComputed();
  scheduleSave();
}

var INITIATIVE_STORAGE_KEY = "dndInitiativeTracker";
var initiativeState = null;

function campaignSlug(name){
  return String(name||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64);
}

function initiativeStorageKey(){
  return initiativeCampaignSlug ? (INITIATIVE_STORAGE_KEY+":"+initiativeCampaignSlug) : INITIATIVE_STORAGE_KEY;
}

function loadInitiativeStateLocal(key){
  try{
    var raw = localStorage.getItem(key);
    if(raw){
      var parsed = JSON.parse(raw);
      if(parsed && Array.isArray(parsed.entries)) return parsed;
    }
  }catch(e){}
  return {round:1, currentId:null, entries:[]};
}

function initInitiativeTracker(){
  initiativePollGeneration++;
  var slug = campaignSlug(state.meta.campaign);
  initiativeCampaignSlug = slug || null;
  var key = initiativeStorageKey();
  if(!slug){
    initiativeState = loadInitiativeStateLocal(key);
    initiativeServerAvailable = false;
    renderInitiativeTracker();
    renderInitiativeCampaignPicker();
    return;
  }
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/initiative", {cache:"no-store"}).then(function(resp){
    if(!resp.ok) throw new Error("no server");
    lastKnownInitiativeUpdatedAt = parseFloat(resp.headers.get("X-Updated-At")) || 0;
    return resp.json();
  }).then(function(loaded){
    initiativeState = (loaded && Array.isArray(loaded.entries)) ? loaded : loadInitiativeStateLocal(key);
    initiativeServerAvailable = true;
    renderInitiativeTracker();
    renderInitiativeCampaignPicker();
    startInitiativePolling();
  }).catch(function(){
    initiativeState = loadInitiativeStateLocal(key);
    initiativeServerAvailable = false;
    renderInitiativeTracker();
    renderInitiativeCampaignPicker();
  });
}

function startInitiativePolling(){
  initiativePollNext(initiativePollGeneration);
}

function initiativePollNext(generation){
  if(generation !== initiativePollGeneration || !initiativeCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(initiativeCampaignSlug)+"/initiative/wait?since="+lastKnownInitiativeUpdatedAt, {cache:"no-store"})
    .then(function(resp){
      if(generation !== initiativePollGeneration) return null;
      var updatedHeader = parseFloat(resp.headers.get("X-Updated-At"));
      if(resp.status === 200){
        return resp.json().then(function(data){
          return {data: data, updatedAt: isNaN(updatedHeader) ? lastKnownInitiativeUpdatedAt : updatedHeader};
        });
      }
      if(!isNaN(updatedHeader)){ lastKnownInitiativeUpdatedAt = updatedHeader; }
      return null;
    })
    .then(function(result){
      if(generation !== initiativePollGeneration) return;
      var applied = result ? applyRemoteInitiativeUpdate(result.data, result.updatedAt, generation) : Promise.resolve();
      applied.then(function(){
        if(generation !== initiativePollGeneration) return;
        initiativePollNext(generation);
      });
    })
    .catch(function(){
      if(generation !== initiativePollGeneration) return;
      setTimeout(function(){ initiativePollNext(generation); }, 3000);
    });
}

function isEditingInitiativeField(){
  var el = document.activeElement;
  if(!el || !el.closest) return false;
  if(!el.closest("#initiative-widget")) return false;
  var tag = el.tagName;
  return tag==="INPUT" || tag==="TEXTAREA" || tag==="SELECT";
}

function applyRemoteInitiativeUpdate(data, updatedAt, generation){
  return new Promise(function(resolve){
    (function attempt(){
      if(generation !== initiativePollGeneration) { resolve(); return; }
      if(initiativeSaveTimer || isEditingInitiativeField()){
        setTimeout(attempt, 500);
        return;
      }
      initiativeState = (data && Array.isArray(data.entries)) ? data : {round:1, currentId:null, entries:[]};
      lastKnownInitiativeUpdatedAt = updatedAt;
      renderInitiativeTracker();
      renderInitiativeCampaignPicker();
      try{ localStorage.setItem(initiativeStorageKey(), JSON.stringify(initiativeState)); }catch(e){}
      resolve();
    })();
  });
}

function postInitiativeToServer(){
  if(!initiativeCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(initiativeCampaignSlug)+"/initiative", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(initiativeState)
  }).then(function(r){
    initiativeServerAvailable = !!(r && r.ok);
    if(initiativeServerAvailable){
      return r.json().then(function(res){
        if(res && res.updatedAt){ lastKnownInitiativeUpdatedAt = res.updatedAt; }
      }).catch(function(){});
    }
  }).catch(function(){
    initiativeServerAvailable = false;
  });
}

function saveInitiativeState(){
  try{ localStorage.setItem(initiativeStorageKey(), JSON.stringify(initiativeState)); }catch(e){}
  if(!initiativeCampaignSlug) return;
  if(initiativeSaveTimer) clearTimeout(initiativeSaveTimer);
  initiativeSaveTimer = setTimeout(function(){ initiativeSaveTimer = null; postInitiativeToServer(); }, 350);
}

function sortedInitiativeEntries(){
  return initiativeState.entries.slice().sort(function(a,b){
    var d = (Number(b.init)||0)-(Number(a.init)||0);
    if(d!==0) return d;
    return String(a.name||"").localeCompare(String(b.name||""));
  });
}

function renderInitiativeTracker(){
  var el = document.getElementById("initiative-list");
  if(!el) return;
  var sorted = sortedInitiativeEntries();
  el.innerHTML = sorted.map(function(entry){
    var isCurrent = entry.id===initiativeState.currentId;
    var linkedChar = entry.characterId ? lastRosterList.find(function(c){ return c.id===entry.characterId; }) : null;
    var summonsList = (linkedChar && linkedChar.summons) || [];
    var summonsHtml = summonsList.length ? ' <span class="init-summons" title="Summons">('+esc(summonsList.join(", "))+')</span>' : '';
    return '<div class="initiative-row'+(isCurrent?" current-turn":"")+'">'+
      '<input type="number" class="init-val-input mono" value="'+(Number(entry.init)||0)+'" onchange="updateInitiativeValue(\''+entry.id+'\', this.value)">'+
      '<span class="init-name">'+esc(entry.name||"Unnamed")+summonsHtml+(entry.characterId?' <span class="init-pc-badge" title="Player character">PC</span>':'')+'</span>'+
      '<button class="row-del" onclick="removeInitiativeEntry(\''+entry.id+'\')" title="Remove">&times;</button>'+
      '</div>';
  }).join("");
  setText("initiative-round", initiativeState.round);
  setText("initiative-sync-status", initiativeCampaignSlug ? ("Shared · "+state.meta.campaign) : "Local only");
}

var pendingInitiativeCharacterId = null;

function renderInitiativeCampaignPicker(){
  var el = document.getElementById("initiative-campaign-picker");
  if(!el) return;
  var campaign = (state.meta.campaign||"").trim();
  if(!campaign){
    el.innerHTML = '<div class="campaign-chip-hint">Set a Campaign in Details to link party members here.</div>';
    return;
  }
  var addedIds = {};
  initiativeState.entries.forEach(function(e){ if(e.characterId) addedIds[e.characterId] = true; });
  var mates = lastRosterList.filter(function(c){
    return ((c.meta&&c.meta.campaign)||"").trim().toLowerCase()===campaign.toLowerCase() && !addedIds[c.id];
  });
  if(!mates.length){
    el.innerHTML = '<div class="campaign-chip-hint">No available campaign members to add.</div>';
    return;
  }
  el.innerHTML = mates.map(function(c){
    var name = (c.name && c.name.trim()) ? c.name : "(unnamed)";
    return '<button type="button" class="campaign-chip" data-cid="'+esc(c.id)+'" data-cname="'+esc(name)+'" onclick="pickInitiativeCandidate(this)">'+
      esc(name)+' <span class="mono">(Lv '+totalLevelFromMeta(c.meta)+')</span></button>';
  }).join("");
}

function pickInitiativeCandidate(btn){
  pendingInitiativeCharacterId = btn.dataset.cid;
  var nameInput = document.getElementById("initiative-name-input");
  var valueInput = document.getElementById("initiative-value-input");
  nameInput.value = btn.dataset.cname;
  valueInput.focus();
  valueInput.select();
}

function addInitiativeEntry(){
  var nameInput = document.getElementById("initiative-name-input");
  var valueInput = document.getElementById("initiative-value-input");
  var name = nameInput.value.trim();
  if(!name) return;
  var init = Number(valueInput.value)||0;
  var entry = {id:"init-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), name:name, init:init};
  if(pendingInitiativeCharacterId) entry.characterId = pendingInitiativeCharacterId;
  pendingInitiativeCharacterId = null;
  initiativeState.entries.push(entry);
  if(initiativeState.currentId===null){ initiativeState.currentId = entry.id; }
  nameInput.value = "";
  valueInput.value = "";
  saveInitiativeState();
  renderInitiativeTracker();
  renderInitiativeCampaignPicker();
  nameInput.focus();
}

function updateInitiativeValue(id, val){
  var entry = initiativeState.entries.find(function(e){ return e.id===id; });
  if(!entry) return;
  entry.init = Number(val)||0;
  saveInitiativeState();
  renderInitiativeTracker();
}

function removeInitiativeEntry(id){
  var sorted = sortedInitiativeEntries();
  var wasCurrent = initiativeState.currentId===id;
  var idx = sorted.findIndex(function(e){ return e.id===id; });
  initiativeState.entries = initiativeState.entries.filter(function(e){ return e.id!==id; });
  if(wasCurrent){
    var remaining = sortedInitiativeEntries();
    initiativeState.currentId = remaining.length ? (remaining[idx] || remaining[0]).id : null;
  }
  saveInitiativeState();
  renderInitiativeTracker();
  renderInitiativeCampaignPicker();
}

function nextInitiativeTurn(){
  var sorted = sortedInitiativeEntries();
  if(!sorted.length) return;
  var idx = sorted.findIndex(function(e){ return e.id===initiativeState.currentId; });
  var nextIdx = idx===-1 ? 0 : idx+1;
  if(nextIdx>=sorted.length){
    nextIdx = 0;
    initiativeState.round = (Number(initiativeState.round)||1)+1;
  }
  initiativeState.currentId = sorted[nextIdx].id;
  saveInitiativeState();
  renderInitiativeTracker();
}

function prevInitiativeTurn(){
  var sorted = sortedInitiativeEntries();
  if(!sorted.length) return;
  var idx = sorted.findIndex(function(e){ return e.id===initiativeState.currentId; });
  var prevIdx = idx===-1 ? sorted.length-1 : idx-1;
  if(prevIdx<0){
    prevIdx = sorted.length-1;
    initiativeState.round = Math.max(1, (Number(initiativeState.round)||1)-1);
  }
  initiativeState.currentId = sorted[prevIdx].id;
  saveInitiativeState();
  renderInitiativeTracker();
}

function resetInitiativeTracker(){
  var msg = initiativeCampaignSlug
    ? "Clear the SHARED initiative tracker for everyone in this campaign and reset the round counter?"
    : "Clear the initiative tracker and reset the round counter?";
  if(!confirm(msg)) return;
  initiativePollGeneration++;
  initiativeState = {round:1, currentId:null, entries:[]};
  saveInitiativeState();
  renderInitiativeTracker();
  renderInitiativeCampaignPicker();
  if(initiativeCampaignSlug){ startInitiativePolling(); }
}

var pcBoardMap = {image:"", gridCols:20, gridRows:15};
var pcBoardTokens = [];
var pcBoardTokensPollGeneration = 0;
var pcLastKnownBoardTokensUpdatedAt = 0;
var pcBoardDragTokenId = null;
var pcBoardCampaignSlug = null;
var pcBoardNaturalW = 0;
var pcBoardNaturalH = 0;
var pcBoardZoom = 1;
var pcBoardPanX = 0;
var pcBoardPanY = 0;
var pcBoardPanning = false;
var pcBoardPanStart = null;

function pcApplyBoardTransform(){
  var world = document.getElementById("pc-battle-map-world");
  if(!world) return;
  world.style.transform = "translate("+pcBoardPanX+"px,"+pcBoardPanY+"px) scale("+pcBoardZoom+")";
}

function pcZoomBoard(factor, clientX, clientY){
  var viewport = document.getElementById("pc-battle-map-viewport");
  if(!viewport) return;
  var rect = viewport.getBoundingClientRect();
  var mx = clientX!==undefined ? clientX-rect.left : rect.width/2;
  var my = clientY!==undefined ? clientY-rect.top : rect.height/2;
  var worldX = (mx-pcBoardPanX)/pcBoardZoom;
  var worldY = (my-pcBoardPanY)/pcBoardZoom;
  var newZoom = Math.min(5, Math.max(0.25, pcBoardZoom*factor));
  pcBoardPanX = mx - worldX*newZoom;
  pcBoardPanY = my - worldY*newZoom;
  pcBoardZoom = newZoom;
  pcApplyBoardTransform();
}

function pcResetBoardView(){
  var viewport = document.getElementById("pc-battle-map-viewport");
  if(!viewport || !pcBoardNaturalW){ pcBoardZoom=1; pcBoardPanX=0; pcBoardPanY=0; pcApplyBoardTransform(); return; }
  var rect = viewport.getBoundingClientRect();
  pcBoardZoom = Math.min(rect.width/pcBoardNaturalW, rect.height/pcBoardNaturalH, 1) || 1;
  pcBoardPanX = (rect.width - pcBoardNaturalW*pcBoardZoom)/2;
  pcBoardPanY = (rect.height - pcBoardNaturalH*pcBoardZoom)/2;
  pcApplyBoardTransform();
}

var pcActiveTool = "pan";
var pcShapes = [];
var pcShapesPollGeneration = 0;
var pcLastKnownShapesUpdatedAt = 0;
var pcDraftShape = null;

function pcSetActiveTool(tool){
  pcActiveTool = tool;
  document.querySelectorAll(".battlemap-tool-btn").forEach(function(btn){
    btn.classList.toggle("battlemap-tool-active", btn.dataset.tool===tool);
  });
  var viewport = document.getElementById("pc-battle-map-viewport");
  if(viewport) viewport.classList.toggle("drawing", tool!=="pan");
}

function pcShapeColorForKind(kind){
  if(kind==="ruler") return "#e2b878";
  if(kind==="circle") return "#c1666a";
  if(kind==="cone") return "#8f7fe0";
  return "#e2b878";
}

function pcShapeDrawColor(){
  return state.meta.color || pcShapeColorForKind(pcActiveTool);
}

function pcShapeDrawInitials(){
  var name = (state.meta.name||"").trim();
  if(!name) return "?";
  return name.split(/\s+/).map(function(w){ return w[0]; }).slice(0,2).join("").toUpperCase();
}

function pcFeetForPixels(pixelDist){
  var cols = Math.max(1, pcBoardMap.gridCols||20);
  var rows = Math.max(1, pcBoardMap.gridRows||15);
  var cellSize = ((pcBoardNaturalW/cols) + (pcBoardNaturalH/rows)) / 2;
  if(!cellSize) return 0;
  var feet = (pixelDist/cellSize)*5;
  return Math.max(5, Math.round(feet/5)*5);
}

function pcCellPixelSize(){
  var cols = Math.max(1, pcBoardMap.gridCols||20);
  var rows = Math.max(1, pcBoardMap.gridRows||15);
  return ((pcBoardNaturalW/cols) + (pcBoardNaturalH/rows)) / 2;
}

function pcConeBasePoints(x1,y1,x2,y2){
  var dx = x2-x1, dy = y2-y1;
  var angle = Math.atan2(dy,dx);
  var len = Math.sqrt(dx*dx+dy*dy);
  var half = Math.atan(0.5);
  return [
    [x1+len*Math.cos(angle-half), y1+len*Math.sin(angle-half)],
    [x1+len*Math.cos(angle+half), y1+len*Math.sin(angle+half)]
  ];
}

function pcShapeSvgMarkup(s){
  var x1 = s.x1*pcBoardNaturalW, y1 = s.y1*pcBoardNaturalH;
  var x2 = s.x2*pcBoardNaturalW, y2 = s.y2*pcBoardNaturalH;
  var dist = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  var feet = pcFeetForPixels(dist);
  var color = s.color || "#e2b878";
  var canDelete = s.id && s.characterId===currentId;
  var delBtn = canDelete ? '<g class="shape-del" transform="translate('+x2+','+y2+')" onclick="pcRemoveBoardShape(\''+s.id+'\')" style="pointer-events:auto;cursor:pointer;">'+
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
    var base = pcConeBasePoints(x1,y1,x2,y2);
    var pts = x1+','+y1+' '+base[0][0]+','+base[0][1]+' '+base[1][0]+','+base[1][1];
    return '<polygon points="'+pts+'" fill="'+color+'" fill-opacity="0.22" stroke="'+color+'" stroke-width="2.5"/>'+
      initials+
      '<text x="'+x2+'" y="'+(y2-10)+'" text-anchor="middle" font-size="14" fill="'+color+'" font-weight="700" stroke="#000" stroke-width="3" paint-order="stroke">'+feet+' ft</text>'+
      delBtn;
  }
  if(s.kind==="mark"){
    var half = pcCellPixelSize()*0.32 || 14;
    var markDel = canDelete ? '<g class="shape-del" transform="translate('+(x1+half)+','+(y1-half)+')" onclick="pcRemoveBoardShape(\''+s.id+'\')" style="pointer-events:auto;cursor:pointer;">'+
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
    var r = pcCellPixelSize()*0.4 || 18;
    return '<g class="board-ping">'+
      '<circle cx="'+x1+'" cy="'+y1+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="4" class="ping-ring"/>'+
      '<circle cx="'+x1+'" cy="'+y1+'" r="'+(r*0.35)+'" fill="'+color+'"/>'+
      (s.initials ? '<text x="'+x1+'" y="'+(y1-r-6)+'" text-anchor="middle" font-size="12" font-weight="700" fill="'+color+'" stroke="#000" stroke-width="3" paint-order="stroke">'+esc(s.initials)+'</text>' : '')+
      '</g>';
  }
  return "";
}

var pcPingCleanupScheduled = {};

function renderPcBoardShapes(){
  var svg = document.getElementById("pc-battle-map-shapes-svg");
  if(!svg) return;
  svg.setAttribute("width", pcBoardNaturalW);
  svg.setAttribute("height", pcBoardNaturalH);
  svg.setAttribute("viewBox", "0 0 "+pcBoardNaturalW+" "+pcBoardNaturalH);
  var html = pcShapes.map(pcShapeSvgMarkup).join("");
  if(pcDraftShape) html += pcShapeSvgMarkup(pcDraftShape);
  svg.innerHTML = html;
  pcShapes.forEach(function(s){
    if(s.kind==="ping" && s.id && !pcPingCleanupScheduled[s.id]){
      pcPingCleanupScheduled[s.id] = true;
      setTimeout(function(){
        delete pcPingCleanupScheduled[s.id];
        pcShapes = pcShapes.filter(function(x){ return x.id!==s.id; });
        renderPcBoardShapes();
        pcDeleteBoardShapeRemote(s.id);
      }, 2200);
    }
  });
}

function pcRemoveBoardShape(id){
  var shape = pcShapes.find(function(s){ return s.id===id; });
  if(!shape || shape.characterId!==currentId) return;
  pcShapes = pcShapes.filter(function(s){ return s.id!==id; });
  renderPcBoardShapes();
  pcDeleteBoardShapeRemote(id);
}

function pcAddBoardShapeRemote(shape){
  if(!pcBoardCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(pcBoardCampaignSlug)+"/board-shapes/add", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({shape:shape})
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res && res.updatedAt){ pcLastKnownShapesUpdatedAt = res.updatedAt; }
  }).catch(function(){});
}

function pcDeleteBoardShapeRemote(id){
  if(!pcBoardCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(pcBoardCampaignSlug)+"/board-shapes/remove", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id:id})
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res && res.updatedAt){ pcLastKnownShapesUpdatedAt = res.updatedAt; }
  }).catch(function(){});
}

function pcLoadBoardShapes(slug){
  pcShapesPollGeneration++;
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/board-shapes", {cache:"no-store"}).then(function(r){
    pcLastKnownShapesUpdatedAt = parseFloat(r.headers.get("X-Updated-At"))||0;
    return r.json();
  }).then(function(data){
    pcShapes = (data && Array.isArray(data.shapes)) ? data.shapes : [];
    renderPcBoardShapes();
    pcShapesPollNext(pcShapesPollGeneration, slug);
  }).catch(function(){
    pcShapes = [];
    renderPcBoardShapes();
  });
}

function pcShapesPollNext(generation, slug){
  if(generation!==pcShapesPollGeneration || slug!==pcBoardCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/board-shapes/wait?since="+pcLastKnownShapesUpdatedAt, {cache:"no-store"})
    .then(function(resp){
      if(generation!==pcShapesPollGeneration) return null;
      var updatedHeader = parseFloat(resp.headers.get("X-Updated-At"));
      if(resp.status===200){
        return resp.json().then(function(data){
          return {data:data, updatedAt: isNaN(updatedHeader)?pcLastKnownShapesUpdatedAt:updatedHeader};
        });
      }
      if(!isNaN(updatedHeader)){ pcLastKnownShapesUpdatedAt = updatedHeader; }
      return null;
    })
    .then(function(result){
      if(generation!==pcShapesPollGeneration) return;
      if(result && !pcDraftShape){
        pcShapes = (result.data && Array.isArray(result.data.shapes)) ? result.data.shapes : pcShapes;
        pcLastKnownShapesUpdatedAt = result.updatedAt;
        renderPcBoardShapes();
      } else if(result){
        pcLastKnownShapesUpdatedAt = result.updatedAt;
      }
      pcShapesPollNext(generation, slug);
    })
    .catch(function(){
      if(generation!==pcShapesPollGeneration) return;
      setTimeout(function(){ pcShapesPollNext(generation, slug); }, 3000);
    });
}

function pcSetupBoardViewportInteractions(){
  var viewport = document.getElementById("pc-battle-map-viewport");
  if(!viewport || viewport.dataset.wired) return;
  viewport.dataset.wired = "1";
  viewport.addEventListener("wheel", function(e){
    e.preventDefault();
    pcZoomBoard(e.deltaY<0 ? 1.1 : 0.9, e.clientX, e.clientY);
  }, {passive:false});
  function worldPointFromEvent(e){
    var rect = viewport.getBoundingClientRect();
    var x = ((e.clientX-rect.left)-pcBoardPanX)/pcBoardZoom;
    var y = ((e.clientY-rect.top)-pcBoardPanY)/pcBoardZoom;
    return {x: pcBoardNaturalW ? x/pcBoardNaturalW : 0, y: pcBoardNaturalH ? y/pcBoardNaturalH : 0};
  }
  viewport.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  viewport.addEventListener("pointerdown", function(e){
    if(e.target.closest(".shape-del")) return;
    if(e.button===1 || e.button===2){
      e.preventDefault();
      pcDraftShape = null;
      pcBoardPanning = true;
      pcBoardPanStart = {x:e.clientX, y:e.clientY, panX:pcBoardPanX, panY:pcBoardPanY};
      viewport.classList.add("panning");
      viewport.setPointerCapture(e.pointerId);
      return;
    }
    if(e.target.closest(".battle-map-token")) return;
    if(pcActiveTool==="mark" || pcActiveTool==="ping"){
      var mp = worldPointFromEvent(e);
      if(pcActiveTool==="mark"){
        var cols = Math.max(1, pcBoardMap.gridCols||20);
        var rows = Math.max(1, pcBoardMap.gridRows||15);
        mp.x = (Math.floor(mp.x*cols)+0.5)/cols;
        mp.y = (Math.floor(mp.y*rows)+0.5)/rows;
      }
      var placedInstant = {kind:pcActiveTool, x1:mp.x, y1:mp.y, x2:mp.x, y2:mp.y, color:pcShapeDrawColor(), initials:pcShapeDrawInitials(), characterId:currentId,
        id:"shp-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
      pcShapes.push(placedInstant);
      renderPcBoardShapes();
      pcAddBoardShapeRemote(placedInstant);
      return;
    }
    if(pcActiveTool!=="pan"){
      var p = worldPointFromEvent(e);
      pcDraftShape = {kind:pcActiveTool, x1:p.x, y1:p.y, x2:p.x, y2:p.y, color:pcShapeDrawColor(), initials:pcShapeDrawInitials(), characterId:currentId};
      viewport.setPointerCapture(e.pointerId);
      return;
    }
    pcBoardPanning = true;
    pcBoardPanStart = {x:e.clientX, y:e.clientY, panX:pcBoardPanX, panY:pcBoardPanY};
    viewport.classList.add("panning");
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", function(e){
    if(pcDraftShape){
      var p = worldPointFromEvent(e);
      pcDraftShape.x2 = p.x; pcDraftShape.y2 = p.y;
      renderPcBoardShapes();
      return;
    }
    if(!pcBoardPanning || !pcBoardPanStart) return;
    pcBoardPanX = pcBoardPanStart.panX + (e.clientX-pcBoardPanStart.x);
    pcBoardPanY = pcBoardPanStart.panY + (e.clientY-pcBoardPanStart.y);
    pcApplyBoardTransform();
  });
  function stopPan(e){
    if(pcDraftShape){
      pcDraftShape.id = "shp-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
      var placed = pcDraftShape;
      pcShapes.push(placed);
      pcDraftShape = null;
      renderPcBoardShapes();
      pcAddBoardShapeRemote(placed);
      return;
    }
    pcBoardPanning = false; pcBoardPanStart = null; viewport.classList.remove("panning");
  }
  viewport.addEventListener("pointerup", stopPan);
  viewport.addEventListener("pointercancel", stopPan);
}

function initBattleMap(){
  pcBoardTokensPollGeneration++;
  var slug = campaignSlug(state.meta.campaign);
  pcBoardCampaignSlug = slug || null;
  if(!slug){
    pcBoardMap = {image:"", gridCols:20, gridRows:15};
    pcBoardTokens = [];
    renderPcBoardMap();
    return;
  }
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/board-map", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(data){
    pcBoardMap = {
      image: (data && data.image) || "",
      gridCols: (data && Number(data.gridCols)) || 20,
      gridRows: (data && Number(data.gridRows)) || 15
    };
    renderPcBoardMap();
  }).catch(function(){ renderPcBoardMap(); });
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/board-tokens", {cache:"no-store"}).then(function(r){
    pcLastKnownBoardTokensUpdatedAt = parseFloat(r.headers.get("X-Updated-At"))||0;
    return r.json();
  }).then(function(data){
    pcBoardTokens = (data && Array.isArray(data.tokens)) ? data.tokens : [];
    renderPcBoardTokens();
    pcBoardTokensPollNext(pcBoardTokensPollGeneration, slug);
  }).catch(function(){
    pcBoardTokens = [];
    renderPcBoardTokens();
  });
  pcLoadBoardShapes(slug);
}

function renderPcBoardMap(){
  var viewport = document.getElementById("pc-battle-map-viewport");
  var world = document.getElementById("pc-battle-map-world");
  var img = document.getElementById("pc-battle-map-image");
  var overlay = document.getElementById("pc-battle-map-grid-overlay");
  var hint = document.getElementById("pc-battle-map-empty-hint");
  if(!viewport) return;
  pcSetupBoardViewportInteractions();
  var cols = Math.max(1, pcBoardMap.gridCols||20);
  var rows = Math.max(1, pcBoardMap.gridRows||15);
  var cellW = 100/cols, cellH = 100/rows;
  overlay.style.backgroundImage =
    'repeating-linear-gradient(to right, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 1px, transparent 1px, transparent '+cellW+'%),'+
    'repeating-linear-gradient(to bottom, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 1px, transparent 1px, transparent '+cellH+'%)';
  if(pcBoardMap.image){
    hint.style.display = "none";
    if(img.src !== pcBoardMap.image){
      img.onload = function(){
        pcBoardNaturalW = img.naturalWidth;
        pcBoardNaturalH = img.naturalHeight;
        world.style.width = pcBoardNaturalW+"px";
        world.style.height = pcBoardNaturalH+"px";
        pcResetBoardView();
        renderPcBoardTokens();
        renderPcBoardShapes();
      };
      img.src = pcBoardMap.image;
    }
  }else{
    hint.style.display = "flex";
    img.removeAttribute("src");
    pcBoardNaturalW = 0; pcBoardNaturalH = 0;
    world.style.width = "100%"; world.style.height = "100%";
  }
  renderPcBoardTokens();
  renderPcBoardShapes();
}

function pcTokenColorForKind(kind){
  if(kind==="pc") return "#4f8fc9";
  if(kind==="enemy") return "#c1666a";
  return "#d4b23c";
}

function pcRenderSummonTokenSelect(){
  var sel = document.getElementById("pc-battlemap-summon-select");
  if(!sel) return;
  var options = (state.summons||[]).map(function(s,i){
    if(!s.name) return "";
    return '<option value="'+i+'">'+esc(s.name)+'</option>';
  }).join("");
  sel.innerHTML = '<option value="">+ Add my summon…</option>' + options;
}

function pcAddSummonToken(){
  var sel = document.getElementById("pc-battlemap-summon-select");
  var idx = sel.value;
  if(idx==="") return;
  var summon = state.summons[Number(idx)];
  if(!summon) return;
  pcBoardTokens.push({
    id:"tok-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    name:summon.name||"Summon", x:0.5, y:0.5, image:"", size:summon.size||"medium",
    kind:"pc", ownerCharacterId:currentId
  });
  sel.value = "";
  renderPcBoardTokens();
  savePcBoardTokens();
}

function pcTokenPixelSize(size){
  var cols = Math.max(1, pcBoardMap.gridCols||20);
  var rows = Math.max(1, pcBoardMap.gridRows||15);
  var cellSize = ((pcBoardNaturalW/cols) + (pcBoardNaturalH/rows)) / 2;
  var mult = sizeGridSpan(size);
  return Math.max(16, (cellSize||38)*mult*0.94);
}

function pcSnapTokenPosition(x, y, size, cols, rows){
  var mult = Math.round(sizeGridSpan(size));
  if(mult>=2 && mult%2===0){
    return {x: Math.round(x*cols)/cols, y: Math.round(y*rows)/rows};
  }
  return {x: (Math.floor(x*cols)+0.5)/cols, y: (Math.floor(y*rows)+0.5)/rows};
}

function renderPcBoardTokens(){
  var el = document.getElementById("pc-battle-map-tokens");
  if(!el) return;
  el.innerHTML = pcBoardTokens.map(function(t){
    var initials = (t.name||"?").trim().split(/\s+/).map(function(w){ return w[0]; }).slice(0,2).join("").toUpperCase();
    var inner = t.image ? '<img src="'+t.image+'" alt="">' : '<span>'+esc(initials)+'</span>';
    var mine = t.characterId===currentId || t.ownerCharacterId===currentId;
    var px = pcTokenPixelSize(t.size);
    var fontSize = Math.max(10, Math.round(px*0.32));
    return '<div class="battle-map-token'+(mine?" own-token":"")+'" data-tid="'+esc(t.id)+'" style="left:'+(t.x*100)+'%;top:'+(t.y*100)+'%;width:'+px+'px;height:'+px+'px;margin:'+(-px/2)+'px 0 0 '+(-px/2)+'px;font-size:'+fontSize+'px;background:'+(t.image?"transparent":esc(pcTokenColorForKind(t.kind)))+';cursor:'+(mine?"grab":"default")+';" title="'+esc(t.name||"")+'">'+inner+'</div>';
  }).join("");
  function fractionFromEvent(e){
    var viewport = document.getElementById("pc-battle-map-viewport");
    var rect = viewport.getBoundingClientRect();
    var worldX = ((e.clientX-rect.left)-pcBoardPanX)/pcBoardZoom;
    var worldY = ((e.clientY-rect.top)-pcBoardPanY)/pcBoardZoom;
    var x = pcBoardNaturalW ? worldX/pcBoardNaturalW : 0.5;
    var y = pcBoardNaturalH ? worldY/pcBoardNaturalH : 0.5;
    return {x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y))};
  }
  el.querySelectorAll(".battle-map-token.own-token").forEach(function(tokenEl){
    tokenEl.addEventListener("pointerdown", function(e){
      if(e.button===1 || e.button===2) return;
      e.stopPropagation();
      pcBoardDragTokenId = tokenEl.dataset.tid;
      tokenEl.classList.add("dragging");
      tokenEl.setPointerCapture(e.pointerId);
    });
    tokenEl.addEventListener("pointermove", function(e){
      if(pcBoardDragTokenId!==tokenEl.dataset.tid) return;
      var pos = fractionFromEvent(e);
      tokenEl.style.left = (pos.x*100)+"%";
      tokenEl.style.top = (pos.y*100)+"%";
    });
    tokenEl.addEventListener("pointerup", function(e){
      if(pcBoardDragTokenId!==tokenEl.dataset.tid) return;
      pcBoardDragTokenId = null;
      tokenEl.classList.remove("dragging");
      var pos = fractionFromEvent(e);
      var cols = Math.max(1, pcBoardMap.gridCols||20);
      var rows = Math.max(1, pcBoardMap.gridRows||15);
      var tok = pcBoardTokens.find(function(t){ return t.id===tokenEl.dataset.tid; });
      var snapped = pcSnapTokenPosition(pos.x, pos.y, tok&&tok.size, cols, rows);
      if(tok){ tok.x = snapped.x; tok.y = snapped.y; }
      renderPcBoardTokens();
      savePcBoardTokens();
    });
  });
}

function savePcBoardTokens(){
  if(!pcBoardCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(pcBoardCampaignSlug)+"/board-tokens", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({tokens:pcBoardTokens})
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res && res.updatedAt){ pcLastKnownBoardTokensUpdatedAt = res.updatedAt; }
  }).catch(function(){});
}

function pcBoardTokensPollNext(generation, slug){
  if(generation!==pcBoardTokensPollGeneration || slug!==pcBoardCampaignSlug) return;
  fetch("/api/campaign/"+encodeURIComponent(slug)+"/board-tokens/wait?since="+pcLastKnownBoardTokensUpdatedAt, {cache:"no-store"})
    .then(function(resp){
      if(generation!==pcBoardTokensPollGeneration) return null;
      var updatedHeader = parseFloat(resp.headers.get("X-Updated-At"));
      if(resp.status===200){
        return resp.json().then(function(data){
          return {data:data, updatedAt: isNaN(updatedHeader)?pcLastKnownBoardTokensUpdatedAt:updatedHeader};
        });
      }
      if(!isNaN(updatedHeader)){ pcLastKnownBoardTokensUpdatedAt = updatedHeader; }
      return null;
    })
    .then(function(result){
      if(generation!==pcBoardTokensPollGeneration) return;
      if(result && pcBoardDragTokenId===null){
        pcBoardTokens = (result.data && Array.isArray(result.data.tokens)) ? result.data.tokens : pcBoardTokens;
        pcLastKnownBoardTokensUpdatedAt = result.updatedAt;
        renderPcBoardTokens();
      } else if(result){
        pcLastKnownBoardTokensUpdatedAt = result.updatedAt;
      }
      pcBoardTokensPollNext(generation, slug);
    })
    .catch(function(){
      if(generation!==pcBoardTokensPollGeneration) return;
      setTimeout(function(){ pcBoardTokensPollNext(generation, slug); }, 3000);
    });
}

function setupConditionsToggle(){
  var btn = document.getElementById("conditions-toggle-btn");
  var widget = document.getElementById("conditions-widget");
  if(!btn || !widget) return;
  btn.addEventListener("click", function(){ widget.classList.toggle("expanded"); });
}

function adjustExhaustion(delta){
  var v = (Number(state.combat.exhaustion)||0) + delta;
  if(v<0) v = 0;
  if(v>6) v = 6;
  state.combat.exhaustion = v;
  setText("exhaustion-display", v);
  scheduleSave();
}

function renderSlots(){
  var el = document.getElementById("slots-grid");
  var slots = state.spellcasting.slots;
  var out = "";
  for(var i=0;i<9;i++){
    out += '<div class="slot-card">'+
      '<div class="slot-level">Level '+(i+1)+'</div>'+
      '<div class="slot-sub">Max</div>'+
      '<input type="number" min="0" class="slot-input mono no-spin" data-bind="spellcasting.slots.'+i+'.total" value="'+slots[i].total+'" title="Max slots">'+
      '<div class="slot-row">'+
      '<button class="btn resource-btn" onclick="adjustSlot('+i+',-1)">-</button>'+
      '<input type="number" min="0" class="slot-input mono no-spin" data-bind="spellcasting.slots.'+i+'.current" value="'+slots[i].current+'" title="Slots remaining">'+
      '<button class="btn resource-btn" onclick="adjustSlot('+i+',1)">+</button>'+
      '</div>'+
      '<div class="slot-sub">Left</div>'+
      '</div>';
  }
  var pact = state.spellcasting.pact;
  if(pact && pact.slots>0){
    out += '<div class="slot-card">'+
      '<div class="slot-level">Pact (Lv '+pact.level+')</div>'+
      '<div class="slot-sub">Max</div>'+
      '<div class="mono" style="font-size:12.5px;font-weight:700;color:var(--brass-bright);">'+pact.slots+'</div>'+
      '<div class="slot-row">'+
      '<button class="btn resource-btn" onclick="adjustPactSlot(-1)">-</button>'+
      '<input type="number" min="0" class="slot-input mono no-spin" data-bind="spellcasting.pact.current" value="'+pact.current+'" title="Pact slots remaining">'+
      '<button class="btn resource-btn" onclick="adjustPactSlot(1)">+</button>'+
      '</div>'+
      '<div class="slot-sub">Left</div>'+
      '</div>';
  }
  el.innerHTML = out;
}
function adjustPactSlot(delta){
  var p = state.spellcasting.pact;
  var cur = (Number(p.current)||0) + delta;
  if(cur<0) cur = 0;
  if(cur>p.slots) cur = p.slots;
  p.current = cur;
  syncBind("spellcasting.pact.current");
  scheduleSave();
}
function clampPactField(){
  var p = state.spellcasting.pact;
  var cur = Number(p.current)||0;
  if(cur<0) cur = 0;
  if(cur>p.slots) cur = p.slots;
  p.current = cur;
  syncBind("spellcasting.pact.current");
}

function renderHitDice(){
  var el = document.getElementById("hitdice-list");
  if(!el) return;
  el.innerHTML = state.combat.hitDicePools.map(function(p,i){
    return '<div class="hd-pool-row">'+
      '<span class="hd-pool-label" title="'+esc(p.class||"Hit Dice")+'"><span class="mono">d'+p.die+'</span> '+esc(p.class||"—")+'</span>'+
      '<span class="sep">used</span>'+
      '<input type="number" min="0" class="hd-pool-input" data-bind="combat.hitDicePools.'+i+'.used" value="'+(p.used||0)+'">'+
      '<span class="hd-pool-count mono">/ '+p.total+'</span>'+
      '</div>';
  }).join("");
}
function adjustSlot(i, delta){
  var s = state.spellcasting.slots[i];
  var max = Number(s.total)||0;
  var cur = (Number(s.current)||0) + delta;
  if(cur<0) cur = 0;
  if(cur>max) cur = max;
  s.current = cur;
  syncBind("spellcasting.slots."+i+".current");
  scheduleSave();
}
function clampSlotField(i, field){
  var s = state.spellcasting.slots[i];
  if(!s) return;
  if(field==="total"){
    var max = Math.max(0, Number(s.total)||0);
    s.total = max;
    if((Number(s.current)||0) > max){ s.current = max; syncBind("spellcasting.slots."+i+".current"); }
  }else{
    var maxv = Math.max(0, Number(s.total)||0);
    var cur = Number(s.current)||0;
    if(cur<0) cur = 0;
    if(cur>maxv) cur = maxv;
    s.current = cur;
    syncBind("spellcasting.slots."+i+".current");
  }
}
function adjustCurrency(key, sign){
  var amtInput = document.getElementById("coin-amt-"+key);
  var amt = amtInput ? Math.abs(Number(amtInput.value)||0) : 0;
  if(!amt) amt = 1;
  var cur = (Number(state.currency[key])||0) + sign*amt;
  if(cur<0) cur = 0;
  state.currency[key] = cur;
  syncBind("currency."+key);
  renderComputed();
  scheduleSave();
}

var COIN_VALUE_IN_GP = {cp:0.01, sp:0.1, ep:0.5, gp:1, pp:10};

function currencyTotalValueGp(){
  var total = 0;
  Object.keys(COIN_VALUE_IN_GP).forEach(function(key){
    total += (Number(state.currency[key])||0) * COIN_VALUE_IN_GP[key];
  });
  return Math.round(total*100)/100;
}

function renderAttacks(){
  var el = document.getElementById("attacks-body");
  var attacksHtml = state.attacks.map(function(a,i){
    return '<div class="entry-card">'+
      '<div class="entry-top">'+
      '<textarea rows="1" class="entry-name auto-grow" data-bind="attacks.'+i+'.name" placeholder="Weapon">'+esc(a.name)+'</textarea>'+
      '<input type="text" class="entry-narrow" data-bind="attacks.'+i+'.bonus" value="'+esc(a.bonus)+'" placeholder="+5">'+
      '<textarea rows="1" class="entry-mid auto-grow" data-bind="attacks.'+i+'.damage" placeholder="1d8+3 slashing">'+esc(a.damage)+'</textarea>'+
      '<button class="entry-toggle" onclick="toggleEntry(this)">▸</button>'+
      '<button class="row-del" onclick="removeAttack('+i+')">&times;</button>'+
      '</div>'+
      '<textarea rows="1" class="entry-notes auto-grow" data-bind="attacks.'+i+'.notes" placeholder="Notes">'+esc(a.notes)+'</textarea>'+
      '</div>';
  }).join("");
  var cantripIdx = sortedSpellIndices(function(i){ return !!state.spells[i].combat && (Number(state.spells[i].level)||0)===0; });
  var cantripsHtml = cantripIdx.map(function(i){ return cantripCardHtml(i); }).join("");
  el.innerHTML = attacksHtml + cantripsHtml;
  el.querySelectorAll(".auto-grow").forEach(autoGrow);
}

function cantripCardHtml(i){
  var sp = state.spells[i];
  return '<div class="entry-card">'+
    '<div class="entry-top">'+
    '<input type="checkbox" class="entry-check" data-bind="spells.'+i+'.prepared" '+(sp.prepared?"checked":"")+' title="Prepared">'+
    '<textarea rows="1" class="entry-name auto-grow" data-bind="spells.'+i+'.name" placeholder="Cantrip name">'+esc(sp.name)+'</textarea>'+
    '<button class="entry-toggle" onclick="toggleEntry(this)">▸</button>'+
    '<button class="row-del" onclick="removeSpell('+i+')">&times;</button>'+
    '</div>'+
    '<textarea rows="1" class="entry-notes auto-grow" data-bind="spells.'+i+'.notes" placeholder="Notes">'+esc(sp.notes)+'</textarea>'+
    '</div>';
}
function addAttack(){ state.attacks.push({name:"",bonus:"",damage:"",notes:""}); renderAttacks(); scheduleSave(); }
function removeAttack(i){ state.attacks.splice(i,1); renderAttacks(); scheduleSave(); }

function toggleEntry(btn){
  var card = btn.closest(".entry-card");
  var expanded = card.classList.toggle("expanded");
  btn.textContent = expanded ? "▾" : "▸";
  if(expanded){
    var ta = card.querySelector(".entry-notes");
    if(ta) autoGrow(ta);
  }
}

var equipmentSearchQuery = "";
function setEquipmentSearch(v){
  equipmentSearchQuery = (v||"").trim().toLowerCase();
  renderEquipment();
}

var equipDragSrcIndex = null;

function reindexAfterMove(map, from, to){
  var result = {};
  Object.keys(map).forEach(function(k){
    var oi = Number(k);
    var ni;
    if(oi===from) ni = to;
    else if(from < to){ ni = (oi > from && oi <= to) ? oi-1 : oi; }
    else { ni = (oi >= to && oi < from) ? oi+1 : oi; }
    result[ni] = map[k];
  });
  return result;
}

function reorderEquipment(from, to){
  if(from===to) return;
  var item = state.equipment.splice(from,1)[0];
  state.equipment.splice(to,0,item);
  expandedEquipment = reindexAfterMove(expandedEquipment, from, to);
  expandedSendPickers = reindexAfterMove(expandedSendPickers, from, to);
  renderEquipment();
  scheduleSave();
}

function handleEquipDragStart(e, i){
  equipDragSrcIndex = i;
  var tr = e.currentTarget.closest("tr");
  try{
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(i));
    e.dataTransfer.setDragImage(tr, 10, 10);
  }catch(err){}
  tr.classList.add("dragging");
}
function handleEquipDragOver(e){
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.classList.add("drag-over");
}
function handleEquipDragLeave(e){
  e.currentTarget.classList.remove("drag-over");
}
function handleEquipDrop(e, i){
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");
  var src = equipDragSrcIndex;
  equipDragSrcIndex = null;
  if(src===null || src===undefined || src===i) return;
  reorderEquipment(src, i);
}
function handleEquipDragEnd(){
  document.querySelectorAll("#equipment-body tr.dragging").forEach(function(tr){ tr.classList.remove("dragging"); });
  document.querySelectorAll("#equipment-body tr.drag-over").forEach(function(tr){ tr.classList.remove("drag-over"); });
  equipDragSrcIndex = null;
}

function equipSendRowHtml(i){
  var it = state.equipment[i];
  var campaign = (state.meta.campaign||"").trim();
  if(!campaign){
    return '<div class="campaign-chip-hint">Set a Campaign in Details to send items to other players.</div>';
  }
  var mates = lastRosterList.filter(function(c){
    return c.id!==currentId && ((c.meta&&c.meta.campaign)||"").trim().toLowerCase()===campaign.toLowerCase();
  });
  if(!mates.length){
    return '<div class="campaign-chip-hint">No other characters in this campaign yet.</div>';
  }
  var maxQty = Math.max(1, Number(it.qty)||1);
  return '<div class="send-item-row">'+
    '<label class="send-item-qty-label">Qty <input type="number" min="1" max="'+maxQty+'" value="1" id="send-qty-'+i+'" class="send-item-qty"></label>'+
    '<div class="campaign-chip-row">'+
    mates.map(function(c){
      var name = (c.name && c.name.trim()) ? c.name : "(unnamed)";
      return '<button type="button" class="campaign-chip" onclick="sendEquipmentItemTo('+i+',\''+esc(c.id)+'\',\''+esc(name)+'\')">'+esc(name)+'</button>';
    }).join("")+
    '</div>'+
    '</div>';
}

function renderEquipment(){
  var el = document.getElementById("equipment-body");
  var q = equipmentSearchQuery;
  el.innerHTML = state.equipment.map(function(it,i){
    if(q && (it.name||"").toLowerCase().indexOf(q)===-1) return "";
    var effects = it.effects||[];
    var isOpen = !!expandedEquipment[i];
    var isSendOpen = !!expandedSendPickers[i];
    return '<tr ondragover="handleEquipDragOver(event)" ondragleave="handleEquipDragLeave(event)" ondrop="handleEquipDrop(event,'+i+')">'+
      '<td class="col-move"><span class="row-drag-handle" draggable="true" ondragstart="handleEquipDragStart(event,'+i+')" ondragend="handleEquipDragEnd()" title="Drag to reorder"></span></td>'+
      '<td><input data-bind="equipment.'+i+'.name" value="'+esc(it.name)+'" placeholder="Item"></td>'+
      '<td><input type="number" min="0" data-bind="equipment.'+i+'.qty" value="'+(it.qty||0)+'"></td>'+
      '<td class="col-weight"><input type="number" min="0" step="0.1" data-bind="equipment.'+i+'.weight" value="'+(it.weight||0)+'"></td>'+
      '<td class="col-equipped" style="text-align:center;"><input type="checkbox" data-bind="equipment.'+i+'.equipped" '+(it.equipped?"checked":"")+' title="Equipped"></td>'+
      '<td style="text-align:center;"><input type="checkbox" data-bind="equipment.'+i+'.attuned" '+(it.attuned?"checked":"")+' title="Attuned"></td>'+
      '<td><textarea rows="1" class="auto-grow" data-bind="equipment.'+i+'.notes" placeholder="Notes">'+esc(it.notes)+'</textarea></td>'+
      '<td class="col-equip-toggle" style="text-align:center;">'+
        '<button class="entry-toggle" onclick="toggleEquipRow(this,'+i+')" title="Effects"><span class="caret">'+(isOpen?"&#9662;":"&#9656;")+'</span>'+(effects.length?" "+effects.length:"")+'</button>'+
        '<button class="entry-toggle" onclick="toggleEquipSendRow(this,'+i+')" title="Send to another player">&#8594;</button>'+
      '</td>'+
      '<td><button class="row-del" onclick="removeEquipment('+i+')">&times;</button></td>'+
      '</tr>'+
      '<tr class="equip-effects-row" style="display:'+(isOpen?"table-row":"none")+';"><td colspan="9">'+effectRowsHtml("equipment", i, effects)+'</td></tr>'+
      '<tr class="equip-send-row" style="display:'+(isSendOpen?"table-row":"none")+';"><td colspan="9">'+(isSendOpen?equipSendRowHtml(i):"")+'</td></tr>';
  }).join("");
  el.querySelectorAll(".auto-grow").forEach(autoGrow);
}
function addEquipment(){ state.equipment.push({name:"",qty:1,weight:0,notes:"",attuned:false,equipped:false,effects:[]}); renderEquipment(); scheduleSave(); }
function removeEquipment(i){
  state.equipment.splice(i,1);
  expandedEquipment = reindexAfterRemoval(expandedEquipment, i);
  expandedSendPickers = reindexAfterRemoval(expandedSendPickers, i);
  renderEquipment(); renderComputed(); scheduleSave();
}

function toggleEquipSendRow(btn, i){
  expandedSendPickers[i] = !expandedSendPickers[i];
  renderEquipment();
}

function sendEquipmentItemTo(i, targetId, targetName){
  var it = state.equipment[i];
  if(!it) return;
  var qtyInput = document.getElementById("send-qty-"+i);
  var sendQty = Math.max(1, Number(qtyInput && qtyInput.value)||1);
  var ownQty = Math.max(1, Number(it.qty)||1);
  if(sendQty>ownQty) sendQty = ownQty;
  var payloadItem = {name: it.name, qty: sendQty, weight: it.weight||0, notes: it.notes||"", from: state.meta.name||"Another player"};
  fetch("/api/inbox/"+encodeURIComponent(targetId), {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({item: payloadItem})
  }).then(function(r){
    if(!r.ok) throw new Error("send failed");
    if(sendQty>=ownQty){
      removeEquipment(i);
    }else{
      it.qty = ownQty - sendQty;
      expandedSendPickers[i] = false;
      renderEquipment();
      scheduleSave();
    }
    setText("save-status", "Sent "+payloadItem.name+" to "+targetName);
  }).catch(function(){
    alert("Could not send item — is the server running?");
  });
}

function toggleEquipRow(btn, i){
  expandedEquipment[i] = !expandedEquipment[i];
  var row = btn.closest("tr");
  var next = row.nextElementSibling;
  if(!next || !next.classList.contains("equip-effects-row")) return;
  var showing = !!expandedEquipment[i];
  next.style.display = showing ? "table-row" : "none";
  var caret = btn.querySelector(".caret");
  if(caret) caret.innerHTML = showing ? "&#9662;" : "&#9656;";
}

function spellCardHtml(i, editableLevel){
  var sp = state.spells[i];
  var levelField = editableLevel
    ? '<input type="number" min="0" max="9" class="entry-tiny" data-bind="spells.'+i+'.level" value="'+(sp.level||0)+'" title="Level">'
    : '<input type="number" class="entry-tiny" value="'+(sp.level||0)+'" title="Level (edit on the Spells tab)" disabled>';
  var combatField = editableLevel
    ? '<label class="combat-toggle" title="Combat spell"><input type="checkbox" data-bind="spells.'+i+'.combat" '+(sp.combat?"checked":"")+'>⚔</label>'
    : '';
  return '<div class="entry-card">'+
    '<div class="entry-top">'+
    '<input type="checkbox" class="entry-check" data-bind="spells.'+i+'.prepared" '+(sp.prepared?"checked":"")+' title="Prepared">'+
    levelField+
    '<textarea rows="1" class="entry-name auto-grow" data-bind="spells.'+i+'.name" placeholder="Spell name">'+esc(sp.name)+'</textarea>'+
    combatField+
    '<button class="entry-toggle" onclick="toggleEntry(this)">▸</button>'+
    '<button class="row-del" onclick="removeSpell('+i+')">&times;</button>'+
    '</div>'+
    '<textarea rows="1" class="entry-notes auto-grow" data-bind="spells.'+i+'.notes" placeholder="Notes">'+esc(sp.notes)+'</textarea>'+
    '</div>';
}

function sortedSpellIndices(filterFn){
  var indices = state.spells.map(function(_,i){ return i; }).filter(filterFn || function(){ return true; });
  indices.sort(function(a,b){
    var sa = state.spells[a], sb = state.spells[b];
    var la = Number(sa.level)||0, lb = Number(sb.level)||0;
    if(la!==lb) return la-lb;
    return String(sa.name||"").localeCompare(String(sb.name||""));
  });
  return indices;
}

function renderSpells(){
  var el = document.getElementById("combat-spells-body");
  if(!el) return;
  var indices = sortedSpellIndices(function(i){ return !!state.spells[i].combat && (Number(state.spells[i].level)||0)>0; });
  el.innerHTML = indices.map(function(i){ return spellCardHtml(i, false); }).join("");
  el.querySelectorAll(".auto-grow").forEach(autoGrow);
}

function spellLevelsToShow(){
  var levels = {0:true};
  for(var i=0;i<9;i++){
    if((Number(state.spellcasting.slots[i].total)||0) > 0) levels[i+1] = true;
  }
  state.spells.forEach(function(sp){ levels[Number(sp.level)||0] = true; });
  return Object.keys(levels).map(Number).sort(function(a,b){ return a-b; });
}

function renderSpellsOverview(){
  var el = document.getElementById("spells-overview");
  if(!el) return;
  var levels = spellLevelsToShow();
  el.innerHTML = levels.map(function(lvl){
    var atLevel = sortedSpellIndices(function(i){ return (Number(state.spells[i].level)||0)===lvl; });
    var combatIdx = atLevel.filter(function(i){ return !!state.spells[i].combat; });
    var utilityIdx = atLevel.filter(function(i){ return !state.spells[i].combat; });
    var title = lvl===0 ? "Cantrips" : "Level "+lvl;
    return '<div class="panel">'+
      '<div class="section-title">'+title+'</div>'+
      '<div class="dual-col">'+
        '<div>'+
          '<div class="spell-subcol-title">Combat</div>'+
          '<div class="entry-list">'+combatIdx.map(function(i){ return spellCardHtml(i, true); }).join("")+'</div>'+
          '<button class="btn add-row-btn" onclick="addSpellAt('+lvl+',true)">+ Add Combat Spell</button>'+
        '</div>'+
        '<div>'+
          '<div class="spell-subcol-title">Non-Combat</div>'+
          '<div class="entry-list">'+utilityIdx.map(function(i){ return spellCardHtml(i, true); }).join("")+'</div>'+
          '<button class="btn add-row-btn" onclick="addSpellAt('+lvl+',false)">+ Add Non-Combat Spell</button>'+
        '</div>'+
      '</div>'+
      '</div>';
  }).join("");
  el.querySelectorAll(".auto-grow").forEach(autoGrow);
}

function addSpellAt(level, combat){
  state.spells.push({level:level, name:"", prepared:false, notes:"", combat:!!combat});
  renderAttacks();
  renderSpells();
  renderSpellsOverview();
  scheduleSave();
}
function removeSpell(i){
  state.spells.splice(i,1);
  renderAttacks();
  renderSpells();
  renderSpellsOverview();
  scheduleSave();
}

var SUMMON_LABEL_MAP = [
  [["Armor Class","AC"],"ac"],
  [["Hit Points","HP"],"hpRaw"],
  [["Initiative"],"initiative"],
  [["Speed"],"speed"],
  [["Saving Throws"],"saves"],
  [["Skills"],"skills"],
  [["Damage Vulnerabilities","Vulnerabilities"],"vulnerabilities"],
  [["Damage Resistances","Resistances"],"resistances"],
  [["Damage Immunities"],"immunities"],
  [["Condition Immunities"],"conditionImmunities"],
  [["Senses"],"senses"],
  [["Languages"],"languages"],
  [["Challenge","CR"],"cr"],
  [["Proficiency Bonus","PB"],"profBonus"]
];
var SUMMON_SECTION_MAP = {
  "traits":"traits",
  "actions":"actions",
  "bonus actions":"bonusActions",
  "reactions":"reactions",
  "legendary actions":"legendary",
  "mythic actions":"legendary",
  "lair actions":"legendary"
};
var SUMMON_ABILITY_KEYS = ["str","dex","con","int","wis","cha"];

function defaultSummon(){
  return {
    name:"", meta:"", ac:"", initiative:"", hpMax:0, hpCurrent:0, hpFormula:"", speed:"", size:"medium",
    abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10},
    saves:"", skills:"", vulnerabilities:"", resistances:"", immunities:"",
    conditionImmunities:"", senses:"", languages:"", cr:"", profBonus:"",
    traits:"", actions:"", bonusActions:"", reactions:"", legendary:"",
    resources:[], notes:"", raw:""
  };
}

function matchSummonLabel(line){
  var lower = line.toLowerCase();
  for(var i=0;i<SUMMON_LABEL_MAP.length;i++){
    var aliases = SUMMON_LABEL_MAP[i][0];
    var key = SUMMON_LABEL_MAP[i][1];
    for(var j=0;j<aliases.length;j++){
      var alias = aliases[j];
      if(lower.indexOf(alias.toLowerCase())===0){
        var nextChar = line.charAt(alias.length);
        if(nextChar==="" || /\s/.test(nextChar)) return {label:alias, key:key};
      }
    }
  }
  return null;
}

function extractAbilitiesFromLines(lines, summon){
  var idxMap = {};
  for(var li=0; li<lines.length; li++){
    var t = lines[li].toLowerCase();
    if(SUMMON_ABILITY_KEYS.indexOf(t)!==-1 && idxMap[t]===undefined){ idxMap[t] = li; }
  }
  var allFound = SUMMON_ABILITY_KEYS.every(function(k){ return idxMap[k]!==undefined; });
  if(!allFound) return false;

  SUMMON_ABILITY_KEYS.forEach(function(k){
    var scoreLine = lines[idxMap[k]+1];
    var sm = scoreLine && scoreLine.match(/^(\d+)/);
    if(sm){ summon.abilities[k] = Number(sm[1]); }
  });

  var order = SUMMON_ABILITY_KEYS.slice().sort(function(a,b){ return idxMap[a]-idxMap[b]; });
  var minIdx = idxMap[order[0]];
  var lastIdx = idxMap[order[order.length-1]];

  var endIdx = lastIdx;
  for(var e=lastIdx+1; e<lines.length && e<=lastIdx+3; e++){
    if(/^[+\-−]?\d+$/.test(lines[e])){ endIdx = e; } else break;
  }
  var startIdx = minIdx;
  while(startIdx>0){
    var prevTok = lines[startIdx-1].toLowerCase();
    if(prevTok==="mod" || prevTok==="save"){ startIdx--; } else break;
  }
  lines.splice(startIdx, endIdx-startIdx+1);
  return true;
}

function extractAbilitiesInline(lines, summon){
  var joined = lines.join(" ");
  var strIdx = joined.search(/\bSTR\b/i);
  if(strIdx===-1) return false;
  var scan = joined.slice(strIdx, strIdx+400);
  var re = /(\d+)\s*\(([+\-−]?\d+)\)/g;
  var m, found=[];
  while((m = re.exec(scan)) && found.length<6){ found.push(Number(m[1])); }
  if(found.length!==6) return false;
  SUMMON_ABILITY_KEYS.forEach(function(k,i){ summon.abilities[k]=found[i]; });
  return true;
}

function parseStatblock(text){
  var summon = defaultSummon();
  summon.raw = text;
  var raw = String(text||"").replace(/\r\n/g,"\n");

  var lines = raw.split("\n").map(function(l){ return l.trim(); }).filter(function(l){ return l.length; });

  if(!extractAbilitiesFromLines(lines, summon)){
    extractAbilitiesInline(lines, summon);
  }

  var idx = 0;
  summon.name = lines[idx] || "";
  if(summon.name) idx++;

  var metaIdx = -1;
  for(var k=idx; k<Math.min(idx+6, lines.length); k++){
    if(/^(Tiny|Small|Medium|Large|Huge|Gargantuan)\b/i.test(lines[k])){ metaIdx = k; break; }
    if(matchSummonLabel(lines[k])) break;
  }
  if(metaIdx!==-1){
    summon.meta = lines[metaIdx];
    idx = metaIdx+1;
  }else if(lines[idx] && !matchSummonLabel(lines[idx])){
    summon.meta = lines[idx];
    idx++;
  }
  if(summon.meta){
    var metaParts = summon.meta.split(",");
    if(metaParts.length>1){ metaParts.pop(); summon.meta = metaParts.join(",").trim(); }
    var sizeMatch = summon.meta.match(/^(Tiny|Small|Medium|Large|Huge|Gargantuan)\b/i);
    if(sizeMatch){ summon.size = sizeMatch[1].toLowerCase(); }
  }

  while(idx < lines.length){
    var immMatch = /^Immunities\b[:\s]*/i.exec(lines[idx]);
    if(immMatch){
      var immRest = lines[idx].slice(immMatch[0].length).trim();
      var immParts = immRest.split(";");
      summon.immunities = (immParts[0]||"").trim();
      summon.conditionImmunities = (immParts[1]||"").trim();
      idx++;
      continue;
    }
    var matched = matchSummonLabel(lines[idx]);
    if(!matched) break;
    var value = lines[idx].slice(matched.label.length).replace(/^[:\s]+/,"").trim();
    summon[matched.key] = value;
    idx++;
  }

  if(summon.initiative){
    summon.initiative = summon.initiative.replace(/\s*\([^)]*\)\s*$/,"").trim();
  }

  if(summon.hpRaw){
    var hpMatch = summon.hpRaw.match(/^(\d+)\s*(\(.*\))?/);
    if(hpMatch){
      summon.hpMax = Number(hpMatch[1])||0;
      summon.hpCurrent = summon.hpMax;
      summon.hpFormula = hpMatch[2] || "";
    }
  }
  delete summon.hpRaw;

  var section = "traits";
  var buckets = {traits:[], actions:[], bonusActions:[], reactions:[], legendary:[], footer:[]};
  for(; idx<lines.length; idx++){
    var line = lines[idx];
    var lower = line.toLowerCase().replace(/\s*\(.*\)\s*$/,"");
    if(SUMMON_SECTION_MAP.hasOwnProperty(lower)){
      section = SUMMON_SECTION_MAP[lower];
      continue;
    }
    if(/^(source|habitat)\s*:/i.test(line)){
      buckets.footer.push(line);
      continue;
    }
    buckets[section].push(line);
  }
  summon.traits = buckets.traits.join("\n");
  summon.actions = buckets.actions.join("\n");
  summon.bonusActions = buckets.bonusActions.join("\n");
  summon.reactions = buckets.reactions.join("\n");
  summon.legendary = buckets.legendary.join("\n");
  summon.notes = buckets.footer.join("\n");

  return summon;
}

function importSummon(){
  var ta = document.getElementById("summon-import-text");
  var text = ta.value.trim();
  if(!text) return;
  var summon = parseStatblock(text);
  state.summons.push(summon);
  ta.value = "";
  renderSummons();
  scheduleSave();
}

function removeSummon(i){
  if(!confirm("Remove this summon?")) return;
  state.summons.splice(i,1);
  renderSummons();
  scheduleSave();
}

function adjustSummonHp(i, delta){
  var s = state.summons[i];
  var max = Number(s.hpMax)||0;
  var cur = (Number(s.hpCurrent)||0) + delta;
  if(cur<0) cur = 0;
  if(max>0 && cur>max) cur = max;
  s.hpCurrent = cur;
  renderSummons();
  scheduleSave();
}

function addSummonResource(i){
  state.summons[i].resources.push({name:"",current:0,max:0,notes:""});
  renderSummons();
  scheduleSave();
}
function removeSummonResource(i,j){
  state.summons[i].resources.splice(j,1);
  renderSummons();
  scheduleSave();
}
function adjustSummonResource(i,j,delta){
  var r = state.summons[i].resources[j];
  var max = Number(r.max)||0;
  var cur = (Number(r.current)||0) + delta;
  if(cur<0) cur = 0;
  if(max>0 && cur>max) cur = max;
  r.current = cur;
  renderSummons();
  scheduleSave();
}

function summonAbilityBoxHtml(i, key, label){
  var score = state.summons[i].abilities[key];
  return '<div class="summon-ability-chip">'+
    '<div class="summon-ability-seal"><span class="summon-ability-mod mono" id="summon-mod-'+i+'-'+key+'">'+fmt(mod(score))+'</span></div>'+
    '<div class="summon-ability-name">'+label+'</div>'+
    '<input type="number" class="summon-ability-score mono no-spin" data-bind="summons.'+i+'.abilities.'+key+'" value="'+score+'">'+
    '</div>';
}

function summonResourceHtml(i,j,r){
  return '<div class="resource-card">'+
    '<div class="top">'+
    '<input class="resource-name" data-bind="summons.'+i+'.resources.'+j+'.name" value="'+esc(r.name)+'" placeholder="Charge name">'+
    '<button class="row-del" onclick="removeSummonResource('+i+','+j+')">&times;</button>'+
    '</div>'+
    '<div class="resource-vals">'+
    '<button class="btn resource-btn" onclick="adjustSummonResource('+i+','+j+',-1)">-</button>'+
    '<input type="number" min="0" data-bind="summons.'+i+'.resources.'+j+'.current" value="'+(r.current||0)+'">'+
    '<span class="hp-sep">/</span>'+
    '<input type="number" min="0" data-bind="summons.'+i+'.resources.'+j+'.max" value="'+(r.max||0)+'">'+
    '<button class="btn resource-btn" onclick="adjustSummonResource('+i+','+j+',1)">+</button>'+
    '</div>'+
    '<textarea rows="1" class="resource-notes auto-grow" data-bind="summons.'+i+'.resources.'+j+'.notes" placeholder="Notes">'+esc(r.notes)+'</textarea>'+
    '</div>';
}

function summonTextFieldHtml(i, key, label, hideIfEmpty){
  var s = state.summons[i];
  if(hideIfEmpty && !s[key]) return "";
  return '<div class="field"><label>'+label+'</label>'+
    '<textarea rows="1" class="tall auto-grow" data-bind="summons.'+i+'.'+key+'" placeholder="'+label+'">'+esc(s[key])+'</textarea></div>';
}

function summonShortFieldHtml(i, key, label){
  var s = state.summons[i];
  return '<div class="field"><label>'+label+'</label>'+
    '<textarea rows="1" class="auto-grow" data-bind="summons.'+i+'.'+key+'" placeholder="'+label+'">'+esc(s[key])+'</textarea></div>';
}

function summonCardHtml(i){
  var s = state.summons[i];
  return '<div class="panel summon-card">'+
    '<div class="entry-top summon-name-row">'+
    '<textarea rows="1" class="entry-name auto-grow" data-bind="summons.'+i+'.name" placeholder="Summon name">'+esc(s.name)+'</textarea>'+
    '<button class="row-del" onclick="removeSummon('+i+')">&times;</button>'+
    '</div>'+
    '<div class="summon-details-grid" style="margin-bottom:var(--sp-2);">'+
    '<div class="field"><label>Type</label><textarea rows="1" class="auto-grow" data-bind="summons.'+i+'.meta" placeholder="e.g. Large Elemental">'+esc(s.meta)+'</textarea></div>'+
    '<div class="field"><label>Size (map token)</label><select data-bind="summons.'+i+'.size">'+sizeSelectOptionsHtml(s.size)+'</select></div>'+
    '</div>'+

    '<div class="summon-stat-row">'+
    '<div class="summon-mini-stat"><input data-bind="summons.'+i+'.ac" value="'+esc(s.ac)+'"><div class="lbl">AC</div></div>'+
    '<div class="summon-mini-stat"><input data-bind="summons.'+i+'.initiative" value="'+esc(s.initiative)+'"><div class="lbl">Initiative</div></div>'+
    '<div class="summon-mini-stat"><input data-bind="summons.'+i+'.speed" value="'+esc(s.speed)+'"><div class="lbl">Speed</div></div>'+
    '<div class="summon-mini-stat summon-hp-box">'+
    '<div class="resource-vals">'+
    '<button class="btn resource-btn" onclick="adjustSummonHp('+i+',-1)">-</button>'+
    '<input type="number" class="no-spin" style="width:34px;text-align:center;" data-bind="summons.'+i+'.hpCurrent" value="'+(s.hpCurrent||0)+'">'+
    '<span class="hp-sep">/</span>'+
    '<input type="number" class="no-spin" style="width:34px;text-align:center;" data-bind="summons.'+i+'.hpMax" value="'+(s.hpMax||0)+'">'+
    '<button class="btn resource-btn" onclick="adjustSummonHp('+i+',1)">+</button>'+
    '</div>'+
    '<div class="lbl">HP'+(s.hpFormula?' <span class="mono">'+esc(s.hpFormula)+'</span>':'')+'</div>'+
    '</div>'+
    '</div>'+

    '<div class="summon-abilities">'+
    ["str","dex","con","int","wis","cha"].map(function(k){ return summonAbilityBoxHtml(i,k,k.toUpperCase()); }).join("")+
    '</div>'+

    '<div class="summon-details-grid">'+
    summonShortFieldHtml(i,"saves","Saving Throws")+
    summonShortFieldHtml(i,"vulnerabilities","Vulnerabilities")+
    summonShortFieldHtml(i,"resistances","Resistances")+
    summonShortFieldHtml(i,"immunities","Damage Immunities")+
    summonShortFieldHtml(i,"conditionImmunities","Condition Immunities")+
    summonShortFieldHtml(i,"senses","Senses")+
    '</div>'+

    (function(){
      var blocks = [
        summonTextFieldHtml(i,"traits","Traits",true),
        summonTextFieldHtml(i,"actions","Actions",true),
        summonTextFieldHtml(i,"bonusActions","Bonus Actions",true),
        summonTextFieldHtml(i,"reactions","Reactions",true)
      ].filter(function(h){ return h; });
      return blocks.length ? '<div class="summon-text-grid">'+blocks.join("")+'</div>' : '';
    })()+
    summonTextFieldHtml(i,"legendary","Legendary Actions",true)+

    '<div class="section-title">Charges / Resources</div>'+
    '<div class="resources-row">'+
    s.resources.map(function(r,j){ return summonResourceHtml(i,j,r); }).join("")+
    '</div>'+
    '<button class="btn add-row-btn" onclick="addSummonResource('+i+')">+ Add Charge</button>'+

    summonTextFieldHtml(i,"notes","Notes")+
    '</div>';
}

function renderSummons(){
  var el = document.getElementById("summons-list");
  if(!el) return;
  el.innerHTML = state.summons.map(function(_,i){ return summonCardHtml(i); }).join("");
  el.querySelectorAll(".auto-grow").forEach(autoGrow);
  pcRenderSummonTokenSelect();
}

function renderResources(){
  var el = document.getElementById("resources-grid");
  el.innerHTML = state.resources.map(function(r,i){
    return '<div class="resource-card">'+
      '<div class="top">'+
      '<input class="resource-name" data-bind="resources.'+i+'.name" value="'+esc(r.name)+'" placeholder="Resource name">'+
      '<button class="row-del" onclick="removeResource('+i+')">&times;</button>'+
      '</div>'+
      '<div class="resource-vals">'+
      '<button class="btn resource-btn" onclick="adjustResource('+i+',-1)">-</button>'+
      '<input type="number" min="0" data-bind="resources.'+i+'.current" value="'+(r.current||0)+'">'+
      '<span class="hp-sep">/</span>'+
      '<input type="number" min="0" data-bind="resources.'+i+'.max" value="'+(r.max||0)+'">'+
      '<button class="btn resource-btn" onclick="adjustResource('+i+',1)">+</button>'+
      '</div>'+
      '<select class="resource-reset" data-bind="resources.'+i+'.resetOn" title="Resets on">'+
      '<option value="none"'+(!r.resetOn||r.resetOn==="none"?" selected":"")+'>Manual only</option>'+
      '<option value="short"'+(r.resetOn==="short"?" selected":"")+'>Resets: Short Rest</option>'+
      '<option value="long"'+(r.resetOn==="long"?" selected":"")+'>Resets: Long Rest</option>'+
      '</select>'+
      '<textarea rows="1" class="resource-notes auto-grow" data-bind="resources.'+i+'.notes" placeholder="Notes">'+esc(r.notes)+'</textarea>'+
      '</div>';
  }).join("");
  el.querySelectorAll(".auto-grow").forEach(autoGrow);
}
function addResource(){ state.resources.push({name:"",current:0,max:0,notes:"",resetOn:"none"}); renderResources(); scheduleSave(); }
function removeResource(i){ state.resources.splice(i,1); renderResources(); scheduleSave(); }
function adjustResource(i,delta){
  var r = state.resources[i];
  var max = Number(r.max)||0;
  var cur = (Number(r.current)||0) + delta;
  if(cur<0) cur = 0;
  if(max>0 && cur>max) cur = max;
  r.current = cur;
  renderResources();
  scheduleSave();
}

function renderSettings(){
  var el = document.getElementById("settings-list");
  if(!el) return;
  el.innerHTML = SETTINGS_DEFS.map(function(d){
    var key = d[0], label = d[1], desc = d[2];
    return '<label class="settings-row">'+
      '<input type="checkbox" data-bind="settings.'+key+'" '+(state.settings[key]?"checked":"")+'>'+
      '<span class="settings-row-text"><span class="settings-row-title">'+esc(label)+'</span><span class="settings-row-desc">'+esc(desc)+'</span></span>'+
      '</label>';
  }).join("");
}

function applySettings(){
  var s = state.settings;
  document.body.classList.toggle("hide-spellcasting", !s.spellcasting);
  document.body.classList.toggle("hide-summons", !s.summons);
  document.body.classList.toggle("hide-deathsaves", !s.deathSaves);
  document.body.classList.toggle("hide-inspiration", !s.inspiration);
  document.body.classList.toggle("hide-exhaustion", !s.exhaustion);
  document.body.classList.toggle("hide-encumbrance", !s.encumbrance);
  document.body.classList.toggle("hide-currency", !s.currency);
  document.body.classList.toggle("hide-initiative", !s.initiative);
  document.body.classList.toggle("hide-portraitbg", !s.portraitBackground);
  document.body.classList.toggle("hide-effects", !s.effects);
  document.body.classList.toggle("hide-flyspeed", !s.flySpeed);
  document.body.classList.toggle("hide-swimspeed", !s.swimSpeed);
  ensureActiveTabVisible();
}

function ensureActiveTabVisible(){
  var activeBtn = document.querySelector(".tab-btn.active");
  if(activeBtn && activeBtn.offsetParent===null){
    var firstVisible = Array.prototype.filter.call(document.querySelectorAll(".tab-btn"), function(b){ return b.offsetParent!==null; })[0];
    if(firstVisible) activateTab(firstVisible);
  }
}

var phoneMQ = window.matchMedia("(max-width:640px)");
var phoneLayoutActive = false;

function syncPhoneLayout(){
  var isPhone = phoneMQ.matches;
  if(isPhone===phoneLayoutActive) return;
  phoneLayoutActive = isPhone;
  var dashboardEl = document.getElementById("dashboard");
  var stickyTop = document.getElementById("sticky-top");
  var tabContent = document.querySelector(".tab-content");
  var tabsNav = document.querySelector(".tabs");
  var viewModeToggle = document.getElementById("view-mode-toggle");
  var dashboardTabBtn = document.getElementById("tab-btn-dashboard");
  if(!dashboardEl || !stickyTop || !tabContent || !tabsNav) return;

  if(isPhone){
    dashboardEl.classList.add("tab-panel");
    tabContent.insertBefore(dashboardEl, tabContent.firstChild);
    if(viewModeToggle){ dashboardEl.insertBefore(viewModeToggle, dashboardEl.firstChild); }
    if(dashboardTabBtn) activateTab(dashboardTabBtn);
  } else {
    dashboardEl.classList.remove("tab-panel", "active");
    var header = stickyTop.querySelector(".topbar");
    if(header && header.nextSibling){ stickyTop.insertBefore(dashboardEl, header.nextSibling); }
    else { stickyTop.appendChild(dashboardEl); }
    if(viewModeToggle){ tabsNav.appendChild(viewModeToggle); }
    ensureActiveTabVisible();
  }
}

function applyPhoneLayout(){
  syncPhoneLayout();
  if(phoneMQ.addEventListener){ phoneMQ.addEventListener("change", syncPhoneLayout); }
  else if(phoneMQ.addListener){ phoneMQ.addListener(syncPhoneLayout); }
}

var VIEW_MODE_KEY = "dndViewMode";

function setViewMode(mode){
  try{ localStorage.setItem(VIEW_MODE_KEY, mode); }catch(e){}
  document.body.classList.toggle("view-mode-combat", mode==="combat");
  document.body.classList.toggle("view-mode-noncombat", mode==="noncombat");
  document.querySelectorAll(".view-mode-btn").forEach(function(btn){
    btn.classList.toggle("view-mode-active", btn.dataset.mode===mode);
  });
  ensureActiveTabVisible();
}

function loadViewMode(){
  var mode = "all";
  try{ mode = localStorage.getItem(VIEW_MODE_KEY) || "all"; }catch(e){}
  setViewMode(mode);
}

function populateBindValues(){
  document.querySelectorAll("[data-bind]").forEach(function(el){
    var v = byPath(state, el.dataset.bind);
    if(el.type==="checkbox"){ el.checked = !!v; }
    else{ el.value = (v===undefined||v===null)?"":v; }
  });
  document.querySelectorAll("textarea.auto-grow").forEach(autoGrow);
}

function isEffectActive(effect, owner){
  var cond = effect.condition || "always";
  if(cond==="always") return true;
  if(cond==="equipped") return !!(owner && owner.equipped);
  if(cond==="attuned") return !!(owner && owner.attuned);
  if(cond==="manual") return !!effect.active;
  return false;
}

var EFFECT_OWNER_KINDS = [["features","Feature"],["equipment","Item"],["spellEffects","Spell Effect"]];

function effectOwnerList(kind){
  if(kind==="spellEffects") return (state.combat && state.combat.spellEffects) || [];
  return state[kind] || [];
}
function effectOwnerPath(kind){
  return kind==="spellEffects" ? "combat.spellEffects" : kind;
}
function rerenderEffectOwner(kind){
  if(kind==="features") renderFeatures();
  else if(kind==="equipment") renderEquipment();
  else if(kind==="spellEffects") renderSpellEffects();
}

function activeEffects(){
  if(state.settings && state.settings.effects===false) return [];
  var out = [];
  EFFECT_OWNER_KINDS.forEach(function(pair){
    var kind = pair[0], fallbackName = pair[1];
    effectOwnerList(kind).forEach(function(owner, oi){
      (owner.effects||[]).forEach(function(eff, ei){
        if(isEffectActive(eff, owner)){ out.push({effect:eff, sourceName:owner.name||fallbackName, sourceType:kind, sourceIndex:oi, effectIndex:ei}); }
      });
    });
  });
  return out;
}

function valueSourceOf(effect){
  return effect.valueSource || (effect.valueIsPB ? "pb" : "custom");
}

function valueSourceMultiplier(effect){
  return (effect.value===""||effect.value===undefined||effect.value===null) ? 1 : (Number(effect.value)||0);
}

function effectNumericValue(effect){
  var source = valueSourceOf(effect);
  if(source==="custom") return Number(effect.value)||0;
  var base = source==="pb" ? profBonus(totalLevel()) : (source==="level" ? totalLevel() : 0);
  return base * valueSourceMultiplier(effect);
}

function effectBonusTotal(target){
  return activeEffects().reduce(function(sum, e){
    return sum + (e.effect.target===target && e.effect.type==="bonus" ? effectNumericValue(e.effect) : 0);
  }, 0);
}

function effectSetValue(target){
  var vals = activeEffects().filter(function(e){ return e.effect.target===target && e.effect.type==="set"; }).map(function(e){ return effectNumericValue(e.effect); });
  return vals.length ? Math.max.apply(null, vals) : undefined;
}

function effectHasGrant(target, value){
  return activeEffects().some(function(e){
    if(e.effect.target!==target || e.effect.type!=="grant") return false;
    if(value===undefined) return true;
    return String(e.effect.value||"").trim().toLowerCase()===String(value).trim().toLowerCase();
  });
}

function effAbilityScore(key){
  var setV = effectSetValue("ability."+key);
  if(setV!==undefined) return setV;
  return (Number(state.abilities[key])||0) + effectBonusTotal("ability."+key);
}

function effectiveHpMax(){
  var setV = effectSetValue("hpMax");
  var base = setV!==undefined ? setV : (Number(state.combat.hpMax)||0);
  return base + effectBonusTotal("hpMax");
}

function effectiveSpeed(){
  var setV = effectSetValue("speed");
  var base = setV!==undefined ? setV : (Number(state.combat.speed)||0);
  return base + effectBonusTotal("speed");
}

function saveBonus(key, pb){
  return mod(effAbilityScore(key)) + ((state.saves[key] || effectHasGrant("saveProficiency."+key)) ? pb : 0) + effectBonusTotal("save."+key) + effectBonusTotal("saveAll");
}

function targetLabel(target){
  var found = EFFECT_TARGETS.find(function(t){ return t[0]===target; });
  return found ? found[1] : target;
}

function formatEffectValue(effect){
  if(effect.type==="note") return effect.value||"";
  if(effect.type==="grant") return effect.value ? String(effect.value) : "Granted";
  var source = valueSourceOf(effect);
  if(source!=="custom"){
    var label = source==="pb" ? "PB" : (source==="level" ? "Level" : source);
    var mult = valueSourceMultiplier(effect);
    var prefix = (mult===1?"":mult+"×")+label;
    var n = effectNumericValue(effect);
    return effect.type==="set" ? ("= "+prefix+" ("+n+")") : ("+"+prefix+" ("+fmt(n)+")");
  }
  var raw = Number(effect.value)||0;
  return effect.type==="set" ? ("= "+raw) : fmt(raw);
}

function effectOptionsHtml(selected){
  var groups = {}, order = [];
  EFFECT_TARGETS.forEach(function(t){
    if(!groups[t[2]]){ groups[t[2]] = []; order.push(t[2]); }
    groups[t[2]].push(t);
  });
  var html = '<option value=""'+(selected?"":" selected")+' disabled>Choose target…</option>';
  html += order.map(function(g){
    return '<optgroup label="'+esc(g)+'">'+groups[g].map(function(t){
      return '<option value="'+t[0]+'"'+(t[0]===selected?" selected":"")+'>'+esc(t[1])+'</option>';
    }).join("")+'</optgroup>';
  }).join("");
  return html;
}

function effectRowsHtml(kind, ownerIndex, effects){
  var pathPrefix = effectOwnerPath(kind);
  var conditions = kind==="equipment" ? EFFECT_CONDITIONS : EFFECT_CONDITIONS.filter(function(c){ return c[0]!=="equipped" && c[0]!=="attuned"; });
  return '<div class="fx-editor">'+
    (effects||[]).map(function(eff, ei){
      var base = pathPrefix+"."+ownerIndex+".effects."+ei;
      var cond = eff.condition||"always";
      var isNumeric = eff.type==="bonus"||eff.type==="set";
      var source = valueSourceOf(eff);
      var valuePlaceholder = (isNumeric && source!=="custom") ? "×1" : "Value";
      return '<div class="fx-row">'+
        '<select data-bind="'+base+'.target">'+effectOptionsHtml(eff.target)+'</select>'+
        '<select data-bind="'+base+'.type">'+EFFECT_TYPES.map(function(t){ return '<option value="'+t[0]+'"'+(t[0]===eff.type?" selected":"")+'>'+esc(t[1])+'</option>'; }).join("")+'</select>'+
        (isNumeric ? '<select class="fx-value-source" data-bind="'+base+'.valueSource" title="Where this effect gets its number from">'+VALUE_SOURCES.map(function(v){ return '<option value="'+v[0]+'"'+(v[0]===source?" selected":"")+'>'+esc(v[1])+'</option>'; }).join("")+'</select>' : '')+
        '<input type="text" class="fx-value" data-bind="'+base+'.value" value="'+esc(eff.value)+'" placeholder="'+valuePlaceholder+'" title="'+(isNumeric && source!=="custom" ? "Multiplier applied to "+(source==="pb"?"Proficiency Bonus":"Character Level")+" — leave blank for ×1" : "Value")+'">'+
        '<select data-bind="'+base+'.condition">'+conditions.map(function(c){ return '<option value="'+c[0]+'"'+(c[0]===cond?" selected":"")+'>'+esc(c[1])+'</option>'; }).join("")+'</select>'+
        (cond==="manual" ? '<label class="fx-active-toggle"><input type="checkbox" data-bind="'+base+'.active" '+(eff.active?"checked":"")+'> On</label>' : '')+
        '<button class="row-del" onclick="removeEffect(\''+kind+'\','+ownerIndex+','+ei+')">&times;</button>'+
        '</div>';
    }).join("") +
    '<button class="btn add-row-btn fx-add-btn" onclick="addEffect(\''+kind+'\','+ownerIndex+')">+ Add Effect</button>'+
    '</div>';
}

function addEffect(kind, ownerIndex){
  var owner = effectOwnerList(kind)[ownerIndex];
  if(!owner.effects) owner.effects = [];
  owner.effects.push({target:"", type:"bonus", value:"", condition:"always"});
  rerenderEffectOwner(kind);
  renderComputed();
  scheduleSave();
}
function removeEffect(kind, ownerIndex, effectIndex){
  var owner = effectOwnerList(kind)[ownerIndex];
  owner.effects.splice(effectIndex,1);
  rerenderEffectOwner(kind);
  renderComputed();
  scheduleSave();
}

function renderFeatures(){
  var el = document.getElementById("features-body");
  if(!el) return;
  el.innerHTML = (state.features||[]).map(function(f,i){
    var isOpen = !!expandedFeatures[i];
    return '<div class="entry-card'+(isOpen?" expanded":"")+'">'+
      '<div class="entry-top">'+
      '<select class="entry-source" data-bind="features.'+i+'.source">'+FEATURE_SOURCES.map(function(s){ return '<option value="'+esc(s)+'"'+(s===f.source?" selected":"")+'>'+esc(s)+'</option>'; }).join("")+'</select>'+
      '<textarea rows="1" class="entry-name auto-grow" data-bind="features.'+i+'.name" placeholder="Feature name">'+esc(f.name)+'</textarea>'+
      '<button class="entry-toggle" onclick="toggleFeatureCard(this,'+i+')">'+(isOpen?"▾":"▸")+'</button>'+
      '<button class="row-del" onclick="removeFeature('+i+')">&times;</button>'+
      '</div>'+
      '<textarea rows="1" class="entry-notes auto-grow" data-bind="features.'+i+'.description" placeholder="Description">'+esc(f.description)+'</textarea>'+
      effectRowsHtml("features", i, f.effects)+
      '</div>';
  }).join("");
  el.querySelectorAll(".auto-grow").forEach(autoGrow);
}
function toggleFeatureCard(btn, i){
  expandedFeatures[i] = !expandedFeatures[i];
  var card = btn.closest(".entry-card");
  var expanded = card.classList.toggle("expanded");
  btn.textContent = expanded ? "▾" : "▸";
  if(expanded){ var ta = card.querySelector(".entry-notes"); if(ta) autoGrow(ta); }
}
function addFeature(){ state.features.push({name:"",source:"Feat",description:"",effects:[]}); renderFeatures(); scheduleSave(); }
function removeFeature(i){
  state.features.splice(i,1);
  expandedFeatures = reindexAfterRemoval(expandedFeatures, i);
  renderFeatures(); renderComputed(); scheduleSave();
}

function renderActiveEffectsSummary(){
  var el = document.getElementById("active-effects-list");
  if(!el) return;
  var effects = activeEffects();
  if(!effects.length){ el.innerHTML = '<div class="footer-line">No active effects yet.</div>'; return; }
  el.innerHTML = effects.map(function(e){
    var eff = e.effect;
    var toggle = eff.condition==="manual" ? '<input type="checkbox" data-bind="'+effectOwnerPath(e.sourceType)+'.'+e.sourceIndex+'.effects.'+e.effectIndex+'.active" '+(eff.active?"checked":"")+'>' : '';
    return '<div class="active-effect-row">'+toggle+
      '<span class="active-effect-source">'+esc(e.sourceName)+'</span>'+
      '<span class="active-effect-target">'+esc(targetLabel(eff.target))+'</span>'+
      '<span class="active-effect-value">'+esc(formatEffectValue(eff))+'</span>'+
      '</div>';
  }).join("");
}

function skillBonus(key, pb){
  var s = state.skills[key];
  var ab = SKILLS.find(function(x){ return x[0]===key; })[2];
  var isExp = s.exp || effectHasGrant("skillExpertise."+key);
  var isProf = isExp || s.prof || effectHasGrant("skillProficiency."+key);
  return mod(effAbilityScore(ab)) + (isExp ? pb*2 : (isProf ? pb : 0)) + effectBonusTotal("skill."+key) + effectBonusTotal("skillAll") + effectBonusTotal("checkAll."+ab);
}

function renderComputed(){
  var lvl = totalLevel();
  var pb = profBonus(lvl) + effectBonusTotal("profBonus");
  setText("pb-display", fmt(pb));
  setText("class-summary-display", classSummaryText() || "—");
  setText("level-summary-display", lvl);

  ABILITIES.forEach(function(a){
    setText("mod-"+a[0], fmt(mod(effAbilityScore(a[0]))));
  });
  ABILITIES.forEach(function(a){
    var key = a[0];
    setText("save-"+key, fmt(saveBonus(key, pb)));
  });
  SKILLS.forEach(function(s){
    setText("skill-"+s[0], fmt(skillBonus(s[0], pb)));
  });
  setText("initiative-display", fmt(mod(effAbilityScore("dex")) + (Number(state.combat.initMisc)||0) + effectBonusTotal("initiative")));
  var acSet = effectSetValue("ac");
  var acBase = acSet!==undefined ? acSet : (10 + mod(effAbilityScore("dex")));
  setText("ac-display", acBase + (Number(state.combat.acBonus)||0) + effectBonusTotal("ac"));
  setText("passive-perception-display", 10 + skillBonus("perception", pb));
  setText("exhaustion-display", Number(state.combat.exhaustion)||0);

  var attunedCount = state.equipment.filter(function(it){ return !!it.attuned; }).length;
  setText("attuned-count", attunedCount+" / "+ATTUNEMENT_MAX);

  var sc = state.spellcasting.ability;
  setText("spell-dc", 8 + pb + mod(effAbilityScore(sc)) + effectBonusTotal("spellDC") + (Number(state.combat.spellDcMisc)||0));
  setText("spell-atk", fmt(pb + mod(effAbilityScore(sc)) + effectBonusTotal("spellAttack") + (Number(state.combat.spellAtkMisc)||0)));

  setText("carry-capacity", (effAbilityScore("str")*15)+" lb");
  var totalWeight = 0;
  state.equipment.forEach(function(it){ totalWeight += (Number(it.qty)||0) * (Number(it.weight)||0); });
  setText("total-weight", (Math.round(totalWeight*100)/100)+" lb");
  setText("currency-total-value", "Total: "+currencyTotalValueGp()+" gp");

  var hpEff = effectiveHpMax();
  var hpBadge = document.getElementById("hpmax-effect-badge");
  if(hpBadge){
    if(hpEff !== (Number(state.combat.hpMax)||0)){ hpBadge.style.display = "block"; hpBadge.textContent = "Effective: "+hpEff; }
    else{ hpBadge.style.display = "none"; }
  }
  var spEff = effectiveSpeed();
  var spBadge = document.getElementById("speed-effect-badge");
  if(spBadge){
    if(spEff !== (Number(state.combat.speed)||0)){ spBadge.style.display = "block"; spBadge.textContent = "Effective: "+spEff+" ft"; }
    else{ spBadge.style.display = "none"; }
  }

  var parts = [];
  parts.push("Level "+lvl);
  if(classSummaryText()) parts.push(classSummaryText());
  if(state.meta.race) parts.push(state.meta.race);
  setText("header-subtitle", parts.length ? parts.join(" · ") : "Unnamed Adventurer");

  renderActiveEffectsSummary();
}

function applyDamage(){
  var d = Number(document.getElementById("hp-delta").value)||0;
  var temp = Number(state.combat.hpTemp)||0;
  var cur = Number(state.combat.hpCurrent)||0;
  var dmg = d;
  if(temp>0){
    var used = Math.min(temp, dmg);
    temp -= used;
    dmg -= used;
  }
  cur = Math.max(0, cur-dmg);
  state.combat.hpTemp = temp;
  state.combat.hpCurrent = cur;
  populateBindValues();
  renderComputed();
  scheduleSave();
}
function applyHeal(){
  var d = Number(document.getElementById("hp-delta").value)||0;
  var cur = (Number(state.combat.hpCurrent)||0) + d;
  var max = effectiveHpMax();
  if(max>0) cur = Math.min(cur, max);
  state.combat.hpCurrent = cur;
  populateBindValues();
  renderComputed();
  scheduleSave();
}

function shortRest(){
  state.spellcasting.pact.current = state.spellcasting.pact.slots;
  state.resources.forEach(function(r){ if(r.resetOn==="short"){ r.current = r.max; } });
  populateBindValues();
  renderSlots();
  renderResources();
  renderComputed();
  scheduleSave();
}

function longRest(){
  state.combat.hpCurrent = effectiveHpMax();
  state.combat.hpTemp = 0;
  var totalDice = state.combat.hitDicePools.reduce(function(s,p){ return s+(Number(p.total)||0); }, 0);
  var totalUsed = state.combat.hitDicePools.reduce(function(s,p){ return s+(Number(p.used)||0); }, 0);
  var recover = Math.min(totalUsed, Math.max(1, Math.floor(totalDice/2)));
  for(var i=0; i<state.combat.hitDicePools.length && recover>0; i++){
    var p = state.combat.hitDicePools[i];
    var reduce = Math.min(Number(p.used)||0, recover);
    p.used = (Number(p.used)||0) - reduce;
    recover -= reduce;
  }
  state.combat.deathSuccess = [false,false,false];
  state.combat.deathFail = [false,false,false];
  state.combat.exhaustion = Math.max(0, (Number(state.combat.exhaustion)||0)-1);
  state.combat.concentration.active = false;
  state.spellcasting.slots.forEach(function(s){ s.current = s.total; });
  state.spellcasting.pact.current = state.spellcasting.pact.slots;
  state.resources.forEach(function(r){ if(r.resetOn==="short"||r.resetOn==="long"){ r.current = r.max; } });
  populateBindValues();
  renderSlots();
  renderHitDice();
  renderResources();
  renderComputed();
  scheduleSave();
}

function autoGrow(el){
  var scroller = document.querySelector(".tab-content");
  var prevScroll = scroller ? scroller.scrollTop : 0;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
  if(scroller) scroller.scrollTop = prevScroll;
}

function onSpeedModChanged(newMod){
  var prev = Number(state.combat.speedModPrev)||0;
  var delta = newMod - prev;
  if(delta!==0){
    state.combat.speed = (Number(state.combat.speed)||0) + delta;
    syncBind("combat.speed");
  }
  state.combat.speedModPrev = newMod;
}
function onFlySpeedModChanged(newMod){
  var prev = Number(state.combat.flySpeedModPrev)||0;
  var delta = newMod - prev;
  if(delta!==0){
    state.combat.flySpeed = (Number(state.combat.flySpeed)||0) + delta;
    syncBind("combat.flySpeed");
  }
  state.combat.flySpeedModPrev = newMod;
}
function onSwimSpeedModChanged(newMod){
  var prev = Number(state.combat.swimSpeedModPrev)||0;
  var delta = newMod - prev;
  if(delta!==0){
    state.combat.swimSpeed = (Number(state.combat.swimSpeed)||0) + delta;
    syncBind("combat.swimSpeed");
  }
  state.combat.swimSpeedModPrev = newMod;
}

function handleBind(e){
  var el = e.target;
  if(!el.dataset || !el.dataset.bind) return;
  if(el.tagName==="TEXTAREA" && el.classList.contains("auto-grow")){ autoGrow(el); }
  var val;
  if(el.type==="checkbox"){ val = el.checked; }
  else if(el.type==="number"){ val = el.value===""?"":Number(el.value); }
  else{ val = el.value; }
  setByPath(state, el.dataset.bind, val);
  document.querySelectorAll('[data-bind="'+el.dataset.bind+'"]').forEach(function(other){
    if(other===el) return;
    if(other.type==="checkbox"){ other.checked = !!val; }
    else{ other.value = val; }
  });
  var classFieldMatch = el.dataset.bind.match(/^meta\.classes\.\d+\.(class|level)$/);
  if(classFieldMatch){ if(e.type==="change"){ onClassesChanged(); } }
  else if(el.dataset.bind==="combat.speedMod"){ onSpeedModChanged(Number(val)||0); renderComputed(); }
  else if(el.dataset.bind==="combat.flySpeedMod"){ onFlySpeedModChanged(Number(val)||0); renderComputed(); }
  else if(el.dataset.bind==="combat.swimSpeedMod"){ onSwimSpeedModChanged(Number(val)||0); renderComputed(); }
  else{
    var slotMatch = el.dataset.bind.match(/^spellcasting\.slots\.(\d+)\.(total|current)$/);
    if(slotMatch){
      clampSlotField(Number(slotMatch[1]), slotMatch[2]);
      if(slotMatch[2]==="total" && e.type==="change") renderSpellsOverview();
    }
    if(el.dataset.bind==="spellcasting.pact.current"){
      clampPactField();
    }
    var spellGroupMatch = el.dataset.bind.match(/^spells\.\d+\.(level|combat)$/);
    if(spellGroupMatch && (spellGroupMatch[1]==="combat" || e.type==="change")){
      renderAttacks();
      renderSpells();
      renderSpellsOverview();
    }
    var summonAbilityMatch = el.dataset.bind.match(/^summons\.(\d+)\.abilities\.(str|dex|con|int|wis|cha)$/);
    if(summonAbilityMatch){
      setText("summon-mod-"+summonAbilityMatch[1]+"-"+summonAbilityMatch[2], fmt(mod(val)));
    }
    if(el.dataset.bind.indexOf("combat.conditions.")===0){
      updateConditionsSummary();
    }
    if(el.dataset.bind.indexOf("settings.")===0){
      applySettings();
    }
    var effectConditionMatch = el.dataset.bind.match(/^(features|equipment)\.\d+\.effects\.\d+\.(condition|valueSource|type)$/);
    if(effectConditionMatch && e.type==="change"){
      if(effectConditionMatch[1]==="features") renderFeatures(); else renderEquipment();
    }
    if(el.dataset.bind.match(/^combat\.spellEffects\.\d+\.effects\.\d+\.(condition|valueSource|type)$/) && e.type==="change"){
      renderSpellEffects();
    }
    if(el.dataset.bind==="meta.campaign" && e.type==="change"){
      initInitiativeTracker(); initBattleMap();
    }
    renderComputed();
  }
  scheduleSave();
}

function activateTab(btn){
  if(!btn) return;
  document.querySelectorAll(".tab-btn").forEach(function(b){ b.classList.remove("active"); });
  document.querySelectorAll(".tab-panel").forEach(function(p){ p.classList.remove("active"); });
  btn.classList.add("active");
  var panel = btn.dataset.tab==="dashboard" ? document.getElementById("dashboard") : document.getElementById("tab-"+btn.dataset.tab);
  if(!panel) return;
  panel.classList.add("active");
  panel.querySelectorAll("textarea.auto-grow").forEach(autoGrow);
  if(btn.dataset.tab==="battlemap"){ setTimeout(pcResetBoardView, 0); }
}

function setupTabs(){
  document.querySelectorAll(".tab-btn").forEach(function(btn){
    btn.addEventListener("click", function(){ activateTab(btn); });
  });
}

function setupColResizer(){
  var resizer = document.getElementById("col-resizer");
  var appEl = document.getElementById("app");
  var dragging = false;
  var saved;
  try{ saved = localStorage.getItem("ledger-col-split"); }catch(e){}
  if(saved) appEl.style.setProperty("--left-col-width", saved);
  resizer.addEventListener("pointerdown", function(e){
    dragging = true;
    resizer.classList.add("dragging");
    resizer.setPointerCapture(e.pointerId);
  });
  resizer.addEventListener("pointermove", function(e){
    if(!dragging) return;
    var rect = appEl.getBoundingClientRect();
    var min = 200, max = rect.width - 200 - 6;
    var x = e.clientX - rect.left;
    if(x < min) x = min;
    if(x > max) x = max;
    appEl.style.setProperty("--left-col-width", x + "px");
  });
  function stopDrag(){
    if(!dragging) return;
    dragging = false;
    resizer.classList.remove("dragging");
    try{ localStorage.setItem("ledger-col-split", appEl.style.getPropertyValue("--left-col-width")); }catch(e){}
  }
  resizer.addEventListener("pointerup", stopDrag);
  resizer.addEventListener("pointercancel", stopDrag);
}

function exportJSON(){
  var blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  var fname = (state.meta.name || "character").trim().replace(/\s+/g,"_").replace(/[^a-zA-Z0-9_-]/g,"") || "character";
  a.href = url;
  a.download = fname+".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importJSON(file){
  var reader = new FileReader();
  reader.onload = function(){
    try{
      var parsed = JSON.parse(reader.result);
      normalizeState(parsed);
      state = parsed;
      resetExpandedState();
      rebuildAll();
      initInitiativeTracker(); initBattleMap();
      scheduleSave();
    }catch(err){
      alert("That file could not be read as a character. Make sure it is a JSON export from this app.");
    }
  };
  reader.readAsText(file);
}

function rebuildAll(){
  autoFillSaves();
  renderPortrait();
  renderClasses();
  renderAbilities();
  renderSaves();
  renderSkills();
  renderSlots();
  renderHitDice();
  renderAttacks();
  renderEquipment();
  renderFeatures();
  renderSpells();
  renderSpellsOverview();
  renderSummons();
  renderResources();
  renderConditions();
  renderSpellEffects();
  renderSettings();
  populateBindValues();
  autoFillSpellAbility();
  renderComputed();
  applySettings();
  loadKnownCampaigns();
  renderPlayerColorPicker();
  populateSizeSelect();
}

function startFreshCharacter(){
  var newId = "char-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  currentId = newId;
  setStoredActiveId(newId);
  state = defaultState();
  state.meta.playerName = getCurrentPlayerName();
  resetExpandedState();
  rebuildAll();
  initInitiativeTracker(); initBattleMap();
  scheduleSave();
}

function newCharacter(){
  if(!confirm("Create a new character? Your current character stays saved on the server — switch back to it anytime from the Characters view.")) return;
  startFreshCharacter();
  refreshCharacterList();
  closeCharactersView();
}

function setupButtons(){
  document.getElementById("btn-toggle-characters").addEventListener("click", toggleCharactersView);
  document.getElementById("btn-pc-battlemap-zoom-in").addEventListener("click", function(){ pcZoomBoard(1.25); });
  document.getElementById("btn-pc-battlemap-zoom-out").addEventListener("click", function(){ pcZoomBoard(0.8); });
  document.getElementById("btn-pc-battlemap-zoom-reset").addEventListener("click", pcResetBoardView);
  document.querySelectorAll(".battlemap-tool-btn").forEach(function(btn){
    btn.addEventListener("click", function(){ pcSetActiveTool(btn.dataset.tool); });
  });
  document.getElementById("pc-battlemap-summon-select").addEventListener("change", pcAddSummonToken);
  document.querySelectorAll(".view-mode-btn").forEach(function(btn){
    btn.addEventListener("click", function(){ setViewMode(btn.dataset.mode); });
  });
  document.getElementById("btn-export").addEventListener("click", exportJSON);
  document.getElementById("btn-new").addEventListener("click", newCharacter);
  document.getElementById("btn-new-wizard").addEventListener("click", function(){ openWizard("create"); });
  document.getElementById("btn-view-trash").addEventListener("click", openTrashView);
  document.getElementById("btn-back-from-trash").addEventListener("click", closeTrashView);
  document.getElementById("btn-empty-trash").addEventListener("click", emptyTrash);
  document.getElementById("btn-go-home").addEventListener("click", function(){ location.href = "index.html"; });
  document.getElementById("btn-level-up").addEventListener("click", function(){ openWizard("levelup"); });
  document.querySelectorAll(".add-class-btn").forEach(function(btn){ btn.addEventListener("click", addClassRow); });
  document.getElementById("import-input").addEventListener("change", function(e){
    if(e.target.files && e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = "";
  });
  document.getElementById("portrait-input").addEventListener("change", function(e){
    if(e.target.files && e.target.files[0]) handlePortraitFile(e.target.files[0]);
    e.target.value = "";
  });
  document.getElementById("btn-remove-portrait").addEventListener("click", removePortrait);
  document.getElementById("add-attack").addEventListener("click", addAttack);
  document.getElementById("add-equipment").addEventListener("click", addEquipment);
  document.getElementById("equipment-search").addEventListener("input", function(e){ setEquipmentSearch(e.target.value); });
  document.getElementById("add-feature").addEventListener("click", addFeature);
  document.getElementById("add-resource").addEventListener("click", addResource);
  document.getElementById("btn-import-summon").addEventListener("click", importSummon);
  document.getElementById("btn-damage").addEventListener("click", applyDamage);
  document.getElementById("btn-heal").addEventListener("click", applyHeal);
  document.getElementById("btn-short-rest").addEventListener("click", shortRest);
  document.getElementById("btn-long-rest").addEventListener("click", longRest);
  setupConditionsToggle();
  document.getElementById("btn-add-effect").addEventListener("click", addSpellEffect);
  document.getElementById("effect-add-input").addEventListener("keydown", function(e){
    if(e.key==="Enter"){ e.preventDefault(); addSpellEffect(); }
  });
  document.getElementById("btn-add-initiative").addEventListener("click", addInitiativeEntry);
  document.getElementById("initiative-name-input").addEventListener("keydown", function(e){
    if(e.key==="Enter"){ e.preventDefault(); document.getElementById("initiative-value-input").focus(); }
  });
  document.getElementById("initiative-name-input").addEventListener("input", function(){
    pendingInitiativeCharacterId = null;
  });
  document.getElementById("initiative-value-input").addEventListener("keydown", function(e){
    if(e.key==="Enter"){ e.preventDefault(); addInitiativeEntry(); }
  });
  document.getElementById("btn-initiative-prev").addEventListener("click", prevInitiativeTurn);
  document.getElementById("btn-initiative-next").addEventListener("click", nextInitiativeTurn);
  document.getElementById("btn-initiative-reset").addEventListener("click", resetInitiativeTracker);
  document.body.addEventListener("input", handleBind);
  document.body.addEventListener("change", handleBind);
  document.body.addEventListener("focusin", function(e){
    if(e.target && e.target.classList && e.target.classList.contains("curr-bulk")){
      e.target.select();
    }
  });
}

function asiLevelsFor(cls){
  return ASI_LEVELS[cls] || ASI_LEVELS.default;
}

function abilitySelectOptions(selected){
  return '<option value="">— choose —</option>'+ABILITIES.map(function(a){
    return '<option value="'+a[0]+'"'+(a[0]===selected?" selected":"")+'>'+a[1]+'</option>';
  }).join("");
}

var wizardState = null;

function newWizardState(mode){
  return {
    mode: mode,
    step: mode==="create" ? "identity" : "levelup-class",
    history: [],
    name:"", race:"", background:"", alignment:"", playerName:getCurrentPlayerName(), campaign:"",
    cls:"",
    abilityMethod:"array",
    abilities:{str:15,dex:14,con:13,int:12,wis:10,cha:8},
    bgAbilityMode:"2-1",
    bgAbilityPicks:[null,null,null],
    skillProfs:{},
    startingEquipment:[],
    levelUpClassIndex: null,
    levelUpNewClassName:"",
    targetClass:"",
    newLevel:1,
    hpMethod:"average",
    hpRoll:null,
    asiChoice:null,
    asiMode:"one",
    asiPicks:[null,null],
    featName:"",
    featDescription:"",
    newFeatures:[]
  };
}

function openWizard(mode){
  wizardState = newWizardState(mode);
  document.getElementById("wizard-overlay").style.display = "flex";
  renderWizardStep();
}

function closeWizard(){
  wizardState = null;
  document.getElementById("wizard-overlay").style.display = "none";
}

function wizardGoTo(stepId){
  wizardState.history.push(wizardState.step);
  wizardState.step = stepId;
  renderWizardStep();
}

function wizardBack(){
  if(!wizardState.history.length) return;
  wizardState.step = wizardState.history.pop();
  renderWizardStep();
}

function wizardNavHtml(opts){
  opts = opts||{};
  return '<div class="wizard-nav">'+
    '<button class="btn" onclick="closeWizard()">Cancel</button>'+
    '<div class="wizard-nav-right">'+
    (wizardState.history.length ? '<button class="btn" onclick="wizardBack()">Back</button>' : '')+
    '<button class="btn wizard-btn-primary" onclick="'+opts.nextFn+'">'+(opts.nextLabel||"Next")+'</button>'+
    '</div></div>';
}

function renderWizardStep(){
  var card = document.getElementById("wizard-card");
  if(!card || !wizardState) return;
  var html = "";
  switch(wizardState.step){
    case "identity": html = wizardStepIdentity(); break;
    case "class": html = wizardStepClass(); break;
    case "abilities": html = wizardStepAbilities(); break;
    case "bg-ability": html = wizardStepBackgroundBonus(); break;
    case "skills": html = wizardStepSkills(); break;
    case "levelup-class": html = wizardStepLevelUpClass(); break;
    case "hp": html = wizardStepHp(); break;
    case "asi": html = wizardStepAsi(); break;
    case "features": html = wizardStepFeatures(); break;
    case "equipment": html = wizardStepEquipment(); break;
    case "finish": html = wizardStepFinish(); break;
  }
  card.innerHTML = html;
  card.querySelectorAll(".auto-grow").forEach(autoGrow);
}

function wizardStepIdentity(){
  var w = wizardState;
  return '<div class="wizard-step-title">New Character — Identity</div>'+
    '<div class="wizard-grid">'+
      '<div class="wizard-field"><label>Name</label><input type="text" id="wiz-name" value="'+esc(w.name)+'" placeholder="Character name"></div>'+
      '<div class="wizard-field"><label>Race</label><input type="text" list="dl-races" id="wiz-race" value="'+esc(w.race)+'"></div>'+
      '<div class="wizard-field"><label>Background</label><input type="text" list="dl-backgrounds" id="wiz-background" value="'+esc(w.background)+'"></div>'+
      '<div class="wizard-field"><label>Alignment</label><input type="text" list="dl-alignments" id="wiz-alignment" value="'+esc(w.alignment)+'"></div>'+
      '<div class="wizard-field"><label>Player Name</label><input type="text" id="wiz-playerName" value="'+esc(w.playerName)+'"></div>'+
      '<div class="wizard-field"><label>Campaign</label><select id="wiz-campaign">'+campaignSelectOptionsHtml(w.campaign)+'</select></div>'+
    '</div>'+
    wizardNavHtml({nextFn:"wizardCommitIdentity()"});
}
function wizardCommitIdentity(){
  var w = wizardState;
  w.name = document.getElementById("wiz-name").value.trim();
  w.race = document.getElementById("wiz-race").value.trim();
  w.background = document.getElementById("wiz-background").value.trim();
  w.alignment = document.getElementById("wiz-alignment").value.trim();
  w.playerName = document.getElementById("wiz-playerName").value.trim();
  w.campaign = document.getElementById("wiz-campaign").value.trim();
  wizardGoTo("class");
}

function wizardStepClass(){
  var w = wizardState;
  return '<div class="wizard-step-title">Class</div>'+
    '<div class="wizard-field"><label>Class</label><input type="text" list="dl-classes" id="wiz-class" value="'+esc(w.cls)+'" placeholder="e.g. Fighter"></div>'+
    '<div class="footer-line">You\'ll start at level 1. You can add a second class later via Level Up.</div>'+
    wizardNavHtml({nextFn:"wizardCommitClass()"});
}
function wizardCommitClass(){
  var w = wizardState;
  var val = document.getElementById("wiz-class").value.trim();
  if(!val){ alert("Pick a class to continue."); return; }
  w.cls = val;
  wizardGoTo("abilities");
}

function wizardSetAbilityMethod(method){
  wizardState.abilityMethod = method;
  if(method==="array"){
    wizardState.abilities = {str:15,dex:14,con:13,int:12,wis:10,cha:8};
  }
  renderWizardStep();
}
function wizardAbilityArraySelectChanged(el, key){
  var w = wizardState;
  var newVal = Number(el.value)||8;
  var oldVal = w.abilities[key];
  var swapKey = null;
  ABILITIES.forEach(function(a){
    if(a[0]!==key && w.abilities[a[0]]===newVal) swapKey = a[0];
  });
  w.abilities[key] = newVal;
  if(swapKey) w.abilities[swapKey] = oldVal;
  renderWizardStep();
}
function wizardAbilityArrayHtml(){
  var w = wizardState;
  return '<div class="wizard-ability-grid">'+
    ABILITIES.map(function(a){
      return '<div class="wizard-ability-box"><label>'+a[1]+'</label>'+
        '<select onchange="wizardAbilityArraySelectChanged(this,\''+a[0]+'\')">'+STANDARD_ARRAY.map(function(v){ return '<option value="'+v+'"'+(v===w.abilities[a[0]]?" selected":"")+'>'+v+'</option>'; }).join("")+'</select>'+
        '</div>';
    }).join("")+
    '</div>';
}
function wizardAbilityManualHtml(){
  var w = wizardState;
  return '<div class="wizard-ability-grid">'+
    ABILITIES.map(function(a){
      return '<div class="wizard-ability-box"><label>'+a[1]+'</label>'+
        '<input type="number" id="wiz-ability-'+a[0]+'" value="'+(w.abilities[a[0]]||10)+'">'+
        '</div>';
    }).join("")+
    '</div>';
}
function wizardStepAbilities(){
  var w = wizardState;
  var isArray = w.abilityMethod==="array";
  var body = isArray ? wizardAbilityArrayHtml() : wizardAbilityManualHtml();
  return '<div class="wizard-step-title">Ability Scores</div>'+
    '<div class="wizard-method-toggle">'+
      '<button class="btn'+(isArray?" wizard-method-active":"")+'" onclick="wizardSetAbilityMethod(\'array\')">Standard Array</button>'+
      '<button class="btn'+(!isArray?" wizard-method-active":"")+'" onclick="wizardSetAbilityMethod(\'manual\')">Manual Entry</button>'+
    '</div>'+
    body+
    wizardNavHtml({nextFn:"wizardCommitAbilities()"});
}
function wizardCommitAbilities(){
  var w = wizardState;
  if(w.abilityMethod==="manual"){
    ABILITIES.forEach(function(a){
      var el = document.getElementById("wiz-ability-"+a[0]);
      w.abilities[a[0]] = Number(el.value)||10;
    });
  }
  wizardGoTo("bg-ability");
}

function wizardBackgroundBonusAmount(key){
  var w = wizardState;
  var picks = w.bgAbilityPicks||[];
  if(w.bgAbilityMode==="1-1-1") return picks.indexOf(key)!==-1 ? 1 : 0;
  if(picks[0]===key) return 2;
  if(picks[1]===key) return 1;
  return 0;
}
function wizardEffectiveAbility(key){
  return (Number(wizardState.abilities[key])||10) + wizardBackgroundBonusAmount(key);
}
function wizardBgAbilityOptions(allowedKeys, selected){
  return '<option value="">— choose —</option>'+allowedKeys.map(function(k){
    var a = ABILITIES.find(function(x){ return x[0]===k; });
    return '<option value="'+k+'"'+(k===selected?" selected":"")+'>'+a[1]+'</option>';
  }).join("");
}
function wizardSetBgAbilityMode(mode){
  wizardState.bgAbilityMode = mode;
  wizardState.bgAbilityPicks = [null,null,null];
  renderWizardStep();
}
function wizardStepBackgroundBonus(){
  var w = wizardState;
  var allowed = BACKGROUND_ABILITIES[w.background] || null;
  var allowedKeys = allowed || ABILITIES.map(function(a){ return a[0]; });
  var noteHtml = allowed
    ? '<div class="footer-line" style="margin-bottom:var(--sp-3);">Your background ('+esc(w.background)+') limits this to: '+
      allowed.map(function(k){ return ABILITIES.find(function(a){ return a[0]===k; })[1]; }).join(", ")+'.</div>'
    : '<div class="footer-line" style="margin-bottom:var(--sp-3);">We don\'t have ability data for "'+esc(w.background||"this background")+'" — choose any three.</div>';
  var isThree = w.bgAbilityMode==="1-1-1";
  var body = isThree
    ? '<div class="wizard-ability-grid">'+[0,1,2].map(function(i){
        return '<div class="wizard-ability-box"><label>+1 Ability</label><select id="wiz-bg-ability-'+i+'">'+wizardBgAbilityOptions(allowedKeys, w.bgAbilityPicks[i])+'</select></div>';
      }).join("")+'</div>'
    : '<div class="wizard-ability-grid">'+
        '<div class="wizard-ability-box"><label>+2 Ability</label><select id="wiz-bg-ability-0">'+wizardBgAbilityOptions(allowedKeys, w.bgAbilityPicks[0])+'</select></div>'+
        '<div class="wizard-ability-box"><label>+1 Ability</label><select id="wiz-bg-ability-1">'+wizardBgAbilityOptions(allowedKeys, w.bgAbilityPicks[1])+'</select></div>'+
      '</div>';
  return '<div class="wizard-step-title">Background Ability Bonus</div>'+
    noteHtml+
    '<div class="wizard-method-toggle">'+
      '<button class="btn'+(!isThree?" wizard-method-active":"")+'" onclick="wizardSetBgAbilityMode(\'2-1\')">+2 / +1</button>'+
      '<button class="btn'+(isThree?" wizard-method-active":"")+'" onclick="wizardSetBgAbilityMode(\'1-1-1\')">+1 / +1 / +1</button>'+
    '</div>'+
    body+
    wizardNavHtml({nextFn:"wizardCommitBackgroundBonus()"});
}
function wizardCommitBackgroundBonus(){
  var w = wizardState;
  if(w.bgAbilityMode==="1-1-1"){
    var picks = [0,1,2].map(function(i){ return document.getElementById("wiz-bg-ability-"+i).value; });
    if(picks.some(function(p){ return !p; })){ alert("Choose three abilities."); return; }
    if((new Set(picks)).size!==3){ alert("Choose three different abilities."); return; }
    w.bgAbilityPicks = picks;
  } else {
    var p0 = document.getElementById("wiz-bg-ability-0").value;
    var p1 = document.getElementById("wiz-bg-ability-1").value;
    if(!p0 || !p1){ alert("Choose both abilities."); return; }
    if(p0===p1){ alert("Choose two different abilities."); return; }
    w.bgAbilityPicks = [p0, p1, null];
  }
  wizardGoTo("skills");
}

function wizardStepSkills(){
  var w = wizardState;
  return '<div class="wizard-step-title">Skill Proficiencies</div>'+
    '<div class="footer-line" style="margin-bottom:var(--sp-3);">Tick any skills you\'re proficient in. (Your class and background normally limit this to a specific list — pick whichever apply.)</div>'+
    '<div class="wizard-skill-grid">'+
    SKILLS.map(function(s){
      return '<label class="settings-row wizard-skill-row"><input type="checkbox" id="wiz-skill-'+s[0]+'" '+(w.skillProfs[s[0]]?"checked":"")+'><span class="settings-row-title">'+esc(s[1])+'</span></label>';
    }).join("")+
    '</div>'+
    wizardNavHtml({nextFn:"wizardCommitSkills()"});
}
function wizardCommitSkills(){
  var w = wizardState;
  SKILLS.forEach(function(s){
    var el = document.getElementById("wiz-skill-"+s[0]);
    w.skillProfs[s[0]] = !!(el && el.checked);
  });
  w.targetClass = w.cls;
  w.newLevel = 1;
  wizardGoTo("hp");
}

function wizardToggleNewClassField(isNew){
  var f = document.getElementById("wiz-newclass-field");
  if(f) f.style.display = isNew ? "block" : "none";
}
function wizardStepLevelUpClass(){
  var w = wizardState;
  var rows = (state.meta.classes||[]).map(function(c,i){
    var lvl = Number(c.level)||1;
    return '<label class="wizard-radio-row"><input type="radio" name="wiz-levelup-class" value="'+i+'" '+(w.levelUpClassIndex===i?"checked":"")+' onclick="wizardToggleNewClassField(false)"> '+esc(c.class||"(unnamed class)")+' — currently level '+lvl+' → '+Math.min(20,lvl+1)+'</label>';
  }).join("");
  return '<div class="wizard-step-title">Level Up — Choose Class</div>'+
    '<div class="wizard-radio-list">'+rows+
    '<label class="wizard-radio-row"><input type="radio" name="wiz-levelup-class" value="new" '+(w.levelUpClassIndex===-1?"checked":"")+' onclick="wizardToggleNewClassField(true)"> Add a new class (multiclass)</label>'+
    '</div>'+
    '<div class="wizard-field" id="wiz-newclass-field" style="'+(w.levelUpClassIndex===-1?"":"display:none;")+'"><label>New Class</label><input type="text" list="dl-classes" id="wiz-newclass-name" value="'+esc(w.levelUpNewClassName)+'"></div>'+
    wizardNavHtml({nextFn:"wizardCommitLevelUpClass()"});
}
function wizardCommitLevelUpClass(){
  var w = wizardState;
  var checked = document.querySelector('input[name="wiz-levelup-class"]:checked');
  if(!checked){ alert("Choose a class to level up."); return; }
  if(checked.value==="new"){
    var name = document.getElementById("wiz-newclass-name").value.trim();
    if(!name){ alert("Enter the new class's name."); return; }
    w.levelUpClassIndex = -1;
    w.levelUpNewClassName = name;
    w.targetClass = name;
    w.newLevel = 1;
  } else {
    var idx = Number(checked.value);
    w.levelUpClassIndex = idx;
    var c = state.meta.classes[idx];
    w.targetClass = c.class;
    w.newLevel = Math.min(20, (Number(c.level)||1)+1);
  }
  wizardGoTo("hp");
}

function wizardSetHpMethod(method){
  wizardState.hpMethod = method;
  renderWizardStep();
}
function wizardRollHp(hitDie){
  wizardState.hpRoll = 1 + Math.floor(Math.random()*hitDie);
  renderWizardStep();
}
function wizardStepHp(){
  var w = wizardState;
  var cls = matchClass(w.targetClass);
  var hitDie = (cls && CLASS_HIT_DIE[cls]) || 8;
  var conMod = mod(w.mode==="create" ? wizardEffectiveAbility("con") : state.abilities.con);
  if(w.mode==="create"){
    var total = Math.max(1, hitDie+conMod);
    return '<div class="wizard-step-title">Hit Points</div>'+
      '<div class="footer-line">Level 1 always gets the maximum on your hit die.</div>'+
      '<div class="wizard-hp-preview">Max Hit Die (d'+hitDie+') + CON mod ('+fmt(conMod)+') = <b>'+total+' HP</b></div>'+
      wizardNavHtml({nextFn:"wizardCommitHp()"});
  }
  var avg = Math.ceil((hitDie+1)/2);
  var chosen = w.hpMethod==="roll" ? (w.hpRoll||0) : avg;
  var total2 = Math.max(1, chosen+conMod);
  return '<div class="wizard-step-title">Hit Points — Level '+w.newLevel+' ('+esc(w.targetClass)+', d'+hitDie+')</div>'+
    '<div class="wizard-method-toggle">'+
      '<button class="btn'+(w.hpMethod==="average"?" wizard-method-active":"")+'" onclick="wizardSetHpMethod(\'average\')">Average ('+avg+')</button>'+
      '<button class="btn'+(w.hpMethod==="roll"?" wizard-method-active":"")+'" onclick="wizardSetHpMethod(\'roll\')">Roll / Enter Manually</button>'+
    '</div>'+
    (w.hpMethod==="roll" ? '<div class="wizard-hp-roll-row">'+
      '<button class="btn" onclick="wizardRollHp('+hitDie+')">Roll for me</button>'+
      '<input type="number" min="1" max="'+hitDie+'" class="wizard-hp-roll-input" id="wiz-hp-roll" value="'+(w.hpRoll!==null?w.hpRoll:"")+'" placeholder="or type your own d'+hitDie+' roll" onchange="wizardSetHpRoll(this.value)">'+
      '</div>' : '')+
    '<div class="wizard-hp-preview">'+chosen+' + CON mod ('+fmt(conMod)+') = <b>+'+total2+' HP</b></div>'+
    wizardNavHtml({nextFn:"wizardCommitHp()"});
}
function wizardSetHpRoll(val){
  var n = Number(val)||0;
  wizardState.hpRoll = n>0 ? n : null;
  renderWizardStep();
}
function wizardCommitHp(){
  var w = wizardState;
  if(w.mode==="levelup" && w.hpMethod==="roll" && !w.hpRoll){
    alert("Roll your hit die first.");
    return;
  }
  if(w.mode==="levelup" && asiLevelsFor(matchClass(w.targetClass)).indexOf(w.newLevel)!==-1){
    wizardGoTo("asi");
  } else {
    wizardGoTo("features");
  }
}

function wizardSetAsiChoice(choice){ wizardState.asiChoice = choice; renderWizardStep(); }
function wizardSetAsiMode(mode){ wizardState.asiMode = mode; renderWizardStep(); }
function wizardStepAsi(){
  var w = wizardState;
  var isFeat = w.asiChoice==="feat";
  var chooserHtml = '<div class="wizard-method-toggle">'+
    '<button class="btn'+(!isFeat?" wizard-method-active":"")+'" onclick="wizardSetAsiChoice(\'asi\')">Ability Score Improvement</button>'+
    '<button class="btn'+(isFeat?" wizard-method-active":"")+'" onclick="wizardSetAsiChoice(\'feat\')">Feat</button>'+
    '</div>';
  var body;
  if(isFeat){
    body = '<div class="wizard-field"><label>Feat Name</label><input type="text" id="wiz-feat-name" value="'+esc(w.featName)+'" placeholder="e.g. Alert"></div>'+
      '<div class="wizard-field"><label>Description (optional)</label><textarea id="wiz-feat-desc" class="auto-grow" rows="1">'+esc(w.featDescription)+'</textarea></div>'+
      '<div class="footer-line">You can attach mechanical Effects to this feat afterward on the Features tab.</div>';
  } else {
    body = '<div class="wizard-asi-mode-toggle">'+
        '<button class="btn'+(w.asiMode==="one"?" wizard-method-active":"")+'" onclick="wizardSetAsiMode(\'one\')">+2 to one ability</button>'+
        '<button class="btn'+(w.asiMode==="two"?" wizard-method-active":"")+'" onclick="wizardSetAsiMode(\'two\')">+1 to two abilities</button>'+
      '</div>'+
      '<div class="wizard-ability-grid">'+
        '<div class="wizard-ability-box"><label>'+(w.asiMode==="one"?"Ability":"Ability 1")+'</label><select id="wiz-asi-0">'+abilitySelectOptions(w.asiPicks[0])+'</select></div>'+
        (w.asiMode==="two" ? '<div class="wizard-ability-box"><label>Ability 2</label><select id="wiz-asi-1">'+abilitySelectOptions(w.asiPicks[1])+'</select></div>' : '')+
      '</div>';
  }
  return '<div class="wizard-step-title">Ability Score Improvement or Feat (Level '+w.newLevel+')</div>'+
    chooserHtml+body+
    wizardNavHtml({nextFn:"wizardCommitAsi()"});
}
function wizardCommitAsi(){
  var w = wizardState;
  if(w.asiChoice==="feat"){
    w.featName = document.getElementById("wiz-feat-name").value.trim();
    w.featDescription = document.getElementById("wiz-feat-desc").value.trim();
    if(!w.featName){ alert("Name your feat, or switch to Ability Score Improvement."); return; }
  } else {
    w.asiChoice = "asi";
    w.asiPicks[0] = document.getElementById("wiz-asi-0").value || null;
    w.asiPicks[1] = w.asiMode==="two" ? (document.getElementById("wiz-asi-1").value || null) : null;
    if(!w.asiPicks[0] || (w.asiMode==="two" && !w.asiPicks[1])){ alert("Choose an ability (or two)."); return; }
    if(w.asiMode==="two" && w.asiPicks[0]===w.asiPicks[1]){ alert("Choose two different abilities, or switch to +2 on one."); return; }
  }
  wizardGoTo("features");
}

function wizardFeaturesListHtml(){
  var w = wizardState;
  return (w.newFeatures||[]).map(function(f,i){
    return '<div class="entry-card wizard-feature-card">'+
      '<div class="entry-top">'+
      '<select class="entry-source" onchange="wizardUpdateFeatureField('+i+',\'source\',this.value)">'+FEATURE_SOURCES.map(function(s){ return '<option value="'+esc(s)+'"'+(s===f.source?" selected":"")+'>'+esc(s)+'</option>'; }).join("")+'</select>'+
      '<input type="text" class="entry-name" placeholder="Feature name" value="'+esc(f.name)+'" onchange="wizardUpdateFeatureField('+i+',\'name\',this.value)">'+
      '<button class="row-del" onclick="wizardRemoveFeature('+i+')">&times;</button>'+
      '</div>'+
      '<textarea class="entry-notes auto-grow" placeholder="Description" onchange="wizardUpdateFeatureField('+i+',\'description\',this.value)">'+esc(f.description)+'</textarea>'+
      '</div>';
  }).join("");
}
function wizardAddFeature(){
  wizardState.newFeatures.push({name:"", source:"Class Feature", description:""});
  renderWizardStep();
}
function wizardRemoveFeature(i){
  wizardState.newFeatures.splice(i,1);
  renderWizardStep();
}
function wizardUpdateFeatureField(i, field, val){
  wizardState.newFeatures[i][field] = val;
}
function wizardStepFeatures(){
  var w = wizardState;
  var title = w.mode==="create" ? "Starting Features & Traits" : "New Features at Level "+w.newLevel;
  var nextFn = w.mode==="create" ? "wizardGoTo('equipment')" : "wizardGoTo('finish')";
  return '<div class="wizard-step-title">'+title+'</div>'+
    '<div class="footer-line" style="margin-bottom:var(--sp-3);">Add any racial traits or class features gained here. You can always add more later on the Features tab.</div>'+
    '<div class="entry-list" id="wiz-features-list">'+wizardFeaturesListHtml()+'</div>'+
    '<button class="btn add-row-btn" onclick="wizardAddFeature()">+ Add Feature</button>'+
    wizardNavHtml({nextFn:nextFn});
}

function wizardEquipmentListHtml(){
  var w = wizardState;
  return (w.startingEquipment||[]).map(function(it,i){
    return '<tr>'+
      '<td><input type="text" value="'+esc(it.name)+'" placeholder="Item" onchange="wizardUpdateEquipmentField('+i+',\'name\',this.value)"></td>'+
      '<td><input type="number" min="0" value="'+(it.qty||1)+'" onchange="wizardUpdateEquipmentField('+i+',\'qty\',this.value)"></td>'+
      '<td><input type="number" min="0" step="0.1" value="'+(it.weight||0)+'" onchange="wizardUpdateEquipmentField('+i+',\'weight\',this.value)"></td>'+
      '<td><button class="row-del" onclick="wizardRemoveEquipment('+i+')">&times;</button></td>'+
      '</tr>';
  }).join("");
}
function wizardAddEquipment(){
  wizardState.startingEquipment.push({name:"",qty:1,weight:0});
  renderWizardStep();
}
function wizardRemoveEquipment(i){
  wizardState.startingEquipment.splice(i,1);
  renderWizardStep();
}
function wizardUpdateEquipmentField(i, field, val){
  wizardState.startingEquipment[i][field] = field==="name" ? val : (Number(val)||0);
}
function wizardStepEquipment(){
  return '<div class="wizard-step-title">Starting Equipment</div>'+
    '<div class="footer-line" style="margin-bottom:var(--sp-3);">Add your starting gear from your class and background. Weight is optional. You can add gold on the Inventory tab afterward.</div>'+
    '<table class="data-table wizard-equipment-table"><thead><tr><th>Item</th><th style="width:60px;">Qty</th><th style="width:80px;">Weight</th><th style="width:36px;"></th></tr></thead>'+
    '<tbody id="wiz-equipment-body">'+wizardEquipmentListHtml()+'</tbody></table>'+
    '<button class="btn add-row-btn" onclick="wizardAddEquipment()">+ Add Item</button>'+
    wizardNavHtml({nextFn:"wizardGoTo('finish')"});
}

function wizardStepFinish(){
  var w = wizardState;
  var summary = w.mode==="create"
    ? '<div class="wizard-summary">'+
        '<div><b>'+esc(w.name||"Unnamed")+'</b></div>'+
        '<div>'+esc(w.race)+(w.background?" · "+esc(w.background):"")+'</div>'+
        '<div>'+esc(w.cls)+' 1</div>'+
      '</div>'
    : '<div class="wizard-summary"><div>'+esc(w.targetClass)+' → level '+w.newLevel+'</div></div>';
  return '<div class="wizard-step-title">Ready</div>'+
    summary+
    (w.mode==="create" ? '<div class="footer-line">Don\'t forget to add starting gold on the Inventory tab afterward.</div>' : '')+
    '<div class="wizard-nav">'+
    '<button class="btn" onclick="closeWizard()">Cancel</button>'+
    '<div class="wizard-nav-right">'+
    (wizardState.history.length ? '<button class="btn" onclick="wizardBack()">Back</button>' : '')+
    '<button class="btn wizard-btn-primary" onclick="wizardFinish()">'+(w.mode==="create"?"Create Character":"Finish Level Up")+'</button>'+
    '</div></div>';
}

function wizardFinish(){
  var w = wizardState;
  var mode = w.mode;

  if(mode==="create"){
    var newId = "char-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    currentId = newId;
    setStoredActiveId(newId);
    state = defaultState();
    resetExpandedState();
    state.meta.name = w.name;
    state.meta.race = w.race;
    state.meta.background = w.background;
    state.meta.alignment = w.alignment;
    state.meta.playerName = w.playerName;
    state.meta.campaign = w.campaign;
    state.meta.classes = [{class: w.cls, level:1}];
    state.abilities = {
      str:wizardEffectiveAbility("str"), dex:wizardEffectiveAbility("dex"), con:wizardEffectiveAbility("con"),
      int:wizardEffectiveAbility("int"), wis:wizardEffectiveAbility("wis"), cha:wizardEffectiveAbility("cha")
    };
    SKILLS.forEach(function(s){ state.skills[s[0]].prof = !!w.skillProfs[s[0]]; });
    (w.startingEquipment||[]).forEach(function(it){
      if(it.name) state.equipment.push({name:it.name, qty:it.qty||1, weight:it.weight||0, notes:"", attuned:false, equipped:false, effects:[]});
    });
  } else {
    if(w.levelUpClassIndex===-1){
      state.meta.classes.push({class: w.levelUpNewClassName, level:1});
    } else {
      state.meta.classes[w.levelUpClassIndex].level = w.newLevel;
    }
  }

  onClassesChanged();

  var cls = matchClass(w.targetClass);
  var hitDie = (cls && CLASS_HIT_DIE[cls]) || 8;
  var conMod = mod(state.abilities.con);
  var hpGain;
  if(mode==="create"){
    hpGain = Math.max(1, hitDie+conMod);
    state.combat.hpMax = hpGain;
    state.combat.hpCurrent = hpGain;
  } else {
    var base = w.hpMethod==="roll" ? (Number(w.hpRoll)||1) : Math.ceil((hitDie+1)/2);
    hpGain = Math.max(1, base+conMod);
    state.combat.hpMax = (Number(state.combat.hpMax)||0) + hpGain;
    state.combat.hpCurrent = (Number(state.combat.hpCurrent)||0) + hpGain;
  }

  if(mode==="levelup" && w.asiChoice==="asi"){
    if(w.asiMode==="two"){
      [w.asiPicks[0], w.asiPicks[1]].forEach(function(key){
        if(key) state.abilities[key] = (Number(state.abilities[key])||10) + 1;
      });
    } else if(w.asiPicks[0]){
      state.abilities[w.asiPicks[0]] = (Number(state.abilities[w.asiPicks[0]])||10) + 2;
    }
  } else if(mode==="levelup" && w.asiChoice==="feat" && w.featName){
    state.features.push({name:w.featName, source:"Feat", description:w.featDescription||"", effects:[]});
  }

  (w.newFeatures||[]).forEach(function(f){
    if(f.name) state.features.push({name:f.name, source:f.source||"Class Feature", description:f.description||"", effects:[]});
  });

  closeWizard();
  rebuildAll();
  initInitiativeTracker(); initBattleMap();
  refreshCharacterList();
  scheduleSave();
}

var PLAYER_NAME_KEY = "dndCurrentPlayer";

function getCurrentPlayerName(){
  try{ return localStorage.getItem(PLAYER_NAME_KEY) || ""; }catch(e){ return ""; }
}

function init(){
  loadViewMode();
  var params = new URLSearchParams(location.search);
  var playerParam = params.get("player");
  var openParam = params.get("open");
  var newBlank = params.get("newBlank");
  var startWizardFlag = params.get("startWizard");
  if(playerParam){
    try{ localStorage.setItem(PLAYER_NAME_KEY, playerParam); }catch(e){}
  }
  if(openParam){ setStoredActiveId(openParam); }
  if(playerParam || openParam || newBlank || startWizardFlag){
    history.replaceState(null, "", location.pathname);
  }
  loadState().then(function(){
    buildDatalists();
    rebuildAll();
    initInitiativeTracker(); initBattleMap();
    setupTabs();
    applyPhoneLayout();
    setupColResizer();
    setupButtons();
    refreshCharacterList();
    if(newBlank){
      startFreshCharacter();
    } else if(startWizardFlag){
      openWizard("create");
    }
    checkInbox();
    setInterval(checkInbox, 12000);
  });
}

window.addEventListener("DOMContentLoaded", function(){
  if(document.getElementById("vitals-grid")){ init(); }
});
