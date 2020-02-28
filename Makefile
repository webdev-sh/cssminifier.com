all:

test:
	curl -X POST -s --data-urlencode 'input@test/calc.css'          http://localhost:8011/raw > test/calc.min.css
	curl -X POST -s --data-urlencode 'input@test/import.css'        http://localhost:8011/raw > test/import.min.css
	curl -X POST -s --data-urlencode 'input@test/ok.css'            http://localhost:8011/raw > test/ok.min.css
	curl -X POST -s --data-urlencode 'input@test/bootstrap.css'     http://localhost:8011/raw > test/bootstrap.min.css
	curl -X POST -s --data-urlencode 'input@test/causes-error.css'  http://localhost:8011/raw > test/causes-error.min.css
	curl -X POST -s --data-urlencode 'input@test/infinite-loop.css' http://localhost:8011/raw > test/infinite-loop.min.css

test-remote:
	curl -X POST -s --data-urlencode 'input@test/calc.css'          http://cssminifier.com/raw > test/calc.min.css
	curl -X POST -s --data-urlencode 'input@test/import.css'        http://cssminifier.com/raw > test/import.min.css
	curl -X POST -s --data-urlencode 'input@test/ok.css'            http://cssminifier.com/raw > test/ok.min.css
	curl -X POST -s --data-urlencode 'input@test/bootstrap.css'     http://cssminifier.com/raw > test/bootstrap.min.css
	curl -X POST -s --data-urlencode 'input@test/causes-error.css'  http://cssminifier.com/raw > test/causes-error.min.css
	curl -X POST -s --data-urlencode 'input@test/infinite-loop.css' http://cssminifier.com/raw > test/infinite-loop.min.css

build:
	cleancss -o public/s/css/main.min.css public/s/css/main.css

.PHONY: server test clean
