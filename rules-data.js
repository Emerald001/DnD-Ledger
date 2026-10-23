// Rules database for the Character Ledger.
// Everything the character wizard fills in automatically lives here, so it can be checked
// against the books in one place. Each entry carries a `source` tag so books can be turned
// on/off per campaign later. Descriptions are short summaries — see the book for full text.
//
// Current contents: 2024 Player's Handbook (PHB'24) backgrounds, species, feats, classes and subclasses,
// plus optional content from XGE, TCE and EFA at the bottom of the file (see BOOKS).

// ---------------------------------------------------------------------------------------
// Small helpers so the entries below stay readable.
function resist(damageType){ return {target:"resistance", type:"grant", value:damageType, condition:"always"}; }
function skillProf(skillKey){ return {target:"skillProficiency."+skillKey, type:"grant", value:"", condition:"always"}; }
function bonus(target, value, extra){ return Object.assign({target:target, type:"bonus", value:value, condition:"always"}, extra||{}); }
var ALL_SKILL_KEYS = ["acrobatics","animalHandling","arcana","athletics","deception","history","insight","intimidation","investigation",
  "medicine","nature","perception","performance","persuasion","religion","sleightOfHand","stealth","survival"];

// ---------------------------------------------------------------------------------------
// BACKGROUNDS
// abilities: the three scores the background can raise (+2/+1 or +1/+1/+1)
// skills:    skill keys (see SKILLS in app.js)
// tool:      tool proficiency granted
// feat:      origin feat granted
var BACKGROUND_DATA = {
  Acolyte:    {source:"PHB'24", abilities:["int","wis","cha"], skills:["insight","religion"],        tool:"Calligrapher's Supplies", feat:"Magic Initiate (Cleric)"},
  Artisan:    {source:"PHB'24", abilities:["str","dex","int"], skills:["investigation","persuasion"], tool:"One kind of Artisan's Tools", feat:"Crafter"},
  Charlatan:  {source:"PHB'24", abilities:["dex","con","cha"], skills:["deception","sleightOfHand"],  tool:"Forgery Kit", feat:"Skilled"},
  Criminal:   {source:"PHB'24", abilities:["dex","con","int"], skills:["sleightOfHand","stealth"],    tool:"Thieves' Tools", feat:"Alert"},
  Entertainer:{source:"PHB'24", abilities:["str","dex","cha"], skills:["acrobatics","performance"],   tool:"One kind of Musical Instrument", feat:"Musician"},
  Farmer:     {source:"PHB'24", abilities:["str","con","wis"], skills:["animalHandling","nature"],    tool:"Carpenter's Tools", feat:"Tough"},
  Guard:      {source:"PHB'24", abilities:["str","int","wis"], skills:["athletics","perception"],     tool:"One kind of Gaming Set", feat:"Alert"},
  Guide:      {source:"PHB'24", abilities:["dex","con","wis"], skills:["stealth","survival"],         tool:"Cartographer's Tools", feat:"Magic Initiate (Druid)"},
  Hermit:     {source:"PHB'24", abilities:["con","wis","cha"], skills:["medicine","religion"],        tool:"Herbalism Kit", feat:"Healer"},
  Merchant:   {source:"PHB'24", abilities:["con","int","cha"], skills:["animalHandling","persuasion"],tool:"Navigator's Tools", feat:"Lucky"},
  Noble:      {source:"PHB'24", abilities:["str","int","cha"], skills:["history","persuasion"],       tool:"One kind of Gaming Set", feat:"Skilled"},
  Sage:       {source:"PHB'24", abilities:["con","int","wis"], skills:["arcana","history"],           tool:"Calligrapher's Supplies", feat:"Magic Initiate (Wizard)"},
  Sailor:     {source:"PHB'24", abilities:["str","dex","wis"], skills:["acrobatics","perception"],    tool:"Navigator's Tools", feat:"Tavern Brawler"},
  Scribe:     {source:"PHB'24", abilities:["dex","int","wis"], skills:["investigation","perception"], tool:"Calligrapher's Supplies", feat:"Skilled"},
  Soldier:    {source:"PHB'24", abilities:["str","dex","con"], skills:["athletics","intimidation"],   tool:"One kind of Gaming Set", feat:"Savage Attacker"},
  Wayfarer:   {source:"PHB'24", abilities:["dex","wis","cha"], skills:["insight","stealth"],          tool:"Thieves' Tools", feat:"Lucky"}
};

