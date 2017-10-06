
quest = function(params = {}) {
  var result = params
  if (!result.difficulty) {
    var power = gaussianRandom(3 + 0.1 * resources.level(), 0.5 * Math.pow(resources.level()+7, 0.25) - 0.1)
    console.log("power", power)
    var baseQuality = -4+3*Math.pow((1+Math.cos(power/10))/2, 0.4)
    var randomQuality = 0.6+0.2*Math.sin(power/14.19)
    console.log("base quality", baseQuality)
    console.log("random quality", randomQuality)
    var quality = gaussianRandom(baseQuality, randomQuality)
    console.log("quality", quality)
    result.difficulty = Math.pow(10, power)    
    result.reward = Math.pow(10, quality + power)
  }
  
  var panel = instantiate('questSample')
  
  if (params.instantiate != false) {
    $('.quests').append(panel)
  }
  
  result = Object.assign(result, {
    deathChance: function() {
      return this.difficulty/(resources.farm()*resources.idle()+this.difficulty)
    },
    choose: function() {
      if (resources.idle() < minIdleForQuest) {
        return
      }
      win = rndEvent(1-this.deathChance())
      if (win) {
        resources.level.value += 1
        if (resources.level() % 10 == 0) {
          resources.life.value += 1
        }
        resources.farmIncome.value += this.reward
      } else {
        resources.life.value -= 1
        resources.activeLife.value -= 1
        resources.lastDeathChance.value = this.deathChance()
      }
      resources.idle.value = 0
      refreshQuests()
      game.paint()
    },
    paint: function() {
      setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance(), 2))
      panel.find('.choose').toggleClass('disabled', resources.idle() < minIdleForQuest)
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
  setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance(), 2))
  setFormattedText(panel.find('.reward'), large(result.reward))
  panel.find('.choose').click(() => result.choose())
  
  return result
} 