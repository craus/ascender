function createRoguelike(params) {
  
  // Rules common things
    
  var gameName = "roguelike"
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
    Object.values(resources).forEach(function(resource) {
      savedata[resource.id] = resource.value
    })
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  resources = {
    farm: variable(10, 'farm'),
    level: variable(0, 'level'),
  }
  
  var refreshQuests = function() {
    quests = []
    for (var i = 0; i < 3; i++) {
      quests.push(quest())
    }
  }
  
  quests = savedata.quests
  if (!!quests) {
  }
  
  civilization = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')

      debug.unprofile('paint')
    },
    tick: function() {
      if (resources.conquestCost.value < 100) resources.conquestCost.value = 100
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return civilization
}