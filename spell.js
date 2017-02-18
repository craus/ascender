var spell = function(params) {
  var panel = instantiate('spellSample')
  $('.spells').append(panel)
  
  setFormattedText(panel.find('.name'), params.name)
  setFormattedText(panel.find('.reward'), params.reward)
  setFormattedText(panel.find('.spellPower'), params.power)
  setFormattedText(panel.find('.decay'), Format.time(params.decay))
  
  Object.entries(params.cooldowns).forEach(c => {
    var cd = cooldowns[c[0]]
    var duration = c[1]
    var cooldownPanel = instantiate('spellCooldownSample')
    panel.find('.spellCooldowns').append(cooldownPanel)
    setFormattedText(cooldownPanel.find('.name'), cd.Name)
    setFormattedText(cooldownPanel.find('.duration'), duration)
  })

  var spell = Object.assign({ 
    available: function() {
      return Object.entries(params.cooldowns).every(c => cooldowns[c[0]]() == 0)
    },
    cast: function() { 
      if (!this.available()) {
        return
      }
      console.log('cast, available')
      Object.entries(params.cooldowns).forEach(c => cooldowns[c[0]].value = c[1])
      this.action()
    },
    action: function() {
      resources.wisdom.value += this.reward * wisdomMultiplier()
      effects.push(powerEffect({
        power: params.power,
        decay: params.decay
      })) 
    },   
    paint: function() {
      enable(panel.find(".cast"), this.available())
    }
  }, params)
  
  panel.find(".cast").click(() => spell.cast())
  window.addEventListener("keydown", (e) => {
    if (e.key == params.hotkey) {
      cast()
    }
  })
  return spell
}