// ---------------------------------------------------------------------------------------
// SPECIES
// sizes:       allowed sizes, first one is the default
// speed:       walking speed in feet
// darkvision:  range in feet (0 = none)
// traits:      added to the Features tab. Optional per trait:
//                minLevel  – character level the trait is gained at (default 1)
//                effects   – Effects Engine entries (resistances, proficiencies, bonuses...)
//                resource  – adds a tracker on the Resources panel. max is a number or "pb"
//                            (Proficiency Bonus, kept in sync as you level); resetOn short|long
//                spells    – added to the Spells tab: {name, level, minLevel}
// choices:     picked in the wizard. Each option can override speed/darkvision and add traits.
// skillChoice: pick one skill proficiency from the list (or "any").
// spellAbilityChoice: species spells use Int, Wis or Cha — the player picks.
// featChoice:  the player picks an extra Origin feat (from FEAT_DATA below).
// resource on a trait can also be written as resources:[...] for more than one tracker.
// longRestInspiration: gain Heroic Inspiration on every Long Rest.
var SPECIES_DATA = {
  Aasimar: {
    source:"PHB'24", sizes:["medium","small"], speed:30, darkvision:60,
    traits:[
      {name:"Celestial Resistance", description:"Resistance to Necrotic and Radiant damage.", effects:[resist("Necrotic"), resist("Radiant")]},
      {name:"Darkvision", description:"You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light."},
      {name:"Healing Hands", description:"Magic action: touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains that many Hit Points. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}},
      {name:"Light Bearer", description:"You know the Light cantrip. Charisma is your spellcasting ability for it.",
        spells:[{name:"Light", level:0}]},
      {name:"Celestial Revelation", minLevel:3, description:"Bonus Action: transform for 1 minute (once per Long Rest). Choose Heavenly Wings (Fly Speed equal to your Speed), Inner Radiance (shed light; at the end of each of your turns, creatures within 10 ft take Radiant damage equal to your PB) or Necrotic Shroud (creatures within 10 ft make a Cha save or are Frightened). While transformed, once per turn you deal extra Radiant or Necrotic damage equal to your PB.",
        resource:{max:1, resetOn:"long"}}
    ]
  },

  Dragonborn: {
    source:"PHB'24", sizes:["medium"], speed:30, darkvision:60,
    traits:[
      {name:"Breath Weapon", description:"When you take the Attack action, replace one attack with a 15-ft Cone or 30-ft Line (5 ft wide). Each creature makes a Dex save (DC 8 + Con mod + PB): 1d10 damage of your ancestry's type, half on a success. Damage becomes 2d10 at level 5, 3d10 at 11 and 4d10 at 17. Uses equal to your PB per Long Rest.",
        resource:{max:"pb", resetOn:"long"}},
      {name:"Darkvision", description:"You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light."},
      {name:"Draconic Flight", minLevel:5, description:"Bonus Action: sprout spectral wings for 10 minutes, gaining a Fly Speed equal to your Speed. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}}
    ],
    choices:[
      {id:"ancestry", label:"Draconic Ancestry", options:[
        {name:"Black (Acid)",       traits:[{name:"Draconic Ancestry: Black", description:"Breath Weapon deals Acid damage. Resistance to Acid damage.", effects:[resist("Acid")]}]},
        {name:"Blue (Lightning)",   traits:[{name:"Draconic Ancestry: Blue", description:"Breath Weapon deals Lightning damage. Resistance to Lightning damage.", effects:[resist("Lightning")]}]},
        {name:"Brass (Fire)",       traits:[{name:"Draconic Ancestry: Brass", description:"Breath Weapon deals Fire damage. Resistance to Fire damage.", effects:[resist("Fire")]}]},
        {name:"Bronze (Lightning)", traits:[{name:"Draconic Ancestry: Bronze", description:"Breath Weapon deals Lightning damage. Resistance to Lightning damage.", effects:[resist("Lightning")]}]},
        {name:"Copper (Acid)",      traits:[{name:"Draconic Ancestry: Copper", description:"Breath Weapon deals Acid damage. Resistance to Acid damage.", effects:[resist("Acid")]}]},
        {name:"Gold (Fire)",        traits:[{name:"Draconic Ancestry: Gold", description:"Breath Weapon deals Fire damage. Resistance to Fire damage.", effects:[resist("Fire")]}]},
        {name:"Green (Poison)",     traits:[{name:"Draconic Ancestry: Green", description:"Breath Weapon deals Poison damage. Resistance to Poison damage.", effects:[resist("Poison")]}]},
        {name:"Red (Fire)",         traits:[{name:"Draconic Ancestry: Red", description:"Breath Weapon deals Fire damage. Resistance to Fire damage.", effects:[resist("Fire")]}]},
        {name:"Silver (Cold)",      traits:[{name:"Draconic Ancestry: Silver", description:"Breath Weapon deals Cold damage. Resistance to Cold damage.", effects:[resist("Cold")]}]},
        {name:"White (Cold)",       traits:[{name:"Draconic Ancestry: White", description:"Breath Weapon deals Cold damage. Resistance to Cold damage.", effects:[resist("Cold")]}]}
      ]}
    ]
  },

  Dwarf: {
    source:"PHB'24", sizes:["medium"], speed:30, darkvision:120,
    traits:[
      {name:"Darkvision", description:"You can see in dim light within 120 feet as if it were bright light, and in darkness as if it were dim light."},
      {name:"Dwarven Resilience", description:"Resistance to Poison damage. Advantage on saving throws to avoid or end the Poisoned condition.", effects:[resist("Poison")]},
      {name:"Dwarven Toughness", description:"Your Hit Point maximum increases by 1, and by 1 again whenever you gain a level.",
        effects:[{target:"hpMax", type:"bonus", valueSource:"level", value:"", condition:"always"}]},
      {name:"Stonecunning", description:"Bonus Action: gain Tremorsense with a range of 60 feet for 10 minutes. You must be on or touching a stone surface. Uses equal to your PB per Long Rest.",
        resource:{max:"pb", resetOn:"long"}}
    ]
  },

  Elf: {
    source:"PHB'24", sizes:["medium"], speed:30, darkvision:60,
    spellAbilityChoice:true,
    skillChoice:{label:"Keen Senses", skills:["insight","perception","survival"]},
    traits:[
      {name:"Darkvision", description:"You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light."},
      {name:"Fey Ancestry", description:"Advantage on saving throws to avoid or end the Charmed condition."},
      {name:"Keen Senses", description:"Proficiency in Insight, Perception or Survival (chosen at creation)."},
      {name:"Trance", description:"You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours by meditating, remaining conscious."}
    ],
    choices:[
      {id:"lineage", label:"Elven Lineage", options:[
        {name:"Drow", darkvision:120, traits:[
          {name:"Drow Lineage", description:"Your Darkvision has a range of 120 feet. You know Dancing Lights; at level 3 you can cast Faerie Fire and at level 5 Darkness, each once per Long Rest without a spell slot (or with slots).",
            spells:[{name:"Dancing Lights", level:0}, {name:"Faerie Fire", level:1, minLevel:3}, {name:"Darkness", level:2, minLevel:5}]}
        ]},
        {name:"High Elf", traits:[
          {name:"High Elf Lineage", description:"You know Prestidigitation (you can swap it for another Wizard cantrip after a Long Rest). At level 3 you can cast Detect Magic and at level 5 Misty Step, each once per Long Rest without a spell slot (or with slots).",
            spells:[{name:"Prestidigitation", level:0}, {name:"Detect Magic", level:1, minLevel:3}, {name:"Misty Step", level:2, minLevel:5}]}
        ]},
        {name:"Wood Elf", speed:35, traits:[
          {name:"Wood Elf Lineage", description:"Your Speed increases to 35 feet. You know Druidcraft; at level 3 you can cast Longstrider and at level 5 Pass without Trace, each once per Long Rest without a spell slot (or with slots).",
            spells:[{name:"Druidcraft", level:0}, {name:"Longstrider", level:1, minLevel:3}, {name:"Pass without Trace", level:2, minLevel:5}]}
        ]}
      ]}
    ]
  },

  Gnome: {
    source:"PHB'24", sizes:["small"], speed:30, darkvision:60,
    spellAbilityChoice:true,
    traits:[
      {name:"Darkvision", description:"You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light."},
      {name:"Gnomish Cunning", description:"Advantage on Intelligence, Wisdom and Charisma saving throws."}
    ],
    choices:[
      {id:"lineage", label:"Gnomish Lineage", options:[
        {name:"Forest Gnome", traits:[
          {name:"Forest Gnome Lineage", description:"You know Minor Illusion. You always have Speak with Animals prepared and can cast it without a spell slot a number of times equal to your PB per Long Rest.",
            spells:[{name:"Minor Illusion", level:0}, {name:"Speak with Animals", level:1}],
            resource:{name:"Speak with Animals (free casts)", max:"pb", resetOn:"long"}}
        ]},
        {name:"Rock Gnome", traits:[
          {name:"Rock Gnome Lineage", description:"You know Mending and Prestidigitation. You can spend 10 minutes casting Prestidigitation to make a Tiny clockwork device (AC 5, 1 HP) that lasts 8 hours; you can have up to three at once.",
            spells:[{name:"Mending", level:0}, {name:"Prestidigitation", level:0}]}
        ]}
      ]}
    ]
  },

  Goliath: {
    source:"PHB'24", sizes:["medium"], speed:35, darkvision:0,
    traits:[
      {name:"Large Form", minLevel:5, description:"Bonus Action: become Large for 10 minutes (if there's room). You have Advantage on Strength checks and your Speed increases by 10 feet. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}},
      {name:"Powerful Build", description:"Advantage on any ability check you make to end the Grappled condition. You count as one size larger when determining carrying capacity."}
    ],
    choices:[
      {id:"ancestry", label:"Giant Ancestry", options:[
        {name:"Cloud's Jaunt (Cloud Giant)", traits:[{name:"Cloud's Jaunt", description:"Bonus Action: teleport up to 30 feet to an unoccupied space you can see. Uses equal to your PB per Long Rest.", resource:{max:"pb", resetOn:"long"}}]},
        {name:"Fire's Burn (Fire Giant)",    traits:[{name:"Fire's Burn", description:"When you hit a target with an attack roll and deal damage, deal an extra 1d10 Fire damage. Uses equal to your PB per Long Rest.", resource:{max:"pb", resetOn:"long"}}]},
        {name:"Frost's Chill (Frost Giant)", traits:[{name:"Frost's Chill", description:"When you hit a target with an attack roll and deal damage, deal an extra 1d6 Cold damage and reduce its Speed by 10 feet until the start of your next turn. Uses equal to your PB per Long Rest.", resource:{max:"pb", resetOn:"long"}}]},
        {name:"Hill's Tumble (Hill Giant)",  traits:[{name:"Hill's Tumble", description:"When you hit a Large or smaller creature with an attack roll and deal damage, you can give it the Prone condition. Uses equal to your PB per Long Rest.", resource:{max:"pb", resetOn:"long"}}]},
        {name:"Stone's Endurance (Stone Giant)", traits:[{name:"Stone's Endurance", description:"Reaction when you take damage: roll 1d12, add your Con modifier, and reduce the damage by that total. Uses equal to your PB per Long Rest.", resource:{max:"pb", resetOn:"long"}}]},
        {name:"Storm's Thunder (Storm Giant)", traits:[{name:"Storm's Thunder", description:"Reaction when a creature within 60 feet damages you: deal 1d8 Thunder damage to it. Uses equal to your PB per Long Rest.", resource:{max:"pb", resetOn:"long"}}]}
      ]}
    ]
  },

  Halfling: {
    source:"PHB'24", sizes:["small"], speed:30, darkvision:0,
    traits:[
      {name:"Brave", description:"Advantage on saving throws to avoid or end the Frightened condition."},
      {name:"Halfling Nimbleness", description:"You can move through the space of any creature that is a size larger than you, but you can't stop in the same space."},
      {name:"Luck", description:"When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll."},
      {name:"Naturally Stealthy", description:"You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you."}
    ]
  },

  Human: {
    source:"PHB'24", sizes:["medium","small"], speed:30, darkvision:0,
    longRestInspiration:true,
    skillChoice:{label:"Skillful", skills:"any"},
    featChoice:{label:"Versatile — Origin feat", suggestion:"Skilled"},
    traits:[
      {name:"Resourceful", description:"You gain Heroic Inspiration whenever you finish a Long Rest. (The ledger ticks Inspired for you on a Long Rest.)"},
      {name:"Skillful", description:"Proficiency in one skill of your choice (chosen at creation)."},
      {name:"Versatile", description:"You gain an Origin feat of your choice."}
    ]
  },

  Orc: {
    source:"PHB'24", sizes:["medium"], speed:30, darkvision:120,
    traits:[
      {name:"Adrenaline Rush", description:"You can take the Dash action as a Bonus Action. When you do, gain Temporary Hit Points equal to your PB. Uses equal to your PB per Short or Long Rest.",
        resource:{max:"pb", resetOn:"short"}},
      {name:"Darkvision", description:"You can see in dim light within 120 feet as if it were bright light, and in darkness as if it were dim light."},
      {name:"Relentless Endurance", description:"When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}}
    ]
  },

  Tiefling: {
    source:"PHB'24", sizes:["medium","small"], speed:30, darkvision:60,
    spellAbilityChoice:true,
    traits:[
      {name:"Darkvision", description:"You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light."},
      {name:"Otherworldly Presence", description:"You know the Thaumaturgy cantrip, using the same spellcasting ability as your Fiendish Legacy.",
        spells:[{name:"Thaumaturgy", level:0}]}
    ],
    choices:[
      {id:"legacy", label:"Fiendish Legacy", options:[
        {name:"Abyssal", traits:[
          {name:"Abyssal Legacy", description:"Resistance to Poison damage. You know Poison Spray; at level 3 you can cast Ray of Sickness and at level 5 Hold Person, each once per Long Rest without a spell slot (or with slots).",
            effects:[resist("Poison")],
            spells:[{name:"Poison Spray", level:0}, {name:"Ray of Sickness", level:1, minLevel:3}, {name:"Hold Person", level:2, minLevel:5}]}
        ]},
        {name:"Chthonic", traits:[
          {name:"Chthonic Legacy", description:"Resistance to Necrotic damage. You know Chill Touch; at level 3 you can cast False Life and at level 5 Ray of Enfeeblement, each once per Long Rest without a spell slot (or with slots).",
            effects:[resist("Necrotic")],
            spells:[{name:"Chill Touch", level:0}, {name:"False Life", level:1, minLevel:3}, {name:"Ray of Enfeeblement", level:2, minLevel:5}]}
        ]},
        {name:"Infernal", traits:[
          {name:"Infernal Legacy", description:"Resistance to Fire damage. You know Fire Bolt; at level 3 you can cast Hellish Rebuke and at level 5 Darkness, each once per Long Rest without a spell slot (or with slots).",
            effects:[resist("Fire")],
            spells:[{name:"Fire Bolt", level:0}, {name:"Hellish Rebuke", level:1, minLevel:3}, {name:"Darkness", level:2, minLevel:5}]}
        ]}
      ]}
    ]
  }
};

// ---------------------------------------------------------------------------------------
// FEATS
// category:   origin | general | fightingStyle | epicBoon
// abilities:  scores the feat can raise by +1 (pick one): a list, or "any". Max 20 (30 for Epic Boons).
// prereq:     level        – minimum character level
//             abilities    – {str:13, dex:13}: at least ONE of these scores must be met
//             spellcasting – needs the Spellcasting or Pact Magic feature
//             armor        – "light" | "medium" | "heavy" | "shield" training required
//             fightingStyle– needs the Fighting Style feature; class – needs that class
// repeatable: can be taken more than once
// saveFromAbility: also grants saving throw proficiency in the ability raised (Resilient)
// effects / resources / spells: same as species traits. Resources' max can be a number or "pb".
// grants:     text added to the sheet — {proficiencies:"...", senses:"..."}
// choices:    asked for when the feat is picked:
//               {id, label, type:"option",  options:[{name, effects}], count, inName}
//               {id, label, type:"skill",   from:[...]|"any", count, grant:"proficiency"|"expertise"|"profOrExpertise"}
//               {id, label, type:"ability", from:["int","wis","cha"]}   – spellcasting ability for the feat's spells
//               {id, label, type:"spell",   level, count}               – spell names, added to the Spells tab
//               {id, label, type:"text",    count}                      – free text noted on the feature
//             inName puts the chosen option in the feature name, e.g. "Magic Initiate (Cleric)".
var FEAT_DATA = {
  // ----- Origin feats --------------------------------------------------------------------
  "Alert": {source:"PHB'24", category:"origin",
    description:"Initiative Proficiency: add your Proficiency Bonus to Initiative rolls. Initiative Swap: right after you roll Initiative, you can swap your Initiative with one willing ally in the same combat (not if either of you is Incapacitated).",
    effects:[bonus("initiative", "", {valueSource:"pb"})]},
  "Crafter": {source:"PHB'24", category:"origin",
    description:"Tool Proficiency: three Artisan's Tools of your choice (from the Fast Crafting table). Discount: 20% off nonmagical items you buy. Fast Crafting: when you finish a Long Rest, you can craft one piece of gear from the Fast Crafting table that you have the tools for; it lasts until your next Long Rest.",
    choices:[{id:"tools", label:"Artisan's Tools", type:"text", count:3, proficiency:true}]},
  "Healer": {source:"PHB'24", category:"origin",
    description:"Battle Medic: with a Healer's Kit, take the Utilize action to expend one use and let a creature within 5 feet expend one of its Hit Point Dice; it regains HP equal to the roll plus your Proficiency Bonus. Healing Rerolls: when you roll to restore HP with a spell or this feat, you can reroll any 1s and must use the new roll."},
  "Lucky": {source:"PHB'24", category:"origin",
    description:"You have Luck Points equal to your Proficiency Bonus, regained on a Long Rest. Advantage: spend 1 Luck Point to give yourself Advantage on a D20 Test. Disadvantage: when a creature rolls a d20 for an attack roll against you, spend 1 Luck Point to impose Disadvantage on that roll.",
    resources:[{name:"Luck Points", max:"pb", resetOn:"long"}]},
  "Magic Initiate": {source:"PHB'24", category:"origin", repeatable:true,
    description:"Two Cantrips: learn two cantrips from the chosen spell list. Level 1 Spell: choose a level 1 spell from the same list; it is always prepared and you can cast it once without a slot per Long Rest (you can also use slots). Choose Intelligence, Wisdom or Charisma as the spellcasting ability for these spells. Spell Change: when you gain a level, you can replace one of these spells with another of the same level from the same list. Repeatable with a different spell list.",
    choices:[
      {id:"list", label:"Spell List", type:"option", inName:true, options:[{name:"Cleric"},{name:"Druid"},{name:"Wizard"}]},
      {id:"ability", label:"Spellcasting Ability", type:"ability", from:["int","wis","cha"]},
      {id:"cantrips", label:"Cantrip", type:"spell", level:0, count:2},
      {id:"spell", label:"Level 1 Spell (once per Long Rest without a slot)", type:"spell", level:1, count:1, oncePerLongRest:true}
    ]},
  "Musician": {source:"PHB'24", category:"origin",
    description:"Instrument Training: proficiency with three Musical Instruments of your choice. Encouraging Song: as you finish a Short or Long Rest, you can play a song and give Heroic Inspiration to allies who hear it, up to your Proficiency Bonus.",
    choices:[{id:"instruments", label:"Musical Instrument", type:"text", count:3, proficiency:true}]},
  "Savage Attacker": {source:"PHB'24", category:"origin",
    description:"Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target."},
  "Skilled": {source:"PHB'24", category:"origin", repeatable:true,
    description:"You gain proficiency in any combination of three skills or tools of your choice. (Pick skills here; swap any for a tool on the sheet if you prefer.)",
    choices:[{id:"skills", label:"Skill", type:"skill", from:"any", count:3, grant:"proficiency"}]},
  "Tavern Brawler": {source:"PHB'24", category:"origin",
    description:"Enhanced Unarmed Strike: your Unarmed Strike deals 1d4 + Strength modifier Bludgeoning damage. Damage Rerolls: reroll 1s on the damage dice of your Unarmed Strikes. Improvised Weaponry: you have proficiency with improvised weapons. Push: once per turn when you hit with an Unarmed Strike as part of the Attack action, you can also push the target 5 feet away.",
    grants:{proficiencies:"Weapons: Improvised weapons"}},
  "Tough": {source:"PHB'24", category:"origin",
    description:"Your Hit Point maximum increases by twice your character level when you gain this feat, and by 2 more whenever you gain a level.",
    effects:[bonus("hpMax", 2, {valueSource:"level"})]},

  // ----- General feats (level 4+) ------------------------------------------------------
  "Ability Score Improvement": {source:"PHB'24", category:"general", asi:true, repeatable:true, prereq:{level:4},
    description:"Increase one ability score by 2, or two ability scores by 1. Can't raise a score above 20. (Use the Ability Score Improvement button in the level-up wizard.)"},
  "Actor": {source:"PHB'24", category:"general", abilities:["cha"], prereq:{level:4, abilities:{cha:13}},
    description:"Impersonation: while disguised as a real or fictional person, you have Advantage on Charisma (Deception or Performance) checks to convince others you are that person. Mimicry: you can mimic the sounds of other creatures, including speech; a listener must succeed on a Wisdom (Insight) check (DC 8 + Cha mod + PB) to tell it's fake."},
  "Athlete": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4, abilities:{str:13, dex:13}},
    description:"Climb Speed: you gain a Climb Speed equal to your Speed. Hop Up: when you have the Prone condition, you can right yourself with only 5 feet of movement. Jumping: you can make a running Long or High Jump after moving only 5 feet."},
  "Charger": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4, abilities:{str:13, dex:13}},
    description:"Improved Dash: when you take the Dash action, your Speed increases by 10 feet for that action. Charge Attack: if you move at least 10 feet in a straight line toward a target right before hitting it with a melee attack as part of the Attack action, either deal an extra 1d8 damage or push it up to 10 feet away (once per turn)."},
  "Chef": {source:"PHB'24", category:"general", abilities:["con","wis"], prereq:{level:4},
    description:"Cook's Utensils: you gain proficiency with Cook's Utensils. Replenishing Meal: during a Short Rest, you can cook food for up to 4 + PB creatures; each that spends Hit Point Dice regains an extra 1d8 HP. Bolstering Treats: with an hour of work or when you finish a Long Rest, you can make treats equal to your PB (lasting 8 hours); a creature can eat one as a Bonus Action to gain Temporary HP equal to your PB.",
    grants:{proficiencies:"Tools: Cook's Utensils"},
    resources:[{name:"Bolstering Treats", max:"pb", resetOn:"long"}]},
  "Crossbow Expert": {source:"PHB'24", category:"general", abilities:["dex"], prereq:{level:4, abilities:{dex:13}},
    description:"Ignore Loading: you ignore the Loading property of Hand Crossbows, Heavy Crossbows and Light Crossbows. Firing in Melee: being within 5 feet of an enemy doesn't impose Disadvantage on your crossbow attack rolls. Dual Wielding: when you make the extra attack of the Light property, you can add your ability modifier to the damage if it's with a Light crossbow."},
  "Crusher": {source:"PHB'24", category:"general", abilities:["str","con"], prereq:{level:4},
    description:"Push: once per turn when you hit with an attack that deals Bludgeoning damage, you can move the target 5 feet to an unoccupied space (if it's no more than one size larger than you). Enhanced Critical: when you score a Critical Hit that deals Bludgeoning damage, attack rolls against that creature have Advantage until the start of your next turn."},
  "Defensive Duelist": {source:"PHB'24", category:"general", abilities:["dex"], prereq:{level:4, abilities:{dex:13}},
    description:"Parry: if you're holding a Finesse weapon and another creature hits you with a melee attack, you can take a Reaction to add your Proficiency Bonus to your AC, potentially causing the attack to miss. The bonus lasts until the start of your next turn."},
  "Dual Wielder": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4, abilities:{str:13, dex:13}},
    description:"Enhanced Dual Wielding: when you take the Attack action and attack with a Light weapon, you can make one extra attack as a Bonus Action with a different weapon, which must be a melee weapon that lacks the Two-Handed property. Quick Draw: you can draw or stow two weapons that lack the Two-Handed property when you would normally be able to draw or stow only one."},
  "Durable": {source:"PHB'24", category:"general", abilities:["con"], prereq:{level:4},
    description:"Defy Death: you have Advantage on Death Saving Throws. Speedy Recovery: as a Bonus Action, you can expend one of your Hit Point Dice, roll it, and regain that many HP."},
  "Elemental Adept": {source:"PHB'24", category:"general", abilities:["int","wis","cha"], repeatable:true, prereq:{level:4, spellcasting:true},
    description:"Energy Mastery: spells you cast ignore Resistance to the chosen damage type. When you roll damage for a spell that deals that type, you can treat any 1 on a damage die as a 2. Repeatable with a different damage type.",
    choices:[{id:"type", label:"Damage Type", type:"option", inName:true, options:[{name:"Acid"},{name:"Cold"},{name:"Fire"},{name:"Lightning"},{name:"Thunder"}]}]},
  "Fey-Touched": {source:"PHB'24", category:"general", abilities:["int","wis","cha"], prereq:{level:4},
    description:"Fey Magic: you always have Misty Step and one level 1 Divination or Enchantment spell of your choice prepared. You can cast each once without a slot per Long Rest (you can also use slots). The spellcasting ability is the one raised by this feat.",
    spells:[{name:"Misty Step", level:2, oncePerLongRest:true}],
    choices:[{id:"spell", label:"Level 1 Divination or Enchantment spell", type:"spell", level:1, count:1, oncePerLongRest:true}]},
  "Grappler": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4, abilities:{str:13, dex:13}},
    description:"Punch and Grab: when you hit a creature with an Unarmed Strike as part of the Attack action, you can use both the Damage and the Grapple option (once per turn). Attack Advantage: you have Advantage on attack rolls against a creature Grappled by you. Fast Wrestler: you don't spend extra movement to move a creature Grappled by you if it's your size or smaller."},
  "Great Weapon Master": {source:"PHB'24", category:"general", abilities:["str"], prereq:{level:4, abilities:{str:13}},
    description:"Heavy Weapon Mastery: when you hit with a weapon that has the Heavy property as part of the Attack action, you can deal extra damage equal to your Proficiency Bonus. Hew: right after you score a Critical Hit with a melee weapon or reduce a creature to 0 HP with one, you can make one attack with the same weapon as a Bonus Action."},
  "Heavily Armored": {source:"PHB'24", category:"general", abilities:["con","str"], prereq:{level:4, armor:"medium"},
    description:"Armor Training: you gain training with Heavy armor.",
    grants:{proficiencies:"Armor: Heavy armor"}},
  "Heavy Armor Master": {source:"PHB'24", category:"general", abilities:["con","str"], prereq:{level:4, armor:"heavy"},
    description:"Damage Reduction: when you're hit by an attack while wearing Heavy armor, any Bludgeoning, Piercing and Slashing damage dealt to you by that attack is reduced by an amount equal to your Proficiency Bonus."},
  "Inspiring Leader": {source:"PHB'24", category:"general", abilities:["wis","cha"], prereq:{level:4, abilities:{wis:13, cha:13}},
    description:"Bolstering Performance: when you finish a Short or Long Rest, you can give an inspiring performance. Choose up to six allies (which can include yourself) within 30 feet; each gains Temporary HP equal to your character level + the modifier of the ability you raised with this feat."},
  "Keen Mind": {source:"PHB'24", category:"general", abilities:["int"], prereq:{level:4, abilities:{int:13}},
    description:"Lore Knowledge: choose Arcana, History, Investigation, Nature or Religion. You gain proficiency in it, or Expertise if you're already proficient. Quick Study: you can take the Study action as a Bonus Action.",
    choices:[{id:"skill", label:"Lore Knowledge", type:"skill", from:["arcana","history","investigation","nature","religion"], count:1, grant:"profOrExpertise"}]},
  "Lightly Armored": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4},
    description:"Armor Training: you gain training with Light armor and Shields.",
    grants:{proficiencies:"Armor: Light armor, Shields"}},
  "Mage Slayer": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4},
    description:"Concentration Breaker: when you damage a creature that is Concentrating, it has Disadvantage on the save to keep Concentration. Guarded Mind: if you fail an Intelligence, Wisdom or Charisma saving throw, you can choose to succeed instead; once per Short or Long Rest.",
    resources:[{name:"Guarded Mind", max:1, resetOn:"short"}]},
  "Martial Weapon Training": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4},
    description:"Weapon Proficiency: you gain proficiency with Martial weapons.",
    grants:{proficiencies:"Weapons: Martial weapons"}},
  "Medium Armor Master": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4, armor:"medium"},
    description:"Dexterous Wearer: while wearing Medium armor, you can add 3 (rather than 2) to your AC if your Dexterity is 16 or higher."},
  "Moderately Armored": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4, armor:"light"},
    description:"Armor Training: you gain training with Medium armor.",
    grants:{proficiencies:"Armor: Medium armor"}},
  "Mounted Combatant": {source:"PHB'24", category:"general", abilities:["str","dex","wis"], prereq:{level:4},
    description:"Mounted Strike: while mounted, you have Advantage on attack rolls against unmounted creatures within 5 feet that are at least one size smaller than your mount. Leap Aside: if your mount is subjected to an effect that allows a Dex save for half damage, it takes no damage on a success and half on a failure (while you ride it and neither of you is Incapacitated). Veer: while mounted, you can force an attack that hits your mount to hit you instead (if you aren't Incapacitated)."},
  "Observant": {source:"PHB'24", category:"general", abilities:["int","wis"], prereq:{level:4, abilities:{int:13, wis:13}},
    description:"Keen Observer: choose Insight, Investigation or Perception. You gain proficiency in it, or Expertise if you're already proficient. Quick Search: you can take the Search action as a Bonus Action.",
    choices:[{id:"skill", label:"Keen Observer", type:"skill", from:["insight","investigation","perception"], count:1, grant:"profOrExpertise"}]},
  "Piercer": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4},
    description:"Puncture: once per turn when you hit with an attack that deals Piercing damage, you can reroll one of the damage dice and must use the new roll. Enhanced Critical: when you score a Critical Hit that deals Piercing damage, you can roll one additional damage die."},
  "Poisoner": {source:"PHB'24", category:"general", abilities:["dex","int"], prereq:{level:4},
    description:"Potent Poison: your damage rolls ignore Resistance to Poison damage. Brew Poison: you gain proficiency with the Poisoner's Kit. With 1 hour and 50 GP of materials, you can make doses equal to your PB. As a Bonus Action you can coat a weapon or up to two pieces of ammunition; a creature hit must make a Con save (DC 8 + modifier of the ability raised + PB) or take 2d8 Poison damage and be Poisoned until the end of your next turn.",
    grants:{proficiencies:"Tools: Poisoner's Kit"}},
  "Polearm Master": {source:"PHB'24", category:"general", abilities:["dex","str"], prereq:{level:4, abilities:{str:13, dex:13}},
    description:"Pole Strike: right after you take the Attack action with a Quarterstaff, Spear or a weapon with the Heavy and Reach properties, you can make a Bonus Action attack with the opposite end (d4 Bludgeoning). Reactive Strike: while holding such a weapon, you can take a Reaction to make a melee attack against a creature that enters the reach of that weapon."},
  "Resilient": {source:"PHB'24", category:"general", abilities:"any", saveFromAbility:true, prereq:{level:4},
    description:"Choose one ability in which you lack saving throw proficiency. Increase that score by 1, and you gain saving throw proficiency with it."},
  "Ritual Caster": {source:"PHB'24", category:"general", abilities:["int","wis","cha"], prereq:{level:4, abilities:{int:13, wis:13, cha:13}},
    description:"Ritual Spells: choose a number of level 1 spells with the Ritual tag equal to your Proficiency Bonus; you always have them prepared and can cast them with any spell slots you have. Whenever your PB increases you can add another level 1 Ritual spell. Quick Ritual: you can cast one Ritual spell you have prepared using its regular casting time rather than the extended time, without a slot; once per Long Rest.",
    choices:[{id:"spells", label:"Level 1 Ritual spell", type:"spell", level:1, count:"pb"}],
    resources:[{name:"Quick Ritual", max:1, resetOn:"long"}]},
  "Sentinel": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4, abilities:{str:13, dex:13}},
    description:"Guardian: right after a creature within 5 feet of you takes the Disengage action or hits a target other than you with an attack, you can make an Opportunity Attack against it. Halt: when you hit a creature with an Opportunity Attack, its Speed becomes 0 for the rest of the current turn."},
  "Shadow-Touched": {source:"PHB'24", category:"general", abilities:["int","wis","cha"], prereq:{level:4},
    description:"Shadow Magic: you always have Invisibility and one level 1 Illusion or Necromancy spell of your choice prepared. You can cast each once without a slot per Long Rest (you can also use slots). The spellcasting ability is the one raised by this feat.",
    spells:[{name:"Invisibility", level:2, oncePerLongRest:true}],
    choices:[{id:"spell", label:"Level 1 Illusion or Necromancy spell", type:"spell", level:1, count:1, oncePerLongRest:true}]},
  "Sharpshooter": {source:"PHB'24", category:"general", abilities:["dex"], prereq:{level:4, abilities:{dex:13}},
    description:"Bypass Cover: your ranged weapon attacks ignore Half Cover and Three-Quarters Cover. Firing in Melee: being within 5 feet of an enemy doesn't impose Disadvantage on your ranged weapon attack rolls. Long Shots: attacking at long range doesn't impose Disadvantage on your ranged weapon attack rolls."},
  "Shield Master": {source:"PHB'24", category:"general", abilities:["str"], prereq:{level:4, armor:"shield"},
    description:"Shield Bash: if you attack a creature within 5 feet as part of the Attack action and hit with a melee weapon, you can bash it with your Shield: Str save (DC 8 + Str mod + PB) or be pushed 5 feet or knocked Prone (once per turn). Interpose Shield: if you're subjected to an effect that allows a Dex save for half damage, you can take a Reaction to take no damage on a success (while holding a Shield)."},
  "Skill Expert": {source:"PHB'24", category:"general", abilities:"any", prereq:{level:4},
    description:"Skill Proficiency: you gain proficiency in one skill of your choice. Expertise: choose one skill in which you have proficiency but lack Expertise; you gain Expertise in it.",
    choices:[
      {id:"prof", label:"Skill Proficiency", type:"skill", from:"any", count:1, grant:"proficiency"},
      {id:"expertise", label:"Expertise", type:"skill", from:"any", count:1, grant:"expertise"}
    ]},
  "Skulker": {source:"PHB'24", category:"general", abilities:["dex"], prereq:{level:4, abilities:{dex:13}},
    description:"Blindsight: you have Blindsight with a range of 10 feet. Fog of War: you exploit the distractions of battle, gaining Advantage on any Dexterity (Stealth) check you make as part of the Hide action during combat. Sniper: if you make an attack roll while hidden and miss, making the attack doesn't reveal your location.",
    grants:{senses:"Blindsight 10 ft"}},
  "Slasher": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4},
    description:"Hamstring: once per turn when you hit a creature with an attack that deals Slashing damage, you can reduce its Speed by 10 feet until the start of your next turn. Enhanced Critical: when you score a Critical Hit that deals Slashing damage, the target has Disadvantage on attack rolls until the start of your next turn."},
  "Speedy": {source:"PHB'24", category:"general", abilities:["dex","con"], prereq:{level:4, abilities:{dex:13, con:13}},
    description:"Speed Increase: your Speed increases by 10 feet. Dash over Difficult Terrain: when you take the Dash action on your turn, Difficult Terrain doesn't cost you extra movement for the rest of that turn. Agile Movement: Opportunity Attacks have Disadvantage against you.",
    effects:[bonus("speed", 10)]},
  "Spell Sniper": {source:"PHB'24", category:"general", abilities:["int","wis","cha"], prereq:{level:4, spellcasting:true},
    description:"Bypass Cover: your spell attack rolls ignore Half Cover and Three-Quarters Cover. Casting in Melee: being within 5 feet of an enemy doesn't impose Disadvantage on your spell attack rolls. Increased Range: when you cast a spell that has a range of at least 10 feet and requires an attack roll, you can increase its range by 60 feet."},
  "Telekinetic": {source:"PHB'24", category:"general", abilities:["int","wis","cha"], prereq:{level:4},
    description:"Minor Telekinesis: you learn Mage Hand (if you already know it, its range increases by 30 feet); you can cast it without Verbal or Somatic components and the hand can be invisible. Telekinetic Shove: as a Bonus Action, you can try to move one creature you can see within 30 feet: Str save (DC 8 + modifier of the ability raised + PB) or be moved 5 feet toward or away from you.",
    spells:[{name:"Mage Hand", level:0}]},
  "Telepathic": {source:"PHB'24", category:"general", abilities:["int","wis","cha"], prereq:{level:4},
    description:"Telepathic Utterance: you can speak telepathically to any creature you can see within 60 feet (it understands only if it knows a language you know). Detect Thoughts: you always have Detect Thoughts prepared and can cast it without a slot or components once per Long Rest (you can also use slots).",
    grants:{senses:"Telepathy 60 ft"},
    spells:[{name:"Detect Thoughts", level:2, oncePerLongRest:true}]},
  "War Caster": {source:"PHB'24", category:"general", abilities:["int","wis","cha"], prereq:{level:4, spellcasting:true},
    description:"Concentration: you have Advantage on Constitution saving throws to maintain Concentration. Reactive Spell: when a creature provokes an Opportunity Attack from you, you can take a Reaction to cast a spell at it (casting time of one action, targets only that creature). Somatic Components: you can perform the Somatic components of spells even when your hands are full of weapons or a Shield."},
  "Weapon Master": {source:"PHB'24", category:"general", abilities:["str","dex"], prereq:{level:4},
    description:"Mastery Property: you can use the mastery property of one kind of Simple or Martial weapon of your choice, as long as you have proficiency with it. Whenever you finish a Long Rest, you can change the kind of weapon.",
    choices:[{id:"weapon", label:"Weapon kind", type:"text", count:1}]},

  // ----- Fighting Style feats (need the Fighting Style feature) -------------------------
  "Archery": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"You gain a +2 bonus to attack rolls you make with Ranged weapons."},
  "Blind Fighting": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"You have Blindsight with a range of 10 feet.",
    grants:{senses:"Blindsight 10 ft"}},
  "Defense": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"While you're wearing Light, Medium or Heavy armor, you gain a +1 bonus to Armor Class. (Toggle the effect off when you're not wearing armor.)",
    effects:[bonus("ac", 1, {condition:"manual", active:true})]},
  "Dueling": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"When you're holding a Melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon."},
  "Great Weapon Fighting": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"When you roll damage for an attack with a Melee weapon you're holding with two hands, you can treat any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property."},
  "Interception": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"When a creature you can see hits another creature within 5 feet of you with an attack roll, you can take a Reaction to reduce the damage by 1d10 + your Proficiency Bonus. You must be holding a Shield or a Simple or Martial weapon."},
  "Protection": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"When a creature you can see attacks a target other than you within 5 feet of you, you can take a Reaction to interpose your Shield: you impose Disadvantage on that attack roll and every other attack roll against the target until the start of your next turn, if you remain within 5 feet of it. You must be holding a Shield."},
  "Thrown Weapon Fighting": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"When you hit with a ranged attack roll using a weapon that has the Thrown property, you gain a +2 bonus to the damage roll."},
  "Two-Weapon Fighting": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack if you aren't already adding it."},
  "Unarmed Fighting": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true},
    description:"Your Unarmed Strikes deal 1d6 + Strength modifier Bludgeoning damage (1d8 if you aren't holding any weapons or a Shield). At the start of each of your turns, you can deal 1d4 Bludgeoning damage to one creature Grappled by you."},
  "Blessed Warrior": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true, class:"Paladin"},
    description:"You learn two Cleric cantrips of your choice. They count as Paladin spells for you, and Charisma is your spellcasting ability for them. Whenever you gain a Paladin level, you can replace one of them with another Cleric cantrip.",
    choices:[{id:"cantrips", label:"Cleric cantrip", type:"spell", level:0, count:2}]},
  "Druidic Warrior": {source:"PHB'24", category:"fightingStyle", prereq:{fightingStyle:true, class:"Ranger"},
    description:"You learn two Druid cantrips of your choice. They count as Ranger spells for you, and Wisdom is your spellcasting ability for them. Whenever you gain a Ranger level, you can replace one of them with another Druid cantrip.",
    choices:[{id:"cantrips", label:"Druid cantrip", type:"spell", level:0, count:2}]},

  // ----- Epic Boons (level 19+) --------------------------------------------------------
  "Boon of Combat Prowess": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"Peerless Aim: when you miss with an attack roll, you can hit instead. Once you use this benefit, you can't use it again until the start of your next turn."},
  "Boon of Dimensional Travel": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"Blink Steps: immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see."},
  "Boon of Energy Resistance": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"Energy Resistances: you gain Resistance to two damage types of your choice (Acid, Cold, Fire, Lightning, Necrotic, Poison, Psychic, Radiant or Thunder); you can change them after a Long Rest. Energy Redirection: when you take damage of one of those types, you can take a Reaction to force a creature within 60 feet to make a Dex save (DC 8 + Con mod + PB) or take 2d12 + your Con modifier damage of that type.",
    choices:[{id:"types", label:"Resistance", type:"option", count:2, options:[
      {name:"Acid", effects:[resist("Acid")]}, {name:"Cold", effects:[resist("Cold")]}, {name:"Fire", effects:[resist("Fire")]},
      {name:"Lightning", effects:[resist("Lightning")]}, {name:"Necrotic", effects:[resist("Necrotic")]}, {name:"Poison", effects:[resist("Poison")]},
      {name:"Psychic", effects:[resist("Psychic")]}, {name:"Radiant", effects:[resist("Radiant")]}, {name:"Thunder", effects:[resist("Thunder")]}
    ]}]},
  "Boon of Fate": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"Improve Fate: when you or another creature within 60 feet succeeds on or fails a D20 Test, you can roll 2d4 and apply the total as a bonus or penalty to the d20 roll. Once used, you can't use it again until you roll Initiative or finish a Short or Long Rest.",
    resources:[{name:"Improve Fate", max:1, resetOn:"short"}]},
  "Boon of Fortitude": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"Fortified Health: your Hit Point maximum increases by 40. In addition, whenever you regain Hit Points, you can regain additional HP equal to your Constitution modifier (once per turn).",
    effects:[bonus("hpMax", 40)]},
  "Boon of Irresistible Offense": {source:"PHB'24", category:"epicBoon", abilities:["str","dex"], prereq:{level:19},
    description:"Overcome Defenses: the Bludgeoning, Piercing and Slashing damage you deal always ignores Resistance. Overwhelming Strike: when you roll a 20 on the d20 for an attack roll, you can deal extra damage equal to the ability score increased by this feat. The extra damage's type is the same as the attack's."},
  "Boon of Recovery": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"Last Stand: when you would be reduced to 0 HP, you can drop to 1 HP instead and regain HP equal to half your Hit Point maximum; once per Long Rest. Recover Vitality: you have a pool of ten d10s. As a Bonus Action, you can expend dice from the pool, roll them and regain that many HP. You regain all expended dice on a Long Rest.",
    resources:[{name:"Last Stand", max:1, resetOn:"long"}, {name:"Recover Vitality (d10s)", max:10, resetOn:"long"}]},
  "Boon of Skill": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"All-Around Adept: you gain proficiency in all skills. Expertise: choose one skill in which you lack Expertise; you gain Expertise in it.",
    effects:ALL_SKILL_KEYS.map(skillProf),
    choices:[{id:"expertise", label:"Expertise", type:"skill", from:"any", count:1, grant:"expertise"}]},
  "Boon of Speed": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"Escape Artist: as a Bonus Action, you can take the Disengage action, which also ends the Grappled condition on you. Quickness: your Speed increases by 30 feet.",
    effects:[bonus("speed", 30)]},
  "Boon of Spell Recall": {source:"PHB'24", category:"epicBoon", abilities:["int","wis","cha"], prereq:{level:19, spellcasting:true},
    description:"Free Casting: whenever you cast a spell with a level 1–4 spell slot, roll 1d4. If the number equals the slot's level, the slot isn't expended."},
  "Boon of the Night Spirit": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"Merge with Shadows: while within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action; it ends right after you take an action, Bonus Action or Reaction. Shadowy Form: while within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant."},
  "Boon of Truesight": {source:"PHB'24", category:"epicBoon", abilities:"any", prereq:{level:19},
    description:"Truesight: you have Truesight with a range of 60 feet.",
    grants:{senses:"Truesight 60 ft"}}
};

