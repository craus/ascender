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
    money: variable(1e9, 'money'),
    time: variable(0, 'time'),
    m1: variable(0, 'm1'),
    m2: variable(0, 'm2'),
    m3: variable(0, 'm3'),
    m4: variable(0, 'm4'),
    m5: variable(0, 'm5'),
    m6: variable(0, 'm6'),
  }
  
  var c = 10
  resources.money.income = () => 1e-3 * 
    Math.pow(2, resources.m1()) * 
    Math.pow(3, resources.m2()) * 
    Math.pow(5, resources.m3()) *
    Math.pow(7, resources.m4()) *
    Math.pow(11, resources.m5()) *
    Math.pow(13, resources.m6())
  buys = {
    m1: buy({
      id: 'buyM1',
      cost: {
        money: () => 1 * Math.pow(Math.pow(2, 6), resources.m1())
      }, 
      reward: {
        m1: () => 1
      }
    }),
    m2: buy({
      id: 'buyM2',
      cost: {
        money: () => 1 * Math.pow(Math.pow(3, 6), resources.m2())
      }, 
      reward: {
        m2: () => 1
      }
    }),
    m3: buy({
      id: 'buyM3',
      cost: {
        money: () => 1 * Math.pow(Math.pow(5, 6), resources.m3())
      }, 
      reward: {
        m3: () => 1
      }
    }),
    m4: buy({
      id: 'buyM4',
      cost: {
        money: () => 1 * Math.pow(Math.pow(7, 6), resources.m4())
      }, 
      reward: {
        m4: () => 1
      }
    }),
    m5: buy({
      id: 'buyM5',
      cost: {
        money: () => 1 * Math.pow(Math.pow(11, 6), resources.m5())
      }, 
      reward: {
        m5: () => 1
      }
    }),
    m6: buy({
      id: 'buyM6',
      cost: {
        money: () => 1 * Math.pow(Math.pow(13, 6), resources.m6())
      }, 
      reward: {
        m6: () => 1
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