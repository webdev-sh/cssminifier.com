server:
	NODE_ENV=development supervisor --no-restart-on error -- server.js 8011

clean:
	find . -name '*~' -exec rm {} ';'

.PHONY: clean
