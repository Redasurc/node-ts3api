#
# from: https://gist.github.com/saidinesh5/2727732
#

PROJECT = "node-ts3api"


all: install test

debug: ;@echo "Debugging ${PROJECT}.....http://0.0.0.0:8080/debug?port=5858 to start debugging"; \
	export NODE_PATH=.; \
	node-inspector & node --debug-brk test/test.js;

test: ;@echo "Testing ${PROJECT}....."; \
	export NODE_PATH=.; \
	./node_modules/mocha/bin/mocha;

install: ;@echo "Installing ${PROJECT}....."; \
	npm install \
	git clone git@github.com:jsdoc3/jsdoc.git

update: ;@echo "Updating ${PROJECT}....."; \
	git pull --rebase; \
	npm install

doc: ;@echo "Creating jsdoc dokumentation in folder doc"; \
	jsdoc/jsdoc lib/main.js --destination doc \
	rm -rf doc/scripts \
	rm doc/styles/prettify-jsdoc.css \
	rm doc/styles/prettify-tomorrow.css \
	rm doc/index.html \
	mv doc/ts3api.html doc/documentation.html

clean: ;@echo "Removing uneccesary folders ${PROJECT}....."; \
	rm -rf node_modules \
	rm -rf jsdoc


.PHONY: test install clean update