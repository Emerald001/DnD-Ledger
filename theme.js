var DND_THEME_KEY = "dndTheme";
var DND_SHAPE_KEY = "dndShape";

var DND_THEMES = [
  {id:"tavern", name:"Tavern", swatch:["#14181b","#b98c4f"]},
  {id:"arcane", name:"Arcane Violet", swatch:["#161225","#8f7fe0"]},
  {id:"bloodmoon", name:"Blood Moon", swatch:["#180d0d","#c14545"]},
  {id:"deepwoods", name:"Deep Woods", swatch:["#0f1712","#7fae5f"]},
  {id:"parchment", name:"Parchment", swatch:["#f2e9d8","#8a5a24"]},
  {id:"slate", name:"Slate", swatch:["#141414","#9a9a9a"]},
  {id:"noir", name:"Noir", swatch:["#0a0a0a","#ffffff"]},
  {id:"ivory", name:"Ivory", swatch:["#f7f7f5","#141414"]}
];

var DND_SHAPES = [
  {id:"rounded", name:"Rounded", radius:"7px"},
  {id:"sharp", name:"Sharp", radius:"2px"},
  {id:"soft", name:"Soft", radius:"14px"}
];

function dndGetTheme(){
  try{ return localStorage.getItem(DND_THEME_KEY) || "tavern"; }catch(e){ return "tavern"; }
}
function dndGetShape(){
  try{ return localStorage.getItem(DND_SHAPE_KEY) || "rounded"; }catch(e){ return "rounded"; }
}
function dndApplyAppearance(){
  var root = document.documentElement;
  root.setAttribute("data-theme", dndGetTheme());
  root.setAttribute("data-shape", dndGetShape());
}
function dndSetTheme(id){
  try{ localStorage.setItem(DND_THEME_KEY, id); }catch(e){}
  dndApplyAppearance();
}
function dndSetShape(id){
  try{ localStorage.setItem(DND_SHAPE_KEY, id); }catch(e){}
  dndApplyAppearance();
}

dndApplyAppearance();