// ---------------------------------------------------------------------------------------
// CLASSES
// Checked against the SRD 5.2.1 class tables (CC-BY-4.0, Wizards of the Coast).
// hitDie, saves, armor (training: light|medium|heavy|shield), weapons/tools (text for the sheet)
// skillChoice:  {count, from:[skill keys] | "any"} picked at level 1
// multiclass:   what you get when this is NOT your first class
// caster:       "full" | "half" | "pact" | null — drives spell slots. spellAbility for the class's spells.
// columns:      per-level class table values (index 0 = level 1). Feature descriptions can show them
//               with {Column Name}, and resources/effects can use them as their value.
// cantrips / prepared: spells-known table columns, used to prompt for new spells on level up.
// asiLevels:    Ability Score Improvement levels. epicBoonLevel: the level 19 Epic Boon feat.
// subclasses / subclassLevel / subclassFeatureLevels: subclass picking; features are in SUBCLASS_DATA below.
// features:     {level, name, description, ...} gained at that class level. Optional:
//                 resource   – tracker: max is a number, "pb", {column}, {byLevel:{lvl:n}},
//                              {ability, min} (ability modifier) or {classLevelTimes:n};
//                              resetOn short|long; resetOnFrom:{level, resetOn} changes it later
//                 effects    – Effects Engine entries; value can be {column} to scale with level
//                 spells     – always-prepared spells; choices – same types as feats, plus
//                              "fightingStyle", "subclass" and skill from:"proficient"
//                 grants     – {proficiencies, senses}; abilityIncrease – {str:4, con:4, max:25}
//                 effect value {classLevel:true} follows the class level (e.g. Draconic Resilience HP)
var SPELL_SLOTS_BY_CASTER_LEVEL = [
  [2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]
];
// Warlock Pact Magic: [slot level, number of slots] per Warlock level.
var PACT_MAGIC_TABLE = [
  [1,1],[1,2],[2,2],[2,2],[3,2],[3,2],[4,2],[4,2],[5,2],[5,2],
  [5,3],[5,3],[5,3],[5,3],[5,3],[5,3],[5,4],[5,4],[5,4],[5,4]
];
var STANDARD_ASI_LEVELS = [4,8,12,16];

var ELDRITCH_INVOCATIONS = ["Agonizing Blast","Armor of Shadows","Ascendant Step (lvl 5+)","Devil's Sight (lvl 2+)","Devouring Blade (lvl 12+)","Eldritch Mind",
  "Eldritch Smite (lvl 5+)","Eldritch Spear (lvl 2+)","Fiendish Vigor (lvl 2+)","Gaze of Two Minds (lvl 5+)","Gift of the Depths (lvl 5+)",
  "Gift of the Protectors (lvl 9+)","Investment of the Chain Master (lvl 5+)","Lessons of the First Ones (lvl 2+)","Lifedrinker (lvl 9+)",
  "Mask of Many Faces (lvl 2+)","Master of Myriad Forms (lvl 5+)","Misty Visions (lvl 2+)","One with Shadows (lvl 5+)","Otherworldly Leap (lvl 2+)",
  "Pact of the Blade","Pact of the Chain","Pact of the Tome","Repelling Blast (lvl 2+)","Thirsting Blade (lvl 5+)",
  "Visions of Distant Realms (lvl 9+)","Whispers of the Grave (lvl 7+)","Witch Sight (lvl 15+)"].map(function(n){ return {name:n}; });
var METAMAGIC_OPTIONS = ["Careful Spell (1 SP)","Distant Spell (1 SP)","Empowered Spell (1 SP)","Extended Spell (1 SP)","Heightened Spell (2 SP)",
  "Quickened Spell (2 SP)","Seeking Spell (1 SP)","Subtle Spell (1 SP)","Transmuted Spell (1 SP)","Twinned Spell (1 SP)"].map(function(n){ return {name:n}; });

function weaponMasteryChoice(count){ return {id:"weapons", label:"Weapon kind (mastery)", type:"text", count:count}; }
function expertiseChoice(count){ return {id:"expertise", label:"Expertise", type:"skill", from:"proficient", count:count, grant:"expertise"}; }
function asiFeature(level){ return {level:level, name:"Ability Score Improvement", description:"You gain the Ability Score Improvement feat or another feat you qualify for (chosen in the level-up wizard)."}; }

