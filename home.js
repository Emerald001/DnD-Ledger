function esc(s){
  return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

var homeRosterList = [];
var homeCampaigns = [];
var newPlayerMode = "wizard";
var dmHomeSlug = null;
var dmHomeHasPassword = false;

function showHomePanel(option){
  document.querySelectorAll(".home-option-btn").forEach(function(b){ b.classList.toggle("home-option-active", b.dataset.option===option); });
  document.querySelectorAll(".home-panel").forEach(function(p){ p.style.display = "none"; });
  if(option){ document.getElementById("panel-"+option).style.display = "block"; }
}

function backToOptions(){
  showHomePanel(null);
}

function loadRoster(){
  return fetch("/api/characters", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(list){
    homeRosterList = list;
    return list;
  }).catch(function(){ homeRosterList = []; return []; });
}

function populateExistingPlayerSelect(){
  var sel = document.getElementById("existing-player-select");
  var names = {};
  homeRosterList.forEach(function(c){
    var name = ((c.meta&&c.meta.playerName)||"").trim();
    if(name) names[name] = true;
  });
  var list = Object.keys(names).sort();
  sel.innerHTML = '<option value="">— choose —</option>' + list.map(function(n){ return '<option value="'+esc(n)+'">'+esc(n)+'</option>'; }).join("");
}

function populateExistingCharacterSelect(playerName){
  var sel = document.getElementById("existing-character-select");
  if(!playerName){
    sel.innerHTML = '<option value="">— choose a player first —</option>';
    sel.disabled = true;
    return;
  }
  var matches = homeRosterList.filter(function(c){ return ((c.meta&&c.meta.playerName)||"").trim()===playerName; });
  if(!matches.length){
    sel.innerHTML = '<option value="">No characters for this player</option>';
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
  sel.innerHTML = matches.map(function(c){
    var name = (c.name&&c.name.trim()) ? c.name : "(unnamed)";
    return '<option value="'+esc(c.id)+'">'+esc(name)+'</option>';
  }).join("");
}

function loadHomeCampaigns(){
  return fetch("/api/campaigns", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(list){
    homeCampaigns = Array.isArray(list) ? list : [];
    return homeCampaigns;
  }).catch(function(){ homeCampaigns = []; return []; });
}

function populateDmCampaignSelect(){
  var sel = document.getElementById("dm-campaign-select");
  var sorted = homeCampaigns.slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
  sel.innerHTML = '<option value="">— choose —</option>' +
    sorted.map(function(c){ return '<option value="'+esc(c.slug)+'">'+esc(c.name)+'</option>'; }).join("") +
    '<option value="__create__">+ Create New Campaign</option>';
}

function populateMapCampaignSelect(){
  var sel = document.getElementById("map-campaign-select");
  var sorted = homeCampaigns.slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
  sel.innerHTML = '<option value="">— choose —</option>' +
    sorted.map(function(c){ return '<option value="'+esc(c.slug)+'">'+esc(c.name)+'</option>'; }).join("");
}

function goViewMap(){
  var slug = document.getElementById("map-campaign-select").value;
  var errEl = document.getElementById("map-home-error");
  if(!slug){ errEl.textContent = "Choose a campaign."; return; }
  errEl.textContent = "";
  location.href = "map.html?campaign="+encodeURIComponent(slug);
}

function onDmCampaignChange(){
  var sel = document.getElementById("dm-campaign-select");
  var errEl = document.getElementById("dm-home-error");
  errEl.textContent = "";
  if(sel.value==="__create__"){
    showCreateCampaignForm();
    hideDmPasswordField();
    return;
  }
  hideCreateCampaignForm();
  if(!sel.value){
    hideDmPasswordField();
    return;
  }
  showDmPasswordField(sel.value);
}

function showCreateCampaignForm(){
  document.getElementById("dm-new-campaign-field").style.display = "block";
  document.getElementById("dm-new-campaign-name").focus();
}

function hideCreateCampaignForm(){
  document.getElementById("dm-new-campaign-field").style.display = "none";
  document.getElementById("dm-new-campaign-name").value = "";
}

function createNewCampaign(){
  var name = document.getElementById("dm-new-campaign-name").value.trim();
  var errEl = document.getElementById("dm-home-error");
  if(!name){ errEl.textContent = "Enter a campaign name."; return; }
  errEl.textContent = "";
  fetch("/api/campaigns", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name:name})})
    .then(function(r){ return r.json().then(function(data){ return {status:r.status, data:data}; }); })
    .then(function(res){
      var campaign = res.data && res.data.campaign;
      if(res.status===409){
        errEl.textContent = "That campaign already exists — selecting it instead.";
      }
      return loadHomeCampaigns().then(function(){
        populateDmCampaignSelect();
        hideCreateCampaignForm();
        if(campaign){
          document.getElementById("dm-campaign-select").value = campaign.slug;
          showDmPasswordField(campaign.slug);
        }
      });
    }).catch(function(){
      errEl.textContent = "Could not reach the server.";
    });
}

