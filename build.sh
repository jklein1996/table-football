#!/bin/bash
# Builds js/game.js from src/ and injects src/style2.css into index.html. Run from anywhere.
set -e
R="$(cd "$(dirname "$0")" && pwd)"
{ echo '(function(){'; echo '"use strict";'; cat "$R/src/pdata.js" "$R/src/engine4.js" "$R/src/app.js" "$R/src/ui.js" "$R/src/crash.js"; echo '})();'; } > "$R/js/game.js"
node --check "$R/js/game.js" && echo BUILD-OK
python3 - "$R" <<'PY'
import sys
R=sys.argv[1]; h=open(R+'/index.html').read(); css=open(R+'/src/style2.css').read()
a=h.index('<style>')+len('<style>\n'); b=h.index('</style>')
open(R+'/index.html','w').write(h[:a]+css+'\n'+h[b:]); print('CSS-OK')
PY
