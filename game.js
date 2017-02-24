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
    time: variable(0, 'time'),
    questLimit: variable(2, 'questLimit'),
    heroLimit: variable(1, 'heroLimit')
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
      refreshSelected()
    }
  }
  
  heroes = []
  $('.newHero').click(() => {
    heroes.push(hero())
  })
  if (savedata.heroes) {
    heroes = savedata.heroes.map(h => hero(h))
  } else {
    heroes.push(hero())
  }
  
  quests = []
  if (savedata.quests) {
    quests = savedata.quests.map(q => quest(q))
  } else {
    for (var i = 0; i < 1; i++) {
      quests.push(quest({level: 0}))
    }
  }
  
  heroes.forEach(h => h.quest = quests[h.questIndex])
  quests.forEach(q => q.hero = heroes[q.heroIndex])

  selectedHero = heroes.find(h => h.selected)
  selectedQuest = quests.find(q => q.selected)
  
  refreshSelected = function() {
    selectedHero = heroes.find(h => h.selected)
    selectedQuest = quests.find(q => q.selected)
  }
  
  buys = {
    buyQuestSlot: buy({
      id: 'buyQuestSlot',
      cost: {
        gold: () => 25 * (Math.pow(2, resources.questLimit()))
      }, 
      reward: {
        questLimit: () => 1
      }
    }),
    buyHeroSlot: buy({
      id: 'buyHeroSlot',
      cost: {
        gold: () => 25 * (Math.pow(2, resources.heroLimit()))
      }, 
      reward: {
        heroLimit: () => 1
      }
    })
  }
  
  heroesArrival = poisson({
    trigger: function() {
      heroes.push(hero())
    },
    period: () => 60 * Math.pow(1.2, heroes.length-resources.heroLimit())
  })
  
  spellcaster = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      heroes.each('paint')
      quests.each('paint')
      setFormattedText($('.heroCount'), heroes.length)
      setFormattedText($('.questCount'), quests.length)
      Object.values(buys).each('paint')
      
      setFormattedText($('.heroesArrival.period'), Format.time(heroesArrival.period()))
      
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      resources.time.value += deltaTime
      heroesArrival.tick(deltaTime)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return spellcaster
}