function renderAppearancePanel(){
  var themeEl = document.getElementById("theme-swatches");
  var shapeEl = document.getElementById("shape-swatches");
  var currentTheme = dndGetTheme();
  var currentShape = dndGetShape();
  themeEl.innerHTML = DND_THEMES.map(function(t){
    return '<button type="button" class="theme-option-row'+(t.id===currentTheme?" theme-option-active":"")+'" onclick="onThemePicked(\''+t.id+'\')">'+
      '<span class="theme-option-swatch" style="background:linear-gradient(135deg,'+t.swatch[0]+' 50%,'+t.swatch[1]+' 50%);"></span>'+
      '<span class="theme-option-name">'+esc(t.name)+'</span>'+
      '</button>';
  }).join("");
  shapeEl.innerHTML = DND_SHAPES.map(function(s){
    return '<button type="button" class="shape-option-row'+(s.id===currentShape?" theme-option-active":"")+'" onclick="onShapePicked(\''+s.id+'\')">'+
      '<span class="shape-option-swatch" style="border-radius:'+s.radius+';"></span>'+
      '<span class="theme-option-name">'+esc(s.name)+'</span>'+
      '</button>';
  }).join("");
}

function onThemePicked(id){
  dndSetTheme(id);
  renderAppearancePanel();
}
function onShapePicked(id){
  dndSetShape(id);
  renderAppearancePanel();
}

function toggleThemePopover(){
  var pop = document.getElementById("theme-popover");
  pop.style.display = pop.style.display==="none" ? "block" : "none";
}
function closeThemePopoverIfOutside(e){
  var pop = document.getElementById("theme-popover");
  var btn = document.getElementById("btn-theme-toggle");
  if(pop.style.display==="none") return;
  if(pop.contains(e.target) || btn.contains(e.target)) return;
  pop.style.display = "none";
}

function setNewPlayerMode(mode){
  newPlayerMode = mode;
  document.getElementById("btn-new-mode-wizard").classList.toggle("wizard-method-active", mode==="wizard");
  document.getElementById("btn-new-mode-manual").classList.toggle("wizard-method-active", mode==="manual");
}

function goNewPlayer(){
  var name = document.getElementById("new-player-name").value.trim();
  var errEl = document.getElementById("new-player-error");
  if(!name){ errEl.textContent = "Enter your name to continue."; return; }
  errEl.textContent = "";
  var url = "character-ledger.html?player="+encodeURIComponent(name);
  url += newPlayerMode==="wizard" ? "&startWizard=1" : "&newBlank=1";
  location.href = url;
}

function goExistingPlayer(){
  var player = document.getElementById("existing-player-select").value;
  var charId = document.getElementById("existing-character-select").value;
  var errEl = document.getElementById("existing-player-error");
  if(!player || !charId){ errEl.textContent = "Choose a player and a character."; return; }
  errEl.textContent = "";
  location.href = "character-ledger.html?open="+encodeURIComponent(charId)+"&player="+encodeURIComponent(player);
}

function hideDmPasswordField(){
  dmHomeSlug = null;
  dmHomeHasPassword = false;
  document.getElementById("dm-home-password-field").style.display = "none";
  document.getElementById("dm-home-password-input").value = "";
}

