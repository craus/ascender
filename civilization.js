function createCivilization(params) {
  
  // Rules common things
    
  var gameName = "civilization"
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
    savedata.activeTab = $('.sections>.active>a').attr('href')
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  resources = {
    time: variable(0, 'time'),
    money: variable(0, 'money'),
    population: variable(1, 'population'),
    science: variable(0, 'science'),
    totalTech: variable(0, 'totalTech'),
    scientists: variable(0, 'scientists'),
    commands: variable(10, 'commands', {formatter: x => x.toFixed(2)})
  }
  resources.science.income = resources.scientists
  resources.money.income = resources.population
  resources.time.income = (() => 1)

  commands = {
    hireScientists: command('hireScientists', z => ({
      commands: -1,
      money: -Math.pow(10, z),
      scientists: +Math.pow(5, z)
    }))
  }
  
  $('a[href="' + savedata.activeTab + '"]').tab('show')
  
  civilization = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      Object.values(commands).each('paint')
      setFormattedText($('.populationIncome'), noZero(signed(0)))

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000

      Object.values(resources).each('tick', deltaTime)
      resources.commands.value += deltaTime * 0.1
      resources.commands.value = Math.min(10, resources.commands.value)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return civilization
}