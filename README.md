# Hanami

This is an implementation of an Engine for Hanamikoji the card game.

At the moment, it supports running AI bots head to head with a fairly rudimentary API.

## TODO

- [ ] Abstract hands away into a class with a Set() as the internal state, but useful functions on top of that
- [ ] Tests?
- [ ] A web interface. Also - a way for humans to play (against AI for now). This would open up the door to taking advantage of some nice features of redux such as the time travelling debugger
- [ ] Make sure the engine is correct

## Performance

- Fix the selectors to always return data instead of sometimes a function
- Should we use a better memoizer?
- Profiling

## Contributing

- Please ensure that your editor is equipped with a [standard js plugin](https://standardjs.com/) for linting
