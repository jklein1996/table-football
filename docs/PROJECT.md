# Turkey Bowl LVII: project notes

Everything built and decided so far. Read this first before changing the game.
Last updated: Thanksgiving, Nov 26 2026.

## What it is

- A family dice football game for Thanksgiving night 2026. It replays Super Bowl LVII (Chiefs 38, Eagles 35, Feb 12 2023).
- It is modeled on the board game **Paydirt** (Sports Illustrated / Avalon Hill). Joe first called it "Play Dirt"; the right name is Paydirt / Pay Dirt.
- Owner: Joe (GitHub `jklein1996`). Players are family members, each on their own phone.

## Links

| What | Where |
|---|---|
| Live game | https://jklein1996.github.io/table-football/ |
| Quick card (QR, kickoff checklist, fixes, dice key) | https://jklein1996.github.io/table-football/card.html |
| Host link used on Joe's desktop | `https://jklein1996.github.io/table-football/?host=TURK&admin=Joe` |
| Repo / branch served by GitHub Pages | `jklein1996/table-football`, branch **gh-pages** (there is no other working branch) |

## Repo layout

| Path | What |
|---|---|
| `src/pdata.js` | Per-roll box likelihoods from 30 fan-typed 1983 Paydirt team charts (where INC, QT, flags, INT, F, B sit on each roll). |
| `src/engine4.js` | Teams, dice, plays, defenses, chart building, the priority rules, clock, scoring, kicks, follow-up rolls, overtime, matchup odds. |
| `src/app.js` | Game state actions (`handleAction`), whose turn it is (`needs`), turn rotation, transport (host / client / local), your-dice config (`DCOLS`, `diceCfg`). |
| `src/ui.js` | All rendering: field, result banner, call and roll cards, odds previews, playbook sheets, rules, admin, TV view, animations. |
| `src/crash.js` | Crash screen ("Something hiccuped"), wake lock, error handling. |
| `src/style2.css` | All styles (injected into `index.html` by the build). |
| `build.sh` | Concatenates `src/*.js` into `js/game.js` (inside one IIFE) and injects the CSS into `index.html`. |
| `js/game.js` | **Built file. Don't edit by hand**; edit `src/` and run `./build.sh`. |
| `js/peerjs.min.js` | Vendored PeerJS 1.5.4 (peer-to-peer fallback). |
| `js/relay.js` | `RelayPeer`: same API as PeerJS but over a WebSocket relay. Used when `window.TB_RELAY` is set. |
| `js/relay-url.js` | The relay's public URL (`window.TB_RELAY`). |
| `js/qrcode.js` | QR code generator. |
| `relay/server.js` | The WebSocket relay server (Node + `ws`). |
| `card.html` | The printable / phone quick card. |
| `sw.js`, `manifest.webmanifest`, `icons/` | Installable app + offline cache. |
| `tests/` | Playwright scripts (see Testing). |

## Build, test, publish

1. Edit files in `src/`.
2. Run `./build.sh` (needs node and python3).
3. **Bump the cache-busting version**: change every `?v=N` in `index.html` to `N+1`, and the cache name in `sw.js` (`turkeybowl-vN`). Phones keep old code otherwise.
4. Test (below).
5. Commit and push to `gh-pages`. GitHub Pages updates in about a minute.
6. The cloud sandbox can't reach github.io (proxy blocks it). Verify the push with `git ls-remote origin gh-pages`. The live page can be checked from Joe's desktop with Desktop Commander.
7. **After publishing, the desktop host tab must be refreshed** (it runs the game logic), and phones should reopen the link.

### Testing

Serve the repo locally (`python3 -m http.server 8080` in the repo), run a local relay (`node relay/server.js`, port 8787), then from a scratch folder:

- `tests/st3.js`: plays 150 full games through `window.__tb` with every call type (QS, HM, sideline calls, coffin punts, onside kicks, two-point tries). Expect `0 []`.
- `tests/t4.js`: a full one-phone game clicked through the real UI. Expect `errors []`.
- `tests/gp.js`, `tests/pb.js`: screenshot the call cards, odds previews, playbook tabs, dice setup.
- `tests/tour_relay.js`: two phones plus a TV over the local relay (`window.TB_RELAY='ws://127.0.0.1:8787'`); 23 screenshots. Expect `missing []`.
- `tests/ot.js`: overtime rules.

Rule from the person: after a test fails, re-run only the failing one while fixing.

## Hosting and connections (important)