var CLASS_DATA = {
  Barbarian: {
    source:"PHB'24", hitDie:12, primary:["str"], saves:["str","con"],
    skillChoice:{count:2, from:["animalHandling","athletics","intimidation","nature","perception","survival"]},
    weapons:"Simple and Martial weapons", tools:"", armor:["light","medium","shield"],
    multiclass:{proficiencies:"Weapons: Martial weapons\nArmor: Shields", armor:["shield"]},
    caster:null, asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,6,10,14],
    subclasses:["Path of the Berserker","Path of the Wild Heart","Path of the World Tree","Path of the Zealot"],
    columns:{"Rages":[2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6], "Rage Damage":["+2","+2","+2","+2","+2","+2","+2","+2","+3","+3","+3","+3","+3","+3","+3","+4","+4","+4","+4","+4"],
      "Weapon Mastery":[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4]},
    features:[
      {level:1, name:"Rage", description:"Bonus Action (not in Heavy armor). While raging: Resistance to Bludgeoning, Piercing and Slashing damage; +{Rage Damage} damage on Strength attacks; Advantage on Strength checks and saves; no Concentration or spellcasting. Lasts until the end of your next turn, extended by attacking, forcing a save or a Bonus Action (up to 10 minutes). Regain one use on a Short Rest, all on a Long Rest.",
        resource:{max:{column:"Rages"}, resetOn:"long"}},
      {level:1, name:"Unarmored Defense", description:"While not wearing armor, your base AC is 10 + Dex modifier + Con modifier. You can still use a Shield."},
      {level:1, name:"Weapon Mastery", description:"You can use the mastery properties of {Weapon Mastery} kinds of Simple or Martial Melee weapons. Change one choice after a Long Rest.", choices:[weaponMasteryChoice(2)]},
      {level:2, name:"Danger Sense", description:"Advantage on Dexterity saving throws unless you're Incapacitated."},
      {level:2, name:"Reckless Attack", description:"When you make your first attack roll on your turn, you can attack recklessly: Advantage on Strength attack rolls until your next turn, but attack rolls against you have Advantage too."},
      {level:3, name:"Primal Knowledge", description:"Gain proficiency in another Barbarian skill. While raging, you can make Acrobatics, Intimidation, Perception, Stealth or Survival checks as Strength checks.",
        choices:[{id:"skill", label:"Skill", type:"skill", from:["animalHandling","athletics","intimidation","nature","perception","survival"], count:1, grant:"proficiency"}]},
      {level:4, name:"Weapon Mastery (more weapons)", description:"You can now use the mastery properties of one more kind of weapon.", choices:[weaponMasteryChoice(1)]},
      {level:5, name:"Extra Attack", description:"You attack twice instead of once when you take the Attack action."},
      {level:5, name:"Fast Movement", description:"Your Speed increases by 10 feet while you aren't wearing Heavy armor. (Toggle the effect off in Heavy armor.)",
        effects:[{target:"speed", type:"bonus", value:10, condition:"manual", active:true}]},
      {level:7, name:"Feral Instinct", description:"Advantage on Initiative rolls."},
      {level:7, name:"Instinctive Pounce", description:"As part of the Bonus Action to enter your Rage, you can move up to half your Speed."},
      {level:9, name:"Brutal Strike", description:"When you use Reckless Attack, you can forgo Advantage on one Strength attack; if it hits, it deals an extra 1d10 damage and you choose Forceful Blow (push 15 ft, then follow half your Speed) or Hamstring Blow (Speed -15 ft until your next turn)."},
      {level:10, name:"Weapon Mastery (more weapons)", description:"You can now use the mastery properties of one more kind of weapon.", choices:[weaponMasteryChoice(1)]},
      {level:11, name:"Relentless Rage", description:"If you drop to 0 HP while raging and don't die outright, make a DC 10 Con save (DC +5 each later use, resets on a Short or Long Rest). On a success your HP becomes twice your Barbarian level."},
      {level:13, name:"Improved Brutal Strike", description:"New Brutal Strike options: Staggering Blow (Disadvantage on its next save, no Opportunity Attacks) and Sundering Blow (next attack by someone else gets +5)."},
      {level:15, name:"Persistent Rage", description:"When you roll Initiative you can regain all uses of Rage (once per Long Rest). Your Rage now lasts 10 minutes without needing to be extended.",
        resource:{name:"Persistent Rage (regain Rages)", max:1, resetOn:"long"}},
      {level:17, name:"Improved Brutal Strike (2d10)", description:"Brutal Strike's extra damage becomes 2d10, and you can apply two different Brutal Strike effects."},
      {level:18, name:"Indomitable Might", description:"If your total for a Strength check or Strength save is lower than your Strength score, you can use the score instead."},
      {level:20, name:"Primal Champion", description:"Your Strength and Constitution scores increase by 4, to a maximum of 25.", abilityIncrease:{str:4, con:4, max:25}}
    ]
  },

  Bard: {
    source:"PHB'24", hitDie:8, primary:["cha"], saves:["dex","cha"],
    skillChoice:{count:3, from:"any"},
    weapons:"Simple weapons", tools:"Three Musical Instruments of your choice", armor:["light"],
    multiclass:{proficiencies:"Armor: Light armor\nTools: One Musical Instrument of your choice", armor:["light"], skillChoice:{count:1, from:"any"}},
    caster:"full", spellAbility:"cha", asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,6,14],
    subclasses:["College of Dance","College of Glamour","College of Lore","College of Valor"],
    cantrips:[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    prepared:[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],
    columns:{"Bardic Die":["d6","d6","d6","d6","d8","d8","d8","d8","d8","d10","d10","d10","d10","d10","d12","d12","d12","d12","d12","d12"]},
    features:[
      {level:1, name:"Bardic Inspiration", description:"Bonus Action: give a creature within 60 ft a Bardic Inspiration die ({Bardic Die}). Within the next hour, when it fails a D20 Test, it can roll the die and add it. Uses equal to your Charisma modifier (min 1).",
        resource:{max:{ability:"cha", min:1}, resetOn:"long", resetOnFrom:{level:5, resetOn:"short"}}},
      {level:1, name:"Spellcasting", description:"Charisma is your spellcasting ability. You prepare Bard spells (changing one when you gain a level) and can use a Musical Instrument as a focus."},
      {level:2, name:"Expertise", description:"Gain Expertise in two skills you're proficient in (Performance and Persuasion are recommended).", choices:[expertiseChoice(2)]},
      {level:2, name:"Jack of All Trades", description:"Add half your Proficiency Bonus (round down) to ability checks using a skill you aren't proficient in.",
        effects:[{target:"halfProfSkills", type:"grant", value:"", condition:"always"}]},
      {level:5, name:"Font of Inspiration", description:"You now regain all Bardic Inspiration on a Short or Long Rest, and you can expend a spell slot (no action) to regain one use."},
      {level:7, name:"Countercharm", description:"Reaction when you or a creature within 30 ft fails a save against being Charmed or Frightened: the save is rerolled with Advantage."},
      {level:9, name:"Expertise (two more)", description:"Gain Expertise in two more skills you're proficient in.", choices:[expertiseChoice(2)]},
      {level:10, name:"Magical Secrets", description:"Whenever your Prepared Spells number increases, you can pick the new spells from the Bard, Cleric, Druid and Wizard lists; they count as Bard spells."},
      {level:18, name:"Superior Inspiration", description:"When you roll Initiative, you regain Bardic Inspiration uses until you have two."},
      {level:20, name:"Words of Creation", description:"You always have Power Word Heal and Power Word Kill prepared, and can target a second creature within 10 ft of the first.",
        spells:[{name:"Power Word Heal", level:9}, {name:"Power Word Kill", level:9}]}
    ]
  },

  Cleric: {
    source:"PHB'24", hitDie:8, primary:["wis"], saves:["wis","cha"],
    skillChoice:{count:2, from:["history","insight","medicine","persuasion","religion"]},
    weapons:"Simple weapons", tools:"", armor:["light","medium","shield"],
    multiclass:{proficiencies:"Armor: Light and Medium armor, Shields", armor:["light","medium","shield"]},
    caster:"full", spellAbility:"wis", asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,6,17],
    subclasses:["Life Domain","Light Domain","Trickery Domain","War Domain"],
    cantrips:[3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
    prepared:[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],
    columns:{"Channel Divinity":[0,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4], "Divine Spark":["1d8","1d8","1d8","1d8","1d8","1d8","2d8","2d8","2d8","2d8","2d8","2d8","3d8","3d8","3d8","3d8","3d8","4d8","4d8","4d8"]},
    features:[
      {level:1, name:"Spellcasting", description:"Wisdom is your spellcasting ability. You prepare Cleric spells (change them after a Long Rest) and can use a Holy Symbol as a focus."},
      {level:1, name:"Divine Order", description:"Choose a sacred role. Protector: Martial weapons and Heavy armor training. Thaumaturge: one extra Cleric cantrip, and a bonus equal to your Wisdom modifier (min +1) on Intelligence (Arcana or Religion) checks.",
        choices:[{id:"order", label:"Divine Order", type:"option", inName:true, options:[
          {name:"Protector", grants:{proficiencies:"Weapons: Martial weapons\nArmor: Heavy armor"}},
          {name:"Thaumaturge"}]}]},
      {level:2, name:"Channel Divinity", description:"Uses: {Channel Divinity} (regain one on a Short Rest, all on a Long Rest). Divine Spark: Magic action, a creature within 30 ft either regains {Divine Spark} + Wis mod HP or makes a Con save against that much Necrotic or Radiant damage (half on success). Turn Undead: Undead within 30 ft make a Wis save or are Frightened and Incapacitated for 1 minute.",
        resource:{max:{column:"Channel Divinity"}, resetOn:"long"}},
      {level:5, name:"Sear Undead", description:"When you use Turn Undead, roll a number of d8s equal to your Wisdom modifier (min 1); each Undead that fails takes that much Radiant damage."},
      {level:7, name:"Blessed Strikes", description:"Choose Divine Strike (once per turn, +1d8 Necrotic or Radiant on a weapon hit) or Potent Spellcasting (add your Wisdom modifier to Cleric cantrip damage).",
        choices:[{id:"strike", label:"Blessed Strikes", type:"option", inName:true, options:[{name:"Divine Strike"},{name:"Potent Spellcasting"}]}]},
      {level:10, name:"Divine Intervention", description:"Magic action: cast any Cleric spell of level 5 or lower (no Reaction spells) without a slot or Material components. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}},
      {level:14, name:"Improved Blessed Strikes", description:"Divine Strike becomes 2d8; or with Potent Spellcasting, damaging a creature with a Cleric cantrip lets you give yourself or a creature within 60 ft Temporary HP equal to twice your Wisdom modifier."},
      {level:20, name:"Greater Divine Intervention", description:"Divine Intervention can now cast Wish. If you do, you can't use Divine Intervention again until you finish 2d4 Long Rests."}
    ]
  },

  Druid: {
    source:"PHB'24", hitDie:8, primary:["wis"], saves:["int","wis"],
    skillChoice:{count:2, from:["animalHandling","arcana","insight","medicine","nature","perception","religion","survival"]},
    weapons:"Simple weapons", tools:"Herbalism Kit", armor:["light","shield"],
    multiclass:{proficiencies:"Armor: Light armor, Shields", armor:["light","shield"]},
    caster:"full", spellAbility:"wis", asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,6,10,14],
    subclasses:["Circle of the Land","Circle of the Moon","Circle of the Sea","Circle of the Stars"],
    cantrips:[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    prepared:[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],
    columns:{"Wild Shape":[0,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4],
      "Beast Shapes":["","4 forms, max CR 1/4, no Fly Speed","4 forms, max CR 1/4, no Fly Speed","6 forms, max CR 1/2, no Fly Speed","6 forms, max CR 1/2, no Fly Speed","6 forms, max CR 1/2, no Fly Speed","6 forms, max CR 1/2, no Fly Speed",
        "8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed",
        "8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed","8 forms, max CR 1, Fly Speed allowed"]},
    features:[
      {level:1, name:"Spellcasting", description:"Wisdom is your spellcasting ability. You prepare Druid spells (change them after a Long Rest) and can use a Druidic Focus."},
      {level:1, name:"Druidic", description:"You know Druidic and always have Speak with Animals prepared. You can leave hidden messages only Druids can read (others spot them with a DC 15 Investigation check).",
        spells:[{name:"Speak with Animals", level:1}]},
      {level:1, name:"Primal Order", description:"Choose a sacred role. Magician: one extra Druid cantrip, and a bonus equal to your Wisdom modifier (min +1) on Intelligence (Arcana or Nature) checks. Warden: Martial weapons and Medium armor training.",
        choices:[{id:"order", label:"Primal Order", type:"option", inName:true, options:[
          {name:"Magician"},
          {name:"Warden", grants:{proficiencies:"Weapons: Martial weapons\nArmor: Medium armor"}}]}]},
      {level:2, name:"Wild Shape", description:"Bonus Action: turn into a known Beast form for hours equal to half your Druid level; you gain Temporary HP equal to your Druid level. Known forms: {Beast Shapes}. Uses: {Wild Shape} (regain one on a Short Rest, all on a Long Rest).",
        resource:{max:{column:"Wild Shape"}, resetOn:"long"}},
      {level:2, name:"Wild Companion", description:"Magic action: expend a spell slot or a use of Wild Shape to cast Find Familiar without Material components. The familiar is Fey and vanishes on a Long Rest."},
      {level:5, name:"Wild Resurgence", description:"Once per turn, if you have no Wild Shape uses, expend a spell slot to gain one. You can also expend a Wild Shape use to gain a level 1 spell slot (once per Long Rest).",
        resource:{name:"Wild Resurgence (slot from Wild Shape)", max:1, resetOn:"long"}},
      {level:7, name:"Elemental Fury", description:"Choose Potent Spellcasting (add your Wisdom modifier to Druid cantrip damage) or Primal Strike (once per turn, +1d8 Cold, Fire, Lightning or Thunder damage on a weapon or Beast-form hit).",
        choices:[{id:"fury", label:"Elemental Fury", type:"option", inName:true, options:[{name:"Potent Spellcasting"},{name:"Primal Strike"}]}]},
      {level:15, name:"Improved Elemental Fury", description:"Potent Spellcasting: Druid cantrips with a range of 10+ ft gain +300 ft range. Primal Strike: the extra damage becomes 2d8."},
      {level:18, name:"Beast Spells", description:"You can cast spells in Wild Shape, except ones with a costly or consumed Material component."},
      {level:20, name:"Archdruid", description:"Evergreen Wild Shape: when you roll Initiative with no Wild Shape uses, regain one. Nature Magician: convert Wild Shape uses into a spell slot (2 spell levels each, once per Long Rest). Longevity: you age one year per ten."}
    ]
  },

  Fighter: {
    source:"PHB'24", hitDie:10, primary:["str","dex"], saves:["str","con"],
    skillChoice:{count:2, from:["acrobatics","animalHandling","athletics","history","insight","intimidation","persuasion","perception","survival"]},
    weapons:"Simple and Martial weapons", tools:"", armor:["light","medium","heavy","shield"],
    multiclass:{proficiencies:"Weapons: Martial weapons\nArmor: Light and Medium armor, Shields", armor:["light","medium","shield"]},
    caster:null, asiLevels:[4,6,8,12,14,16], epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,7,10,15,18],
    subclasses:["Battle Master","Champion","Eldritch Knight","Psi Warrior"],
    columns:{"Second Wind":[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4], "Weapon Mastery":[3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6]},
    features:[
      {level:1, name:"Fighting Style", description:"You gain a Fighting Style feat (Defense is recommended). You can swap it whenever you gain a Fighter level.",
        choices:[{id:"style", label:"Fighting Style feat", type:"fightingStyle"}]},
      {level:1, name:"Second Wind", description:"Bonus Action: regain 1d10 + your Fighter level in HP. Uses: {Second Wind} (regain one on a Short Rest, all on a Long Rest).",
        resource:{max:{column:"Second Wind"}, resetOn:"long"}},
      {level:1, name:"Weapon Mastery", description:"You can use the mastery properties of {Weapon Mastery} kinds of Simple or Martial weapons. Change one choice after a Long Rest.", choices:[weaponMasteryChoice(3)]},
      {level:2, name:"Action Surge", description:"On your turn, take one additional action (not the Magic action). Once per Short or Long Rest; twice per rest from level 17 (but only once per turn).",
        resource:{max:{byLevel:{2:1, 17:2}}, resetOn:"short"}},
      {level:2, name:"Tactical Mind", description:"When you fail an ability check, you can expend a use of Second Wind to roll 1d10 and add it. If the check still fails, the use isn't expended."},
      {level:4, name:"Weapon Mastery (more weapons)", description:"You can now use the mastery properties of one more kind of weapon.", choices:[weaponMasteryChoice(1)]},
      {level:5, name:"Extra Attack", description:"You attack twice instead of once when you take the Attack action."},
      {level:5, name:"Tactical Shift", description:"When you use Second Wind as a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks."},
      {level:9, name:"Indomitable", description:"When you fail a saving throw, reroll it with a bonus equal to your Fighter level. Once per Long Rest; twice from level 13, three times from level 17.",
        resource:{max:{byLevel:{9:1, 13:2, 17:3}}, resetOn:"long"}},
      {level:9, name:"Tactical Master", description:"When you attack with a weapon whose mastery you can use, you can replace its mastery property with Push, Sap or Slow for that attack."},
      {level:10, name:"Weapon Mastery (more weapons)", description:"You can now use the mastery properties of one more kind of weapon.", choices:[weaponMasteryChoice(1)]},
      {level:11, name:"Two Extra Attacks", description:"You attack three times instead of once when you take the Attack action."},
      {level:13, name:"Studied Attacks", description:"If you miss a creature with an attack roll, you have Advantage on your next attack roll against it before the end of your next turn."},
      {level:16, name:"Weapon Mastery (more weapons)", description:"You can now use the mastery properties of one more kind of weapon.", choices:[weaponMasteryChoice(1)]},
      {level:20, name:"Three Extra Attacks", description:"You attack four times instead of once when you take the Attack action."}
    ]
  },

  Monk: {
    source:"PHB'24", hitDie:8, primary:["dex","wis"], saves:["str","dex"],
    skillChoice:{count:2, from:["acrobatics","athletics","history","insight","religion","stealth"]},
    weapons:"Simple weapons, Martial weapons with the Light property", tools:"One type of Artisan's Tools or Musical Instrument", armor:[],
    multiclass:{proficiencies:"", armor:[]},
    caster:null, asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,6,11,17],
    subclasses:["Warrior of Mercy","Warrior of Shadow","Warrior of the Elements","Warrior of the Open Hand"],
    columns:{"Martial Arts":["1d6","1d6","1d6","1d6","1d8","1d8","1d8","1d8","1d8","1d8","1d10","1d10","1d10","1d10","1d10","1d10","1d12","1d12","1d12","1d12"],
      "Focus Points":[0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
      "Unarmored Movement":[0,10,10,10,10,15,15,15,15,20,20,20,20,25,25,25,25,30,30,30]},
    features:[
      {level:1, name:"Martial Arts", description:"While unarmed or using only Monk weapons, with no armor or Shield: make an Unarmed Strike as a Bonus Action; roll {Martial Arts} instead of normal damage; use Dexterity instead of Strength for attacks, damage and Grapple/Shove DCs."},
      {level:1, name:"Unarmored Defense", description:"While not wearing armor or wielding a Shield, your base AC is 10 + Dex modifier + Wis modifier."},
      {level:2, name:"Monk's Focus", description:"You have {Focus Points} Focus Points (regained on a Short or Long Rest; save DC 8 + Wis mod + PB). Flurry of Blows: 1 FP, two Unarmed Strikes as a Bonus Action. Patient Defense: Disengage as a Bonus Action, or 1 FP for Disengage + Dodge. Step of the Wind: Dash as a Bonus Action, or 1 FP for Disengage + Dash and double jump distance.",
        resource:{name:"Focus Points", max:{column:"Focus Points"}, resetOn:"short"}},
      {level:2, name:"Unarmored Movement", description:"Your Speed increases by {Unarmored Movement} feet while you aren't wearing armor or wielding a Shield. (Toggle the effect off when armored.)",
        effects:[{target:"speed", type:"bonus", value:{column:"Unarmored Movement"}, condition:"manual", active:true}]},
      {level:2, name:"Uncanny Metabolism", description:"When you roll Initiative, you can regain all Focus Points and heal your Monk level + a roll of your Martial Arts die. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}},
      {level:3, name:"Deflect Attacks", description:"Reaction when hit by an attack dealing Bludgeoning, Piercing or Slashing damage: reduce the damage by 1d10 + Dex mod + Monk level. If reduced to 0, spend 1 FP to redirect: the target makes a Dex save or takes two Martial Arts dice + Dex mod."},
      {level:4, name:"Slow Fall", description:"Reaction when you fall: reduce the falling damage by five times your Monk level."},
      {level:5, name:"Extra Attack", description:"You attack twice instead of once when you take the Attack action."},
      {level:5, name:"Stunning Strike", description:"Once per turn when you hit with a Monk weapon or Unarmed Strike, spend 1 FP: the target makes a Con save or is Stunned until your next turn. On a success its Speed is halved and the next attack against it has Advantage."},
      {level:6, name:"Empowered Strikes", description:"Your Unarmed Strikes can deal Force damage or their normal type."},
      {level:7, name:"Evasion", description:"When a Dex save would halve damage, you take none on a success and half on a failure (not while Incapacitated)."},
      {level:9, name:"Acrobatic Movement", description:"Without armor or a Shield, you can move along vertical surfaces and across liquids on your turn without falling."},
      {level:10, name:"Heightened Focus", description:"Flurry of Blows makes three strikes; Patient Defense with FP also grants Temporary HP equal to two Martial Arts dice; Step of the Wind with FP can carry a willing Large or smaller creature with you."},
      {level:10, name:"Self-Restoration", description:"At the end of each of your turns, remove Charmed, Frightened or Poisoned from yourself. Going without food and drink doesn't give you Exhaustion."},
      {level:13, name:"Deflect Energy", description:"Deflect Attacks now works against any damage type."},
      {level:14, name:"Disciplined Survivor", description:"Proficiency in all saving throws. When you fail a save, you can spend 1 FP to reroll it.",
        effects:["str","dex","con","int","wis","cha"].map(function(k){ return {target:"saveProficiency."+k, type:"grant", value:"", condition:"always"}; })},
      {level:15, name:"Perfect Focus", description:"When you roll Initiative and don't use Uncanny Metabolism, you regain Focus Points until you have 4."},
      {level:18, name:"Superior Defense", description:"At the start of your turn, spend 3 FP: Resistance to all damage except Force for 1 minute (or until Incapacitated)."},
      {level:20, name:"Body and Mind", description:"Your Dexterity and Wisdom scores increase by 4, to a maximum of 25.", abilityIncrease:{dex:4, wis:4, max:25}}
    ]
  },

  Paladin: {
    source:"PHB'24", hitDie:10, primary:["str","cha"], saves:["wis","cha"],
    skillChoice:{count:2, from:["athletics","insight","intimidation","medicine","persuasion","religion"]},
    weapons:"Simple and Martial weapons", tools:"", armor:["light","medium","heavy","shield"],
    multiclass:{proficiencies:"Weapons: Martial weapons\nArmor: Light and Medium armor, Shields", armor:["light","medium","shield"]},
    caster:"half", spellAbility:"cha", asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,7,15,20],
    subclasses:["Oath of Devotion","Oath of Glory","Oath of the Ancients","Oath of Vengeance"],
    prepared:[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15],
    columns:{"Channel Divinity":[0,0,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3], "Aura Range":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,30,30,30]},
    features:[
      {level:1, name:"Lay On Hands", description:"Bonus Action: touch a creature and restore HP from a pool equal to five times your Paladin level (refills on a Long Rest). Spend 5 points to remove the Poisoned condition instead.",
        resource:{name:"Lay On Hands (HP pool)", max:{classLevelTimes:5}, resetOn:"long"}},
      {level:1, name:"Spellcasting", description:"Charisma is your spellcasting ability. You prepare Paladin spells (swap one after a Long Rest) and can use a Holy Symbol as a focus."},
      {level:1, name:"Weapon Mastery", description:"You can use the mastery properties of two kinds of weapons you're proficient with. Change them after a Long Rest.", choices:[weaponMasteryChoice(2)]},
      {level:2, name:"Fighting Style", description:"You gain a Fighting Style feat, or the Blessed Warrior option (two Cleric cantrips using Charisma).",
        choices:[{id:"style", label:"Fighting Style feat", type:"fightingStyle"}]},
      {level:2, name:"Paladin's Smite", description:"You always have Divine Smite prepared and can cast it without a slot once per Long Rest.",
        spells:[{name:"Divine Smite", level:1}], resource:{name:"Divine Smite (free cast)", max:1, resetOn:"long"}},
      {level:3, name:"Channel Divinity", description:"Uses: {Channel Divinity} (regain one on a Short Rest, all on a Long Rest). Divine Sense: Bonus Action, for 10 minutes you sense Celestials, Fiends and Undead within 60 ft, and consecrated or desecrated places.",
        resource:{max:{column:"Channel Divinity"}, resetOn:"long"}},
      {level:5, name:"Extra Attack", description:"You attack twice instead of once when you take the Attack action."},
      {level:5, name:"Faithful Steed", description:"You always have Find Steed prepared and can cast it without a slot once per Long Rest.",
        spells:[{name:"Find Steed", level:2}], resource:{name:"Find Steed (free cast)", max:1, resetOn:"long"}},
      {level:6, name:"Aura of Protection", description:"You and allies within your {Aura Range}-ft Emanation add your Charisma modifier (min +1) to saving throws (not while you're Incapacitated)."},
      {level:9, name:"Abjure Foes", description:"Magic action, one Channel Divinity use: up to Cha-mod creatures (min 1) within 60 ft make a Wis save or are Frightened for 1 minute (or until damaged), able to only move, act or take a Bonus Action each turn."},
      {level:10, name:"Aura of Courage", description:"You and allies in your Aura of Protection are immune to the Frightened condition."},
      {level:11, name:"Radiant Strikes", description:"When you hit with a Melee weapon or Unarmed Strike, the target takes an extra 1d8 Radiant damage."},
      {level:14, name:"Restoring Touch", description:"When you use Lay On Hands, spend 5 points per condition to also remove Blinded, Charmed, Deafened, Frightened, Paralyzed or Stunned."},
      {level:18, name:"Aura Expansion", description:"Your Aura of Protection is now a 30-foot Emanation."}
    ]
  },

  Ranger: {
    source:"PHB'24", hitDie:10, primary:["dex","wis"], saves:["str","dex"],
    skillChoice:{count:3, from:["animalHandling","athletics","insight","investigation","nature","perception","stealth","survival"]},
    weapons:"Simple and Martial weapons", tools:"", armor:["light","medium","shield"],
    multiclass:{proficiencies:"Weapons: Martial weapons\nArmor: Light and Medium armor, Shields", armor:["light","medium","shield"],
      skillChoice:{count:1, from:["animalHandling","athletics","insight","investigation","nature","perception","stealth","survival"]}},
    caster:"half", spellAbility:"wis", asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,7,11,15],
    subclasses:["Beast Master","Fey Wanderer","Gloom Stalker","Hunter"],
    prepared:[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15],
    columns:{"Favored Enemy":[2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6]},
    features:[
      {level:1, name:"Spellcasting", description:"Wisdom is your spellcasting ability. You prepare Ranger spells (swap one after a Long Rest) and can use a Druidic Focus."},
      {level:1, name:"Favored Enemy", description:"You always have Hunter's Mark prepared and can cast it without a slot {Favored Enemy} times per Long Rest.",
        spells:[{name:"Hunter's Mark", level:1}], resource:{name:"Hunter's Mark (free casts)", max:{column:"Favored Enemy"}, resetOn:"long"}},
      {level:1, name:"Weapon Mastery", description:"You can use the mastery properties of two kinds of weapons you're proficient with. Change them after a Long Rest.", choices:[weaponMasteryChoice(2)]},
      {level:2, name:"Deft Explorer", description:"Expertise in one skill you're proficient in, and you learn two languages.",
        choices:[expertiseChoice(1), {id:"languages", label:"Language", type:"text", count:2, proficiency:true, profLabel:"Languages"}]},
      {level:2, name:"Fighting Style", description:"You gain a Fighting Style feat, or the Druidic Warrior option (two Druid cantrips using Wisdom).",
        choices:[{id:"style", label:"Fighting Style feat", type:"fightingStyle"}]},
      {level:5, name:"Extra Attack", description:"You attack twice instead of once when you take the Attack action."},
      {level:6, name:"Roving", description:"Your Speed increases by 10 feet while you aren't wearing Heavy armor, and you have a Climb Speed and Swim Speed equal to your Speed. (Set Climb/Swim on the sheet; toggle the effect off in Heavy armor.)",
        effects:[{target:"speed", type:"bonus", value:10, condition:"manual", active:true}]},
      {level:9, name:"Expertise", description:"Expertise in two more skills you're proficient in.", choices:[expertiseChoice(2)]},
      {level:10, name:"Tireless", description:"Magic action: gain 1d8 + Wis modifier Temporary HP, a number of times equal to your Wisdom modifier (min 1) per Long Rest. Each Short Rest reduces your Exhaustion by 1.",
        resource:{name:"Tireless (Temp HP)", max:{ability:"wis", min:1}, resetOn:"long"}},
      {level:13, name:"Relentless Hunter", description:"Taking damage can't break your Concentration on Hunter's Mark."},
      {level:14, name:"Nature's Veil", description:"Bonus Action: become Invisible until the end of your next turn. Uses equal to your Wisdom modifier (min 1) per Long Rest.",
        resource:{max:{ability:"wis", min:1}, resetOn:"long"}},
      {level:17, name:"Precise Hunter", description:"Advantage on attack rolls against the creature marked by your Hunter's Mark."},
      {level:18, name:"Feral Senses", description:"You have Blindsight with a range of 30 feet.", grants:{senses:"Blindsight 30 ft"}},
      {level:20, name:"Foe Slayer", description:"The damage die of your Hunter's Mark becomes a d10."}
    ]
  },

  Rogue: {
    source:"PHB'24", hitDie:8, primary:["dex"], saves:["dex","int"],
    skillChoice:{count:4, from:["acrobatics","athletics","deception","insight","intimidation","investigation","perception","persuasion","sleightOfHand","stealth"]},
    weapons:"Simple weapons, Martial weapons with the Finesse or Light property", tools:"Thieves' Tools", armor:["light"],
    multiclass:{proficiencies:"Armor: Light armor\nTools: Thieves' Tools", armor:["light"],
      skillChoice:{count:1, from:["acrobatics","athletics","deception","insight","intimidation","investigation","perception","persuasion","sleightOfHand","stealth"]}},
    caster:null, asiLevels:[4,8,10,12,16], epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,9,13,17],
    subclasses:["Arcane Trickster","Assassin","Soulknife","Thief"],
    columns:{"Sneak Attack":["1d6","1d6","2d6","2d6","3d6","3d6","4d6","4d6","5d6","5d6","6d6","6d6","7d6","7d6","8d6","8d6","9d6","9d6","10d6","10d6"]},
    features:[
      {level:1, name:"Expertise", description:"Expertise in two skills you're proficient in (Sleight of Hand and Stealth are recommended).", choices:[expertiseChoice(2)]},
      {level:1, name:"Sneak Attack", description:"Once per turn, deal an extra {Sneak Attack} damage to a creature you hit with a Finesse or Ranged weapon if you have Advantage, or if an ally is within 5 ft of it (and you don't have Disadvantage)."},
      {level:1, name:"Thieves' Cant", description:"You know Thieves' Cant and one other language.",
        choices:[{id:"language", label:"Language", type:"text", count:1, proficiency:true, profLabel:"Languages"}],
        grants:{proficiencies:"Languages: Thieves' Cant"}},
      {level:1, name:"Weapon Mastery", description:"You can use the mastery properties of two kinds of weapons you're proficient with. Change them after a Long Rest.", choices:[weaponMasteryChoice(2)]},
      {level:2, name:"Cunning Action", description:"On your turn, take Dash, Disengage or Hide as a Bonus Action."},
      {level:3, name:"Steady Aim", description:"Bonus Action, if you haven't moved this turn: Advantage on your next attack roll this turn, and your Speed becomes 0 until the end of the turn."},
      {level:5, name:"Cunning Strike", description:"When you deal Sneak Attack damage, forgo dice for an effect (save DC 8 + Dex mod + PB): Poison (1d6, Con save or Poisoned; needs a Poisoner's Kit), Trip (1d6, Dex save or Prone), Withdraw (1d6, move half your Speed without provoking)."},
      {level:5, name:"Uncanny Dodge", description:"Reaction when an attacker you can see hits you: halve the attack's damage."},
      {level:6, name:"Expertise (two more)", description:"Expertise in two more skills you're proficient in.", choices:[expertiseChoice(2)]},
      {level:7, name:"Evasion", description:"When a Dex save would halve damage, you take none on a success and half on a failure (not while Incapacitated)."},
      {level:7, name:"Reliable Talent", description:"When you make an ability check using a skill or tool proficiency, treat a d20 roll of 9 or lower as a 10."},
      {level:11, name:"Improved Cunning Strike", description:"You can use up to two Cunning Strike effects on one Sneak Attack, paying for each."},
      {level:14, name:"Devious Strikes", description:"New Cunning Strike options: Daze (2d6, Con save or only one of move/action/Bonus Action), Knock Out (6d6, Con save or Unconscious for 1 minute), Obscure (3d6, Dex save or Blinded until the end of its next turn)."},
      {level:15, name:"Slippery Mind", description:"Proficiency in Wisdom and Charisma saving throws.",
        effects:[{target:"saveProficiency.wis", type:"grant", value:"", condition:"always"}, {target:"saveProficiency.cha", type:"grant", value:"", condition:"always"}]},
      {level:18, name:"Elusive", description:"No attack roll can have Advantage against you unless you're Incapacitated."},
      {level:20, name:"Stroke of Luck", description:"If you fail a D20 Test, you can turn the roll into a 20. Once per Short or Long Rest.",
        resource:{max:1, resetOn:"short"}}
    ]
  },

  Sorcerer: {
    source:"PHB'24", hitDie:6, primary:["cha"], saves:["con","cha"],
    skillChoice:{count:2, from:["arcana","deception","insight","intimidation","persuasion","religion"]},
    weapons:"Simple weapons", tools:"", armor:[],
    multiclass:{proficiencies:"", armor:[]},
    caster:"full", spellAbility:"cha", asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,6,14,18],
    subclasses:["Aberrant Sorcery","Clockwork Sorcery","Draconic Sorcery","Wild Magic Sorcery"],
    cantrips:[4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6],
    prepared:[2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],
    columns:{"Sorcery Points":[0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]},
    features:[
      {level:1, name:"Spellcasting", description:"Charisma is your spellcasting ability. You prepare Sorcerer spells (swap one when you gain a level) and can use an Arcane Focus."},
      {level:1, name:"Innate Sorcery", description:"Bonus Action: for 1 minute, your Sorcerer spell save DC increases by 1 and you have Advantage on Sorcerer spell attack rolls. Twice per Long Rest.",
        resource:{max:2, resetOn:"long"}},
      {level:2, name:"Font of Magic", description:"You have {Sorcery Points} Sorcery Points (regained on a Long Rest). Convert a spell slot into points equal to its level, or as a Bonus Action spend points to create a slot (1st: 2, 2nd: 3, 3rd: 5, 4th: 6, 5th: 7; created slots vanish on a Long Rest).",
        resource:{name:"Sorcery Points", max:{column:"Sorcery Points"}, resetOn:"long"}},
      {level:2, name:"Metamagic", description:"You learn two Metamagic options and can use one per spell by spending Sorcery Points. Swap one whenever you gain a Sorcerer level.",
        choices:[{id:"metamagic", label:"Metamagic", type:"option", count:2, options:METAMAGIC_OPTIONS}]},
      {level:5, name:"Sorcerous Restoration", description:"When you finish a Short Rest, regain Sorcery Points up to half your Sorcerer level (round down). Once per Long Rest.",
        resource:{max:1, resetOn:"long"}},
      {level:7, name:"Sorcery Incarnate", description:"With no Innate Sorcery uses left, you can spend 2 Sorcery Points to activate it. While it's active, you can use up to two Metamagic options on each spell."},
      {level:10, name:"Metamagic (two more)", description:"You learn two more Metamagic options.",
        choices:[{id:"metamagic", label:"Metamagic", type:"option", count:2, options:METAMAGIC_OPTIONS}]},
      {level:17, name:"Metamagic (two more)", description:"You learn two more Metamagic options.",
        choices:[{id:"metamagic", label:"Metamagic", type:"option", count:2, options:METAMAGIC_OPTIONS}]},
      {level:20, name:"Arcane Apotheosis", description:"While Innate Sorcery is active, you can use one Metamagic option on each of your turns without spending Sorcery Points."}
    ]
  },

  Warlock: {
    source:"PHB'24", hitDie:8, primary:["cha"], saves:["wis","cha"],
    skillChoice:{count:2, from:["arcana","deception","history","intimidation","investigation","nature","religion"]},
    weapons:"Simple weapons", tools:"", armor:["light"],
    multiclass:{proficiencies:"Armor: Light armor", armor:["light"]},
    caster:"pact", spellAbility:"cha", asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,6,10,14],
    subclasses:["Archfey Patron","Celestial Patron","Fiend Patron","Great Old One Patron"],
    cantrips:[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    prepared:[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],
    columns:{"Eldritch Invocations":[1,3,3,3,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10]},
    features:[
      {level:1, name:"Eldritch Invocations", description:"You know {Eldritch Invocations} invocation(s). Swap one whenever you gain a Warlock level (prerequisites apply).",
        choices:[{id:"invocations", label:"Invocation", type:"option", count:1, options:ELDRITCH_INVOCATIONS}]},
      {level:1, name:"Pact Magic", description:"Charisma is your spellcasting ability. Your Pact Magic slots are all the same level and come back on a Short or Long Rest. You prepare Warlock spells (swap one when you gain a level) and can use an Arcane Focus."},
      {level:2, name:"Eldritch Invocations (two more)", description:"You learn two more invocations.", choices:[{id:"invocations", label:"Invocation", type:"option", count:2, options:ELDRITCH_INVOCATIONS}]},
      {level:2, name:"Magical Cunning", description:"1-minute rite: regain expended Pact Magic slots, up to half your maximum (round up). Once per Long Rest.",
        resource:{max:1, resetOn:"long"}},
      {level:5, name:"Eldritch Invocations (two more)", description:"You learn two more invocations.", choices:[{id:"invocations", label:"Invocation", type:"option", count:2, options:ELDRITCH_INVOCATIONS}]},
      {level:7, name:"Eldritch Invocations (one more)", description:"You learn one more invocation.", choices:[{id:"invocations", label:"Invocation", type:"option", count:1, options:ELDRITCH_INVOCATIONS}]},
      {level:9, name:"Eldritch Invocations (one more)", description:"You learn one more invocation.", choices:[{id:"invocations", label:"Invocation", type:"option", count:1, options:ELDRITCH_INVOCATIONS}]},
      {level:9, name:"Contact Patron", description:"You always have Contact Other Plane prepared, can cast it without a slot to contact your patron, and automatically succeed on its save. Once per Long Rest.",
        spells:[{name:"Contact Other Plane", level:5}], resource:{max:1, resetOn:"long"}},
      {level:11, name:"Mystic Arcanum (level 6)", description:"Choose a level 6 Warlock spell; cast it once per Long Rest without a slot.",
        choices:[{id:"spell", label:"Level 6 Warlock spell", type:"spell", level:6, count:1, oncePerLongRest:true}]},
      {level:12, name:"Eldritch Invocations (one more)", description:"You learn one more invocation.", choices:[{id:"invocations", label:"Invocation", type:"option", count:1, options:ELDRITCH_INVOCATIONS}]},
      {level:13, name:"Mystic Arcanum (level 7)", description:"Choose a level 7 Warlock spell; cast it once per Long Rest without a slot.",
        choices:[{id:"spell", label:"Level 7 Warlock spell", type:"spell", level:7, count:1, oncePerLongRest:true}]},
      {level:15, name:"Eldritch Invocations (one more)", description:"You learn one more invocation.", choices:[{id:"invocations", label:"Invocation", type:"option", count:1, options:ELDRITCH_INVOCATIONS}]},
      {level:15, name:"Mystic Arcanum (level 8)", description:"Choose a level 8 Warlock spell; cast it once per Long Rest without a slot.",
        choices:[{id:"spell", label:"Level 8 Warlock spell", type:"spell", level:8, count:1, oncePerLongRest:true}]},
      {level:17, name:"Mystic Arcanum (level 9)", description:"Choose a level 9 Warlock spell; cast it once per Long Rest without a slot.",
        choices:[{id:"spell", label:"Level 9 Warlock spell", type:"spell", level:9, count:1, oncePerLongRest:true}]},
      {level:18, name:"Eldritch Invocations (one more)", description:"You learn one more invocation.", choices:[{id:"invocations", label:"Invocation", type:"option", count:1, options:ELDRITCH_INVOCATIONS}]},
      {level:20, name:"Eldritch Master", description:"When you use Magical Cunning, you regain all your expended Pact Magic slots."}
    ]
  },

  Wizard: {
    source:"PHB'24", hitDie:6, primary:["int"], saves:["int","wis"],
    skillChoice:{count:2, from:["arcana","history","insight","investigation","medicine","nature","religion"]},
    weapons:"Simple weapons", tools:"", armor:[],
    multiclass:{proficiencies:"", armor:[]},
    caster:"full", spellAbility:"int", asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
    subclassLevel:3, subclassFeatureLevels:[3,6,10,14],
    subclasses:["Abjurer","Diviner","Evoker","Illusionist"],
    cantrips:[3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
    prepared:[4,5,6,7,9,10,11,12,14,15,16,16,17,18,19,21,22,23,24,25],
    spellbookPerLevel:2,
    features:[
      {level:1, name:"Spellcasting", description:"Intelligence is your spellcasting ability. Your spellbook starts with six level 1 Wizard spells and gains two each level; you prepare spells from it (change them after a Long Rest) and can use an Arcane Focus or the spellbook as a focus."},
      {level:1, name:"Ritual Adept", description:"You can cast any Ritual spell in your spellbook as a Ritual without having it prepared (reading from the book)."},
      {level:1, name:"Arcane Recovery", description:"When you finish a Short Rest, recover expended spell slots with a combined level up to half your Wizard level (round up), none level 6+. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}},
      {level:2, name:"Scholar", description:"Expertise in one of Arcana, History, Investigation, Medicine, Nature or Religion (you must be proficient in it).",
        choices:[{id:"skill", label:"Scholar", type:"skill", from:["arcana","history","investigation","medicine","nature","religion"], count:1, grant:"expertise"}]},
      {level:5, name:"Memorize Spell", description:"When you finish a Short Rest, you can swap one prepared level 1+ spell for another from your spellbook."},
      {level:18, name:"Spell Mastery", description:"Choose a level 1 and a level 2 spell in your spellbook (casting time of an action). They're always prepared and you can cast them at their lowest level without a slot. You can swap them after a Long Rest.",
        choices:[{id:"spell1", label:"Level 1 spell (at will)", type:"spell", level:1, count:1}, {id:"spell2", label:"Level 2 spell (at will)", type:"spell", level:2, count:1}]},
      {level:20, name:"Signature Spells", description:"Choose two level 3 spells in your spellbook. They're always prepared, and you can cast each once at level 3 without a slot per Short or Long Rest.",
        choices:[{id:"spells", label:"Level 3 signature spell", type:"spell", level:3, count:2}]}
    ]
  }
};

// ---------------------------------------------------------------------------------------
// SUBCLASSES  SUBCLASS_DATA[class][subclass]
// Same feature format as class features (level = class level). Extra fields:
//   checked: "SRD"  – checked against SRD 5.2.1;  "PHB" – written from the 2024 PHB without the
//                     SRD to compare against, so these are the ones worth a spot-check.
//   caster/spellAbility/cantrips/prepared – for subclasses that add spellcasting (one-third casters)
//   columns – extra scaling values for this subclass, like class columns
// Always-prepared subclass spells use subclassSpells(): {classLevel: {"Spell Name": spellLevel}}.
function subclassSpells(name, table){
  return Object.keys(table).map(function(lvl){
    var names = Object.keys(table[lvl]);
    return {level:Number(lvl), name:name+(Number(lvl)===3 ? "" : " (level "+lvl+")"),
      description:"Always prepared: "+names.join(", ")+".",
      spells:names.map(function(n){ return {name:n, level:table[lvl][n]}; })};
  });
}
var THIRD_CASTER_PREPARED = [0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13];
var PSIONIC_DICE = {"Psionic Energy Dice":[0,0,4,4,6,6,6,6,8,8,8,8,10,10,10,10,12,12,12,12],
  "Psionic Die":["","","d6","d6","d8","d8","d8","d8","d8","d8","d10","d10","d10","d10","d10","d10","d12","d12","d12","d12"]};
var BATTLE_MASTER_MANEUVERS = ["Ambush","Bait and Switch","Commander's Strike","Commanding Presence","Disarming Attack","Distracting Strike",
  "Evasive Footwork","Feinting Attack","Goading Attack","Lunging Attack","Maneuvering Attack","Menacing Attack","Parry","Precision Attack",
  "Pushing Attack","Rally","Riposte","Sweeping Attack","Tactical Assessment","Trip Attack"].map(function(n){ return {name:n}; });
function maneuverChoice(count){ return {id:"maneuvers", label:"Maneuver", type:"option", count:count, options:BATTLE_MASTER_MANEUVERS}; }

var SUBCLASS_DATA = {
  Barbarian: {
    "Path of the Berserker": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Frenzy", description:"If you use Reckless Attack while raging, the first target you hit on your turn with a Strength attack takes extra damage: a number of d6s equal to your Rage Damage bonus ({Rage Damage})."},
      {level:6, name:"Mindless Rage", description:"Immunity to the Charmed and Frightened conditions while raging; entering Rage ends them."},
      {level:10, name:"Retaliation", description:"When a creature within 5 ft damages you, you can take a Reaction to make one melee attack against it."},
      {level:14, name:"Intimidating Presence", description:"Bonus Action: creatures of your choice in a 30-ft Emanation make a Wis save (DC 8 + Str mod + PB) or are Frightened for 1 minute (repeating the save each turn). Once per Long Rest, or expend a Rage use to restore it.",
        resource:{max:1, resetOn:"long"}}
    ]},
    "Path of the Wild Heart": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Animal Speaker", description:"You can cast Beast Sense and Speak with Animals, but only as Rituals (Wisdom is your spellcasting ability).",
        spells:[{name:"Beast Sense", level:2}, {name:"Speak with Animals", level:1}]},
      {level:3, name:"Rage of the Wilds", description:"Each time you Rage, choose: Bear (Resistance to every damage type except Force, Necrotic, Psychic and Radiant), Eagle (Disengage and Dash as part of the Bonus Action to Rage, and Dash as a Bonus Action while raging) or Wolf (allies have Advantage on attacks against enemies within 5 ft of you)."},
      {level:6, name:"Aspect of the Wilds", description:"Choose one, changeable after a Long Rest: Owl (Darkvision 60 ft, or +60 ft), Panther (Climb Speed equal to your Speed) or Salmon (Swim Speed equal to your Speed)."},
      {level:10, name:"Nature Speaker", description:"You can cast Commune with Nature, but only as a Ritual.", spells:[{name:"Commune with Nature", level:5}]},
      {level:14, name:"Power of the Wilds", description:"Each time you Rage, choose: Falcon (Fly Speed equal to your Speed if not wearing armor), Lion (enemies within 5 ft have Disadvantage on attacks against anyone but you) or Ram (your melee hits can knock Large or smaller creatures Prone)."}
    ]},
    "Path of the World Tree": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Vitality of the Tree", description:"Vitality Surge: when you Rage, gain Temporary HP equal to your Barbarian level. Life-Giving Force: at the start of each of your turns while raging, give a creature within 10 ft Temporary HP equal to a number of d6s equal to your Rage Damage bonus ({Rage Damage}); they vanish when your Rage ends."},
      {level:6, name:"Branches of the Tree", description:"Reaction when a creature you can see starts its turn within 30 ft while you're raging: it makes a Str save (DC 8 + Str mod + PB) or is teleported to a space within 5 ft of you and its Speed becomes 0 until the end of its turn."},
      {level:10, name:"Battering Roots", description:"Your reach is 10 ft greater with Heavy or Versatile melee weapons, and you can apply the Push or Topple mastery property in addition to the weapon's own."},
      {level:14, name:"Travel Along the Tree", description:"When you Rage, and as a Bonus Action while raging, you can teleport up to 60 ft. Once per Rage you can instead teleport up to 150 ft, bringing up to six willing creatures within 10 ft."}
    ]},
    "Path of the Zealot": {source:"PHB'24", checked:"PHB", columns:{"Warrior of the Gods":[0,0,4,4,4,5,5,5,5,5,5,6,6,6,6,6,7,7,7,7]}, features:[
      {level:3, name:"Divine Fury", description:"While raging, the first creature you hit on each of your turns takes extra Necrotic or Radiant damage (your choice) equal to 1d6 + half your Barbarian level."},
      {level:3, name:"Warrior of the Gods", description:"You have a pool of {Warrior of the Gods} d12s (refilled on a Long Rest). As a Bonus Action, spend dice from the pool to regain that many HP.",
        resource:{name:"Warrior of the Gods (d12s)", max:{column:"Warrior of the Gods"}, resetOn:"long"}},
      {level:6, name:"Fanatical Focus", description:"Once per Rage, when you fail a saving throw, you can reroll it with a bonus equal to your Rage Damage bonus."},
      {level:10, name:"Zealous Presence", description:"Bonus Action: up to ten creatures within 60 ft gain Advantage on attack rolls and saving throws until the start of your next turn. Once per Long Rest, or expend a Rage use to restore it.",
        resource:{max:1, resetOn:"long"}},
      {level:14, name:"Rage of the Gods", description:"When you Rage, you can take a divine form for 1 minute: Fly Speed equal to your Speed (can hover); Resistance to Necrotic, Psychic and Radiant damage; and when a creature within 30 ft would drop to 0 HP, you can take a Reaction and expend a Rage use to set its HP to your Barbarian level instead. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}}
    ]}
  },

  Bard: {
    "College of Dance": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Dazzling Footwork", description:"While not wearing armor or wielding a Shield: Advantage on Performance checks involving dance; Unarmored Defense (AC 10 + Dex mod + Cha mod); when you use Bardic Inspiration as part of an action, Bonus Action or Reaction, you can make an Unarmed Strike; your Unarmed Strikes can use Dexterity and deal your Bardic Inspiration die ({Bardic Die}) + Dex mod Bludgeoning damage."},
      {level:6, name:"Inspiring Movement", description:"Reaction when an enemy you can see ends its turn within 5 ft: expend a Bardic Inspiration use to move up to half your Speed, and one ally within 30 ft can use its Reaction to do the same. Neither movement provokes Opportunity Attacks."},
      {level:6, name:"Tandem Footwork", description:"When you roll Initiative, you can expend a Bardic Inspiration use, roll the die and add it to your Initiative and that of allies within 30 ft who can see or hear you."},
      {level:14, name:"Leading Evasion", description:"When you're subjected to a Dex save for half damage, you take none on a success and half on a failure; creatures within 5 ft of you making the same save get the same benefit (not while you're Incapacitated)."}
    ]},
    "College of Glamour": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Beguiling Magic", description:"You always have Charm Person and Mirror Image prepared. After casting an Enchantment or Illusion spell with a slot, a creature you can see within 60 ft makes a Wis save or is Charmed or Frightened (your choice) for 1 minute. Once per Long Rest, or expend a Bardic Inspiration use to restore it.",
        spells:[{name:"Charm Person", level:1}, {name:"Mirror Image", level:2}], resource:{max:1, resetOn:"long"}},
      {level:3, name:"Mantle of Inspiration", description:"Bonus Action: expend a Bardic Inspiration use and roll it. Up to your Charisma modifier (min 1) creatures within 60 ft each gain Temporary HP equal to twice the roll and can use their Reaction to move up to their Speed without provoking Opportunity Attacks."},
      {level:6, name:"Mantle of Majesty", description:"You always have Command prepared. Bonus Action: cast Command without a slot and for 1 minute you can cast it as a Bonus Action each turn without a slot; creatures Charmed by you automatically fail the save. Once per Long Rest, or expend a level 3+ slot to restore it.",
        spells:[{name:"Command", level:1}], resource:{max:1, resetOn:"long"}},
      {level:14, name:"Unbreakable Majesty", description:"Bonus Action: take on a majestic presence for 1 minute. The first time each turn a creature attacks you, it makes a Cha save or the attack misses and it must choose a new target. Once per Short or Long Rest.",
        resource:{max:1, resetOn:"short"}}
    ]},
    "College of Lore": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Bonus Proficiencies", description:"You gain proficiency with three skills of your choice.",
        choices:[{id:"skills", label:"Skill", type:"skill", from:"any", count:3, grant:"proficiency"}]},
      {level:3, name:"Cutting Words", description:"Reaction when a creature within 60 ft makes a damage roll or succeeds on an ability check or attack roll: expend a Bardic Inspiration use and subtract the die ({Bardic Die}) from the roll."},
      {level:6, name:"Magical Discoveries", description:"Learn two spells from the Cleric, Druid or Wizard lists (cantrips or levels you have slots for). They're always prepared; you can swap one whenever you gain a Bard level.",
        choices:[{id:"spells", label:"Magical Discovery (spell name)", type:"text", count:2}]},
      {level:14, name:"Peerless Skill", description:"When you fail an ability check or attack roll, expend a Bardic Inspiration use and add the die to the d20. If it still fails, the use isn't expended."}
    ]},
    "College of Valor": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Combat Inspiration", description:"A creature with your Bardic Inspiration die can add it to a weapon damage roll, or use its Reaction when attacked to add it to its AC against that attack."},
      {level:3, name:"Martial Training", description:"You gain Martial weapon proficiency and Medium armor and Shield training, and can use a Simple or Martial weapon as a Spellcasting Focus.",
        grants:{proficiencies:"Weapons: Martial weapons\nArmor: Medium armor, Shields"}},
      {level:6, name:"Extra Attack", description:"You attack twice when you take the Attack action, and can cast a cantrip in place of one of those attacks."},
      {level:14, name:"Battle Magic", description:"After you cast a spell with a casting time of an action, you can make one weapon attack as a Bonus Action."}
    ]}
  },

  Cleric: {
    "Life Domain": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Disciple of Life", description:"When a spell you cast with a slot restores HP, the creature regains an extra 2 + the slot's level HP."},
      {level:3, name:"Preserve Life", description:"Magic action, one Channel Divinity use: restore HP equal to five times your Cleric level, divided among Bloodied creatures within 30 ft (no more than half a creature's max HP)."}
    ].concat(subclassSpells("Life Domain Spells", {3:{"Aid":2,"Bless":1,"Cure Wounds":1,"Lesser Restoration":2}, 5:{"Mass Healing Word":3,"Revivify":3}, 7:{"Aura of Life":4,"Death Ward":4}, 9:{"Greater Restoration":5,"Mass Cure Wounds":5}})).concat([
      {level:6, name:"Blessed Healer", description:"After you cast a spell with a slot that heals others, you regain 2 + the slot's level HP."},
      {level:17, name:"Supreme Healing", description:"When you'd roll dice to restore HP with a spell or Channel Divinity, use the maximum for each die instead."}
    ])},
    "Light Domain": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Radiance of the Dawn", description:"Magic action, one Channel Divinity use: dispel magical Darkness within 30 ft, and creatures of your choice there make a Con save, taking 2d10 + your Cleric level Radiant damage (half on success)."},
      {level:3, name:"Warding Flare", description:"Reaction when a creature within 30 ft attacks you or another creature: impose Disadvantage on the attack roll. Uses equal to your Wisdom modifier (min 1) per Long Rest.",
        resource:{max:{ability:"wis", min:1}, resetOn:"long", resetOnFrom:{level:6, resetOn:"short"}}}
    ].concat(subclassSpells("Light Domain Spells", {3:{"Burning Hands":1,"Faerie Fire":1,"Scorching Ray":2,"See Invisibility":2}, 5:{"Daylight":3,"Fireball":3}, 7:{"Arcane Eye":4,"Wall of Fire":4}, 9:{"Flame Strike":5,"Scrying":5}})).concat([
      {level:6, name:"Improved Warding Flare", description:"Warding Flare now recharges on a Short or Long Rest, and the protected creature gains 2d6 + your Wisdom modifier Temporary HP."},
      {level:17, name:"Corona of Light", description:"Magic action: emit sunlight in a 60-ft Emanation for 1 minute; enemies in it have Disadvantage on saves against Radiance of the Dawn and spells that deal Fire or Radiant damage. Uses equal to your Wisdom modifier (min 1) per Long Rest.",
        resource:{max:{ability:"wis", min:1}, resetOn:"long"}}
    ])},
    "Trickery Domain": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Blessing of the Trickster", description:"Magic action: you or a willing creature within 30 ft has Advantage on Dexterity (Stealth) checks until you finish a Long Rest or use this again."},
      {level:3, name:"Invoke Duplicity", description:"Bonus Action, one Channel Divinity use: create an illusory duplicate of yourself within 30 ft for 1 minute. You can cast spells as though you were in its space, you have Advantage on attacks against creatures within 5 ft of it, and you can move it 30 ft as a Bonus Action."}
    ].concat(subclassSpells("Trickery Domain Spells", {3:{"Charm Person":1,"Disguise Self":1,"Invisibility":2,"Pass without Trace":2}, 5:{"Hypnotic Pattern":3,"Nondetection":3}, 7:{"Confusion":4,"Dimension Door":4}, 9:{"Dominate Person":5,"Modify Memory":5}})).concat([
      {level:6, name:"Trickster's Transposition", description:"When you create or move your Invoke Duplicity illusion, you can teleport to swap places with it."},
      {level:17, name:"Improved Duplicity", description:"Allies also have Advantage on attacks against creatures within 5 ft of your illusion, and when the illusion ends you or a creature within 5 ft of it regains HP equal to your Cleric level."}
    ])},
    "War Domain": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Guided Strike", description:"When you or a creature within 30 ft misses with an attack roll, expend a Channel Divinity use to give it +10, possibly turning it into a hit."},
      {level:3, name:"War Priest", description:"Bonus Action: make one attack with a weapon or an Unarmed Strike. Uses equal to your Wisdom modifier (min 1), regained on a Short or Long Rest.",
        resource:{max:{ability:"wis", min:1}, resetOn:"short"}}
    ].concat(subclassSpells("War Domain Spells", {3:{"Guiding Bolt":1,"Magic Weapon":2,"Shield of Faith":1,"Spiritual Weapon":2}, 5:{"Crusader's Mantle":3,"Spirit Guardians":3}, 7:{"Fire Shield":4,"Freedom of Movement":4}, 9:{"Hold Monster":5,"Steel Wind Strike":5}})).concat([
      {level:6, name:"War God's Blessing", description:"Expend a Channel Divinity use to cast Shield of Faith or Spiritual Weapon without a slot; it lasts 1 minute and doesn't need Concentration."},
      {level:17, name:"Avatar of Battle", description:"Resistance to Bludgeoning, Piercing and Slashing damage.",
        effects:[resist("Bludgeoning"), resist("Piercing"), resist("Slashing")]}
    ])}
  },

  Druid: {
    "Circle of the Land": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Circle of the Land Spells", description:"After each Long Rest, choose a land; its spells for your Druid level and lower are prepared. Arid: Blur, Burning Hands, Fire Bolt (3), Fireball (5), Blight (7), Wall of Stone (9). Polar: Fog Cloud, Hold Person, Ray of Frost (3), Sleet Storm (5), Ice Storm (7), Cone of Cold (9). Temperate: Misty Step, Shocking Grasp, Sleep (3), Lightning Bolt (5), Freedom of Movement (7), Tree Stride (9). Tropical: Acid Splash, Ray of Sickness, Web (3), Stinking Cloud (5), Polymorph (7), Insect Plague (9)."},
      {level:3, name:"Land's Aid", description:"Magic action, one Wild Shape use: creatures of your choice in a 10-ft Sphere within 60 ft make a Con save, taking 2d6 Necrotic damage (half on success), and one creature there regains 2d6 HP. Becomes 3d6 at level 10 and 4d6 at 14."},
      {level:6, name:"Natural Recovery", description:"Cast one prepared level 1+ Circle spell without a slot (once per Long Rest). And when you finish a Short Rest, recover spell slots totalling up to half your Druid level (round up), none level 6+ (once per Long Rest).",
        resources:[{name:"Natural Recovery (free Circle spell)", max:1, resetOn:"long"}, {name:"Natural Recovery (slots)", max:1, resetOn:"long"}]},
      {level:10, name:"Nature's Ward", description:"Immunity to the Poisoned condition, and Resistance to your current land's damage type: Arid Fire, Polar Cold, Temperate Lightning, Tropical Poison."},
      {level:14, name:"Nature's Sanctuary", description:"Magic action, one Wild Shape use: spectral trees fill a 15-ft Cube within 120 ft for 1 minute. You and allies have Half Cover there, and allies gain your Nature's Ward Resistance. Bonus Action: move the Cube up to 60 ft."}
    ]},
    "Circle of the Moon": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Circle Forms", description:"Your Wild Shape forms can have a max CR equal to your Druid level divided by 3 (round down). In Wild Shape your AC is at least 13 + Wis mod, and you gain Temporary HP equal to three times your Druid level."}
    ].concat(subclassSpells("Circle of the Moon Spells", {3:{"Cure Wounds":1,"Moonbeam":2,"Starry Wisp":0}, 5:{"Conjure Animals":3}, 7:{"Fount of Moonlight":4}, 9:{"Mass Cure Wounds":5}})).concat([
      {level:6, name:"Improved Circle Forms", description:"In Wild Shape your attacks can deal Radiant damage, and you add your Wisdom modifier to Constitution saving throws."},
      {level:10, name:"Moonlight Step", description:"Bonus Action: teleport up to 30 ft and gain Advantage on your next attack roll this turn. Uses equal to your Wisdom modifier (min 1) per Long Rest, or expend a level 2+ slot to regain one.",
        resource:{max:{ability:"wis", min:1}, resetOn:"long"}},
      {level:14, name:"Lunar Form", description:"Once per turn, a Wild Shape attack can deal an extra 2d10 Radiant damage, and Moonlight Step can bring one willing creature within 10 ft with you."}
    ])},
    "Circle of the Sea": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Wrath of the Sea", description:"Bonus Action, one Wild Shape use: a 5-ft Emanation of ocean spray surrounds you for 10 minutes. When it appears and as a Bonus Action later, one creature in it makes a Con save or takes Cold damage (d6s equal to your Wisdom modifier, min 1) and is pushed up to 15 ft."}
    ].concat(subclassSpells("Circle of the Sea Spells", {3:{"Fog Cloud":1,"Gust of Wind":2,"Ray of Frost":0,"Shatter":2,"Thunderwave":1}, 5:{"Lightning Bolt":3,"Water Breathing":3}, 7:{"Control Water":4,"Ice Storm":4}, 9:{"Conjure Elemental":5,"Hold Monster":5}})).concat([
      {level:6, name:"Aquatic Affinity", description:"Your Wrath of the Sea Emanation becomes 10 ft, and you gain a Swim Speed equal to your Speed."},
      {level:10, name:"Stormborn", description:"While Wrath of the Sea is active: Fly Speed equal to your Speed, and Resistance to Cold, Lightning and Thunder damage."},
      {level:14, name:"Oceanic Gift", description:"You can manifest Wrath of the Sea around a willing creature within 60 ft instead of yourself (or both, by expending two Wild Shape uses)."}
    ])},
    "Circle of the Stars": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Star Map", description:"You know Guidance and always have Guiding Bolt prepared; you can cast Guiding Bolt without a slot a number of times equal to your Wisdom modifier (min 1) per Long Rest.",
        spells:[{name:"Guidance", level:0}, {name:"Guiding Bolt", level:1}], resource:{name:"Guiding Bolt (free casts)", max:{ability:"wis", min:1}, resetOn:"long"}},
      {level:3, name:"Starry Form", description:"Bonus Action, one Wild Shape use: take a starry form for 10 minutes. Archer: Bonus Action ranged spell attack for 1d8 + Wis mod Radiant. Chalice: when you heal with a spell slot, you or another creature within 30 ft regains 1d8 + Wis mod. Dragon: treat a d20 roll of 9 or lower as 10 on Int and Wis checks and Concentration saves."},
      {level:6, name:"Cosmic Omen", description:"After a Long Rest, roll a die: even gives Weal, odd gives Woe. Reaction when a creature within 30 ft makes a D20 Test: add (Weal) or subtract (Woe) 1d6. Uses equal to your Wisdom modifier (min 1) per Long Rest.",
        resource:{max:{ability:"wis", min:1}, resetOn:"long"}},
      {level:10, name:"Twinkling Constellations", description:"Archer and Chalice use 2d8; Dragon also gives a 20-ft Fly Speed (hover). You can change constellation at the start of each of your turns."},
      {level:14, name:"Full of Stars", description:"While in Starry Form, you have Resistance to Bludgeoning, Piercing and Slashing damage."}
    ]}
  },

  Fighter: {
    "Battle Master": {source:"PHB'24", checked:"PHB",
      columns:{"Superiority Dice":[0,0,4,4,4,4,5,5,5,5,5,5,5,5,6,6,6,6,6,6], "Superiority Die":["","","d8","d8","d8","d8","d8","d8","d8","d10","d10","d10","d10","d10","d10","d10","d10","d12","d12","d12"]},
      features:[
      {level:3, name:"Combat Superiority", description:"You have {Superiority Dice} Superiority Dice ({Superiority Die}), regained on a Short or Long Rest, which fuel your maneuvers. Save DC 8 + Str or Dex mod + PB. You can swap one maneuver after a Short or Long Rest.",
        resource:{name:"Superiority Dice", max:{column:"Superiority Dice"}, resetOn:"short"}, choices:[maneuverChoice(3)]},
      {level:3, name:"Student of War", description:"You gain proficiency with one Artisan's Tools and one Fighter skill.",
        choices:[{id:"tool", label:"Artisan's Tools", type:"text", count:1, proficiency:true, profLabel:"Tools"},
          {id:"skill", label:"Skill", type:"skill", from:["acrobatics","animalHandling","athletics","history","insight","intimidation","persuasion","perception","survival"], count:1, grant:"proficiency"}]},
      {level:7, name:"Know Your Enemy", description:"Bonus Action: learn a creature's Immunities, Resistances and Vulnerabilities within 30 ft. Once per Long Rest, or expend a Superiority Die.",
        resource:{max:1, resetOn:"long"}},
      {level:7, name:"Additional Maneuvers", description:"You learn two more maneuvers.", choices:[maneuverChoice(2)]},
      {level:10, name:"Improved Combat Superiority", description:"Your Superiority Die becomes a d10."},
      {level:10, name:"Additional Maneuvers (level 10)", description:"You learn two more maneuvers.", choices:[maneuverChoice(2)]},
      {level:15, name:"Relentless", description:"Once per turn, when you use a maneuver, you can roll 1d8 instead of expending a Superiority Die."},
      {level:15, name:"Additional Maneuvers (level 15)", description:"You learn two more maneuvers.", choices:[maneuverChoice(2)]},
      {level:18, name:"Ultimate Combat Superiority", description:"Your Superiority Die becomes a d12."}
    ]},
    "Champion": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Improved Critical", description:"Your weapon and Unarmed Strike attacks score a Critical Hit on a 19 or 20."},
      {level:3, name:"Remarkable Athlete", description:"Advantage on Initiative rolls and Strength (Athletics) checks. Right after you score a Critical Hit, you can move half your Speed without provoking Opportunity Attacks."},
      {level:7, name:"Additional Fighting Style", description:"You gain another Fighting Style feat.",
        choices:[{id:"style", label:"Fighting Style feat", type:"fightingStyle"}]},
      {level:10, name:"Heroic Warrior", description:"During combat, you can give yourself Heroic Inspiration whenever you start your turn without it."},
      {level:15, name:"Superior Critical", description:"Your weapon and Unarmed Strike attacks score a Critical Hit on an 18–20."},
      {level:18, name:"Survivor", description:"Advantage on Death Saving Throws, and an 18–20 counts as a 20. At the start of each turn, if you're Bloodied and above 0 HP, regain 5 + Con modifier HP."}
    ]},
    "Eldritch Knight": {source:"PHB'24", checked:"PHB", caster:"third", spellAbility:"int",
      cantrips:[0,0,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3], prepared:THIRD_CASTER_PREPARED, features:[
      {level:3, name:"Spellcasting", description:"You cast Wizard spells using Intelligence, with spell slots as a one-third caster. You know Wizard cantrips and prepare Wizard spells (swap one when you gain a Fighter level); an Arcane Focus works as a focus."},
      {level:3, name:"War Bond", description:"Perform a 1-hour ritual to bond with up to two weapons. You can't be disarmed of them, and you can summon a bonded weapon to your hand as a Bonus Action."},
      {level:7, name:"War Magic", description:"When you take the Attack action, you can replace one of the attacks with casting one of your Wizard cantrips that has a casting time of an action."},
      {level:10, name:"Eldritch Strike", description:"When you hit a creature with a weapon, it has Disadvantage on the next saving throw it makes against a spell you cast before the end of your next turn."},
      {level:15, name:"Arcane Charge", description:"When you use Action Surge, you can teleport up to 30 ft."},
      {level:18, name:"Improved War Magic", description:"When you take the Attack action, you can replace two of the attacks with casting one of your level 1 or 2 Wizard spells with a casting time of an action."}
    ]},
    "Psi Warrior": {source:"PHB'24", checked:"PHB", columns:PSIONIC_DICE, features:[
      {level:3, name:"Psionic Power", description:"You have {Psionic Energy Dice} Psionic Energy Dice ({Psionic Die}); regain one on a Short Rest, all on a Long Rest. Protective Field: Reaction to reduce damage to you or a creature within 30 ft by a die + Int mod. Psionic Strike: once per turn after hitting within 30 ft, expend a die for extra Force damage of die + Int mod. Telekinetic Movement: Magic action to move a Large or smaller object or willing creature 30 ft (once per Short or Long Rest, or expend a die).",
        resource:{name:"Psionic Energy Dice", max:{column:"Psionic Energy Dice"}, resetOn:"long"}},
      {level:7, name:"Telekinetic Adept", description:"Psi-Powered Leap: Bonus Action to gain a Fly Speed of twice your Speed until the end of the turn (once per Short or Long Rest, or expend a die). Telekinetic Thrust: when you deal Psionic Strike damage, the target makes a Str save or is knocked Prone or pushed 10 ft."},
      {level:10, name:"Guarded Mind", description:"Resistance to Psychic damage. If you start your turn Charmed or Frightened, you can expend a die to end it.", effects:[resist("Psychic")]},
      {level:15, name:"Bulwark of Force", description:"Bonus Action: up to your Intelligence modifier (min 1) creatures within 30 ft gain Half Cover for 1 minute. Once per Long Rest, or expend a die.",
        resource:{max:1, resetOn:"long"}},
      {level:18, name:"Telekinetic Master", description:"You always have Telekinesis prepared and can cast it without a slot or components (once per Long Rest, or expend a die). While concentrating on it, you can make one weapon attack as a Bonus Action.",
        spells:[{name:"Telekinesis", level:5}], resource:{name:"Telekinesis (free cast)", max:1, resetOn:"long"}}
    ]}
  },

  Monk: {
    "Warrior of Mercy": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Hand of Harm", description:"Once per turn when you hit with an Unarmed Strike, spend 1 Focus Point to deal extra Necrotic damage equal to a Martial Arts die ({Martial Arts}) + Wis mod."},
      {level:3, name:"Hand of Healing", description:"Magic action, 1 Focus Point: touch a creature to restore a Martial Arts die + Wis mod HP. When you use Flurry of Blows, you can replace one strike with this without spending a Focus Point."},
      {level:3, name:"Implements of Mercy", description:"You gain proficiency in Insight and Medicine and with the Herbalism Kit.",
        effects:[skillProf("insight"), skillProf("medicine")], grants:{proficiencies:"Tools: Herbalism Kit"}},
      {level:6, name:"Physician's Touch", description:"Hand of Harm can also Poison the target until the end of your next turn. Hand of Healing can also end Blinded, Deafened, Paralyzed, Poisoned or Stunned."},
      {level:11, name:"Flurry of Healing and Harm", description:"When you use Flurry of Blows, you can replace each strike with Hand of Healing without spending Focus Points, and use Hand of Harm with a Flurry strike without spending a Focus Point. The free Hand of Harm can be used a number of times equal to your Wisdom modifier (min 1) per Long Rest.",
        resource:{max:{ability:"wis", min:1}, resetOn:"long"}},
      {level:17, name:"Hand of Ultimate Mercy", description:"Magic action, 5 Focus Points: touch a creature that died in the last 24 hours; it returns to life with 4d10 + Wis mod HP and is cured of conditions. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}}
    ]},
    "Warrior of Shadow": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Shadow Arts", description:"Spend 1 Focus Point to cast Darkness without components; you can see through it and move it 30 ft at the start of each turn. You gain Darkvision 60 ft (or +60 ft) and know Minor Illusion (Wisdom).",
        spells:[{name:"Minor Illusion", level:0}, {name:"Darkness", level:2}]},
      {level:6, name:"Shadow Step", description:"While in Dim Light or Darkness, Bonus Action: teleport up to 60 ft to another space in Dim Light or Darkness and gain Advantage on your next melee attack this turn."},
      {level:11, name:"Improved Shadow Step", description:"Spend 1 Focus Point to Shadow Step without the light requirement, and you can make an Unarmed Strike right after teleporting."},
      {level:17, name:"Cloak of Shadows", description:"Magic action, 3 Focus Points: while in Dim Light or Darkness you become Invisible for 1 minute, can move through occupied spaces, and can use Flurry of Blows without spending Focus Points."}
    ]},
    "Warrior of the Elements": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Elemental Attunement", description:"Bonus Action, 1 Focus Point: for 10 minutes your Unarmed Strikes have +10 ft reach, can deal Acid, Cold, Fire, Lightning or Thunder damage, and can force a Str save to push or pull the target 10 ft."},
      {level:3, name:"Manipulate Elements", description:"You know the Elementalism cantrip (Wisdom).", spells:[{name:"Elementalism", level:0}]},
      {level:6, name:"Elemental Burst", description:"Magic action, 2 Focus Points: a 20-ft Sphere within 120 ft; creatures there make a Dex save, taking three Martial Arts dice of a chosen element (half on success)."},
      {level:11, name:"Stride of the Elements", description:"While Elemental Attunement is active, you have a Fly Speed and Swim Speed equal to your Speed."},
      {level:17, name:"Elemental Epitome", description:"While attuned: Resistance to one chosen elemental damage type; Step of the Wind gives +20 ft Speed and creatures you pass make a Dex save or take a Martial Arts die of damage; once per turn your Unarmed Strike deals an extra Martial Arts die of your chosen type."}
    ]},
    "Warrior of the Open Hand": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Open Hand Technique", description:"When you hit with a Flurry of Blows strike, impose one: Addle (no Opportunity Attacks until its next turn), Push (Str save or pushed 15 ft) or Topple (Dex save or Prone)."},
      {level:6, name:"Wholeness of Body", description:"Bonus Action: regain HP equal to a roll of your Martial Arts die ({Martial Arts}) + Wis mod (min 1). Uses equal to your Wisdom modifier (min 1) per Long Rest.",
        resource:{max:{ability:"wis", min:1}, resetOn:"long"}},
      {level:11, name:"Fleet Step", description:"When you take a Bonus Action other than Step of the Wind, you can also use Step of the Wind right after it."},
      {level:17, name:"Quivering Palm", description:"When you hit with an Unarmed Strike, spend 4 Focus Points to start lethal vibrations lasting days equal to your Monk level. End them as an action (or by forgoing an attack): Con save, 10d12 Force damage (half on success). One creature at a time."}
    ]}
  },

  Paladin: {
    "Oath of Devotion": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Sacred Weapon", description:"When you take the Attack action, expend a Channel Divinity use: for 10 minutes a melee weapon you hold adds your Charisma modifier (min +1) to attack rolls, can deal Radiant damage, and sheds Bright Light 20 ft."}
    ].concat(subclassSpells("Oath of Devotion Spells", {3:{"Protection from Evil and Good":1,"Shield of Faith":1}, 5:{"Aid":2,"Zone of Truth":2}, 9:{"Beacon of Hope":3,"Dispel Magic":3}, 13:{"Freedom of Movement":4,"Guardian of Faith":4}, 17:{"Commune":5,"Flame Strike":5}})).concat([
      {level:7, name:"Aura of Devotion", description:"You and allies in your Aura of Protection are immune to the Charmed condition."},
      {level:15, name:"Smite of Protection", description:"Whenever you cast Divine Smite, you and allies in your Aura of Protection have Half Cover until the start of your next turn."},
      {level:20, name:"Holy Nimbus", description:"Bonus Action: for 10 minutes, Advantage on saves forced by Fiends or Undead; enemies starting their turn in your aura take Radiant damage equal to Cha mod + PB; the aura is sunlight. Once per Long Rest, or expend a level 5 slot.",
        resource:{max:1, resetOn:"long"}}
    ])},
    "Oath of Glory": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Inspiring Smite", description:"Right after you cast Divine Smite, expend a Channel Divinity use to distribute 2d8 + your Paladin level Temporary HP among creatures within 30 ft."},
      {level:3, name:"Peerless Athlete", description:"Bonus Action, one Channel Divinity use: for 1 hour, Advantage on Athletics and Acrobatics checks, and your jump distance increases by 10 ft."}
    ].concat(subclassSpells("Oath of Glory Spells", {3:{"Guiding Bolt":1,"Heroism":1}, 5:{"Enhance Ability":2,"Magic Weapon":2}, 9:{"Haste":3,"Protection from Energy":3}, 13:{"Compulsion":4,"Freedom of Movement":4}, 17:{"Legend Lore":5,"Yolande's Regal Presence":5}})).concat([
      {level:7, name:"Aura of Alacrity", description:"Your Speed increases by 10 ft, and allies who start their turn in (or enter) your Aura of Protection gain +10 ft Speed until the end of their turn.",
        effects:[{target:"speed", type:"bonus", value:10, condition:"always"}]},
      {level:15, name:"Glorious Defense", description:"Reaction when you or a creature in your aura is hit: add your Charisma modifier (min +1) to its AC; if the attack misses, you can attack the attacker. Uses equal to your Charisma modifier (min 1) per Long Rest.",
        resource:{max:{ability:"cha", min:1}, resetOn:"long"}},
      {level:20, name:"Living Legend", description:"Bonus Action: for 10 minutes, Advantage on Charisma checks, once per turn turn a missed attack into a hit, and reroll a failed save. Once per Long Rest, or expend a level 5 slot.",
        resource:{max:1, resetOn:"long"}}
    ])},
    "Oath of the Ancients": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Nature's Wrath", description:"Magic action, one Channel Divinity use: creatures of your choice within 15 ft make a Str save or are Restrained for 1 minute (repeating the save each turn)."}
    ].concat(subclassSpells("Oath of the Ancients Spells", {3:{"Ensnaring Strike":1,"Speak with Animals":1}, 5:{"Misty Step":2,"Moonbeam":2}, 9:{"Plant Growth":3,"Protection from Energy":3}, 13:{"Ice Storm":4,"Stoneskin":4}, 17:{"Commune with Nature":5,"Tree Stride":5}})).concat([
      {level:7, name:"Aura of Warding", description:"You and allies in your Aura of Protection have Resistance to Necrotic, Psychic and Radiant damage.",
        effects:[resist("Necrotic"), resist("Psychic"), resist("Radiant")]},
      {level:15, name:"Undying Sentinel", description:"When you drop to 0 HP and don't die outright, you can drop to 1 HP and regain three times your Paladin level in HP (once per Long Rest). You also age very slowly.",
        resource:{max:1, resetOn:"long"}},
      {level:20, name:"Elder Champion", description:"Bonus Action: for 1 minute, enemies in your aura have Disadvantage on saves against your spells and Channel Divinity, you regain 10 HP at the start of each turn, and you can cast action spells as a Bonus Action. Once per Long Rest, or expend a level 5 slot.",
        resource:{max:1, resetOn:"long"}}
    ])},
    "Oath of Vengeance": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Vow of Enmity", description:"When you take the Attack action, expend a Channel Divinity use to gain Advantage on attacks against a creature within 30 ft for 1 minute. If it drops to 0 HP, you can move the vow to another creature."}
    ].concat(subclassSpells("Oath of Vengeance Spells", {3:{"Bane":1,"Hunter's Mark":1}, 5:{"Hold Person":2,"Misty Step":2}, 9:{"Haste":3,"Protection from Energy":3}, 13:{"Banishment":4,"Dimension Door":4}, 17:{"Hold Monster":5,"Scrying":5}})).concat([
      {level:7, name:"Relentless Avenger", description:"When you hit with an Opportunity Attack, the target's Speed becomes 0 and you can move up to half your Speed without provoking."},
      {level:15, name:"Soul of Vengeance", description:"When the target of your Vow of Enmity makes an attack, you can take a Reaction to make a melee attack against it."},
      {level:20, name:"Avenging Angel", description:"Bonus Action: for 10 minutes, Fly Speed 60 ft (hover), and enemies starting their turn within 30 ft make a Wis save or are Frightened for 1 minute (attacks against them have Advantage). Once per Long Rest, or expend a level 5 slot.",
        resource:{max:1, resetOn:"long"}}
    ])}
  },

  Ranger: {
    "Beast Master": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Primal Companion", description:"Summon a Beast of the Land, Sea or Sky (its stat block scales with your level and PB). It acts on your turn; command it as a Bonus Action, or forgo one of your attacks to have it make Beast's Strike. Revive it with a Magic action and a spell slot within an hour of it dying."},
      {level:7, name:"Exceptional Training", description:"When you command your beast with a Bonus Action, it can also Dash, Disengage, Dodge or Help, and its attacks can deal Force damage."},
      {level:11, name:"Bestial Fury", description:"When you command Beast's Strike, the beast attacks twice, and the first hit each turn on a target of your Hunter's Mark deals the spell's extra damage."},
      {level:15, name:"Share Spells", description:"When you cast a spell that targets yourself, it can also affect your beast if it's within 30 ft."}
    ]},
    "Fey Wanderer": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Dreadful Strikes", description:"Once per turn when you hit with a weapon, deal an extra 1d4 Psychic damage (1d6 from level 11)."},
      {level:3, name:"Otherworldly Glamour", description:"Add your Wisdom modifier (min +1) to Charisma checks, and gain proficiency in Deception, Performance or Persuasion.",
        choices:[{id:"skill", label:"Skill", type:"skill", from:["deception","performance","persuasion"], count:1, grant:"proficiency"}]}
    ].concat(subclassSpells("Fey Wanderer Spells", {3:{"Charm Person":1}, 5:{"Misty Step":2}, 9:{"Summon Fey":3}, 13:{"Dimension Door":4}, 17:{"Mislead":5}})).concat([
      {level:7, name:"Beguiling Twist", description:"Advantage on saves against Charmed and Frightened. Reaction when a creature within 120 ft succeeds on such a save: another creature makes a Wis save or is Charmed or Frightened for 1 minute."},
      {level:11, name:"Fey Reinforcements", description:"Cast Summon Fey without a Material component, once per Long Rest without a slot; you can make it last 1 minute without Concentration.",
        resource:{name:"Summon Fey (free cast)", max:1, resetOn:"long"}},
      {level:15, name:"Misty Wanderer", description:"Cast Misty Step without a slot a number of times equal to your Wisdom modifier (min 1) per Long Rest, and bring one willing creature within 5 ft with you.",
        resource:{name:"Misty Step (free casts)", max:{ability:"wis", min:1}, resetOn:"long"}}
    ])},
    "Gloom Stalker": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Dread Ambusher", description:"Add your Wisdom modifier to Initiative. On your first turn of combat your Speed increases by 10 ft. Dreadful Strike: once per turn when you hit, deal an extra 2d6 Psychic damage, a number of times equal to your Wisdom modifier (min 1) per Long Rest.",
        resource:{name:"Dreadful Strike", max:{ability:"wis", min:1}, resetOn:"long"}},
      {level:3, name:"Umbral Sight", description:"Darkvision 60 ft (or +60 ft), and while in Darkness you're Invisible to creatures that rely on Darkvision to see you."}
    ].concat(subclassSpells("Gloom Stalker Spells", {3:{"Disguise Self":1}, 5:{"Rope Trick":2}, 9:{"Fear":3}, 13:{"Greater Invisibility":4}, 17:{"Seeming":5}})).concat([
      {level:7, name:"Iron Mind", description:"Proficiency in Wisdom saving throws (or Intelligence or Charisma if you already have it).",
        choices:[{id:"save", label:"Saving throw", type:"option", inName:true, options:[
          {name:"Wisdom", effects:[{target:"saveProficiency.wis", type:"grant", value:"", condition:"always"}]},
          {name:"Intelligence", effects:[{target:"saveProficiency.int", type:"grant", value:"", condition:"always"}]},
          {name:"Charisma", effects:[{target:"saveProficiency.cha", type:"grant", value:"", condition:"always"}]}]}]},
      {level:11, name:"Stalker's Flurry", description:"Dreadful Strike becomes 2d8, and when you use it you can also make another attack (Sudden Strike) or frighten creatures within 10 ft of the target (Mass Fear, Wis save)."},
      {level:15, name:"Shadowy Dodge", description:"Reaction when a creature attacks you: impose Disadvantage on the roll, then teleport up to 30 ft."}
    ])},
    "Hunter": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Hunter's Lore", description:"While a creature is marked by your Hunter's Mark, you know its Immunities, Resistances and Vulnerabilities."},
      {level:3, name:"Hunter's Prey", description:"Choose Colossus Slayer (once per turn +1d8 weapon damage against a creature missing HP) or Horde Breaker (once per turn, attack another creature within 5 ft of your target). Swap after a Short or Long Rest.",
        choices:[{id:"prey", label:"Hunter's Prey", type:"option", inName:true, options:[{name:"Colossus Slayer"},{name:"Horde Breaker"}]}]},
      {level:7, name:"Defensive Tactics", description:"Choose Escape the Horde (Opportunity Attacks against you have Disadvantage) or Multiattack Defense (a creature that hits you has Disadvantage on its other attacks against you this turn). Swap after a Short or Long Rest.",
        choices:[{id:"tactic", label:"Defensive Tactics", type:"option", inName:true, options:[{name:"Escape the Horde"},{name:"Multiattack Defense"}]}]},
      {level:11, name:"Superior Hunter's Prey", description:"Once per turn when you damage a creature marked by Hunter's Mark, you can deal the spell's extra damage to another creature you can see within 30 ft of it."},
      {level:15, name:"Superior Hunter's Defense", description:"Reaction when you take damage: Resistance to that damage and any more of that type until the end of the turn."}
    ]}
  },

  Rogue: {
    "Arcane Trickster": {source:"PHB'24", checked:"PHB", caster:"third", spellAbility:"int",
      cantrips:[0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4], prepared:THIRD_CASTER_PREPARED, features:[
      {level:3, name:"Spellcasting", description:"You cast Wizard spells using Intelligence, with spell slots as a one-third caster. You know Mage Hand plus other Wizard cantrips and prepare Wizard spells (swap one when you gain a Rogue level).",
        spells:[{name:"Mage Hand", level:0}]},
      {level:3, name:"Mage Hand Legerdemain", description:"Your Mage Hand can be invisible, and you can use it to make Sleight of Hand checks (as a Bonus Action via Cunning Action)."},
      {level:9, name:"Magical Ambush", description:"If you have the Invisible condition when you cast a spell, creatures have Disadvantage on saves against it that turn."},
      {level:13, name:"Versatile Trickster", description:"When you use the Trip Cunning Strike, you can also target a creature within 5 ft of your Mage Hand."},
      {level:17, name:"Spell Thief", description:"Reaction when a creature casts a spell targeting you: it makes a save (your spell DC) or the spell has no effect on you and you steal it for 8 hours (if it's level 1+ and of a level you can cast). Once per Long Rest.",
        resource:{max:1, resetOn:"long"}}
    ]},
    "Assassin": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Assassinate", description:"Advantage on Initiative rolls, and Advantage on attacks against creatures that haven't taken a turn yet in the first round. In that round, your Sneak Attack hits deal extra damage equal to your Rogue level."},
      {level:3, name:"Assassin's Tools", description:"You gain a Disguise Kit and a Poisoner's Kit and proficiency with both.", grants:{proficiencies:"Tools: Disguise Kit, Poisoner's Kit"}},
      {level:9, name:"Infiltration Expertise", description:"Masterful Mimicry: copy another creature's speech, handwriting and behaviour after an hour of study. Roving Aim: Steady Aim no longer sets your Speed to 0."},
      {level:13, name:"Envenom Weapons", description:"When you use the Poison Cunning Strike, the target also takes 2d6 Poison damage, which ignores Resistance."},
      {level:17, name:"Death Strike", description:"When you hit with Sneak Attack in the first round of combat, the target makes a Con save (DC 8 + Dex mod + PB) or the attack's damage is doubled."}
    ]},
    "Soulknife": {source:"PHB'24", checked:"PHB", columns:PSIONIC_DICE, features:[
      {level:3, name:"Psionic Power", description:"You have {Psionic Energy Dice} Psionic Energy Dice ({Psionic Die}); regain one on a Short Rest, all on a Long Rest. Psi-Bolstered Knack: when you fail a skill or tool check, add a die (it's only spent on a success). Psychic Whispers: telepathic link with up to PB creatures for hours equal to a die roll (first use per Long Rest is free).",
        resource:{name:"Psionic Energy Dice", max:{column:"Psionic Energy Dice"}, resetOn:"long"}},
      {level:3, name:"Psychic Blades", description:"When you attack, manifest a psychic blade: Simple melee weapon, Finesse and Thrown (60 ft), 1d6 Psychic, Vex mastery. Afterwards you can make a Bonus Action attack with a second blade for 1d4."},
      {level:9, name:"Soul Blades", description:"Homing Strikes: when a Psychic Blade attack misses, add a Psionic die to the roll (spent only if it hits). Psychic Teleportation: Bonus Action, expend a die to throw a blade and teleport up to 10 times the roll in feet."},
      {level:13, name:"Psychic Veil", description:"Magic action: become Invisible for 1 hour (ends if you deal damage or force a save). Once per Long Rest, or expend a die.",
        resource:{max:1, resetOn:"long"}},
      {level:17, name:"Rend Mind", description:"When you deal Sneak Attack damage with a Psychic Blade, the target makes a Wis save or is Stunned for 1 minute (repeating the save each turn). Once per Long Rest, or expend three dice.",
        resource:{max:1, resetOn:"long"}}
    ]},
    "Thief": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Fast Hands", description:"Bonus Action: make a Sleight of Hand check to pick a lock, disarm a trap or pick a pocket, or take the Utilize action or use a magic item that takes a Magic action."},
      {level:3, name:"Second-Story Work", description:"You gain a Climb Speed equal to your Speed, and your jump distance uses Dexterity instead of Strength."},
      {level:9, name:"Supreme Sneak", description:"New Cunning Strike option, Stealth Attack (1d6): if you're Invisible from the Hide action, this attack doesn't end it if you finish the turn behind Three-Quarters or Total Cover."},
      {level:13, name:"Use Magic Device", description:"You can attune to four magic items; when you expend charges, roll 1d6 and on a 6 no charges are used; you can use any Spell Scroll (Int, with an Arcana check for level 2+)."},
      {level:17, name:"Thief's Reflexes", description:"In the first round of combat, you take two turns: one at your Initiative and one at your Initiative minus 10."}
    ]}
  },

  Sorcerer: {
    "Aberrant Sorcery": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Telepathic Speech", description:"Bonus Action: form a telepathic link with a creature within 30 ft for minutes equal to your Sorcerer level; you can speak telepathically within miles equal to your Charisma modifier (min 1)."}
    ].concat(subclassSpells("Psionic Spells", {3:{"Arms of Hadar":1,"Calm Emotions":2,"Detect Thoughts":2,"Dissonant Whispers":1,"Mind Sliver":0}, 5:{"Hunger of Hadar":3,"Sending":3}, 7:{"Evard's Black Tentacles":4,"Summon Aberration":4}, 9:{"Rary's Telepathic Bond":5,"Telekinesis":5}})).concat([
      {level:6, name:"Psionic Sorcery", description:"You can cast your Psionic Spells by spending Sorcery Points equal to the spell's level instead of a slot, without Verbal or Somatic components."},
      {level:6, name:"Psychic Defenses", description:"Resistance to Psychic damage, and Advantage on saves against Charmed and Frightened.", effects:[resist("Psychic")]},
      {level:14, name:"Revelation in Flesh", description:"Bonus Action, spend 1+ Sorcery Points: for 10 minutes gain one benefit per point — see Invisible creatures within 60 ft, Fly Speed equal to your Speed (hover), Swim Speed twice your Speed and water breathing, or squeeze through 1-inch spaces."},
      {level:18, name:"Warping Implosion", description:"Magic action: teleport up to 120 ft; creatures within 30 ft of where you left make a Str save or take 3d10 Force damage and are pulled toward that space. Once per Long Rest, or spend 5 Sorcery Points.",
        resource:{max:1, resetOn:"long"}}
    ])},
    "Clockwork Sorcery": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Restore Balance", description:"Reaction when a creature within 60 ft is about to roll a d20 with Advantage or Disadvantage: cancel it. Uses equal to your Charisma modifier (min 1) per Long Rest.",
        resource:{max:{ability:"cha", min:1}, resetOn:"long"}}
    ].concat(subclassSpells("Clockwork Spells", {3:{"Aid":2,"Alarm":1,"Lesser Restoration":2,"Protection from Evil and Good":1}, 5:{"Dispel Magic":3,"Protection from Energy":3}, 7:{"Freedom of Movement":4,"Summon Construct":4}, 9:{"Greater Restoration":5,"Wall of Force":5}})).concat([
      {level:6, name:"Bastion of Law", description:"Magic action, spend 1–5 Sorcery Points: you or a creature within 30 ft gains a ward of that many d8s; when it takes damage it can expend dice to reduce the damage by the roll. Lasts until a Long Rest or you use this again."},
      {level:14, name:"Trance of Order", description:"Bonus Action: for 1 minute, attack rolls against you can't have Advantage, and on your D20 Tests you can treat a 9 or lower as a 10. Once per Long Rest, or spend 5 Sorcery Points.",
        resource:{max:1, resetOn:"long"}},
      {level:18, name:"Clockwork Cavalcade", description:"Magic action: spirits of order fill a 30-ft Cube — restore up to 100 HP divided among creatures there, repair damaged objects, and end spells of level 6 or lower on creatures and objects of your choice. Once per Long Rest, or spend 7 Sorcery Points.",
        resource:{max:1, resetOn:"long"}}
    ])},
    "Draconic Sorcery": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Draconic Resilience", description:"Your HP maximum increases by 3, plus 1 for every Sorcerer level after 3 (tracked automatically). While not wearing armor, your base AC is 10 + Dex mod + Cha mod.",
        effects:[{target:"hpMax", type:"bonus", value:{classLevel:true}, condition:"always"}]}
    ].concat(subclassSpells("Draconic Spells", {3:{"Alter Self":2,"Chromatic Orb":1,"Command":1,"Dragon's Breath":2}, 5:{"Fear":3,"Fly":3}, 7:{"Arcane Eye":4,"Charm Monster":4}, 9:{"Legend Lore":5,"Summon Dragon":5}})).concat([
      {level:6, name:"Elemental Affinity", description:"Resistance to your chosen damage type, and when you cast a spell dealing that type you can add your Charisma modifier to one damage roll.",
        choices:[{id:"type", label:"Damage type", type:"option", inName:true, options:[
          {name:"Acid", effects:[resist("Acid")]}, {name:"Cold", effects:[resist("Cold")]}, {name:"Fire", effects:[resist("Fire")]},
          {name:"Lightning", effects:[resist("Lightning")]}, {name:"Poison", effects:[resist("Poison")]}]}]},
      {level:14, name:"Dragon Wings", description:"Bonus Action: sprout wings for 1 hour, gaining a Fly Speed of 60 ft. Once per Long Rest, or spend 3 Sorcery Points.",
        resource:{max:1, resetOn:"long"}},
      {level:18, name:"Dragon Companion", description:"Cast Summon Dragon without a Material component, once per Long Rest without a slot; you can make it last 1 minute without Concentration.",
        resource:{name:"Summon Dragon (free cast)", max:1, resetOn:"long"}}
    ])},
    "Wild Magic Sorcery": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Wild Magic Surge", description:"Once per turn after you cast a Sorcerer spell with a slot, roll a d20; on a 20, roll on the Wild Magic Surge table."},
      {level:3, name:"Tides of Chaos", description:"Give yourself Advantage on one D20 Test. You regain the use when you finish a Long Rest, or when you roll on the Wild Magic Surge table.",
        resource:{max:1, resetOn:"long"}},
      {level:6, name:"Bend Luck", description:"Reaction when a creature you can see rolls a d20 for a D20 Test: spend 1 Sorcery Point to add or subtract 1d4."},
      {level:14, name:"Controlled Chaos", description:"When you roll on the Wild Magic Surge table, roll twice and use either result."},
      {level:18, name:"Tamed Surge", description:"After casting a Sorcerer spell with a slot, you can pick any effect from the Wild Magic Surge table (except the final row). Once per Long Rest.",
        resource:{max:1, resetOn:"long"}}
    ]}
  },

  Warlock: {
    "Archfey Patron": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Steps of the Fey", description:"Cast Misty Step without a slot a number of times equal to your Charisma modifier (min 1) per Long Rest. When you do, choose Refreshing Step (you or a creature within 10 ft gains 1d10 Temporary HP) or Taunting Step (creatures within 5 ft of where you left make a Wis save or have Disadvantage on attacks against others).",
        resource:{name:"Steps of the Fey (free Misty Step)", max:{ability:"cha", min:1}, resetOn:"long"}}
    ].concat(subclassSpells("Archfey Spells", {3:{"Calm Emotions":2,"Faerie Fire":1,"Misty Step":2,"Phantasmal Force":2,"Sleep":1}, 5:{"Blink":3,"Plant Growth":3}, 7:{"Dominate Beast":4,"Greater Invisibility":4}, 9:{"Dominate Person":5,"Seeming":5}})).concat([
      {level:6, name:"Misty Escape", description:"Cast Misty Step as a Reaction when you take damage. New Steps of the Fey options: Disappearing Step (Invisible until your next turn) and Dreadful Step (creatures within 5 ft of where you left or arrive make a Wis save or take 2d10 Psychic)."},
      {level:10, name:"Beguiling Defenses", description:"Immunity to the Charmed condition. Reaction when a creature hits you: halve the damage, and the attacker makes a Wis save or takes Psychic damage equal to the damage you took. Once per Long Rest, or expend a Pact Magic slot.",
        resource:{max:1, resetOn:"long"}},
      {level:14, name:"Bewitching Magic", description:"After you cast an Enchantment or Illusion spell with an action and a slot, you can cast Misty Step as part of the same action without a slot."}
    ])},
    "Celestial Patron": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Healing Light", description:"You have a pool of d6s equal to 1 + your Warlock level (refilled on a Long Rest). Bonus Action: heal a creature within 60 ft by spending up to your Charisma modifier (min 1) dice from the pool.",
        resource:{name:"Healing Light (d6s)", max:{classLevelTimes:1, plus:1}, resetOn:"long"}}
    ].concat(subclassSpells("Celestial Spells", {3:{"Aid":2,"Cure Wounds":1,"Guiding Bolt":1,"Lesser Restoration":2,"Light":0,"Sacred Flame":0}, 5:{"Daylight":3,"Revivify":3}, 7:{"Guardian of Faith":4,"Wall of Fire":4}, 9:{"Greater Restoration":5,"Summon Celestial":5}})).concat([
      {level:6, name:"Radiant Soul", description:"Resistance to Radiant damage. Once per turn, when a spell you cast deals Fire or Radiant damage, add your Charisma modifier to one target's damage.", effects:[resist("Radiant")]},
      {level:10, name:"Celestial Resilience", description:"When you use Magical Cunning or finish a Short or Long Rest, you gain Temporary HP equal to your Warlock level + Cha mod, and up to five creatures gain half your Warlock level + Cha mod."},
      {level:14, name:"Searing Vengeance", description:"When you or an ally within 60 ft makes a Death Saving Throw, you can let it regain half its HP maximum and stand up; creatures within 30 ft of it take 2d8 + Cha mod Radiant damage and are Blinded until the end of the turn. Once per Long Rest.",
        resource:{max:1, resetOn:"long"}}
    ])},
    "Fiend Patron": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Dark One's Blessing", description:"When you (or someone else, within 10 ft of you) reduce an enemy to 0 HP, you gain Temporary HP equal to your Charisma modifier + Warlock level (min 1)."}
    ].concat(subclassSpells("Fiend Spells", {3:{"Burning Hands":1,"Command":1,"Scorching Ray":2,"Suggestion":2}, 5:{"Fireball":3,"Stinking Cloud":3}, 7:{"Fire Shield":4,"Wall of Fire":4}, 9:{"Geas":5,"Insect Plague":5}})).concat([
      {level:6, name:"Dark One's Own Luck", description:"When you make an ability check or saving throw, add 1d10 (after seeing the roll). Uses equal to your Charisma modifier (min 1) per Long Rest, once per roll.",
        resource:{max:{ability:"cha", min:1}, resetOn:"long"}},
      {level:10, name:"Fiendish Resilience", description:"After each Short or Long Rest, choose one damage type other than Force; you have Resistance to it until you choose another."},
      {level:14, name:"Hurl Through Hell", description:"Once per turn when you hit with an attack roll, the target makes a Cha save (your spell DC) or vanishes through the Lower Planes, taking 8d10 Psychic damage (if not a Fiend) and being Incapacitated until the end of your next turn. Once per Long Rest, or expend a Pact Magic slot.",
        resource:{max:1, resetOn:"long"}}
    ])},
    "Great Old One Patron": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Awakened Mind", description:"Bonus Action: form a telepathic connection with a creature within 30 ft for minutes equal to your Warlock level; you can communicate across miles equal to your Charisma modifier (min 1)."},
      {level:3, name:"Psychic Spells", description:"Your Warlock spells can deal Psychic damage instead of their normal type, and your Enchantment and Illusion Warlock spells need no Verbal or Somatic components."}
    ].concat(subclassSpells("Great Old One Spells", {3:{"Detect Thoughts":2,"Dissonant Whispers":1,"Phantasmal Force":2,"Tasha's Hideous Laughter":1}, 5:{"Clairvoyance":3,"Hunger of Hadar":3}, 7:{"Confusion":4,"Summon Aberration":4}, 9:{"Modify Memory":5,"Telekinesis":5}})).concat([
      {level:6, name:"Clairvoyant Combatant", description:"When you form a telepathic bond with Awakened Mind, the creature makes a Wis save or, for its duration, has Disadvantage on attacks against you and you have Advantage on attacks against it. Once per Short or Long Rest, or expend a Pact Magic slot.",
        resource:{max:1, resetOn:"short"}},
      {level:10, name:"Eldritch Hex", description:"You always have Hex prepared, and when you cast it, the target has Disadvantage on saves of the chosen ability.", spells:[{name:"Hex", level:1}]},
      {level:10, name:"Thought Shield", description:"Your thoughts can't be read unless you allow it. Resistance to Psychic damage, and a creature that deals Psychic damage to you takes the same amount.", effects:[resist("Psychic")]},
      {level:14, name:"Create Thrall", description:"When you cast Summon Aberration, it needs no Concentration (duration 1 minute) and gains Temporary HP equal to your Warlock level + Cha mod; the first time each turn it hits a creature under your Hex, it deals the Hex damage."}
    ])}
  },

  Wizard: {
    "Abjurer": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Abjuration Savant", description:"Add two Abjuration spells of level 2 or lower to your spellbook for free, plus one more free Abjuration spell each time you gain a new spell slot level.",
        choices:[{id:"spells", label:"Abjuration spell (spellbook)", type:"text", count:2}]},
      {level:3, name:"Arcane Ward", description:"When you cast an Abjuration spell with a slot, you can create a ward with HP equal to twice your Wizard level + Int mod (once per Long Rest). It absorbs damage you take, and regains HP equal to twice the slot level whenever you cast an Abjuration spell; as a Bonus Action you can expend a slot to restore twice its level.",
        resource:{name:"Arcane Ward (create)", max:1, resetOn:"long"}},
      {level:6, name:"Projected Ward", description:"Reaction when a creature within 30 ft takes damage: your Arcane Ward absorbs it instead."},
      {level:10, name:"Spell Breaker", description:"You always have Counterspell and Dispel Magic prepared, can cast Dispel Magic as a Bonus Action, and add your PB to their ability checks; if one fails, the slot isn't expended.",
        spells:[{name:"Counterspell", level:3}, {name:"Dispel Magic", level:3}]},
      {level:14, name:"Spell Resistance", description:"Advantage on saving throws against spells, and Resistance to the damage of spells."}
    ]},
    "Diviner": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Divination Savant", description:"Add two Divination spells of level 2 or lower to your spellbook for free, plus one more free Divination spell each time you gain a new spell slot level.",
        choices:[{id:"spells", label:"Divination spell (spellbook)", type:"text", count:2}]},
      {level:3, name:"Portent", description:"After each Long Rest, roll two d20s and record them. You can replace any D20 Test made by you or a creature you can see with one of these rolls (once per turn).",
        resource:{name:"Portent dice", max:{byLevel:{3:2, 14:3}}, resetOn:"long"}},
      {level:6, name:"Expert Divination", description:"When you cast a Divination spell with a level 2+ slot, you regain an expended slot of a lower level (max level 5)."},
      {level:10, name:"The Third Eye", description:"Bonus Action, until your next Short or Long Rest: Darkvision 120 ft, see the Ethereal Plane within 60 ft, read any language, or see Invisible creatures within 10 ft. Once per Short or Long Rest.",
        resource:{max:1, resetOn:"short"}},
      {level:14, name:"Greater Portent", description:"You roll three d20s for Portent instead of two."}
    ]},
    "Evoker": {source:"PHB'24", checked:"SRD", features:[
      {level:3, name:"Evocation Savant", description:"Add two Evocation spells of level 2 or lower to your spellbook for free, plus one more free Evocation spell each time you gain a new spell slot level.",
        choices:[{id:"spells", label:"Evocation spell (spellbook)", type:"text", count:2}]},
      {level:3, name:"Potent Cantrip", description:"When a creature succeeds on a save against your cantrip or you miss it with a cantrip attack, it still takes half the cantrip's damage (but no other effect)."},
      {level:6, name:"Sculpt Spells", description:"When you cast an Evocation spell, choose 1 + the spell's level creatures you can see; they automatically succeed on their saves and take no damage on a half-damage save."},
      {level:10, name:"Empowered Evocation", description:"Add your Intelligence modifier to one damage roll of any Wizard Evocation spell you cast."},
      {level:14, name:"Overchannel", description:"When you cast a damaging Wizard spell with a level 1–5 slot, deal maximum damage. The first use per Long Rest is free; each further use deals 2d12 Necrotic per slot level to you (increasing by 1d12 each time), ignoring Resistance and Immunity.",
        resource:{name:"Overchannel (free use)", max:1, resetOn:"long"}}
    ]},
    "Illusionist": {source:"PHB'24", checked:"PHB", features:[
      {level:3, name:"Illusion Savant", description:"Add two Illusion spells of level 2 or lower to your spellbook for free, plus one more free Illusion spell each time you gain a new spell slot level.",
        choices:[{id:"spells", label:"Illusion spell (spellbook)", type:"text", count:2}]},
      {level:3, name:"Improved Illusions", description:"Cast Illusion spells without Verbal components, and those with a range of 10+ ft get +60 ft range. You know Minor Illusion, can create both a sound and an image with one casting, and can cast it as a Bonus Action.",
        spells:[{name:"Minor Illusion", level:0}]},
      {level:6, name:"Phantasmal Creatures", description:"You always have Summon Beast and Summon Fey prepared and can cast them as Illusions. Each can be cast once per Long Rest without a slot (the creature then has half HP).",
        spells:[{name:"Summon Beast", level:2}, {name:"Summon Fey", level:3}], resources:[{name:"Summon Beast (free cast)", max:1, resetOn:"long"}, {name:"Summon Fey (free cast)", max:1, resetOn:"long"}]},
      {level:10, name:"Illusory Self", description:"Reaction when a creature attacks you: an illusory duplicate makes the attack automatically miss. Once per Short or Long Rest, or expend a level 2+ slot.",
        resource:{max:1, resetOn:"short"}},
      {level:14, name:"Illusory Reality", description:"When you cast an Illusion spell with a slot, you can choose one inanimate, nonmagical object in it and make it real for 1 minute (it can't deal damage or impose conditions)."}
    ]}
  }
};

