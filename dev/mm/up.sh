#!/usr/bin/env bash
# Starts a throwaway MagicMirror at http://localhost:18080/ in server mode (a browser shows it,
# no Electron), with this checkout as modules/MMM-LiveX and the mirror in config.js. Edit a file
# and reload the page to see a change. `docker rm -f mmm-livex-mm` ends it.
# LIVEX_BASE points the globe at another livex (`baseUrl`), such as a local build of a change
# not yet on livex.earth: LIVEX_BASE=http://localhost:4174/ bash dev/mm/up.sh
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
repo=$(cd "$here/../.." && pwd)
config=$repo/.mm-dev
mkdir -p "$config"
if [ -n "${LIVEX_BASE:-}" ]; then
  sed "s#width: '720px',#& baseUrl: '$LIVEX_BASE',#" "$here/config.js" > "$config/config.js"
else
  cp "$here/config.js" "$config/config.js"
fi
# Git Bash on Windows rewrites `-v a:b` into nonsense; give Docker Windows paths unconverted.
if pwd -W >/dev/null 2>&1; then
  export MSYS_NO_PATHCONV=1
  repo=$(cd "$repo" && pwd -W)
  config=$(cd "$config" && pwd -W)
fi
port=18080
image=karsten13/magicmirror:latest
origin=http://localhost:$port

docker rm -f mmm-livex-mm >/dev/null 2>&1 || true
docker run -d --name mmm-livex-mm -p $port:8080 -e MM_SCENARIO=server -e TZ=America/Chicago \
  -v "$config:/opt/magic_mirror/config" -v "$repo:/opt/magic_mirror/modules/MMM-LiveX:ro" "$image" >/dev/null

until curl -sf "$origin/" >/dev/null; do sleep 2; done
echo "$origin/"