- The admin's device holds the whole game state; everyone else sends actions to it and gets the state back.
- **Why a relay:** Joe's wife could not connect ("Offline", "Still trying to reach the admin's phone") even on the same Wi-Fi; phone-to-phone WebRTC failed. So the game now talks through a **WebSocket relay**:
  - It runs on Joe's always-on Windows desktop `DESKTOP-15BSNC9`, folder `C:\TurkeyBowlRelay`: `server.js` (port 8787), `node_modules/ws`, `cloudflared.exe`, `start-relay.bat`, logs `relay.log` and `tunnel.log`.
  - A **Cloudflare quick tunnel** (cloudflared) makes it reachable from the internet as `wss://<random>.trycloudflare.com`. Joe approved running this.
  - **If the desktop restarts or cloudflared restarts, the tunnel URL changes.** Restart `node server.js` and cloudflared, read the new URL from `tunnel.log`, put it in `js/relay-url.js`, bump `?v=`, push.
- **The desktop is only the host, not a player.** It opens `?host=TURK&admin=Joe`: it hosts game code TURK, and when Joe's phone joins with the name "Joe" it becomes the admin automatically (`autoAdmin`). The 👑 button on a roster row also hands admin to any player.
- A computer that only hosts behaves like a TV screen once admin is handed off: no team, no playbook.
- **Reloads never drop you:** a player's or TV's phone remembers its game (`tb.in` in localStorage) and rejoins automatically on reload, keeping its team.
- **Back button and Leave game ask "Leave the game?" first.** The `#CODE` in the address bar is changed with `history.replaceState`, so it doesn't add history entries.
- Backups: "Resume game" after a reload (state is saved every play), "Take over hosting" on any phone after 20 s without the host, "Play on this device" for a single pass-around phone.

## Screens and flow

Home (join with code / start a new game / play on one device) → Lobby (Invite players panel with the QR, tap to enlarge; join Chiefs or Eagles; admin sets quarters, minutes, and **your dice**) → Start the game → Coin toss → Field.

- Tabs: Field, Playbook, Teams, Rules, Admin (admin only), TV.
- **TV / cast screen** (`Join as TV`): never joins a team and never shows a playbook or calls. It shows the scoreboard, field, results and animations, plus the join QR while in the lobby.
- Admin tab: QR with the game code, settings, your dice, undo last play, pause, restart, roster controls (reorder, switch team, make admin, remove, skip caller or roller).
- Every "are you sure" action (pause, undo, restart, remove, timeout, take over) asks first.
- Screen gallery of every page (older version): https://claude.ai/artifact/9rXx5PhifzyvLSzenwCx1W (Figma uploads were blocked from the sandbox).

## Game rules as implemented

### Dice
- Paydirt's dice math is kept exact: offense = tens die (10/20/30) + two ones dice (0–5 and 0–4), total **10–39**; defense = two dice read as 1–3 and 0–2, total **1–5**.
- **Joe's table uses 3 dice of 3 colors and the same dice for both sides.** The admin sets each die's color in the lobby or Admin tab, and which two of the three dice the defense reads. Die faces map:
  - Die 1 (tens): 1 = 10, 2–3 = 20, 4–6 = 30.
  - Die 2 (ones): face − 1 (0–5).
  - Die 3 (ones): 1–2 = 0, then face − 2 (0–4).
  - Defense first die: 1–3 = 1, 4–5 = 2, 6 = 3. Defense second die: 1–4 = 0, 5 = 1, 6 = 2.
- Real Paydirt's defense rolls 2 dice (red + green). With Joe's set, the defense can roll all 3, and only the two chosen dice count.
- **Your own dice are always the default** (Joe: "Don't ever roll for us unless we select that"). Every roll card opens on "Our own dice": tap the faces you rolled. "App rolls for us" is the second option, and the choice is remembered on that phone.

### Calls and turns
- Offense picks: one of the 9 Paydirt plays (Line Plunge, Off Tackle, End Run, Draw, Screen, Short Pass, Medium Pass, Long Pass, Sideline Pass), or **QB Sneak**, **Hail Mary**, Punt (normal or **coffin corner**), Field Goal, Spike, Kneel. It also picks a tempo (Normal 30 s, Hurry-up 10 s, Run the clock 40 s) and a **sideline call** (normal, get out of bounds, stay in bounds).
- Defense picks formation A–F: Standard, Short Yardage, Spread, Short Pass, Long Pass (prevent), Blitz.
- **Both teams lock in a call before anyone rolls.** Callers and rollers rotate through each team in join order.
- Kickoffs, punts and returns always have a kicking side and a receiving side that each roll (Joe: "there should always be an offensive and defensive role").

