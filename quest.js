quest = function(params = {}) {
  var result = params
  if (!result.difficulty) {
    var quality = gaussianRandom(0, 0.3)
    var power = gaussianRandom(1 + 0.25 * resources.level(), 0.5 + 0.07*resources.level())
    var rewardPower = quality + power
    result.difficulty = Math.pow(10, power)    
    result.reward = Math.pow(10, quality + power)
  }
  
  var panel = instantiate('questSample')
  
  if (params.instantiate != false) {
    $('.quests').append(panel)
  }
  
  result = Object.assign(result, {
    deathChance: function() {
      return this.difficulty/(resources.farm()+this.difficulty)
    },
    choose: function() {
      win = rndEvent(1-this.deathChance())
      if (win) {
        resources.level.value += 1
        resources.farm.value += this.reward
      } else {
        resources.life.value -= 1
      }
      refreshQuests()
    },
    paint: function() {
    },
    save: function() {
      savedata.quests.push(Object.assign({
      }, _.omit(this)))
    },
    destroy: function() {
      panel.remove()
    },
  })
  
  setFormattedText(panel.find('.danger'), large(result.difficulty))
  setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance()))
  setFormattedText(panel.find('.reward'), large(result.reward))
  panel.find('.choose').click(() => result.choose())
  
  return result
} 