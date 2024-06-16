
build:
	cd .devcontainer; docker compose build

console:
	cd .devcontainer; docker compose run node /bin/bash

compile:
	cd .devcontainer; docker compose run node npm run compile

package:
	cd .devcontainer; docker compose run node vsce package
