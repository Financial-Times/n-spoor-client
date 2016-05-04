SRC_FILES=$(wildcard src/*.js)
LIB_FILES=$(patsubst src/%.js, lib/%.js, $(SRC_FILES))

all: $(LIB_FILES)

lib/%.js: src/%.js
	mkdir -p $(@D)
	node_modules/.bin/babel $< -o $@

test: all test.js
	mocha --compilers js:babel-register test.js
