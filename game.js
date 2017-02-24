function createGame(params) {
  
  // Rules common things
    
  var gameName = "experimental"
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
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  var waiting = () => 1 / Math.random()
  
  resources = {
    money: variable(0, 'money'),
    time: variable(0, 'time'),
    power: variable(waiting(), 'power', {formatter: large}),
    moneyIncome: variable(1, 'moneyIncome')
  }
  resources.cost = variable(resources.power(), 'cost')
  
  var nextUpgrade = () => {
    var t = waiting()
    resources.power.value = Math.pow(2, t / 60)
    resources.cost.value = resources.moneyIncome() * t
  }
  
  resources.money.income = resources.moneyIncome
  
  $('.upgrade>.buy').click(() => {
    resources.moneyIncome.value *= resources.power()
    resources.money.value -= resources.cost()
    nextUpgrade()
    game.paint()
    skipAnimation($('.availability'))
  })
  
  game = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      enable($('.upgrade>.buy'), resources.money() >= resources.cost())
      setProgress($('.availability'), Math.clamp(resources.money() / resources.cost(), 0, 1) * 100, {
        text: Format.time(Math.max(0, resources.cost()-resources.money()) / resources.money.income())
      })
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      resources.time.value += deltaTime
      Object.values(resources).each('tick', deltaTime)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  game.paint()
  skipAnimation($('.availability'))
  return game
}