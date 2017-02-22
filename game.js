function createGame(params) {
  
  // Rules common things
    
  var gameName = "fatique"
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
  
  resources = {
    money: variable(0, 'money'),
    time: variable(0, 'time'),
    moneyIncome: variable(1, 'moneyIncome'),
    fatique: variable(1, 'fatique', {
      formatter: large
    }),
    lastClick: variable(1, 'lastClick'),
  }
  
  resources.money.income = resources.moneyIncome
  
  buys = {
    buy: buy({
      id: 'buy',
      cost: {
        money: () => resources.money()
      }, 
      reward: {
        moneyIncome: () => resources.money() / resources.fatique(),
        fatique: () => 1
      }
    })
  }
  
  var timeSpeed = 1
  $('.boost').click(() => timeSpeed *= 10)
  
  //limitExceeded
  
  game = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      Object.values(buys).each('paint')
      
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      timeSpeed /= Math.pow(1000, deltaTime)
      deltaTime *= timeSpeed
      resources.time.value += deltaTime
      resources.fatique.value /= Math.pow(2, deltaTime / 100)
      if (resources.fatique.value < 1e-100) {
        resources.fatique.value = 1e-100
      }
      if (timeSpeed < 1) {
        timeSpeed = 1
      }
      Object.values(resources).each('tick', deltaTime)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return game
}