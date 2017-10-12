function createRoguelike(params) {
  
  // Rules common things
    
  var gameName = "roguelikeNoIdle"
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
  
  minIdleForQuest = 1
  
  resources = {
    farm: variable(1, 'farm', {formatter: large, incomeFormatter: x => noZero(signed(large(x)))}),
    farmIncome: variable(0, 'farmIncome', {formatter: large}),
    time: variable(0, 'time', {formatter: Format.time}),
    realTime: variable(30, 'realTimeVar'),
    level: variable(0, 'level'),
    life: variable(3, 'life'),
    activeLife: variable(1, 'activeLife'),
    idle: variable(0, 'idle'),
    lastDeathChance: variable(1, 'lastDeathChance', {formatter: x => Format.percent(x, 2)})
  }
  quests = []

  //resources.farm.income = resources.farmIncome;
  
  revive = function() {
    resources.activeLife.value += 1
  }
  
  refreshQuests = function() {
    if (!!quests) {
      quests.each('destroy')
    }
    quests = []
    for (var i = 0; i < 3; i++) {
      console.log("quest", i)
      quests.push(quest())
    }
  }
  
  if (!!savedata.quests) {
    quests = savedata.quests.map(q => quest(q))
  } else {
    refreshQuests()
  }

  createWaitButton = function(wait) {
    $('.wait'+wait).click(function() {
      if (resources.realTime.value < wait) {
        return
      }
      resources.realTime.value -= wait
      resources.idle.value += wait
    })
    return {
      paint: function() {
        $('.wait'+wait).toggleClass('disabled', resources.realTime() < wait)
      }
    }
  }

  waitButtons = []
  waitButtons.push(createWaitButton(1))
  waitButtons.push(createWaitButton(10))
  waitButtons.push(createWaitButton(100))

  
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
      
      $('.panel-idle').toggleClass('panel-warning', resources.idle() <= minIdleForQuest-eps)
      $('.panel-idle').toggleClass('panel-primary', resources.idle() > minIdleForQuest-eps)
      
      quests.each('paint')
      waitButtons.each('paint')

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      //resources.idle.value += deltaTime
      // if (resources.activeLife() < 1) {
      //   resources.idle.value = 0
      // }
      resources.time.value += deltaTime

      if (resources.idle.value < 1-eps) {
        resources.idle.value += 1
        resources.realTime.value -= 1
      }

      Object.values(resources).each('tick', deltaTime)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return result
}