// =======================================================================================
// EXPANSION BOOKS
// Everything below is optional content. Each entry's `source` matches a BOOKS id, and the DM
// turns books on per campaign (DM screen → Books). The 2024 PHB is always on.
//   checked: "memory" – entered from the book without an official text to compare against;
//                       worth a spot-check against your copy.
var BOOKS = [
  {id:"PHB'24", name:"Player's Handbook (2024)", core:true},
  {id:"XGE", name:"Xanathar's Guide to Everything"},
  {id:"TCE", name:"Tasha's Cauldron of Everything"},
  {id:"EFA", name:"Eberron: Forge of the Artificer"}
];

// ---------------------------------------------------------------------------------------
// XGE / TCE FEATS (2014-era). Under the 2024 rules these are treated as General feats
// (level 4+). Species prerequisites use the 2024 species names (Half-Orc → Orc, Half-Elf → Khoravar).
//   prereq.species: [names] (any of); prereq.lineage: required Elf lineage etc.;
//   prereq.orSize: also allowed for this size; prereq.martialWeapons: proficiency with a Martial weapon
Object.assign(FEAT_DATA, {
  "Bountiful Luck": {source:"XGE", category:"general", prereq:{level:4, species:["Halfling"]},
    description:"When an ally you can see within 30 ft rolls a 1 on the d20 for an attack roll, ability check or saving throw, you can take a Reaction to let it reroll (it must use the new roll). You then can't use your Luck trait before the end of your next turn."},
  "Dragon Fear": {source:"XGE", category:"general", abilities:["str","con","cha"], prereq:{level:4, species:["Dragonborn"]},
    description:"Instead of exhaling, you can expend a Breath Weapon use to roar: each creature of your choice within 30 ft makes a Wis save (DC 8 + PB + Cha mod) or is Frightened of you for 1 minute (repeating the save when it takes damage)."},
  "Dragon Hide": {source:"XGE", category:"general", abilities:["str","con","cha"], prereq:{level:4, species:["Dragonborn"]},
    description:"Your scales harden: while not wearing armor, your AC is 13 + Dex modifier (a Shield still applies). You grow retractable claws; your Unarmed Strikes deal 1d4 + Str Slashing damage."},
  "Drow High Magic": {source:"XGE", category:"general", prereq:{level:4, species:["Elf"], lineage:"Drow"},
    description:"You can cast Detect Magic at will without a slot, and Levitate and Dispel Magic once each per Long Rest without a slot. Charisma is your spellcasting ability for them.",
    spells:[{name:"Detect Magic", level:1}, {name:"Levitate", level:2, oncePerLongRest:true}, {name:"Dispel Magic", level:3, oncePerLongRest:true}]},
  "Dwarven Fortitude": {source:"XGE", category:"general", abilities:["con"], prereq:{level:4, species:["Dwarf"]},
    description:"Whenever you take the Dodge action, you can spend one Hit Point Die to heal: roll it and regain that many HP plus your Con modifier (min 1)."},
  "Elven Accuracy": {source:"XGE", category:"general", abilities:["dex","int","wis","cha"], prereq:{level:4, species:["Elf","Khoravar"]},
    description:"Whenever you have Advantage on an attack roll using Dexterity, Intelligence, Wisdom or Charisma, you can reroll one of the dice once."},
  "Fade Away": {source:"XGE", category:"general", abilities:["dex","int"], prereq:{level:4, species:["Gnome"]},
    description:"Immediately after you take damage, you can take a Reaction to become Invisible until the end of your next turn or until you attack, deal damage or force a save. Once per Short or Long Rest.",
    resources:[{name:"Fade Away", max:1, resetOn:"short"}]},
  "Fey Teleportation": {source:"XGE", category:"general", abilities:["int","cha"], prereq:{level:4, species:["Elf"], lineage:"High Elf"},
    description:"You learn Sylvan. You can cast Misty Step once without a slot per Short or Long Rest (Intelligence is your spellcasting ability).",
    spells:[{name:"Misty Step", level:2}], resources:[{name:"Misty Step (Fey Teleportation)", max:1, resetOn:"short"}], grants:{proficiencies:"Languages: Sylvan"}},
  "Flames of Phlegethos": {source:"XGE", category:"general", abilities:["int","cha"], prereq:{level:4, species:["Tiefling"]},
    description:"When you roll Fire damage for a spell you cast, you can reroll any 1s (must use the new roll). After you cast a spell that deals Fire damage, flames wreathe you until the end of your next turn: they shed light 30 ft, and a creature within 5 ft that hits you with a melee attack takes 1d4 Fire damage."},
  "Infernal Constitution": {source:"XGE", category:"general", abilities:["con"], prereq:{level:4, species:["Tiefling"]},
    description:"Resistance to Cold and Poison damage, and Advantage on saving throws against being Poisoned.",
    effects:[resist("Cold"), resist("Poison")]},
  "Orcish Fury": {source:"XGE", category:"general", abilities:["str","con"], prereq:{level:4, species:["Orc"]},
    description:"When you hit with a Simple or Martial weapon, you can roll one of its damage dice an extra time and add it (once per Short or Long Rest). Immediately after you use Relentless Endurance, you can take a Reaction to make one weapon attack.",
    resources:[{name:"Orcish Fury (extra die)", max:1, resetOn:"short"}]},
  "Prodigy": {source:"XGE", category:"general", prereq:{level:4, species:["Human","Orc","Khoravar"]},
    description:"You gain one skill proficiency, one tool proficiency and one language of your choice, and Expertise in one skill you're proficient in.",
    choices:[{id:"skill", label:"Skill proficiency", type:"skill", from:"any", count:1, grant:"proficiency"},
      {id:"expertise", label:"Expertise", type:"skill", from:"any", count:1, grant:"expertise"},
      {id:"tool", label:"Tool", type:"text", count:1, proficiency:true, profLabel:"Tools"},
      {id:"language", label:"Language", type:"text", count:1, proficiency:true, profLabel:"Languages"}]},
  "Second Chance": {source:"XGE", category:"general", abilities:["dex","con","cha"], prereq:{level:4, species:["Halfling"]},
    description:"When a creature you can see hits you with an attack roll, you can take a Reaction to force it to reroll. Once per Short or Long Rest, or when you roll Initiative.",
    resources:[{name:"Second Chance", max:1, resetOn:"short"}]},
  "Squat Nimbleness": {source:"XGE", category:"general", abilities:["str","dex"], prereq:{level:4, species:["Dwarf"], orSize:"small"},
    description:"Your Speed increases by 5 feet. You gain proficiency in Acrobatics or Athletics, and you have Advantage on checks to escape a grapple.",
    effects:[bonus("speed", 5)],
    choices:[{id:"skill", label:"Skill", type:"skill", from:["acrobatics","athletics"], count:1, grant:"proficiency"}]},
  "Wood Elf Magic": {source:"XGE", category:"general", prereq:{level:4, species:["Elf"], lineage:"Wood Elf"},
    description:"You learn one Druid cantrip, and can cast Longstrider and Pass without Trace once each per Long Rest without a slot. Wisdom is your spellcasting ability for them.",
    spells:[{name:"Longstrider", level:1, oncePerLongRest:true}, {name:"Pass without Trace", level:2, oncePerLongRest:true}],
    choices:[{id:"cantrip", label:"Druid cantrip", type:"spell", level:0, count:1}]},

  "Artificer Initiate": {source:"TCE", category:"general", prereq:{level:4},
    description:"You learn one Artificer cantrip and one level 1 Artificer spell; you can cast the spell once per Long Rest without a slot (or with slots). Intelligence is your spellcasting ability for them. You gain proficiency with one type of Artisan's Tools, which you can use as a spellcasting focus.",
    choices:[{id:"cantrip", label:"Artificer cantrip", type:"spell", level:0, count:1},
      {id:"spell", label:"Level 1 Artificer spell", type:"spell", level:1, count:1, oncePerLongRest:true},
      {id:"tool", label:"Artisan's Tools", type:"text", count:1, proficiency:true, profLabel:"Tools"}]},
  "Eldritch Adept": {source:"TCE", category:"general", prereq:{level:4, spellcasting:true},
    description:"You learn one Eldritch Invocation you qualify for (level prerequisites refer to your Warlock level, if any). Whenever you gain a level, you can swap it for another.",
    choices:[{id:"invocation", label:"Invocation", type:"option", inName:true, options:ELDRITCH_INVOCATIONS}]},
  "Fighting Initiate": {source:"TCE", category:"general", prereq:{level:4, martialWeapons:true},
    description:"You learn one Fighting Style. Whenever you gain an Ability Score Improvement, you can replace it with another.",
    choices:[{id:"style", label:"Fighting Style feat", type:"fightingStyle"}]},
  "Gunner": {source:"TCE", category:"general", abilities:["dex"], prereq:{level:4},
    description:"You gain proficiency with Firearms, you ignore their Loading property, and being within 5 ft of a hostile creature doesn't impose Disadvantage on your ranged attack rolls.",
    grants:{proficiencies:"Weapons: Firearms"}},
  "Metamagic Adept": {source:"TCE", category:"general", prereq:{level:4, spellcasting:true},
    description:"You learn two Metamagic options and gain 2 Sorcery Points to spend only on Metamagic (regained on a Long Rest). You can swap an option whenever you gain an Ability Score Improvement.",
    choices:[{id:"metamagic", label:"Metamagic", type:"option", count:2, options:METAMAGIC_OPTIONS}],
    resources:[{name:"Metamagic Adept (Sorcery Points)", max:2, resetOn:"long"}]}
});

