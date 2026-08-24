//offsets for states that are small / irregularly shaped

//will create pill at this offset
const SMALL_STATES = {
	"DC": {
		"name" : "DC",
		"abbr" : "DC",
		"pillX" : 860,
		"pillY" : 340
	},
	"DE": {
		"name" : "Delaware",
		"abbr" : "DE",
		"pillX" : 850,
		"pillY" : 290
	},
	"CT": {
		"name" : "Connecticut",
		"abbr" : "CT",
		"pillX" : 865,
		"pillY" : 240
	},
	// "MA": {
	// 	"name" : "Massachusetts",
	// 	"abbr" : "MA",
	// 	"pillX" : 915,
	// 	"pillY" : 190
	// },
	// "MD": {
	// 	"name" : "Maryland",
	// 	"abbr" : "MD",
	// 	"pillX" : 880,
	// 	"pillY" : 315
	// },
	// "NH": {
	// 	"name" : "New Hampshire",
	// 	"abbr" : "NH",
	// 	"pillX" : 900,
	// 	"pillY" : 165
	// },
	// "NJ": {
	// 	"name" : "New Jersey",
	// 	"abbr" : "NJ",
	// 	"pillX" : 900,
	// 	"pillY" : 265
	// },
	"RI": {
		"name" : "Rhode Island",
		"abbr" : "RI",
		"pillX" : 910,
		"pillY" : 210
	},
	// "VT": {
	// 	"name" : "Vermont",
	// 	"abbr" : "VT",
	// 	"pillX" : 915,
	// 	"pillY" : 135
	// }
};

//offsets state label that would otherwise be at centroid 0,0
const IRREGULAR_STATES = {
 	"MI": {
		"centroidX": 18,
		"centroidY": 24
	},
	"FL": {
		"centroidX": 14,
		"centroidY": 0
	},
	"LA": {
		"centroidX": 10,
		"centroidY": 15
	}
};

exports.SMALL_STATES = SMALL_STATES;
exports.IRREGULAR_STATES = IRREGULAR_STATES;
