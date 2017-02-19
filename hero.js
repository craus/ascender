hero = (params={}) => {
  var hero = Object.assign({
    name: names.rnd()
  }, params)

  var panel = instantiate('heroSample')
  $('.heroes').append(panel)
  setFormattedText(panel.find('.name'), hero.name)

  return hero
}