### Resolving a play (the Paydirt priority chart)
1. A flag in the offense box (OFF, DEF, PI).
2. An offense F (fumble).
3. Anything special in the **defense** box: (TD), a number in ( ), QT, black (incomplete on a pass, no gain on a run), INT. It overrules the offense box.
4. The offense box: B, QT, INT, black (incomplete), a number in ( ).
5. Two plain numbers: add them.

- **Flags:** the app rerolls the offense dice for what the play itself did, and the fouled team automatically takes the better (accept or decline). A flag never goes more than half the distance to the goal. Pass interference is a spot foul worth more on deeper passes (Screen 8, Short 10, Sideline 12, Medium 20, Long and Hail Mary 35). Flags on 19/29/39 are PI (passes) or DEF 15* (runs).
- **Offsetting flags:** a flag in the offense box plus a natural 5 on the defense dice → flags on both teams, replay the down.
- **Follow-up rolls:** QT → offense rolls its QT column (sack, throw-away, scramble, strip-sack). B → offense rolls its Breakaway column. INT → the intercepting team rolls its Interception Return column. F → the fumbling team rolls the fumble line: KEEP on 10–28; LOST on 29–39, with 34–38 returned 5 to 30 yards and 39 returned for a TD.
- **Defense counters** (real-life matchups, dice still decide): screens and draws beat the blitz; the blitz sacks deep drops and stuffs inside runs but can get burned deep (a TD box); prevent (E) picks off and knocks down long passes but gives up runs; Short Yardage (B) stuffs plunges and off tackle; Spread (C) stops end runs and screens; Short Pass (D) stops short and sideline passes.
- Team strengths (★): KC Draw, Screen, Short, Medium, Sideline; PHI Line Plunge, Short, Medium, Long. Defense ★: KC D, PHI F (+1 on the defense roll, max 5).

### New calls
- **QB Sneak:** own column; gains 1+ about 77% of the time; Short Yardage and Blitz stuff it more; a defense 5 is (−1).
- **Hail Mary:** own column; mostly incomplete, interceptions on 10–12, PI on 28–29, catches of 40 and 55 on 37–38, a TD on 39. Prevent knocks almost all of it down.
- **Sideline call:** "get out of bounds" stops the clock on any gain, but a box without * loses up to 5 yards; "stay in bounds" keeps the clock running, but a * box loses up to 5 yards. A gain that reaches the end zone is never cut.

### Kicks
- **Kickoff (two rolls):** the kicking team rolls its Kickoff column (touchback at the 25 about 53%, returnable 47%); then the receiving team rolls its Kick Return column (start yard line; 10 = fumble → fumble line; 39 = return TD).
- **Onside kick:** a checkbox on the kickoff roll; recovered on 36–39 (about 14%); the ball goes at the kicking team's 45 either way.
- **Punt (two rolls):** the punting team rolls Punt (36–58 yards; 10 = blocked); the receiving team rolls Punt Return (fair catch, return yards, 10 = muff → fumble line, 39 = TD). Into the end zone = touchback at the 20.
- **Coffin-corner punt:** 8 yards shorter, out of bounds, no return; still a touchback if it reaches the end zone.
- **Blocked punt or field goal:** the ball is loose 7 yards behind the line; the blocking team rolls the Blocked Kick column: KEEP (10–13, the kicking team falls on it; a punt on downs 1–3 keeps the ball), return yards on 14–36, TD on 37–39.
- **Field goal:** distance = yards to goal + 17; good if the box is at least that far; a miss gives the ball at the spot of the kick (at least the 20).
- **Extra point:** no good on 10–11. **Two-point try:** a normal play from the 2.
- **Safety:** 2 points and a free kick.

### Clock
- 2 or 4 quarters only; 5/8/10/12/15 minutes (15 is real Paydirt).
- Time runs in 10-second boxes: each snap or kick is 10 s; if the clock is running, the huddle adds the tempo's time.
- The clock stops on: incomplete, out of bounds (*), a flag, a turnover, a score, a kick, a timeout, a spike.
- Two-minute warning in Q2 and Q4. 3 timeouts per half. Any player can call their team's timeout while the clock runs, before the dice.
- If the clock would hit 0:00 before the snap, the quarter ends with no play.
- **Untimed down:** a quarter can't end on an accepted defensive penalty; the offense gets one more play at 0:00.
- The offense call card shows how much time this snap uses and what will be left, and every play shows how often it stops the clock.

### Overtime
- NFL playoff rules: a coin toss, both teams get at least one possession (even after an opening TD), then next score wins. 3 timeouts each.

## Charts and the numbers