// ---------------------------------------------------------------------------------------
// EBERRON: FORGE OF THE ARTIFICER — species
Object.assign(SPECIES_DATA, {
  Changeling: {
    source:"EFA", checked:"memory", sizes:["medium","small"], speed:30, darkvision:0,
    skillChoice:{label:"Changeling Instincts", skills:["deception","insight","intimidation","performance","persuasion"]},
    traits:[
      {name:"Changeling Instincts", description:"Proficiency in one of Deception, Insight, Intimidation, Performance or Persuasion (chosen at creation; the book grants two — add the second on the Skills tab)."},
      {name:"Shapechanger", description:"As an action, change your appearance and voice: height, weight, features, coloring and size (between Small and Medium). You can't duplicate a creature you've never seen. Your statistics don't change. You revert on death."}
    ]
  },
  Kalashtar: {
    source:"EFA", checked:"memory", sizes:["medium"], speed:30, darkvision:0,
    traits:[
      {name:"Dual Mind", description:"Advantage on Wisdom saving throws."},
      {name:"Mental Discipline", description:"Resistance to Psychic damage.", effects:[resist("Psychic")]},
      {name:"Mind Link", description:"You can speak telepathically to a creature you can see within 60 ft (it understands if it knows a language). You can let it reply telepathically for 1 hour."},
      {name:"Severed from Dreams", description:"You're immune to magical spells and effects that require you to dream (such as Dream), but not to ones that put you to sleep."}
    ]
  },
  Khoravar: {
    source:"EFA", checked:"memory", sizes:["medium","small"], speed:30, darkvision:60,
    skillChoice:{label:"Skill Versatility", skills:"any"},
    traits:[
      {name:"Darkvision", description:"You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light."},
      {name:"Fey Ancestry", description:"Advantage on saving throws to avoid or end the Charmed condition."},
      {name:"Skill Versatility", description:"Proficiency in one skill of your choice (chosen at creation)."}
    ]
  },
  Shifter: {
    source:"EFA", checked:"memory", sizes:["medium","small"], speed:30, darkvision:60,
    skillChoice:{label:"Bestial Instincts", skills:["acrobatics","athletics","intimidation","survival"]},
    traits:[
      {name:"Bestial Instincts", description:"Proficiency in Acrobatics, Athletics, Intimidation or Survival (chosen at creation)."},
      {name:"Darkvision", description:"You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light."},
      {name:"Shifting", description:"Bonus Action: shift for 1 minute, gaining Temporary HP equal to twice your Proficiency Bonus, plus your Shifting benefit. Uses equal to your PB per Long Rest.",
        resource:{max:"pb", resetOn:"long"}}
    ],
    choices:[
      {id:"shifting", label:"Shifting type", options:[
        {name:"Beasthide", traits:[{name:"Beasthide Shifting", description:"While shifted, you gain an extra 1d6 Temporary HP and +1 AC."}]},
        {name:"Longtooth", traits:[{name:"Longtooth Shifting", description:"While shifted, you can make an Unarmed Strike with your fangs as a Bonus Action: 1d6 + Str Piercing damage."}]},
        {name:"Swiftstride", traits:[{name:"Swiftstride Shifting", description:"While shifted, your Speed increases by 10 ft, and you can take a Reaction to move up to 10 ft when a creature ends its turn within 5 ft of you (without provoking)."}]},
        {name:"Wildhunt", traits:[{name:"Wildhunt Shifting", description:"While shifted, you have Advantage on Wisdom checks, and no creature within 30 ft of you can make an attack roll with Advantage against you unless you're Incapacitated."}]}
      ]}
    ]
  },
  Warforged: {
    source:"EFA", checked:"memory", sizes:["medium","small"], speed:30, darkvision:0,
    skillChoice:{label:"Specialized Design", skills:"any"},
    traits:[
      {name:"Constructed Resilience", description:"Resistance to Poison damage and Advantage on saves against being Poisoned. You don't need to eat, drink or breathe, and you're immune to disease. Magic can't put you to sleep.",
        effects:[resist("Poison")]},
      {name:"Sentry's Rest", description:"You finish a Long Rest by spending at least 6 hours in an inactive, motionless state; you remain conscious and can see and hear."},
      {name:"Integrated Protection", description:"+1 bonus to Armor Class. Armor you wear is integrated into your body; it takes an hour to don or doff and can't be removed against your will.",
        effects:[bonus("ac", 1)]},
      {name:"Specialized Design", description:"Proficiency in one skill (chosen at creation) and one tool of your choice."}
    ]
  }
});

