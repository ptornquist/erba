import "server-only";

import { hashString } from "@/lib/utils";
import type { AnswerSheet, Expedition, EventOption, Puzzle } from "@/lib/types";

export const expeditions: Expedition[] = [
  {
    slug: "dawn",
    title: "Dawn of the Games",
    period: "1896 – 1936",
    blurb: "The archive opens on amateur oaths, a first world cup, and a Berlin sprint that rewrote a regime's script.",
    puzzleIds: ["athens-1896", "montevideo-1930", "owens-1936"],
  },
  {
    slug: "postwar",
    title: "Postwar Thunder",
    period: "1954 – 1970",
    blurb: "Radio crowds, a teenager in Sweden, Wembley extra time, and a flop that bent a bar.",
    puzzleIds: ["bern-1954", "pele-1958", "hurst-1966", "fosbury-1968"],
  },
  {
    slug: "satellite",
    title: "Live via Satellite",
    period: "1973 – 1986",
    blurb: "Primetime tennis, a Kinshasa night, a perfect 10, college kids on ice, and a quarter-final in Mexico.",
    puzzleIds: ["king-1973", "ali-1974", "comaneci-1976", "miracle-1980", "maradona-1986"],
  },
  {
    slug: "global",
    title: "The Global Stage",
    period: "1992 – 2008",
    blurb: "Dream Teams, a rainbow jersey, two stoppage-time strikes, a penalty in the Rose Bowl, and a 9.69.",
    puzzleIds: ["dream-team-1992", "mandela-1995", "united-1999", "chastain-1999", "bolt-2008"],
  },
  {
    slug: "already-history",
    title: "Already History",
    period: "2012 – 2022",
    blurb: "A Super Saturday, a 5000-1 title, a last dance in Lusail — recent enough to remember, old enough to archive.",
    puzzleIds: ["super-saturday-2012", "leicester-2016", "messi-2022"],
  },
];

