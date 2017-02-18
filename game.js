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
    Object.values(resources).each('save', savedata)
    Object.values(cooldowns).each('save', savedata)
    effects.each('save', savedata)
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  cooldowns = {
    fire: cooldown('fire', 'Fire'),
    earth: cooldown('earth', 'Earth'),
    air: cooldown('air', 'Air'),
    water: cooldown('water', 'Water'),
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
  if (savedata.effects) {
    savedata.effects.forEach(e => effects.push(powerEffect(e)))
  }
  var power = () => effects.reduce((acc, cur) => acc + cur.power(), 0)
  wisdomMultiplier = () => Math.pow(2, power())
  
  spells = {
    headbang: spell({
      name: 'Headbang',
      reward: 300,
      power: 4,
      decay: 10,
      cooldowns: {
        fire: 2,
        water: 6
      },      
    })
  }

  spellcaster = {
    paint: function() {
      debug.profile('paint')
      
      effects.each('paint')
      Object.values(resources).each('paint')
      Object.values(cooldowns).each('paint')
      Object.values(spells).each('paint')
      
      setFormattedText($(".power"), large(power()))
      setFormattedText($(".wisdomMultiplier"), large(wisdomMultiplier()))
      
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      effects.filter(e => e.expired()).each('destroy')
      effects = effects.filter(e => !e.expired())

      resources.time.value += deltaTime
      Object.values(cooldowns).forEach(c => {
        c.value = Math.clamp(c.value - deltaTime, 0, 1e9)
      })
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return spellcaster
}