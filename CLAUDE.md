# Notes for Claude

Read `docs/PROJECT.md` first: it has the links, the hosting setup on Joe's desktop, every rule, and every decision made so far.

- Edit `src/`, then run `./build.sh`. Never hand-edit `js/game.js`.
- Bump every `?v=N` in `index.html` and the cache name in `sw.js` on each release.
- Publish by pushing the `gh-pages` branch; check with `git ls-remote origin gh-pages`.
- After a release, the desktop host tab must be refreshed.
- Joe's standing rules: nothing is hidden from players (show the odds and boxes before and after every roll); players see only their own team's sheet for the side they're on; the TV screen never shows a playbook.
