minimise:
	js-min.pl public/s/js/ready.js > public/s/js/ready.min.js
	curl -X POST -s --data-urlencode 'input@public/s/css/style.css' http://cssminifier.com/raw > public/s/css/style.min.css

server:
	NODE_ENV=development supervisor --no-restart-on error app.js

clean:
	find . -name '*~' -exec rm {} ';'

.PHONY: clean
