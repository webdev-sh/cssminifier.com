all:

server:
	NODE_ENV=development supervisor --no-restart-on error -- server.js

test:
	curl -X POST -s --data-urlencode 'input@test/calc.css'      http://localhost:8011/raw > test/calc.min.css
	curl -X POST -s --data-urlencode 'input@test/import.css'    http://localhost:8011/raw > test/import.min.css
	curl -X POST -s --data-urlencode 'input@test/ok.css'        http://localhost:8011/raw > test/ok.min.css
	curl -X POST -s --data-urlencode 'input@test/failed-1.css'  http://localhost:8011/raw > test/failed-1.min.css
	curl -X POST -s --data-urlencode 'input@test/bootstrap.css' http://localhost:8011/raw > test/bootstrap.min.css

test-remote:
	curl -X POST -s --data-urlencode 'input@test/calc.css'      http://cssminifier.com/raw > test/calc.min.css
	curl -X POST -s --data-urlencode 'input@test/import.css'    http://cssminifier.com/raw > test/import.min.css
	curl -X POST -s --data-urlencode 'input@test/ok.css'        http://cssminifier.com/raw > test/ok.min.css
	curl -X POST -s --data-urlencode 'input@test/failed-1.css'  http://cssminifier.com/raw > test/failed-1.min.css
	curl -X POST -s --data-urlencode 'input@test/bootstrap.css' http://cssminifier.com/raw > test/bootstrap.min.css

open-digital-ocean-referrals:
	xdg-open https://cloud.digitalocean.com/settings/referrals

open-dnsimple-account:
	xdg-open https://dnsimple.com/account

clean:
	find . -name '*~' -exec rm {} ';'

.PHONY: server test clean
