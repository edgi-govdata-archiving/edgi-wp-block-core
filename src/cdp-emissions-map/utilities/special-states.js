//offsets for states that are small / irregularly shaped

//will create pill at this offset
const SMALL_STATES = {
	"DC": {
		"abbr" : "DC",
		"pillX" : 870,
		"pillY" : 340
	},
	"DE": {
		"abbr" : "DE",
		"pillX" : 880,
		"pillY" : 290
	},
	"CT": {
		"abbr" : "CT",
		"pillX" : 885,
		"pillY" : 240
	},
	"MA": {
		"abbr" : "MA",
		"pillX" : 915,
		"pillY" : 190
	},
	"MD": {
		"abbr" : "MD",
		"pillX" : 880,
		"pillY" : 315
	},
	"NH": {
		"abbr" : "NH",
		"pillX" : 900,
		"pillY" : 165
	},
	"NJ": {
		"abbr" : "NJ",
		"pillX" : 900,
		"pillY" : 265
	},
	"RI": {
		"abbr" : "RI",
		"pillX" : 915,
		"pillY" : 215
	},
	"VT": {
		"abbr" : "VT",
		"pillX" : 915,
		"pillY" : 135
	}
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
