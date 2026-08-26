/**
 * Architecture dossiers for each destination roof.
 * Types and construction notes, not monument IDs for the drawings.
 */

import { siteSrc } from "./cloudinary-site.js";

export const GUIDES = {
  vietnam: {
    typology: "Temple and dinh roofs",
    setting: "Monsoon, river towns, imperial Hue",
    lead:
      "The Vietnamese roof in this stage is a cousin of Chinese timber framing, tuned to rain and river light. Corners lift like a prow. Tiles stack in tight waves. The building is as much a boat held in the air as it is a hall on posts.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "left",
          src: siteSrc("./roof-vietnam.png", { width: 1200 }),
          alt: "Curved Vietnamese temple roof with stacked tiles and lifted corners",
          caption: "Stacked ngói and a corner that turns up instead of dying into a box."
        },
        paragraphs: [
          "Look at the silhouette first. The ridge is not a hard bar. It swells, then the planes drop and flick outward. Those lifted corners are the easiest thing to caricature and the most serious thing in the construction. They throw monsoon water away from the walls and keep the eaves from reading as a lid.",
          "In village dinh halls and Buddhist chùa, the roof is often larger than the room. The building is a dark timber cage under a ceramic landscape. From the courtyard you read animals, dragons, and ceramic shards on the ridge before you read a door."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "right",
          src: siteSrc("./selector-vietnam.png", { width: 480 }),
          alt: "Detail of a Vietnamese roof ridge and tile course",
          caption: "A short reading of the ridge: ornament sitting on a working tile coat."
        },
        paragraphs: [
          "The frame is timber. Posts take the load. Beams and purlins step out so the eave can fly without a thick masonry wall. Tiles (ngói) are laid in overlapping courses so wind-driven rain has to climb backward to get in.",
          "Hue’s imperial work and northern village halls share that logic even when the decoration changes. Ceramic ridge figures are not stickers. They sit on the line where two slopes meet and where water is most likely to fail the roof."
        ]
      },
      {
        heading: "Climate and use",
        paragraphs: [
          "This is a roof for wet heat. Deep shade under the eave is the first air-conditioning. The dark interior stays cooler than the court. Rain is loud on tile, which is part of how the building teaches weather.",
          "Compare the lift of these corners with China’s flying eaves. Vietnam keeps the boat metaphor closer to the water. The same family of timber roofs, a different harbour."
        ]
      }
    ],
    related: ["china", "japan"]
  },

  china: {
    typology: "Flying eaves and courtyard roofs",
    setting: "North China plains, imperial and temple timber",
    lead:
      "The Chinese roof on this stage is a structural brag. The eave flies farther than a simple rafter should allow. Brackets stack under it. Glaze and ridge beasts tell you the building’s rank before anyone speaks.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "left",
          src: siteSrc("./roof-china.png", { width: 1200 }),
          alt: "Chinese palace-style roof with flying corner eaves and ornamental ridge",
          caption: "A concave slope and a corner that leaves the wall behind."
        },
        paragraphs: [
          "Palace and temple roofs of this family are concave in section. The slope starts steep at the ridge and eases toward the eave, so the silhouette feels sprung, not tented. Corners lift. The wall is a screen under a much larger hat.",
          "Colour is law as much as taste. Yellow glaze belonged to imperial work. Temple and garden buildings use other palettes, but the grammar is the same: ridge, hip or gable-and-hip, flying corner, deep shade."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "right",
          src: siteSrc("./selector-china.png", { width: 480 }),
          alt: "Detail of Chinese roof tiles and lifted eave corner",
          caption: "Tile as a coat of scales. The corner is where the coat has to turn."
        },
        paragraphs: [
          "Dougong bracketing is the famous joint. Short timber blocks and arms stack so the eave load steps outward from the column. It is earthquake-tolerant because it can work a little, and it is ornamental because the stepping is left visible.",
          "Above the frame, battens take rows of pan and cover tiles. Chiwen or similar ridge creatures clamp the ends of the ridge, where wind and water meet. The roof is a ceramic landscape on a wooden machine."
        ]
      },
      {
        heading: "Courtyard life",
        paragraphs: [
          "In a siheyuan, roofs face inward to a court. Rain falls to a stone floor. Summer sun is cut by the eave. Winter light still reaches the main hall if the court is sized for the latitude. The roof is climate equipment, not only a crown.",
          "If you have just dragged the letter-cloth under this roof, you have already felt the idea: a hanging plane that is denser than air and lighter than a wall."
        ]
      }
    ],
    related: ["vietnam", "japan"]
  },

  japan: {
    typology: "Irimoya and kawara roofs",
    setting: "Temples, shrines, rain and snow",
    lead:
      "Japanese roofs of this family are calm until you notice how far they hover. Cypress, tile, and bracket work make a lid that is also a veranda in the sky. Silence is a material here, and the eave is what keeps it.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "right",
          src: siteSrc("./roof-japan.png", { width: 1200 }),
          alt: "Japanese temple roof with broad eaves and tiled slopes",
          caption: "A wide hat. The wall is allowed to be a shadow."
        },
        paragraphs: [
          "The irimoya form mixes hip and gable: a triangular gable sitting on hipped slopes. It reads as a mountain that has been folded, not as a lid dropped on a box. Shrine work may be thatched or cypress-barked. Temple work is often kawara tile, grey-blue, with a hard shadow line.",
          "Vermilion belongs more to shrine gates and some shrine halls than to every temple. Unpainted timber, white plaster, and tile are a full sentence on their own."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "left",
          src: siteSrc("./selector-japan.png", { width: 480 }),
          alt: "Detail of Japanese tiled roof and eave edge",
          caption: "Kawara at the drip edge. Water is asked to leave cleanly."
        },
        paragraphs: [
          "Tokyou bracket complexes, related to Chinese dougong, carry the flying eave. The Japanese versions often look tighter and more stacked, a vertical forest under the soffit. Hidden rafters and exposed rafters are both used; the visible ones set the rhythm of the shade.",
          "Tile is heavy. The frame is oversized for earthquakes and for that weight. In snow country the pitch steepens. In wet temperate zones the eave simply grows, like an extra room nobody enters."
        ]
      },
      {
        heading: "Patience as a section",
        paragraphs: [
          "The building asks you to pause at the edge of the eave before you go in. That pause is architectural. It is also why this roof feels different from a mansard, which pulls living space up into the slope, or a yurt, which has no eave at all.",
          "Related roofs: China’s flying corner is a louder relative. Vietnam’s lift is wetter. Japan’s version is the one that treats shade as a finished room."
        ]
      }
    ],
    related: ["china", "norway"]
  },

  kazakhstan: {
    typology: "Yurt (kiyiz üi) and shanyrak",
    setting: "Steppe wind, felt, a house that moves",
    lead:
      "This is not a tiled civic roof. It is a portable ring. The shanyrak at the crown is both skylight and family emblem. Walls are lattice. The coat is felt. Home is a circle you can pack.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "left",
          src: siteSrc("./roof-kazakhstan.png", { width: 1200 }),
          alt: "Yurt roof with felt cover and open shanyrak crown",
          caption: "A low dome of poles. The eye of the house is the hole at the top."
        },
        paragraphs: [
          "The plan is circular because the wind has no preferred street. A kerege lattice wall wraps the space. Uyk poles rise from that wall to the shanyrak, a timber ring that holds the roof together and leaves an eye for smoke and sky.",
          "From outside, the roof is a shallow cone or dome of felt, sometimes with patterned bands. There is no flying eave. The wall and roof are one coat. That is the opposite of a Chinese temple, where the hat is much larger than the body."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "right",
          src: siteSrc("./selector-kazakhstan.png", { width: 480 }),
          alt: "Detail of a yurt crown and felt roof",
          caption: "Shanyrak logic: a ring that is structure, window, and memory."
        },
        paragraphs: [
          "Willow or other light timber, rawhide ties, and felt made from sheep’s wool. Layers of felt are added or peeled with the season. A winter house is thicker. A summer house breathes. The door faces south in many steppe traditions, toward sun and away from the worst wind.",
          "Nothing here is a foundation in the masonry sense. The ground is the floor’s partner. Thresholds are felt and wood. Rank and family history can be stitched into the crown and the interior bands."
        ]
      },
      {
        heading: "A roof that travels",
        paragraphs: [
          "Nomadic architecture is often taught as the absence of architecture. It is the opposite: a complete climate machine that can leave in a morning. Compared with Iran’s badgir, which stands still and mines the wind, the yurt simply becomes small enough to follow grazing.",
          "If you are reading this as a student, draw the shanyrak in plan and section before you draw any ornament. The ring is the building."
        ]
      }
    ],
    related: ["iran", "norway"]
  },

  russia: {
    typology: "Terem and carved timber roofs",
    setting: "North forests, painted wood, snow",
    lead:
      "Russian wooden civic and fairy-tale terems stack rooms like chests. Roofs become barrels, kokoshnik gables, and lace. Snow is a load and a drawing tool. The ridge is allowed to be theatrical because the timber can take it.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "right",
          src: siteSrc("./roof-russia.png", { width: 1200 }),
          alt: "Painted Russian terem roof with stacked gables and carved edges",
          caption: "Gables as headdresses. The roof is a second façade."
        },
        paragraphs: [
          "A terem is a chambered upper house, historically for princely or boyar households, later a folk-national image. The roof silhouette is busy on purpose: stepped kokoshnik gables (named after the headdress), bochka barrel roofs, and deep carved bargeboards.",
          "Colour sits on the carving. White lace edges, red and green planes, gold where the tale needs it. This is not the same object as an ordinary izba, the peasant log house, though they share axe-work and a respect for snow."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "left",
          src: siteSrc("./selector-russia.png", { width: 480 }),
          alt: "Detail of Russian wooden roof ornament and ridge",
          caption: "Carving at the drip. Decoration living where water runs."
        },
        paragraphs: [
          "Log walls (srub) lock at the corners. Roofs may sit on brackets that throw the eave out over the logs so meltwater does not rot the crown of the wall. Shingles, ploughshare tiles on churches, or painted boards cover the planes.",
          "In church architecture of the north, the roof can become a tent (shatyor) or a cluster of onion domes. The civic terem on this stage is the domestic, storied version: a wooden skyline you could theoretically live under."
        ]
      },
      {
        heading: "Winter as a critic",
        paragraphs: [
          "Snow collects in every pocket you design. A good Russian timber roof sheds or holds with intent. Deep eaves protect windows that are already small against heat loss. Carved nalichniki (window frames) are both jewellery and drip detail.",
          "Stand this next to Norway’s sod roof: both are northern, both are timber cultures, but Norway puts a field on the house and Russia puts a festival on it."
        ]
      }
    ],
    related: ["norway", "kazakhstan"]
  },

  france: {
    typology: "Mansard and zinc attic",
    setting: "Paris and the dense European street",
    lead:
      "A mansard is a roof you can live in. The lower slope is steep enough for furniture. Dormers punch the sky. On later streets the coat is zinc, pale grey, almost plumbing, almost couture.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "left",
          src: siteSrc("./roof-france.png", { width: 1200 }),
          alt: "French mansard roof with steep lower slope, dormers, and iron cresting",
          caption: "Two pitches. The lower one is a wall in disguise."
        },
        paragraphs: [
          "François Mansart did not invent attic life, but his name stuck to the double-pitch roof that makes a full storey in the roof volume. The lower plane is steep, sometimes nearly a wall. The upper plane is shallow and disappears from the street.",
          "Haussmann’s Paris made this a city-scale instrument. Cornice, dormer, zinc, chimney pots, and iron cresting became a shared skyline so individual palaces would not break the street."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "right",
          src: siteSrc("./selector-france.png", { width: 480 }),
          alt: "Detail of mansard dormers and zinc or slate roof",
          caption: "Dormers as little houses. They are how the attic joins the street."
        },
        paragraphs: [
          "Timber or later steel trusses set the two pitches. Slate is the older civic coat. Zinc standing-seam became the Paris default because it is light, workable around chimneys, and repairable by a specialised trade that still exists.",
          "Dormers need flashing that actually works. Most leaks in this family start at a lazy junction, not in the middle of a zinc pan. Fire rules in the nineteenth century also pushed incombustible coats and party walls through the roof volume."
        ]
      },
      {
        heading: "Why the attic matters",
        paragraphs: [
          "This roof is an economic section. It turns leftover volume into rooms for servants, then students, then anyone priced out of the piano nobile. Compared with a Japanese eave, which shades a veranda, the mansard is greedy in a useful way: it keeps the street height while adding beds.",
          "Related: the American shingle gable is a cousin in wood, less formal, more house-as-object. The Italian cupola goes the other way, occupying the sky instead of the attic."
        ]
      }
    ],
    related: ["uk", "usa"]
  },

  india: {
    typology: "Dome, chhatri, and deep shade",
    setting: "Heat, courtyard, Mughal and temple civic roofs",
    lead:
      "The Indian roof on this stage is a dome that has learned to float. White or sandstone, it sits on a drum, often ringed by small chhatri kiosks. Shade is the program. Stone is allowed to be lace.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "right",
          src: siteSrc("./roof-india.png", { width: 1200 }),
          alt: "Bulbous dome with corner chhatri pavilions",
          caption: "A dome as a sky room. Chhatris as smaller skies at the corners."
        },
        paragraphs: [
          "Mughal and related civic roofs use a bulbous dome, sometimes with a lotus finial, on a cylindrical or octagonal drum. At the corners, chhatris (small pillared pavilions) repeat the dome at domestic scale. The skyline is a conversation among umbrellas.",
          "Temple shikharas of North India are a different family: piled stone mountains. Do not mash them together. This drawing belongs with tombs, palaces, and mosque courts where the dome is a cool interior, not a mountain."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "left",
          src: siteSrc("./selector-india.png", { width: 480 }),
          alt: "Detail of an Indian dome and chhatri roof",
          caption: "Drum, dome, finial. The profile is a piece of climate equipment."
        },
        paragraphs: [
          "Domes may be masonry in rings or, in later work, mixed with iron. The inner face can be far from the outer bulb. That air gap, plus thick walls and jali screens, is how the building deals with glare and heat.",
          "Chhatris are not toys. They sit on the roof terrace as shade structures and as markers of corners. Water still has to leave the terrace through spouts and slopes. A pretty skyline with a dead-flat terrace is a failure waiting for monsoon."
        ]
      },
      {
        heading: "Heat as the client",
        paragraphs: [
          "Compare this with Iran’s windcatcher: both are pre-mechanical cooling, but India here bets on mass, white surfaces, and layered shade, while Yazd bets on catching a breeze and pulling it across water or night-cooled masonry.",
          "Walk the sequence: glare of the court, darkness of the iwan or veranda, then the dome. The roof is the last room in that sequence, even if you never climb it."
        ]
      }
    ],
    related: ["iran", "italy"]
  },

  uk: {
    typology: "Thatch and the deep cottage eave",
    setting: "Temperate rain, reed and straw, village roofs",
    lead:
      "Thatch is a roof that is still a plant. Reed or long straw is combed into a thick coat. The eaves are fat. The ridge is a sewn line. It looks soft and it is a serious rain screen if the pitch is steep enough.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "left",
          src: siteSrc("./roof-uk.png", { width: 1200 }),
          alt: "Thatched roof with deep rounded eaves and a patterned ridge",
          caption: "A coat of reed. Windows sit back under a brow."
        },
        paragraphs: [
          "The British thatched cottage is a steep pile with rounded brows. Dormers, if they exist, are small and carefully flashed with more thatch or with lime and timber. The chimney is a masonry island in a vegetable sea.",
          "Regional dialects matter. Norfolk reed is different from Devon straw. The ridge pattern is a signature of the thatcher as much as of the county. Do not treat all brown roofs as one material."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "right",
          src: siteSrc("./selector-uk.png", { width: 480 }),
          alt: "Detail of thatch texture and eave",
          caption: "Combed courses. Water is asked to run on the surface, not in."
        },
        paragraphs: [
          "Bundles are fixed to battens with spars and liggers, working from eave to ridge. Thickness is insulation and waterproofing together. A good pitch (often well above 45 degrees for straw) is not a style choice. It is how the plant sheds water before it rots.",
          "Fire is the historic enemy. Modern practice uses membranes, fire barriers, and chimneys detailed with care. Listing and conservation rules mean many of these roofs are living trades, not nostalgia overlays."
        ]
      },
      {
        heading: "A vegetal cousin",
        paragraphs: [
          "Norway’s sod roof is the other plant roof in this set, but inverted: living grass over birch bark, held by the weight of earth. Thatch is a combed pelt. Sod is a small field. Both make the house look like it grew, and both fail if water sits.",
          "France’s mansard is the urban opposite: metal, dormers, a street law. Thatch is the village version of the same need, a warm attic under a thick coat."
        ]
      }
    ],
    related: ["norway", "france"]
  },

  norway: {
    typology: "Sod roof (torvtak)",
    setting: "Cold rain, birch bark, a field on the house",
    lead:
      "A Norwegian sod roof is a waterproof sandwich with a meadow on top. Birch bark sheds water. Turf holds it down and insulates. In summer the house wears grass. In winter it wears snow on grass.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "right",
          src: siteSrc("./roof-norway.png", { width: 1200 }),
          alt: "Turf roof with grass growing on a timber house",
          caption: "The ridge is a seam in a field. The eave is a cut bank."
        },
        paragraphs: [
          "From a distance the roof can vanish into the slope. That is not a metaphor. On farm buildings set into hills, the back eave meets land. The front eave is a thick brow over timber walls painted oxblood or left to weather.",
          "This is not a stave church. Stave churches are tarred wood, steep, almost animal. Sod belongs to the farm, the cabin, and a modern revival that likes the thermal mass and the look of a living hat."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "left",
          src: siteSrc("./selector-norway.png", { width: 480 }),
          alt: "Detail of a sod roof edge and grass cover",
          caption: "Bark for water. Earth for weight. Grass as a side effect that became the image."
        },
        paragraphs: [
          "Several layers of birch bark, lapped like shingles, sit on boarding. Turf is laid grass-down then grass-up, or in other local sequences, so roots and soil make a blanket. The eave needs a board or log to stop the field from walking off in the rain.",
          "Wet turf is heavy. The timber frame is sized for that, and for snow. Compare a zinc mansard, which wants to be light, with this roof, which wants to be a landscape. Both are correct in their weather."
        ]
      },
      {
        heading: "North without theatre",
        paragraphs: [
          "Russian terems paint the snow a story. Norwegian sod accepts the snow as extra insulation and extra load. The yurt, far away on the steppe, is the third northern logic: do not fight the climate with mass, leave when the grazing ends.",
          "If you only remember one joint, remember bark overlapping like fish scales under a living load. The grass is the poster. The bark is the roof."
        ]
      }
    ],
    related: ["uk", "russia"]
  },

  italy: {
    typology: "Cupola, lantern, and terracotta",
    setting: "Mediterranean light, civic churches, clay tiles",
    lead:
      "Italy’s civic roof in this family is a dome with a lantern, sitting on a drum, with terracotta around it like a ploughed field. The cupola is a public object. You navigate the town by it.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "left",
          src: siteSrc("./roof-italy.png", { width: 1200 }),
          alt: "Italian cupola with lantern above terracotta tiled roofs",
          caption: "A lantern on a dome. The town keeps a candle on its skyline."
        },
        paragraphs: [
          "The dome is a civic full stop. Brunelleschi’s Florence is the textbook case of a masonry dome that stands without centering in the old sense, but the drawing here is a type, not a measured monument. Drum, rib or smooth cupola, lantern, lead or tile coat.",
          "Around it, ordinary houses wear coppi and tegole, curved pan and cover tiles that make every roof a ripple of clay. The cathedral is a stone thought. The street is a ceramic field."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "right",
          src: siteSrc("./selector-italy.png", { width: 480 }),
          alt: "Detail of an Italian dome lantern and tiled roof",
          caption: "The lantern ventilates and finishes the dome. It is not only a statue’s stand."
        },
        paragraphs: [
          "Double shells, herringbone brick, timber chains, and later iron ties all appear in this family. The lantern is structural and climatic: it loads the eye of the dome and lets heat out. Fail the lantern and you fail the silhouette and the updraft.",
          "Terracotta tiles need a pitch, battens, and a way for broken pieces to be swapped. Mediterranean roofs are maintenance cultures. Beauty here is a repair cycle, not a freeze-frame."
        ]
      },
      {
        heading: "Light and the street",
        paragraphs: [
          "A dome of this kind is a way of being seen from ten streets at once. India’s bulbous dome is a cooler, more garden-palace cousin. Brazil’s terracotta colonial roof takes the clay tile idea without the cupola, a Portuguese Atlantic version of the same ceramic craft.",
          "Draw the lantern in section with the nave. If the eye does not line up, you have an ornament, not a cupola."
        ]
      }
    ],
    related: ["india", "brazil"]
  },

  usa: {
    typology: "Shingle gable and the wood house",
    setting: "Timber balloon frame, rain, freeze-thaw",
    lead:
      "The American roof on this stage is a wood gable in shingles. It is ordinary on purpose. The triangle is easy to frame, easy to sheathe, and easy to sell. Most of the country’s domestic skyline is this thought, repeated.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "right",
          src: siteSrc("./roof-usa.png", { width: 1200 }),
          alt: "Wood shingle gable roof on a timber house",
          caption: "A triangle with a porch implicit. The gable is the face."
        },
        paragraphs: [
          "Colonial, Federal, and later Craftsman houses all use the gable, but the shingle coat became a New England and then a national image: small units, weathered grey, a roof that is also a wall in some Shingle Style work.",
          "Dormers appear, but they are not a mansard. The American attic is often leftover storage until someone converts it. The porch, not the attic, is the extra room."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "left",
          src: siteSrc("./selector-usa.png", { width: 480 }),
          alt: "Detail of wood shingles on a gable roof",
          caption: "Overlapping units. Each shingle is a small, replaceable eave."
        },
        paragraphs: [
          "Balloon and then platform framing made roofs into triangles anyone could nail. Rafters, ridge, collar ties, sheathing, felt, shingles. The genius is logistical: dimensional lumber, pattern books, and later mail-order houses.",
          "Shingles fail by the piece, which is a virtue. Ice dams, in cold states, are the climatic critic. Ventilation of the attic and a clean eave detail matter more than the profile you sketch in a presentation."
        ]
      },
      {
        heading: "An ordinary skyline",
        paragraphs: [
          "France turned the attic into urban law. America turned the gable into a kit. Neither is naïve. If you only study palaces, you will miss how this roof organised suburbs, farms, and the porch as a social room.",
          "Related: UK thatch is the pre-industrial cousin, thick and vegetal. The US shingle is thin, dry, and industrial even when it pretends to be cottage."
        ]
      }
    ],
    related: ["france", "uk"]
  },

  brazil: {
    typology: "Colonial terracotta and the Atlantic house",
    setting: "Heat, Portuguese inheritance, clay tiles",
    lead:
      "Brazilian colonial roofs wear terracotta like a tanned hide. White walls, deep eaves or verandas, sometimes a little classical punch at the ridge. The tile is Portuguese in memory and tropical in use.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "left",
          src: siteSrc("./roof-brazil.png", { width: 1200 }),
          alt: "Terracotta tiled Brazilian colonial roof with white walls",
          caption: "Clay scales over a white box. Heat hits the tile, not the room."
        },
        paragraphs: [
          "The telha colonial, a curved clay tile, makes a corrugated plane that shades itself. White lime walls bounce light. In town churches and fazenda houses you also get volutes, acroteria, and a baroque gable that is more theatre than tile.",
          "Compared with an Italian cupola, this skyline is usually lower and more horizontal. The civic gesture is a façade and a courtyard, not a dome you steer by from ten streets away."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "right",
          src: siteSrc("./selector-brazil.png", { width: 480 }),
          alt: "Detail of terracotta roof tiles",
          caption: "Pan and cover. Wind and rain have to climb the corrugation."
        },
        paragraphs: [
          "Timber trusses, often simple, take a board or lath deck. Tiles overlap in channels. In heavy rain the channels are the roof. In sun the air under the tile is the first thermal break. Ceramic roofs in the tropics fail when people flatten the pitch or block the eave ventilation.",
          "Portuguese Atlantic building brought the tile; local woods, labour, and climate rewrote the veranda. The Brazilian house of this family is as much porch as it is hall."
        ]
      },
      {
        heading: "Heat, again",
        paragraphs: [
          "India’s dome fights glare with mass and white stone. Brazil’s colonial tile fights heat with a ventilated ceramic skin and shadow on the veranda. Same problem, different budget of materials.",
          "If you cross-reference Italy, take the terracotta and leave the lantern. If you cross-reference the USA, take the porch and leave the shingle."
        ]
      }
    ],
    related: ["italy", "india"]
  },

  iran: {
    typology: "Badgir windcatcher and courtyard roof",
    setting: "Hot arid cities, Yazd and the desert edge",
    lead:
      "The Iranian roof here is not only a lid. It is a set of towers that breathe. Badgirs catch wind, pull it down, and send hot air out. The courtyard is a well of shade. The roof is an instrument.",
    sections: [
      {
        heading: "Form",
        figure: {
          side: "right",
          src: siteSrc("./roof-iran.png", { width: 1200 }),
          alt: "Iranian courtyard roofs with badgir windcatcher towers",
          caption: "Towers as lungs. The skyline is a climate diagram."
        },
        paragraphs: [
          "From the alley you see mud-brick or ochre walls, almost blind. From above, the city is courtyards and windcatchers. The badgir is a vertical shaft with openings aimed at favoured winds. It is more chimney than minaret, though it can be beautiful enough to be mistaken for one.",
          "Domes and vaults appear too, especially over halls and cisterns. The drawing on this stage emphasises the towers and the flat or low terrace, the working roof of a desert house."
        ]
      },
      {
        heading: "How it is built",
        figure: {
          side: "left",
          src: siteSrc("./selector-iran.png", { width: 480 }),
          alt: "Detail of windcatcher towers on a desert roof",
          caption: "Openings with a direction. A tower that is useless if it faces the wrong wind."
        },
        paragraphs: [
          "Thick masonry, often adobe or fired brick with plaster, delays the day’s heat. The badgir’s internal baffles split incoming air. In some houses the stream passes a basement pool or a qanat-fed space so evaporation cools it further. Night air flushes the mass.",
          "This only works as a system: courtyard, thick wall, windcatcher, water if you have it, and a roof terrace used at night. Isolate the tower as a shape and you have a souvenir. Keep the section and you have air-conditioning without a machine."
        ]
      },
      {
        heading: "Wind versus felt",
        paragraphs: [
          "Kazakhstan’s yurt also lives with hard climate, but it leaves. The badgir stays and mines the air that crosses the city. One is portable wool. One is standing earth. Both are complete answers.",
          "India’s dome is the other heat cousin in this guide: mass and white shade without the tower. Read the three sections together and you have a small studio on pre-mechanical cooling."
        ]
      }
    ],
    related: ["kazakhstan", "india"]
  }
};

export function getGuide(id) {
  return GUIDES[id] || GUIDES.china;
}
