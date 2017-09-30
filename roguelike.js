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
  loadedSave = savedata
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
    savedata.quests = []
    quests.each('save')
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  resources = {
    farm: variable(1, 'farm', {formatter: large}),
    level: variable(0, 'level'),
    life: variable(3, 'life'),
    activeLife: variable(1, 'activeLife'),
    idle: variable(1, 'idle')
  }
  quests = []
  
  revive = function() {
    resources.activeLife.value += 1
  }
  
  refreshQuests = function() {
    if (!!quests) {
      quests.each('destroy')
    }
    quests = []
    for (var i = 0; i < 3; i++) {
      quests.push(quest())
    }
  }
  
  if (!!savedata.quests) {
    quests = savedata.quests.map(q => quest(q))
  } else {
    refreshQuests()
  }
  
  result = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      $('.alive').toggle(resources.activeLife() > 0)
      $('.dead').toggle(resources.activeLife() <= 0)
      $('.lifePositive').toggle(resources.life() > 0)
      $('.lifeNonPositive').toggle(resources.life() <= 0)
      
      $('.panel-life').toggleClass('panel-danger', resources.life() <= 1)
      $('.panel-life').toggleClass('panel-primary', resources.life() > 1)
      
      $('.panel-idle').toggleClass('panel-warning', resources.idle() <= 3)
      $('.panel-idle').toggleClass('panel-primary', resources.idle() > 3)
      
      quests.each('paint')

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      resources.idle.value += deltaTime
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return result
}