- Each team has its own offense chart (9 plays + QS + HM), QT column, Breakaway column and kicking columns. The defense chart is shared, A–F.
- **Where each kind of box sits** comes from 30 real 1983 Paydirt charts (`src/pdata.js`): per play and roll, how often those charts had INC, QT, a flag, INT, F or B there. That is why passes have long black runs of incompletes in the 30s, and why flags gather on 19/29/39.
- **The yards** are calibrated to the 2022 regular season. Measured result with a uniform mix of calls: KC 68.8% completions, 8.9 yds per attempt, 1.4% INT, 3.6% sacks, 4.7 per carry; PHI 67.1%, 8.3, 1.7%, 7.2%, 4.7.
- Sheet colors match the modern Paydirt sheet Joe sent (2024 Philadelphia): green = gain, white = 0, black = incomplete, red = loss or turnover, yellow = flag, gold-outlined = breakaway / TD.

## "Nothing is hidden" (Joe's rule)

- Every offense play button shows its odds (catch %, average, INT, QT, fumble, breakaway, flag, how often it stops the clock). Picking a play shows its whole column on the call card.
- Every defense button shows what it's best and weakest against.
- Once both calls are locked, everyone (not the TV) sees the full matchup: every roll's box with its odds, the defense box for rolls 1–5, the odds of each result, and the chance of a first down. The rolled box is outlined.
- Kickoffs, punts, field goals, extra points and every follow-up roll show their whole column before the roll.
- After a play, the result shows both boxes and the rule that decided it; "Show on the charts" opens the sheet with the boxes highlighted (kicks too).

## Playbook

- The classic Paydirt sheet, split into tabs so it fits a phone: **Running** (LP, OT, ER, DR, QS), **Passing** (SC, SP, MP, LG, SL, HM), **QB trapped & Breakaway**, **Special teams**. It has zoom buttons and scrolls both ways (rolls column stays put). Default zoom is 85% on phones.
- The chart is always the view (Joe: "Showing the chart shouldn't be an option"). There is no separate one-play view.
- Defense chart: pick a formation; play rows × defense rolls 1–5, then a table of what the offense gets against it.
- **The offense call card is the chart too**: Running / Passing tabs, tap a play's name or any box in its column to pick it, then Lock in. Punt, Field Goal, Spike and Kneel are equal-size buttons below. The defense call card has six equal-size formation buttons plus the chosen formation's chart.
- All segmented buttons are equal width and height (Joe asked for symmetrical buttons).
- **Players see only their own team, and only the side they're on**: offense sheet when they have the ball, defense when they don't (Joe's request). In one-device mode everything is visible.

## Decisions log (in order)

1. Paydirt-style charts, QT follow-up roll, animations, crash safety, quick card with QR.
2. Box layout from real 1983 charts; Figma requested but uploads blocked, so a screen gallery artifact instead.
3. 15-minute quarters in 10-second boxes; clock awareness on the call card; 2 or 4 quarters only.
4. Defenses counter offenses like real football; dice still decide.
5. Playbook shows only your team and your side; both teams lock in before rolling.
6. Full Paydirt rule pass: field goals, punts, turnovers, fumbles, interceptions, sacks; real priority chart; auto accept/decline flags.
7. Playoff overtime.
8. QR on the lobby screen before the game starts, with spacing and tap-to-enlarge.
9. Connection failures → WebSocket relay on Joe's desktop through a Cloudflare tunnel (approved by Joe). The desktop hosts; Joe's phone is the admin and a player.
10. Kickoffs and punts: the receiving team rolls the return; fumbles on returns.
11. Gap list from a rules rescan, all added: Hail Mary, QB sneak, untimed down, sideline call, blocked-kick returns, PI by depth, offsetting flags, coffin corner, fumble return yards.
12. "Nothing hidden": odds before and after every roll.
13. Your dice: 3 dice, 3 colors, same dice for both sides, set by the admin.
14. Playbook as the classic sheet split into Running / Passing / QB trapped & Breakaway / Special teams, with zoom.
15. TV / cast screen never picks a team or shows a playbook; it shows the field, results and animations.
17. Own dice by default on every roll; iPhone sweep (375 and 430 wide): result boxes like RETURN no longer cut off, 16px form fields so iOS doesn't zoom, tidier game-length settings. `tests/sweep.js` checks every screen for overflow and cut-off buttons.
16. The chart is always shown; plays are picked straight from the chart on the call card; symmetrical buttons; reloads rejoin automatically; Back and Leave game confirm first.

## Known gaps / ideas not done

- Penalty yardage doesn't vary beyond the play type (real Paydirt has a few more penalty kinds).
- No "fumble advance" by the recovering offense on scrimmage plays beyond the line.
- The rules Claude Doc made early on (https://claude.ai/artifact/FJrDtvtyr7gsHy8MqAaWHz) is out of date; this file is the source of truth.
