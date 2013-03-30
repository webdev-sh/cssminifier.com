server:
	NODE_ENV=development supervisor --no-restart-on error app.js

clean:
	find . -name '*~' -exec rm {} ';'

.PHONY: clean
