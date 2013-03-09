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
	npm install

update: ;@echo "Updating ${PROJECT}....."; \
	git pull --rebase; \
	npm install

clean: ;
	rm -rf node_modules


.PHONY: test install clean update