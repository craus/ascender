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
    savedata.idles = idles
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
	
	idles = savedata.idles || []
	
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
			ready: function() { return false },
			waitTime: function() { return this.level - this.time },
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
				return "Click THE BUTTON#{0} with idle time at least #{1} sec.".i(
					this.count > 1 ? " #{0} times".i(this.count) : '',
					this.idle
				) 
			},
			ready: function() {
				return resources.idleTime() >= this.idle
			},
			click: function() { 
				if (!this.ready()) return
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
			maxProgress: function() { return this.count },
			waitTime: function() { return this.idle - resources.idleTime() }
		}),
		criticalClick: mission('criticalClick', {
			name: 'Critical Click',
			idle: 1,
			desc: function() { 
				return "Click THE BUTTON with idle time EXACTLY #{0} sec.".i(
					this.idle
				) 
			},
			smallDesc: function() {
				return "Absolute error must be at most 0.01 sec."
			},
			wait: function() {
				return resources.idleTime() < this.idle - 0.01
			},
			ready: function() {
				return Math.abs(resources.idleTime() - this.idle) < 0.01
			},
			late: function() {
				return resources.idleTime() > this.idle + 0.01
			},
			click: function() { 
				if (!this.ready()) return
				this.complete() 
			},
			complete: function() {
				this.reset()
				this.level += 1
				this.idle += 1
			},
			waitTime: function() { return this.idle - resources.idleTime() }
		}),
		acceleration: mission('acceleration', {
			clicks: 0,
			name: 'Acceleration',
			count: 3,
			time: 1,
			bestIdles: [],
			desc: function() { 
				return "Click THE BUTTON #{0} times, faster with each click.".i(
					this.count > 1 ? " #{0} times".i(this.count) : '',
					this.idle
				) 
			},
			ready: function() {
				return resources.idleTime() < this.time
			},
			late: function() {
				return resources.idleTime() > this.time
			},
			click: function() { 
				if (!this.ready()) {
					this.reset()
				} else {
					this.clicks += 1; 
					if (this.clicks == this.count) this.complete() 
				}
				this.time = resources.idleTime()
			},
			complete: function() {
				this.reset()
				this.level += 1
				this.count += 1
			},
			reset: function() { this.clicks = 0 },
			progress: function() { return this.clicks },
			maxProgress: function() { return this.count },
			paint: function() {
				this.basePaint()
				setFormattedText($('.#{0} .time'.i(this.id)), this.time.toFixed(2))
			},
			waitTime: function() { return this.time - resources.idleTime() }
		}),
		deceleration: mission('deceleration', {
			clicks: 0,
			name: 'Deceleration',
			count: 3,
			time: 1,
			desc: function() { 
				return "Click THE BUTTON #{0} consecutive times, slower with each click.".i(
					this.count > 1 ? " #{0} times".i(this.count) : '',
					this.idle
				) 
			},
			ready: function() {
				return resources.idleTime() > this.time
			},
			click: function() { 
				if (!this.ready()) {
					this.reset()
				} else {
					this.clicks += 1; 
					if (this.clicks == this.count) this.complete() 
				}
				this.time = resources.idleTime()
			},
			complete: function() {
				this.reset()
				this.level += 1
				this.count += 1
			},
			reset: function() { this.clicks = 0 },
			progress: function() { return this.clicks },
			maxProgress: function() { return this.count },
			paint: function() {
				this.basePaint()
				setFormattedText($('.#{0} .time'.i(this.id)), this.time.toFixed(2))
			},
			waitTime: function() { return this.time - resources.idleTime() }
		}),
		rhythm: mission('rhythm', {
			clicks: 0,
			name: 'Rhythm',
			count: 3,
			time: 1,
			eps: 0.2,
			desc: function() { 
				return "Click THE BUTTON #{0} consecutive times, with EXACTLY same idle time.".i(
					this.count > 1 ? " #{0} times".i(this.count) : '',
					this.idle
				) 
			},
			smallDesc: function() {
				return "Relative difference between two consecutive clicks must be at most #{0}%.".i(this.eps * 100)
			},
			wait: function() {
				return resources.idleTime() < this.time - resources.idleTime() * this.eps
			},
			ready: function() {
				return Math.abs(resources.idleTime() - this.time) < resources.idleTime() * this.eps
			},
			late: function() {
				return resources.idleTime() > this.time + resources.idleTime() * this.eps
			},
			click: function() { 
				if (!this.ready()) {
					this.reset()
				} else {
					this.clicks += 1; 
					if (this.clicks == this.count) this.complete() 
				}
				this.time = resources.idleTime()
			},
			complete: function() {
				this.reset()
				this.level += 1
				this.count += 1
			},
			waitTime: function() { return this.idle - resources.idleTime() },
			reset: function() { this.clicks = 0 },
			progress: function() { return this.clicks },
			maxProgress: function() { return this.count },
			paint: function() {
				this.basePaint()
				setFormattedText($('.#{0} .time'.i(this.id)), this.time.toFixed(2))
			},
			waitTime: function() { return this.time - resources.idleTime() }
		}),
	}
	
  savedata.activeTab = savedata.activeTab || '#population'
  
  $('a[href="' + savedata.activeTab + '"]').tab('show')
  $('a[href="' + savedata.activeTechTab + '"]').tab('show')
  $('a[href="' + savedata.activeAreaTab + '"]').tab('show')
	
	$('.theButton').click(() => {
		game.tick()
		Object.values(missions).each('click')
		idles.push(resources.idleTime.value)
		resources.idleTime.value = 0
	})
  
  game = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      Object.values(missions).each('paint')
      setFormattedText($('.lastIdleTime'), idles[idles.length-1].toFixed(2))
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