function showDmPasswordField(slug){
  dmHomeSlug = slug;
  var errEl = document.getElementById("dm-home-error");
  var passwordField = document.getElementById("dm-home-password-field");
  var passwordInput = document.getElementById("dm-home-password-input");
  var continueBtn = document.getElementById("btn-dm-continue");
  errEl.textContent = "";
  passwordInput.value = "";
  fetch("/api/dm/"+encodeURIComponent(slug)+"/status", {cache:"no-store"}).then(function(r){ return r.json(); }).then(function(res){
    if(dmHomeSlug!==slug) return;
    dmHomeHasPassword = !!res.hasPassword;
    document.getElementById("dm-home-password-label").textContent = dmHomeHasPassword ? "Enter Password" : "Set a DM Password (first-time setup)";
    passwordField.style.display = "block";
    continueBtn.textContent = dmHomeHasPassword ? "Log In" : "Set Password";
    passwordInput.focus();
  }).catch(function(){
    if(dmHomeSlug!==slug) return;
    errEl.textContent = "Could not reach the server.";
  });
}

function dmSubmitHomeLogin(){
  var pw = document.getElementById("dm-home-password-input").value;
  var errEl = document.getElementById("dm-home-error");
  if(!pw){ errEl.textContent = "Enter a password."; return; }
  var url = "/api/dm/"+encodeURIComponent(dmHomeSlug)+(dmHomeHasPassword ? "/login" : "/set-password");
  fetch(url, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password:pw})}).then(function(r){
    if(!r.ok) throw new Error("auth failed");
    return r.json();
  }).then(function(res){
    try{ localStorage.setItem("dmToken:"+dmHomeSlug, res.token); }catch(e){}
    location.href = "dm.html?campaign="+encodeURIComponent(dmHomeSlug);
  }).catch(function(){
    errEl.textContent = "Incorrect password.";
  });
}

function resetDmHomeForm(){
  dmHomeSlug = null;
  dmHomeHasPassword = false;
  document.getElementById("dm-campaign-select").value = "";
  hideCreateCampaignForm();
  document.getElementById("dm-home-password-input").value = "";
  document.getElementById("dm-home-password-field").style.display = "none";
  document.getElementById("dm-home-error").textContent = "";
}

function init(){
  renderAppearancePanel();
  document.getElementById("btn-theme-toggle").addEventListener("click", function(e){
    e.stopPropagation();
    toggleThemePopover();
  });
  document.addEventListener("click", closeThemePopoverIfOutside);
  loadRoster().then(function(){
    populateExistingPlayerSelect();
  });
  loadHomeCampaigns().then(function(){
    populateDmCampaignSelect();
    populateMapCampaignSelect();
  });

  document.querySelectorAll(".home-option-btn").forEach(function(btn){
    btn.addEventListener("click", function(){ showHomePanel(btn.dataset.option); });
  });
  document.getElementById("btn-new-back").addEventListener("click", backToOptions);
  document.getElementById("btn-existing-back").addEventListener("click", backToOptions);
  document.getElementById("btn-dm-back").addEventListener("click", function(){ resetDmHomeForm(); backToOptions(); });
  document.getElementById("btn-map-back").addEventListener("click", backToOptions);
  document.getElementById("btn-map-go").addEventListener("click", goViewMap);

  document.getElementById("btn-new-mode-wizard").addEventListener("click", function(){ setNewPlayerMode("wizard"); });
  document.getElementById("btn-new-mode-manual").addEventListener("click", function(){ setNewPlayerMode("manual"); });
  document.getElementById("btn-new-continue").addEventListener("click", goNewPlayer);
  document.getElementById("new-player-name").addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); goNewPlayer(); } });

  document.getElementById("existing-player-select").addEventListener("change", function(e){ populateExistingCharacterSelect(e.target.value); });
  document.getElementById("btn-existing-go").addEventListener("click", goExistingPlayer);

  document.getElementById("btn-dm-continue").addEventListener("click", dmSubmitHomeLogin);
  document.getElementById("dm-campaign-select").addEventListener("change", onDmCampaignChange);
  document.getElementById("btn-dm-create-campaign").addEventListener("click", createNewCampaign);
  document.getElementById("btn-dm-cancel-create").addEventListener("click", function(){
    hideCreateCampaignForm();
    hideDmPasswordField();
    document.getElementById("dm-campaign-select").value = "";
  });
  document.getElementById("dm-new-campaign-name").addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); createNewCampaign(); } });
  document.getElementById("dm-home-password-input").addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); dmSubmitHomeLogin(); } });
}

document.addEventListener("DOMContentLoaded", init);
