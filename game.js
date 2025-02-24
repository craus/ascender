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
  
	var money = variable(0, 'money')
	var reputation = variable(0, 'reputation')
	var experience = variable(0, 'experience')
	var time = variable(0, 'time')
	var mr = variable(0, 'mr', {eff: 1, mult: 3, costType: money})
	var mm = variable(0, 'mm', {eff: 0.6, mult: 2, costType: money})
	var rr = variable(0, 'rr', {eff: 0.6, mult: 7, costType: reputation})
	var rm = variable(0, 'rm', {eff: 0.16, mult: 5, costType: reputation})
	
  var normalize = function(channel, priceMult) {
    channel.mult = Math.exp(Math.log(priceMult) * channel.eff)
  }
  
  normalize(mr, 1.07)
  normalize(mm, 1.07)
  normalize(rr, 1.07)
  normalize(rm, 1.07)
  
  // balance: BC/(1-A)/(1-D) = 1
  
  
  resources = {
		money: money,
		reputation: reputation,
		experience: experience,
		time: time,
    mr: mr,
    mm: mm,
    rr: rr,
    rm: rm,
  }
	
	var hard = 10
  
  money.income = () => Math.pow(rm.mult, rm()) * Math.pow(mm.mult, mm())
  reputation.income = () => Math.pow(rr.mult, rr()) * Math.pow(mr.mult, mr())
	

	multerBuy = (multer) => {
		var reward = {}
		reward[multer.id] = () => 1
		var cost = {}
		cost[multer.costType.id] = () => Math.pow(multer.mult, (multer()+1)/multer.eff) * hard
		var result = buy({
			id: 'buy_'+multer.id,
			cost: cost, 
			reward: reward,
			multer: multer,
		})
		var oldPaint = result.paint
		result.paint = function() {
			oldPaint.apply(this)
			setFormattedText($('.#{0} .mult'.i(this.id)), large(multer.mult))
		}
		return result
	}
	
  buys = {
    mm: multerBuy(mm),
    mr: multerBuy(mr),
    rm: multerBuy(rm),
    rr: multerBuy(rr),
  }
  
  //limitExceeded
  
  game = {
    paint: function() {
      debug.profile('paint')
      
      Object.values(resources).each('paint')
      Object.values(buys).each('paint')
      
      debug.unprofile('paint')
    },

    tick: function(deltaTime = undefined) {
      if (deltaTime == undefined) {
        debug.profile('tick')
        var currentTime = Date.now()
        deltaTime = (currentTime - savedata.realTime) / 1000
        this.tick(deltaTime)
        save(currentTime)
        debug.unprofile('tick')
      }
      resources.time.value += deltaTime
      Object.values(resources).each('tick', deltaTime)
    }
  }
  return game
}