// ---------------------------------------------------------------------------------------
// EBERRON: FORGE OF THE ARTIFICER — Artificer class and subclasses
CLASS_DATA.Artificer = {
  source:"EFA", checked:"memory", hitDie:8, primary:["int"], saves:["con","int"],
  skillChoice:{count:2, from:["arcana","history","investigation","medicine","nature","perception","sleightOfHand"]},
  weapons:"Simple weapons", tools:"Thieves' Tools, Tinker's Tools, and one type of Artisan's Tools", armor:["light","medium","shield"],
  multiclass:{proficiencies:"Armor: Light and Medium armor, Shields\nTools: Thieves' Tools, Tinker's Tools", armor:["light","medium","shield"]},
  caster:"half", spellAbility:"int", asiLevels:STANDARD_ASI_LEVELS, epicBoonLevel:19,
  subclassLevel:3, subclassFeatureLevels:[3,5,9,15],
  subclasses:["Alchemist","Armorer","Artillerist","Battle Smith","Cartographer"],
  cantrips:[2,2,2,2,2,2,2,2,2,3,3,3,3,4,4,4,4,4,4,4],
  prepared:[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15],
  columns:{"Plans Known":[0,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8], "Magic Items":[0,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6]},
  features:[
    {level:1, name:"Spellcasting", description:"Intelligence is your spellcasting ability. You prepare Artificer spells (change them after a Long Rest) and must use Thieves' Tools, Tinker's Tools or Artisan's Tools (or an item you made) as your focus."},
    {level:1, name:"Tinker's Magic", description:"You know Mending. With Tinker's Tools in hand, take a Magic action to create one common adventuring item (such as a rope, torch or lock) in an unoccupied space within 5 ft; it lasts until your next Long Rest. Uses equal to your Intelligence modifier (min 1) per Long Rest.",
      spells:[{name:"Mending", level:0}], resource:{max:{ability:"int", min:1}, resetOn:"long"}},
    {level:2, name:"Replicate Magic Item", description:"You know {Plans Known} magic item plans. After a Long Rest, you can create up to {Magic Items} magic items from your plans with Tinker's Tools (they vanish if you exceed the limit). You can swap one plan whenever you gain an Artificer level.",
      choices:[{id:"plans", label:"Magic item plan", type:"text", count:4}]},
    {level:6, name:"Magic Item Tinker", description:"Bonus Action with Tinker's Tools: charge a replicated item by expending a spell slot, drain one to gain a spell slot (once per Long Rest), or transmute one into another of your plans (once per Long Rest).",
      resource:{name:"Magic Item Tinker (drain/transmute)", max:1, resetOn:"long"}},
    {level:6, name:"Replicate Magic Item (more plans)", description:"You learn another magic item plan.", choices:[{id:"plans", label:"Magic item plan", type:"text", count:1}]},
    {level:7, name:"Flash of Genius", description:"Reaction when you or a creature within 30 ft makes an ability check or saving throw: add your Intelligence modifier to the roll. Uses equal to your Intelligence modifier (min 1) per Long Rest.",
      resource:{max:{ability:"int", min:1}, resetOn:"long"}},
    {level:10, name:"Magic Item Adept", description:"You can attune to up to four magic items at once, and you can replicate higher-rarity items from your plans."},
    {level:10, name:"Replicate Magic Item (more plans)", description:"You learn another magic item plan.", choices:[{id:"plans", label:"Magic item plan", type:"text", count:1}]},
    {level:11, name:"Spell-Storing Item", description:"After a Long Rest, store a level 1–3 Artificer spell (casting time of an action) in a weapon or focus you touch. A creature holding it can take a Magic action to cast the spell using your modifiers, a number of times equal to twice your Intelligence modifier (min 2).",
      resource:{name:"Spell-Storing Item (casts)", max:{ability:"int", min:1, times:2}, resetOn:"long"}},
    {level:14, name:"Advanced Artifice", description:"You can attune to up to five magic items at once, and Flash of Genius uses return on a Short Rest as well."},
    {level:14, name:"Replicate Magic Item (more plans)", description:"You learn another magic item plan.", choices:[{id:"plans", label:"Magic item plan", type:"text", count:1}]},
    {level:18, name:"Magic Item Master", description:"You can attune to up to six magic items at once."},
    {level:18, name:"Replicate Magic Item (more plans)", description:"You learn another magic item plan.", choices:[{id:"plans", label:"Magic item plan", type:"text", count:1}]},
    {level:20, name:"Soul of Artifice", description:"You gain +1 to all saving throws per magic item you're attuned to. When you're reduced to 0 HP but not killed outright, you can end one of your replicated items to drop to 1 HP instead."}
  ]
};

