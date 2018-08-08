function createMissionClicker(params) {
  
  // Rules common things
    
  var gameName = "missionClicker"
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
    Object.values(missions).forEach(function(mission) {
      savedata[mission.id] = mission.save()
    })

    savedata.activeTab = $('.sections>.active>a').attr('href')
    savedata.activeTechTab = $('.techs>.active>a').attr('href')
    savedata.activeTechTab = $('.areas>.active>a').attr('href')
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  resources = {
    time: variable(0, 'time', {formatter: x => x.toFixed(2)}),
    idleTime: variable(0, 'idleTime', {formatter: x => x.toFixed(2)}),
  }
  resources.time.income = (() => 1)
  resources.idleTime.income = (() => 1)
	
	missions = {
		click: mission('click', {
			clicks: 0,
			name: 'Click',
			desc: function() { return "Click THE BUTTON#{0}.".i(this.level > 1 ? " #{0} times".i(this.level) : '') },
			click: function() { this.clicks += 1; if (this.clicks == this.level) this.complete() },
			reset: function() { this.clicks = 0 },
			progress: function() { return this.clicks },
			maxProgress: function() { return this.level }
		}),
		idle: mission('idle', {
			time: 0,
			name: 'Idle',
			desc: function() { return "Do not click THE BUTTON for #{0} seconds.".i(this.level) },
			click: function() { this.time = 0 },
			tick: function(t) { this.time += t; while (this.time >= this.level) this.complete() },
			reset: function() { this.time -= this.level },
			progress: function() { return this.time },
			maxProgress: function() { return this.level }
		}),
		slowPlay: mission('slowPlay', {
			clicks: 0,
			name: 'Slowplay',
			count: 1,
			idle: 1,
			desc: function() { 
				return "Click THE BUTTON#{0} with idle time at least #{1} s.".i(
					this.count > 1 ? " #{0} times".i(this.count) : '',
					this.idle
				) 
			},
			click: function() { 
				if (resources.idleTime() < this.idle) return
				this.clicks += 1; 
				if (this.clicks == this.count) this.complete() 
			},
			complete: function() {
				this.reset()
				this.level += 1
				if (this.idle > 1) {
					this.count += 1
					this.idle -= 1
				} else {
					this.idle = this.count + 1
					this.count = 1
				}
			},
			reset: function() { this.clicks = 0 },
			progress: function() { return this.clicks },
			maxProgress: function() { return this.count }
		}),
	}
	
  savedata.activeTab = savedata.activeTab || '#population'
  
  $('a[href="' + savedata.activeTab + '"]').tab('show')
  $('a[href="' + savedata.activeTechTab + '"]').tab('show')
  $('a[href="' + savedata.activeAreaTab + '"]').tab('show')
	
	$('.theButton').click(() => resources.idleTime.value = 0)
  
  game = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      Object.values(missions).each('paint')
      //setFormattedText($('.conquestPercent'), '#{0}%'.i((resources.warpower() / resources.conquestCost()*100).toFixed(2)))
      //$('.populationTab').toggle(techs.minerals()>0)

      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000

      if (input.contains('f')) {
        deltaTime *= 10   
        if (input.contains('Shift')) {
          deltaTime *= 10
        }
      }
      
      Object.values(resources).each('tick', deltaTime)
      Object.values(missions).each('tick', deltaTime)
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return game
}