export const puzzles: Puzzle[] = [
  {
    id: "athens-1896",
    year: 1896,
    sport: "olympics",
    era: "dawn",
    expedition: "dawn",
    difficulty: 3,
    title: "Spyridon Louis wins the first Olympic marathon",
    teaser: "Dust, a water station, and a city that invented the distance.",
    summary:
      "Greek shepherd Spyridon Louis entered the Panathenaic Stadium first in the inaugural Olympic marathon, turning a revived Games into a national legend.",
    answers: [
      "spyridon louis",
      "spyros louis",
      "first olympic marathon",
      "1896 marathon",
      "athens marathon",
      "louis marathon",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 01 — crop",
        image: { plateId: "olympic-track", scale: 3.1, x: 78, y: 22 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "A local amateur, more used to carrying water than racing, is entered almost as an afterthought. The distance is new. The stadium is marble.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Host city", value: "Athens", revealedAtClue: 5 },
          { label: "Distance", value: "40 km (approx.)", revealedAtClue: 3 },
          { label: "Winner's trade", value: "Water carrier / shepherd", revealedAtClue: 4 },
          { label: "Crowd size", value: "80,000 in the stadium", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Despatch",
        quote: "A Greek has won! A Greek has won!",
        attribution: "Stadium cry, reconstructed from contemporary reports",
      },
      {
        kind: "image",
        kicker: "Plate 01 — pull back",
        image: { plateId: "olympic-track", scale: 1.45, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "The first modern Games. A marathon finished in a horseshoe of marble. Crown prince as escort. A nation decides this is the revival it wanted.",
      },
    ],
  },
  {
    id: "montevideo-1930",
    year: 1930,
    sport: "football",
    era: "dawn",
    expedition: "dawn",
    difficulty: 2,
    title: "Uruguay win the first FIFA World Cup",
    teaser: "A new stadium by the River Plate, and only thirteen sides.",
    summary:
      "Hosts Uruguay beat Argentina 4–2 in Montevideo to become the first World Cup champions, four years after Olympic gold on the same soil.",
    answers: [
      "first world cup",
      "uruguay world cup",
      "1930 world cup",
      "montevideo world cup",
      "uruguay argentina 1930",
      "estadio centenario",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 02 — crop",
        image: { plateId: "pitch-night", scale: 2.9, x: 18, y: 70 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "Only thirteen associations make the journey. Europe mostly stays home. The final is a neighbourly quarrel played in a stadium built for a centenary.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Final score", value: "4–2", revealedAtClue: 4 },
          { label: "Host", value: "Uruguay", revealedAtClue: 5 },
          { label: "Opponent", value: "Argentina", revealedAtClue: 5 },
          { label: "Teams in the field", value: "13", revealedAtClue: 3 },
        ],
      },
      {
        kind: "quote",
        kicker: "Despatch",
        quote: "The sky is a carnival. Montevideo will not sleep.",
        attribution: "Uruguayan match report, July",
      },
      {
        kind: "image",
        kicker: "Plate 02 — pull back",
        image: { plateId: "pitch-night", scale: 1.35, x: 48, y: 52 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Jules Rimet's trophy has a first name on it. The Celeste, already Olympic champions, confirm the hierarchy of the Río de la Plata.",
      },
    ],
  },
  {
    id: "owens-1936",
    year: 1936,
    sport: "athletics",
    era: "dawn",
    expedition: "dawn",
    difficulty: 1,
    title: "Jesse Owens wins four golds in Berlin",
    teaser: "A cinder track, a long-jump pit, and a propaganda Games undone in spikes.",
    summary:
      "Jesse Owens won the 100m, 200m, long jump and 4×100m relay at the Berlin Olympics, the defining athletic rebuke of the Nazi showcase.",
    answers: [
      "jesse owens",
      "owens berlin",
      "owens four golds",
      "berlin 100m",
      "jesse owens long jump",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 03 — crop",
        image: { plateId: "olympic-track", scale: 3.2, x: 22, y: 80 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "Four finals, one week, one athlete. The host wanted a different story from the cinders.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Golds", value: "4", revealedAtClue: 3 },
          { label: "Events", value: "100, 200, long jump, relay", revealedAtClue: 5 },
          { label: "100m time", value: "10.3", revealedAtClue: 4 },
          { label: "Host city", value: "Berlin", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Despatch",
        quote: "I let my feet speak for me.",
        attribution: "Attributed to the champion in later interviews",
      },
      {
        kind: "image",
        kicker: "Plate 03 — pull back",
        image: { plateId: "olympic-track", scale: 1.4, x: 50, y: 55 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "An Alabama-born, Ohio-trained sprinter collects a handful of gold under the Reichssportfeld lights. The long jump is decided against Luz Long.",
      },
    ],
  },
  {
    id: "bern-1954",
    year: 1954,
    sport: "football",
    era: "postwar",
    expedition: "postwar",
    difficulty: 2,
    title: "West Germany's Miracle of Bern",
    teaser: "A 3–2 that a nation still treats as a founding myth.",
    summary:
      "West Germany came from 2–0 down to beat Ferenc Puskás's Hungary 3–2 in the World Cup final in Bern — the Miracle of Bern.",
    answers: [
      "miracle of bern",
      "wunder von bern",
      "west germany hungary 1954",
      "1954 world cup final",
      "helmut rahn",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 04 — crop",
        image: { plateId: "pitch-night", scale: 2.8, x: 82, y: 30 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "The visitors had already put eight past this opponent in the group. In the final the rain is biblical and the favourite is 2–0 up in eight minutes.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Final score", value: "3–2", revealedAtClue: 3 },
          { label: "Comeback from", value: "0–2", revealedAtClue: 4 },
          { label: "Winner", value: "West Germany", revealedAtClue: 5 },
          { label: "Losing favourite", value: "Hungary (Golden Team)", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Wireless",
        quote: "Aus! Aus! Aus! Das Spiel ist aus!",
        attribution: "Herbert Zimmermann, radio call",
      },
      {
        kind: "image",
        kicker: "Plate 04 — pull back",
        image: { plateId: "pitch-night", scale: 1.3, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Helmut Rahn's second goal in Wankdorf Stadium ends the Magical Magyars' unbeaten run and becomes a West German origin story.",
      },
    ],
  },
  {
    id: "pele-1958",
    year: 1958,
    sport: "football",
    era: "postwar",
    expedition: "postwar",
    difficulty: 1,
    title: "A 17-year-old Pelé wins the World Cup in Sweden",
    teaser: "A teenager, a 5–2, and the first of five Brazilian stars.",
    summary:
      "Pelé, aged 17, scored in the semi-final and twice in the final as Brazil beat Sweden 5–2 to win their first World Cup.",
    answers: [
      "pele 1958",
      "pele sweden",
      "brazil 1958",
      "pele world cup debut",
      "brazil sweden 1958",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 05 — crop",
        image: { plateId: "pitch-night", scale: 3, x: 60, y: 18 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "The No. 10 is seventeen. He cries into the captain's shirt when it is over. The hosts are beaten 5–2 in their own capital.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Age", value: "17", revealedAtClue: 2 },
          { label: "Final score", value: "5–2", revealedAtClue: 4 },
          { label: "Winner", value: "Brazil", revealedAtClue: 5 },
          { label: "Host / opponent", value: "Sweden", revealedAtClue: 5 },
        ],
      },
      {
        kind: "quote",
        kicker: "Despatch",
        quote: "He plays as if the ball is a friend he has known all his life.",
        attribution: "Swedish press, after the final",
      },
      {
        kind: "image",
        kicker: "Plate 05 — pull back",
        image: { plateId: "pitch-night", scale: 1.35, x: 52, y: 48 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Garrincha on the wing, Vavá on the scoresheet, and a boy from Bauru announcing a dynasty in Rasunda.",
      },
    ],
  },
  {
    id: "hurst-1966",
    year: 1966,
    sport: "football",
    era: "postwar",
    expedition: "postwar",
    difficulty: 1,
    title: "Geoff Hurst's hat-trick at Wembley",
    teaser: "They think it's all over — extra time, a shot on the bar, and a third.",
    summary:
      "England beat West Germany 4–2 after extra time in the World Cup final. Geoff Hurst scored a hat-trick, including the most disputed goal in the sport.",
    answers: [
      "geoff hurst",
      "1966 world cup",
      "england 1966",
      "they think its all over",
      "hurst hat trick",
      "wembley 1966",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 06 — crop",
        image: { plateId: "pitch-night", scale: 3.05, x: 40, y: 85 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "A home final. Extra time. A shot that hits the bar and comes down — on the line, over it, or in the argument forever.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Final score", value: "4–2 after extra time", revealedAtClue: 4 },
          { label: "Hat-trick", value: "Yes, the only one in a men's World Cup final", revealedAtClue: 5 },
          { label: "Venue", value: "Wembley", revealedAtClue: 3 },
          { label: "Opponent", value: "West Germany", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Wireless",
        quote: "They think it's all over... it is now!",
        attribution: "Kenneth Wolstenholme, BBC",
      },
      {
        kind: "image",
        kicker: "Plate 06 — pull back",
        image: { plateId: "pitch-night", scale: 1.25, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Moore lifts the Jules Rimet. Hurst has three. A nation dates its footballing calendar from a grey July afternoon.",
      },
    ],
  },
  {
    id: "fosbury-1968",
    year: 1968,
    sport: "athletics",
    era: "postwar",
    expedition: "postwar",
    difficulty: 2,
    title: "Dick Fosbury flops to Olympic gold",
    teaser: "A back-first curve over the bar that coaches called a fad.",
    summary:
      "Dick Fosbury won the Mexico City high jump with the back-layout technique that became the Fosbury Flop, retiring the straddle almost overnight.",
    answers: [
      "fosbury flop",
      "dick fosbury",
      "fosbury mexico",
      "1968 high jump",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 07 — crop",
        image: { plateId: "olympic-track", scale: 3.3, x: 70, y: 12 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "He turns his back on the bar. Coaches wince. Photographers have never seen a high jumper look at the sky in mid-air.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Event", value: "High jump", revealedAtClue: 3 },
          { label: "Winning height", value: "2.24 m", revealedAtClue: 4 },
          { label: "Technique", value: "Back layout ('flop')", revealedAtClue: 5 },
          { label: "Games", value: "Mexico City", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Despatch",
        quote: "I think I have invented a new way to jump.",
        attribution: "The champion, to reporters",
      },
      {
        kind: "image",
        kicker: "Plate 07 — pull back",
        image: { plateId: "olympic-track", scale: 1.5, x: 58, y: 40 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "An Oregon State engineer of sorts, jumping last, clearing 2.24, and handing every future high jumper a new shape.",
      },
    ],
  },
  {
    id: "king-1973",
    year: 1973,
    sport: "tennis",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "Billie Jean King wins the Battle of the Sexes",
    teaser: "A Houston astrodome, a piglet, and a match that was never only about tennis.",
    summary:
      "Billie Jean King beat Bobby Riggs in straight sets in the Houston Astrodome, a primetime spectacle that became a landmark for women's sport.",
    answers: [
      "battle of the sexes",
      "billie jean king",
      "king riggs",
      "billie jean king bobby riggs",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 08 — crop",
        image: { plateId: "lawn-tennis", scale: 3, x: 25, y: 20 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "A 55-year-old hustler has already beaten the world's No. 1. Tonight the challenger arrives on a litter. Ninety million people watch.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Score", value: "6–4, 6–3, 6–3", revealedAtClue: 4 },
          { label: "Venue", value: "Houston Astrodome", revealedAtClue: 5 },
          { label: "Winner", value: "Billie Jean King", revealedAtClue: 6 },
          { label: "Format", value: "Best of five, winner-take-all exhibition", revealedAtClue: 3 },
        ],
      },
      {
        kind: "quote",
        kicker: "Despatch",
        quote: "This is not about one tennis match. It is about social change.",
        attribution: "King, before walking on court",
      },
      {
        kind: "image",
        kicker: "Plate 08 — pull back",
        image: { plateId: "lawn-tennis", scale: 1.35, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Straight sets in the Astrodome. The piglet stays with Riggs. Title IX has its most famous highlight reel.",
      },
    ],
  },
  {
    id: "ali-1974",
    year: 1974,
    sport: "boxing",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "Ali defeats Foreman in the Rumble in the Jungle",
    teaser: "Kinshasa, 4 a.m., rope-a-dope, eighth-round thunder.",
    summary:
      "Muhammad Ali knocked out George Foreman in the eighth round in Kinshasa, reclaiming the heavyweight title with the rope-a-dope.",
    answers: [
      "rumble in the jungle",
      "ali foreman",
      "muhammad ali kinshasa",
      "rope a dope",
      "ali vs foreman",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 09 — crop",
        image: { plateId: "boxing-ring", scale: 3.2, x: 80, y: 18 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "The younger champion is supposed to be unhittable. The older man covers up on the ropes for round after round in a 4 a.m. start.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Result", value: "KO, round 8", revealedAtClue: 4 },
          { label: "City", value: "Kinshasa", revealedAtClue: 5 },
          { label: "Winner", value: "Muhammad Ali", revealedAtClue: 6 },
          { label: "Loser", value: "George Foreman", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Ring",
        quote: "Ali bomaye!",
        attribution: "The crowd, all night",
      },
      {
        kind: "image",
        kicker: "Plate 09 — pull back",
        image: { plateId: "boxing-ring", scale: 1.3, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Zaire. Don King. A right hand that drops the unbeaten champion. The title comes home to the Louisville Lip.",
      },
    ],
  },
  {
    id: "comaneci-1976",
    year: 1976,
    sport: "gymnastics",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "Nadia Comăneci scores the first perfect 10",
    teaser: "A scoreboard that can only print 1.00.",
    summary:
      "Fourteen-year-old Nadia Comăneci scored the first perfect 10 in Olympic gymnastics on the uneven bars in Montreal, then added six more.",
    answers: [
      "nadia comaneci",
      "perfect 10",
      "comaneci montreal",
      "first perfect 10",
      "nadia 1976",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 10 — crop",
        image: { plateId: "olympic-track", scale: 2.7, x: 12, y: 40 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "The electronic scoreboard was not built for this number. It flashes 1.00. The arena takes a second to understand.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Score", value: "10.00", revealedAtClue: 3 },
          { label: "Apparatus", value: "Uneven bars (first 10)", revealedAtClue: 4 },
          { label: "Age", value: "14", revealedAtClue: 5 },
          { label: "Games", value: "Montreal", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Despatch",
        quote: "A 10. A perfect 10. The board does not know how to say it.",
        attribution: "Television commentary, Montreal",
      },
      {
        kind: "image",
        kicker: "Plate 10 — pull back",
        image: { plateId: "olympic-track", scale: 1.4, x: 48, y: 52 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "A Romanian teenager, pigtails and composure, rewires the sport. Seven tens before the Games are over.",
      },
    ],
  },
  {
    id: "miracle-1980",
    year: 1980,
    sport: "ice-hockey",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "The Miracle on Ice",
    teaser: "College kids, a superpower, and a question asked into a microphone.",
    summary:
      "The United States Olympic hockey team of college players beat the Soviet Union 4–3 at Lake Placid, then took gold against Finland.",
    answers: [
      "miracle on ice",
      "usa ussr hockey",
      "lake placid hockey",
      "miracle on ice 1980",
      "united states soviet hockey",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 11 — crop",
        image: { plateId: "ice-rink", scale: 3.15, x: 70, y: 75 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "Amateurs against a professional machine that had just beaten NHL All-Stars. A village in the Adirondacks. A flag that will not stay still.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Score", value: "4–3", revealedAtClue: 4 },
          { label: "Winner", value: "USA", revealedAtClue: 5 },
          { label: "Opponent", value: "USSR", revealedAtClue: 5 },
          { label: "Venue", value: "Lake Placid", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Wireless",
        quote: "Do you believe in miracles? YES!",
        attribution: "Al Michaels, ABC",
      },
      {
        kind: "image",
        kicker: "Plate 11 — pull back",
        image: { plateId: "ice-rink", scale: 1.28, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Herb Brooks's team of collegians. Mike Eruzione's winner. A semi-final that America remembers as a final.",
      },
    ],
  },
  {
    id: "maradona-1986",
    year: 1986,
    sport: "football",
    era: "satellite",
    expedition: "satellite",
    difficulty: 1,
    title: "Maradona's Goal of the Century",
    teaser: "Sixty yards, five players, one left foot, Mexico City heat.",
    summary:
      "Diego Maradona scored the Goal of the Century in the World Cup quarter-final against England, four minutes after the Hand of God.",
    answers: [
      "goal of the century",
      "maradona 1986",
      "maradona england",
      "diego maradona mexico",
      "hand of god",
      "argentina england 1986",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 12 — crop",
        image: { plateId: "pitch-night", scale: 3.1, x: 15, y: 40 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "Four minutes after a goal the referee should not have given, the same No. 10 collects in his own half and does not stop.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Minute", value: "54'", revealedAtClue: 4 },
          { label: "Round", value: "World Cup quarter-final", revealedAtClue: 3 },
          { label: "Dribbles beaten", value: "Beardsley, Reid, Butcher, Fenwick, Shilton", revealedAtClue: 6 },
          { label: "Venue", value: "Estadio Azteca", revealedAtClue: 5 },
        ],
      },
      {
        kind: "quote",
        kicker: "Wireless",
        quote: "Barrilete cósmico... ¿de qué planeta viniste?",
        attribution: "Víctor Hugo Morales",
      },
      {
        kind: "image",
        kicker: "Plate 12 — pull back",
        image: { plateId: "pitch-night", scale: 1.32, x: 50, y: 52 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Argentina against England in Mexico City. One disputed hand, then a run that FIFA later named the goal of the century.",
      },
    ],
  },
  {
    id: "dream-team-1992",
    year: 1992,
    sport: "basketball",
    era: "global",
    expedition: "global",
    difficulty: 1,
    title: "The Dream Team wins Olympic gold in Barcelona",
    teaser: "NBA names on Olympic vests, and nobody is close.",
    summary:
      "The 1992 United States men's basketball team — Jordan, Magic, Bird, Barkley and company — won every game in Barcelona by a double-digit margin.",
    answers: [
      "dream team",
      "dream team barcelona",
      "usa basketball 1992",
      "1992 olympics basketball",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 13 — crop",
        image: { plateId: "hardwood", scale: 3, x: 80, y: 70 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "Professionals are allowed in for the first time. The warm-up is a greater show than most finals. Opponents ask for photographs.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Record", value: "8–0", revealedAtClue: 3 },
          { label: "Average margin", value: "43.8 points", revealedAtClue: 4 },
          { label: "Final", value: "USA 117–85 Croatia", revealedAtClue: 6 },
          { label: "City", value: "Barcelona", revealedAtClue: 5 },
        ],
      },
      {
        kind: "quote",
        kicker: "Despatch",
        quote: "They were a bunch of guys who were the best in the world, and they played like it.",
        attribution: "Chuck Daly",
      },
      {
        kind: "image",
        kicker: "Plate 13 — pull back",
        image: { plateId: "hardwood", scale: 1.35, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Jordan, Magic, Larry Bird on one bench. A gold medal that looks inevitable from the opening dunk.",
      },
    ],
  },
  {
    id: "mandela-1995",
    year: 1995,
    sport: "rugby",
    era: "global",
    expedition: "global",
    difficulty: 2,
    title: "South Africa win the Rugby World Cup in a Springbok jersey",
    teaser: "A number 6 shirt, extra time, and a stadium that had to become a country.",
    summary:
      "South Africa beat New Zealand 15–12 after extra time in Johannesburg. Nelson Mandela presented the trophy wearing a Springbok jersey.",
    answers: [
      "1995 rugby world cup",
      "mandela springbok",
      "south africa 1995",
      "joel stransky",
      "invictus",
      "springboks 1995",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 14 — crop",
        image: { plateId: "rugby-turf", scale: 3.05, x: 20, y: 80 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "Extra time. A drop goal from the right. The president is already in the team jersey when he walks onto the grass.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Final score", value: "15–12 after extra time", revealedAtClue: 4 },
          { label: "Drop goal", value: "Joel Stransky", revealedAtClue: 5 },
          { label: "Venue", value: "Ellis Park, Johannesburg", revealedAtClue: 5 },
          { label: "Opponent", value: "New Zealand", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Pitch",
        quote: "Sport has the power to change the world.",
        attribution: "Nelson Mandela",
      },
      {
        kind: "image",
        kicker: "Plate 14 — pull back",
        image: { plateId: "rugby-turf", scale: 1.3, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "François Pienaar lifts the Webb Ellis Cup. The man who hands it over is wearing 6. A rainbow, briefly, in rugby colours.",
      },
    ],
  },
  {
    id: "united-1999",
    year: 1999,
    sport: "football",
    era: "global",
    expedition: "global",
    difficulty: 1,
    title: "Manchester United's stoppage-time Treble",
    teaser: "Injury time, twice, in Barcelona, with a treble on the line.",
    summary:
      "Manchester United scored twice in stoppage time to beat Bayern Munich 2–1 in the Champions League final and complete the Treble.",
    answers: [
      "manchester united 1999",
      "united treble",
      "sheringham solskjaer",
      "bayern united 1999",
      "camp nou 1999",
      "solskjaer 1999",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 15 — crop",
        image: { plateId: "pitch-night", scale: 2.95, x: 88, y: 55 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "They trail to a header from a free-kick. The clock is in the red. Two corners. Two different substitutes.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Final score", value: "2–1", revealedAtClue: 3 },
          { label: "Winner's goals", value: "Sheringham 91', Solskjær 93'", revealedAtClue: 5 },
          { label: "Venue", value: "Camp Nou", revealedAtClue: 4 },
          { label: "Opponent", value: "Bayern Munich", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Wireless",
        quote: "And Solskjær has won it!",
        attribution: "Clive Tyldesley, ITV",
      },
      {
        kind: "image",
        kicker: "Plate 15 — pull back",
        image: { plateId: "pitch-night", scale: 1.28, x: 52, y: 50 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Ferguson's United. Premier League, FA Cup, Europe — all in ten days. Teddy, then Ole, in Catalan injury time.",
      },
    ],
  },
  {
    id: "chastain-1999",
    year: 1999,
    sport: "football",
    era: "global",
    expedition: "global",
    difficulty: 2,
    title: "Brandi Chastain's penalty wins the Women's World Cup",
    teaser: "A black sports bra, the Rose Bowl, and a shoot-out that moved a country.",
    summary:
      "Brandi Chastain converted the winning penalty as the United States beat China in the Women's World Cup final at the Rose Bowl.",
    answers: [
      "brandi chastain",
      "1999 women's world cup",
      "usa china 1999",
      "chastain penalty",
      "rose bowl 1999",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 16 — crop",
        image: { plateId: "pitch-night", scale: 3.2, x: 30, y: 15 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "90,000 in a California bowl. 0–0 after extra time. The fifth penalty of the shoot-out is struck left-footed.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Regulation", value: "0–0 (AET)", revealedAtClue: 3 },
          { label: "Decider", value: "Penalties, 5–4", revealedAtClue: 4 },
          { label: "Venue", value: "Rose Bowl", revealedAtClue: 5 },
          { label: "Winner", value: "United States", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Pitch",
        quote: "Momentary insanity.",
        attribution: "The penalty taker, on the celebration",
      },
      {
        kind: "image",
        kicker: "Plate 16 — pull back",
        image: { plateId: "pitch-night", scale: 1.35, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Mia Hamm's generation. China in the other shirt. A photograph that puts women's football on American magazine covers.",
      },
    ],
  },
  {
    id: "bolt-2008",
    year: 2008,
    sport: "athletics",
    era: "global",
    expedition: "global",
    difficulty: 1,
    title: "Usain Bolt runs 9.69 in Beijing",
    teaser: "Lane 4, a look left, and a world record with the shoes untied.",
    summary:
      "Usain Bolt won the Beijing Olympic 100m in a world record 9.69, slowing to celebrate before the line, then added the 200m record and the relay.",
    answers: [
      "usain bolt",
      "bolt beijing",
      "bolt 9.69",
      "2008 100m",
      "bolt 100m beijing",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 17 — crop",
        image: { plateId: "olympic-track", scale: 3.25, x: 85, y: 60 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "He is clear at 60 metres. He spreads his arms. The clock still drops. One lace is undone.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Time", value: "9.69", revealedAtClue: 3 },
          { label: "Event", value: "100 metres", revealedAtClue: 4 },
          { label: "Wind", value: "0.0 m/s", revealedAtClue: 5 },
          { label: "City", value: "Beijing", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Track",
        quote: "I am No. 1.",
        attribution: "The sprinter, to the Bird's Nest",
      },
      {
        kind: "image",
        kicker: "Plate 17 — pull back",
        image: { plateId: "olympic-track", scale: 1.4, x: 55, y: 50 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "A Jamaican six-foot-five who was supposed to be a 200m man only. By the end of the week he has three golds and a new silhouette.",
      },
    ],
  },
  {
    id: "super-saturday-2012",
    year: 2012,
    sport: "athletics",
    era: "already-history",
    expedition: "already-history",
    difficulty: 2,
    title: "London 2012 Super Saturday",
    teaser: "Sixty minutes, three home golds, one stadium that lost its voice and found it again.",
    summary:
      "On 4 August 2012 Jessica Ennis-Hill, Greg Rutherford and Mo Farah all won Olympic gold for Great Britain within an hour at the London Stadium.",
    answers: [
      "super saturday",
      "london 2012 super saturday",
      "ennis farah rutherford",
      "mo farah 2012",
      "jessica ennis 2012",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 18 — crop",
        image: { plateId: "olympic-track", scale: 2.9, x: 40, y: 18 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "A heptathlon last event, a long jump that looks like a misprint, a 10,000m kick. Same stadium, same hour, same flag.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Home golds in ~60 min", value: "3", revealedAtClue: 3 },
          { label: "Events", value: "Heptathlon, long jump, 10,000m", revealedAtClue: 5 },
          { label: "City", value: "London", revealedAtClue: 4 },
          { label: "Athletes", value: "Ennis-Hill, Rutherford, Farah", revealedAtClue: 6 },
        ],
      },
      {
        kind: "quote",
        kicker: "Wireless",
        quote: "Go on Mo! Go on!",
        attribution: "The stadium, last lap",
      },
      {
        kind: "image",
        kicker: "Plate 18 — pull back",
        image: { plateId: "olympic-track", scale: 1.35, x: 50, y: 48 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Jessica Ennis-Hill's heptathlon, Greg Rutherford's jump, Mo Farah's first Olympic 10,000m. Britain calls the night Super Saturday.",
      },
    ],
  },
  {
    id: "leicester-2016",
    year: 2016,
    sport: "football",
    era: "already-history",
    expedition: "already-history",
    difficulty: 1,
    title: "Leicester City win the Premier League at 5000-1",
    teaser: "A newly promoted fox, a 5000-1 ticket, and a title no model predicted.",
    summary:
      "Leicester City won the 2015–16 Premier League title at pre-season odds of 5000-1, the most unlikely championship in the competition's history.",
    answers: [
      "leicester city",
      "leicester 2016",
      "leicester premier league",
      "5000 to 1",
      "claudio ranieri leicester",
      "leicester title",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 19 — crop",
        image: { plateId: "pitch-night", scale: 3, x: 65, y: 25 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "The bookmakers' board still looks like a joke in April. A striker from Algeria, a midfield of recoveries, a manager who had been written off.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Pre-season odds", value: "5000-1", revealedAtClue: 3 },
          { label: "Points", value: "81", revealedAtClue: 5 },
          { label: "Top scorer", value: "Jamie Vardy (24)", revealedAtClue: 6 },
          { label: "Division", value: "Premier League", revealedAtClue: 4 },
        ],
      },
      {
        kind: "quote",
        kicker: "Dressing room",
        quote: "Dilly ding, dilly dong.",
        attribution: "Claudio Ranieri",
      },
      {
        kind: "image",
        kicker: "Plate 19 — pull back",
        image: { plateId: "pitch-night", scale: 1.3, x: 50, y: 52 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Tottenham draw at Chelsea and the East Midlands explodes. Mahrez, Kante, Vardy — a fox on the badge and on every back page.",
      },
    ],
  },
  {
    id: "messi-2022",
    year: 2022,
    sport: "football",
    era: "already-history",
    expedition: "already-history",
    difficulty: 1,
    title: "Messi wins the World Cup in Lusail",
    teaser: "A final that needed extra time, penalties, and one more crown.",
    summary:
      "Lionel Messi scored twice as Argentina beat France 4–2 on penalties after a 3–3 final in Lusail, claiming his first World Cup.",
    answers: [
      "messi world cup",
      "argentina 2022",
      "lusail",
      "messi 2022",
      "argentina france 2022",
      "qatar world cup final",
    ],
    clues: [
      {
        kind: "image",
        kicker: "Plate 20 — crop",
        image: { plateId: "pitch-night", scale: 3.1, x: 10, y: 60 },
      },
      {
        kind: "text",
        kicker: "Field note",
        body: "2–0 looks settled. Then a hat-trick from the other No. 10. Extra time. A third each. A shoot-out under a gilded bowl.",
      },
      {
        kind: "stats",
        kicker: "Result card",
        stats: [
          { label: "Regulation + ET", value: "3–3", revealedAtClue: 3 },
          { label: "Penalties", value: "4–2", revealedAtClue: 4 },
          { label: "Winner's captain", value: "Lionel Messi", revealedAtClue: 6 },
          { label: "Venue", value: "Lusail Stadium", revealedAtClue: 5 },
        ],
      },
      {
        kind: "quote",
        kicker: "Pitch",
        quote: "I dreamed this so many times.",
        attribution: "The captain, with the trophy",
      },
      {
        kind: "image",
        kicker: "Plate 20 — pull back",
        image: { plateId: "pitch-night", scale: 1.25, x: 50, y: 50 },
      },
      {
        kind: "text",
        kicker: "Final brief",
        body: "Argentina. France. Messi and Mbappé. A final the archive already files under 'greatest', and a first star for the captain.",
      },
    ],
  },
];

const puzzleById = new Map(puzzles.map((puzzle) => [puzzle.id, puzzle]));

const extraEvents: EventOption[] = [
  { id: "extra-istanbul", label: "Istanbul 2005" },
  { id: "extra-wimbledon-2008", label: "Federer vs Nadal, Wimbledon" },
  { id: "extra-botham", label: "Botham's Ashes" },
  { id: "extra-freeman", label: "Cathy Freeman 400m" },
  { id: "extra-nadal-rg", label: "Nadal French Open" },
  { id: "extra-tiger-1997", label: "Tiger Woods 1997 Masters" },
  { id: "extra-italy-1982", label: "Italy World Cup 1982" },
  { id: "extra-spain-2010", label: "Iniesta World Cup winner" },
  { id: "extra-greece-2004", label: "Greece Euro 2004" },
  { id: "extra-jordan-1998", label: "Jordan last shot" },
  { id: "extra-senna-brazil", label: "Senna Brazilian GP" },
  { id: "extra-borg-mcenroe", label: "Borg vs McEnroe" },
  { id: "extra-ali-frazier", label: "Thrilla in Manila" },
  { id: "extra-uswnt-2019", label: "USWNT World Cup 2019" },
  { id: "extra-phelps-2008", label: "Phelps eight golds" },
  { id: "extra-kerri-strug", label: "Kerri Strug vault" },
  { id: "extra-beckham-2001", label: "Beckham free-kick vs Greece" },
];

const SEARCH_LABELS: Record<string, string> = {
  "athens-1896": "Spyridon Louis marathon",
  "montevideo-1930": "First World Cup",
  "owens-1936": "Jesse Owens",
  "bern-1954": "Miracle of Bern",
  "pele-1958": "Pelé in Sweden",
  "hurst-1966": "Geoff Hurst hat-trick",
  "fosbury-1968": "Fosbury Flop",
  "king-1973": "Battle of the Sexes",
  "ali-1974": "Rumble in the Jungle",
  "comaneci-1976": "Nadia Comăneci perfect 10",
  "miracle-1980": "Miracle on Ice",
  "maradona-1986": "Maradona Goal of the Century",
  "dream-team-1992": "Dream Team",
  "mandela-1995": "Springboks 1995",
  "united-1999": "Manchester United Treble",
  "chastain-1999": "Brandi Chastain penalty",
  "bolt-2008": "Usain Bolt Beijing 100m",
  "super-saturday-2012": "Super Saturday",
  "leicester-2016": "Leicester City title",
  "messi-2022": "Messi World Cup",
};

export const eventDictionary: EventOption[] = [
  ...puzzles.map((puzzle) => ({
    id: puzzle.id,
    label: SEARCH_LABELS[puzzle.id] ?? puzzle.answers[0],
  })),
  ...extraEvents,
];

export function getPuzzle(id: string): Puzzle | undefined {
  return puzzleById.get(id);
}

function uniqueAliases(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/**
 * Canonical year + subject + aliases for server-side scoring.
 * Autocomplete labels are included so a dictionary pick always matches.
 */
export function getAnswerSheet(id: string): AnswerSheet | undefined {
  const puzzle = getPuzzle(id);
  if (!puzzle) return undefined;
  const target_subject = SEARCH_LABELS[puzzle.id] ?? puzzle.title;
  const accepted_aliases = uniqueAliases([
    puzzle.title,
    SEARCH_LABELS[puzzle.id],
    ...puzzle.answers,
  ]).filter((alias) => alias.toLowerCase() !== target_subject.toLowerCase());
  return {
    target_year: puzzle.year,
    target_subject,
    accepted_aliases,
  };
}

export function getExpedition(slug: string): Expedition | undefined {
  return expeditions.find((item) => item.slug === slug);
}

export function getExpeditionPuzzles(slug: string): Puzzle[] {
  const expedition = getExpedition(slug);
  if (!expedition) return [];
  return expedition.puzzleIds
    .map((id) => puzzleById.get(id))
    .filter((puzzle): puzzle is Puzzle => Boolean(puzzle));
}

export function getDailyPuzzle(dateKey: string): Puzzle {
  const index = hashString(`sport-history-clue:${dateKey}`) % puzzles.length;
  return puzzles[index];
}

export function getRandomPuzzle(excludeId?: string): Puzzle {
  const pool = excludeId ? puzzles.filter((puzzle) => puzzle.id !== excludeId) : puzzles;
  const list = pool.length > 0 ? pool : puzzles;
  return list[Math.floor(Math.random() * list.length)];
}