SUBCLASS_DATA.Artificer = {
  "Alchemist": {source:"EFA", checked:"memory", columns:{"Elixirs":[0,0,1,1,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4]}, features:[
    {level:3, name:"Tools of the Trade", description:"You gain proficiency with Alchemist's Supplies and the Herbalism Kit.", grants:{proficiencies:"Tools: Alchemist's Supplies, Herbalism Kit"}},
    {level:3, name:"Experimental Elixir", description:"After a Long Rest, create {Elixirs} elixir(s) with Alchemist's Supplies (random effect, or chosen by expending a spell slot for more): Healing, Swiftness, Resilience, Boldness, Flight or Transformation. Drinking one is a Bonus Action.",
      resource:{name:"Experimental Elixirs", max:{column:"Elixirs"}, resetOn:"long"}}
  ].concat(subclassSpells("Alchemist Spells", {3:{"Healing Word":1,"Ray of Sickness":1}, 5:{"Flaming Sphere":2,"Melf's Acid Arrow":2}, 9:{"Gaseous Form":3,"Mass Healing Word":3}, 13:{"Death Ward":4,"Vitriolic Sphere":4}, 17:{"Cloudkill":5,"Raise Dead":5}})).concat([
    {level:5, name:"Alchemical Savant", description:"When you cast a spell using Alchemist's Supplies as the focus, add your Intelligence modifier (min +1) to one roll of the spell that restores HP or deals Acid, Fire, Necrotic or Poison damage."},
    {level:9, name:"Restorative Reagents", description:"Drinking one of your elixirs also grants 2d6 + Int mod Temporary HP. You can cast Lesser Restoration without a slot a number of times equal to your Intelligence modifier (min 1) per Long Rest.",
      resource:{name:"Lesser Restoration (free casts)", max:{ability:"int", min:1}, resetOn:"long"}},
    {level:15, name:"Chemical Mastery", description:"Resistance to Acid and Poison damage and immunity to the Poisoned condition. Your Alchemical Savant spells deal an extra 2d8 Acid or Fire damage once per turn, and you can cast Greater Restoration and Heal once each per Long Rest without a slot.",
      effects:[resist("Acid"), resist("Poison")]}
  ])},
  "Armorer": {source:"EFA", checked:"memory", features:[
    {level:3, name:"Tools of the Trade", description:"You gain Heavy armor training and proficiency with Smith's Tools.", grants:{proficiencies:"Armor: Heavy armor\nTools: Smith's Tools"}},
    {level:3, name:"Arcane Armor", description:"As a Magic action with Smith's Tools, turn armor you wear into Arcane Armor: no Strength requirement, it covers your whole body, can't be removed against your will, and serves as your spellcasting focus."},
    {level:3, name:"Armor Model", description:"Choose a model each time you finish a Long Rest. Guardian: Thunder Gauntlets (1d8 Thunder, target has Disadvantage attacking others) and Defensive Field (Bonus Action Temporary HP equal to your Artificer level, PB times per Long Rest). Infiltrator: Lightning Launcher (ranged 1d6 Lightning, once per turn +1d6), +5 ft Speed and Advantage on Stealth.",
      choices:[{id:"model", label:"Armor Model", type:"option", inName:true, options:[{name:"Guardian"},{name:"Infiltrator"}]}],
      resource:{name:"Defensive Field", max:"pb", resetOn:"long"}}
  ].concat(subclassSpells("Armorer Spells", {3:{"Magic Missile":1,"Thunderwave":1}, 5:{"Mirror Image":2,"Shatter":2}, 9:{"Hypnotic Pattern":3,"Lightning Bolt":3}, 13:{"Fire Shield":4,"Greater Invisibility":4}, 17:{"Passwall":5,"Wall of Force":5}})).concat([
    {level:5, name:"Extra Attack", description:"You attack twice instead of once when you take the Attack action."},
    {level:9, name:"Armor Modifications", description:"Your Arcane Armor counts as separate items (armor, boots, helmet, special weapon) for replicated magic items, and you can have two more replicated items as long as they're part of the armor."},
    {level:15, name:"Perfected Armor", description:"Guardian: Reaction to pull a Huge or smaller creature within 30 ft up to 25 ft toward you (Str save), then attack it. Infiltrator: Lightning Launcher hits make the target glow; the next attack against it has Advantage and deals an extra 1d6 Lightning."}
  ])},
  "Artillerist": {source:"EFA", checked:"memory", features:[
    {level:3, name:"Tools of the Trade", description:"You gain proficiency with Woodcarver's Tools.", grants:{proficiencies:"Tools: Woodcarver's Tools"}},
    {level:3, name:"Eldritch Cannon", description:"Magic action with Smith's or Woodcarver's Tools: create a Small or Tiny cannon (AC 18, HP five times your Artificer level) for 1 hour. Flamethrower (15-ft Cone, Dex save, 2d8 Fire), Force Ballista (ranged spell attack, 2d8 Force, push 5 ft) or Protector (1d8 + Int mod Temporary HP to creatures within 10 ft). Bonus Action to activate it. Once per Long Rest, or expend a spell slot.",
      resource:{max:1, resetOn:"long"}}
  ].concat(subclassSpells("Artillerist Spells", {3:{"Shield":1,"Thunderwave":1}, 5:{"Scorching Ray":2,"Shatter":2}, 9:{"Fireball":3,"Wind Wall":3}, 13:{"Ice Storm":4,"Wall of Fire":4}, 17:{"Cone of Cold":5,"Wall of Force":5}})).concat([
    {level:5, name:"Arcane Firearm", description:"After a Long Rest, carve sigils into a wand, staff or rod; when you cast an Artificer spell through it, add 1d8 to one of the spell's damage rolls."},
    {level:9, name:"Explosive Cannon", description:"Your cannon's damage rolls increase by 1d8, and as a Magic action you can detonate it: creatures within 20 ft make a Dex save, taking 3d10 Force damage (half on success)."},
    {level:15, name:"Fortified Position", description:"You and allies have Half Cover within 10 ft of your cannon, and you can have two cannons at once (both activated with one Bonus Action)."}
  ])},
  "Battle Smith": {source:"EFA", checked:"memory", features:[
    {level:3, name:"Tools of the Trade", description:"You gain proficiency with Smith's Tools.", grants:{proficiencies:"Tools: Smith's Tools"}},
    {level:3, name:"Battle Ready", description:"You gain Martial weapon proficiency, and you can use Intelligence instead of Strength or Dexterity for attack and damage rolls with magic weapons.", grants:{proficiencies:"Weapons: Martial weapons"}},
    {level:3, name:"Steel Defender", description:"You create a Steel Defender companion (its stat block uses your level and PB). It acts on your turn; command it with a Bonus Action, or it Dodges. You can repair or rebuild it with your tools and a spell slot."}
  ].concat(subclassSpells("Battle Smith Spells", {3:{"Heroism":1,"Shield":1}, 5:{"Branding Smite":2,"Warding Bond":2}, 9:{"Aura of Vitality":3,"Conjure Barrage":3}, 13:{"Aura of Purity":4,"Fire Shield":4}, 17:{"Banishing Smite":5,"Mass Cure Wounds":5}})).concat([
    {level:5, name:"Extra Attack", description:"You attack twice instead of once when you take the Attack action."},
    {level:9, name:"Arcane Jolt", description:"Once per turn when you or your Steel Defender hit with an attack, deal an extra 2d6 Force damage, or heal a creature within 30 ft of the target for 2d6. Uses equal to your Intelligence modifier (min 1) per Long Rest.",
      resource:{max:{ability:"int", min:1}, resetOn:"long"}},
    {level:15, name:"Improved Defender", description:"Arcane Jolt becomes 4d6, your Steel Defender gains +2 AC, and its Deflect Attack deals 1d4 + Int mod Force damage to the attacker."}
  ])},
  "Cartographer": {source:"EFA", checked:"memory", features:[
    {level:3, name:"Cartographer (not yet entered)", description:"The Cartographer is new in Forge of the Artificer and isn't in the rules database yet — add its features on the Features tab for now."}
  ]}
};
