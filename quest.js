quest = function(params = {}) {
  var result = params
  if (!result.difficulty) {
    var quality = gaussianRandom(0, 0.3)
    var power = gaussianRandom(1 + 0.25 * resources.level(), 0.5 + 0.05*resources.level())
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
      return this.difficulty/(resources.farm()*resources.idle()+this.difficulty)
    },
    choose: function() {
      if (resources.idle() < 3) {
        return
      }
      win = rndEvent(1-this.deathChance())
      if (win) {
        resources.level.value += 1
        if (resources.level() % 10 == 0) {
          resources.life.value += 1
        }
        resources.farm.value += this.reward
      } else {
        resources.life.value -= 1
        resources.activeLife.value -= 1
      }
      resources.idle.value = 0
      refreshQuests()
      game.paint()
    },
    paint: function() {
      setFormattedText(panel.find('.deathChance'), Format.percent(result.deathChance(), 2))
      panel.find('.choose').toggleClass('disabled', resources.idle() < 3)
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