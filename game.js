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
  
  resources = {
    money: variable(0, 'money'),
    time: variable(0, 'time'),
    m2: variable(0, 'm2'),
    m3: variable(0, 'm3'),
    m5: variable(0, 'm5'),
  }
  
  resources.money.income = () => Math.pow(2, resources.m2()) * Math.pow(3, resources.m3()) * Math.pow(5, resources.m5())
  buys = {
    m2: buy({
      id: 'buyM2',
      cost: {
        money: () => Math.pow(8, resources.m2()+1)
      }, 
      reward: {
        m2: () => 1
      }
    }),
    m3: buy({
      id: 'buyM3',
      cost: {
        money: () => Math.pow(27, resources.m3()+1)
      }, 
      reward: {
        m3: () => 1
      }
    }),
    m5: buy({
      id: 'buyM5',
      cost: {
        money: () => Math.pow(125, resources.m5()+1)
      }, 
      reward: {
        m5: () => 1
      }
    }),
  }
  
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
      
      resources.time.value += deltaTime
      Object.values(resources).each('tick', deltaTime)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return game
}