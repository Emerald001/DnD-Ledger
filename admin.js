function esc(s){
  return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function loadAdminCampaigns(){
  fetch("/api/admin/campaigns", {cache:"no-store"}).then(function(r){
    if(r.status===403){ throw new Error("forbidden"); }
    return r.json();
  }).then(function(list){
    document.getElementById("admin-blocked").style.display = "none";
    document.getElementById("admin-content").style.display = "block";
    renderAdminCampaigns(list);
  }).catch(function(){
    document.getElementById("admin-blocked").style.display = "block";
    document.getElementById("admin-content").style.display = "none";
  });
}

function renderAdminCampaigns(list){
  var el = document.getElementById("admin-campaign-list");
  if(!list.length){ el.innerHTML = '<div class="footer-line">No campaigns yet.</div>'; return; }
  el.innerHTML = list.map(function(c){
    return '<div class="admin-campaign-row">'+
      '<div class="admin-campaign-info">'+
        '<div class="admin-campaign-name">'+esc(c.name)+(c.registered ? '' : ' <span class="admin-tag">unregistered</span>')+'</div>'+
        '<div class="footer-line">slug: '+esc(c.slug)+' &middot; password '+(c.hasPassword ? 'set' : 'not set')+'</div>'+
      '</div>'+
      '<div class="admin-campaign-actions">'+
        (c.hasPassword ? '<button class="btn" onclick="adminResetPassword(\''+esc(c.slug)+'\')">Reset Password</button>' : '')+
        '<button class="btn admin-btn-danger" onclick="adminDeleteCampaign(\''+esc(c.slug)+'\',\''+esc(c.name)+'\')">Delete Campaign</button>'+
      '</div>'+
    '</div>';
  }).join("");
}

function adminResetPassword(slug){
  if(!confirm("Reset the DM password for \""+slug+"\"? The DM will need to set a new one on next login.")) return;
  fetch("/api/dm/"+encodeURIComponent(slug)+"/reset", {method:"POST", headers:{"Content-Type":"application/json"}, body:"{}"}).then(function(r){
    if(!r.ok) throw new Error("reset failed");
    return loadAdminCampaigns();
  }).catch(function(){
    alert("Could not reset — make sure you're viewing this page on the server's own machine.");
  });
}

function adminDeleteCampaign(slug, name){
  if(!confirm("Delete campaign \""+name+"\"? This removes it from the campaign list and clears its DM password/notes/initiative. Characters still tagged with this campaign will bring it back the next time they're opened.")) return;
  fetch("/api/campaigns/"+encodeURIComponent(slug), {method:"DELETE"}).then(function(r){
    if(!r.ok) throw new Error("delete failed");
    return loadAdminCampaigns();
  }).catch(function(){
    alert("Could not delete — make sure you're viewing this page on the server's own machine.");
  });
}

document.addEventListener("DOMContentLoaded", function(){
  document.getElementById("btn-admin-refresh").addEventListener("click", loadAdminCampaigns);
  loadAdminCampaigns();
});
