function createGame(params) {
  
  // Rules common things
    
  var gameName = "heroes"
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
    Object.values(resources).each('save')
    savedata.quests = []
    savedata.heroes = []
    heroes.each('save')
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
    gold: variable(0, 'gold'),
    time: variable(0, 'time')
  }
  
  matchHeroAndQuest = function() {
    var hero = heroes.find(h => h.selected)
    var quest = quests.find(q => q.selected)
    if (hero && quest) {
      hero.quest = quest
      quest.hero = hero
      hero.selected = false
      quest.selected = false
      quest.start()
    }
  }
  
  heroes = []
  $('.newHero').click(() => {
    heroes.push(hero())
  })
  if (savedata.heroes) {
    heroes = savedata.heroes.map(h => hero(h))
  }
  
  quests = []
  if (savedata.quests) {
    quests = savedata.quests.map(q => quest(q))
  } else {
    for (var i = 0; i < 4; i++) {
      quests.push(quest({level: 0}))
    }
  }
  
  heroes.forEach(h => h.quest = quests[h.questIndex])
  quests.forEach(q => q.hero = heroes[q.heroIndex])

  spellcaster = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      heroes.each('paint')
      quests.each('paint')
      
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      resources.time.value += deltaTime
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return spellcaster
}