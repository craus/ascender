function createGame(params) {
  
  // Rules common things
    
  var gameName = "cooldowner"
  var saveName = gameName+"SaveData"

  if (localStorage[saveName] != undefined) {
    savedata = JSON.parse(localStorage[saveName])
  } else {
    savedata = {
      realTime: new Date().getTime()
    }
  }
  console.log("loaded " + gameName + " save: ", savedata)
  
  var saveWiped = false
  
  var save = function(timestamp) {
    if (saveWiped) {
      return
    }
    savedata = {}
    savedata.realTime = timestamp || Date.now()
    //localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  cooldowns = {
    fire: variable(0, 'fire'),
    earth: variable(0, 'earth'),
    air: variable(0, 'air'),
    water: variable(0, 'water'),
  }
  
  resources = {
    wisdom: variable(0, 'wisdom', 'wisdom', {
      formatter: x => x.toFixed(0)
    }),
    time: variable(0, 'time', 'time', {
      formatter: x => x.toFixed(2)
    })
  }

  effects = []
  var power = () => effects.reduce((acc, cur) => acc + cur.power(), 0)
  var wisdomMultiplier = () => Math.pow(2, power())
  
  spells = {
    empower: createSpell({
      action: function() {
        wisdom.value += 300 * wisdomMultiplier()
        effects.push(createEffect({
          name: 'empower',
          createdAt: Date.now(),
          power: function() { 1 * Math.pow(0.5, (Date.now()-this.createdAt)/1000/this.decay) },
          decay: 10,
          paint: function() {
            setFormattedText(this.panel.find(".effectMultiplier"), large(this.effectMultiplier))
            setFormattedText(this.panel.find(".costMultiplier"), large(this.costMultiplier))
          }
        })) 
      },
      hotkey: "3"
    })
  }

  spellcaster = {
    paint: function() {
      debug.profile('paint')
      
      effects.each('paint')
      
      setFormattedText($(".wisdomIncome"), signed(noZero(effects.reduce((acc, cur) => acc + (cur.wisdomIncome || 0), 0))))
      
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      effects.filter(e => e.expired()).each('destroy')
      effects = effects.filter(e => !e.expired())
      effects.each('tick', deltaTime)

      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return spellcaster
}