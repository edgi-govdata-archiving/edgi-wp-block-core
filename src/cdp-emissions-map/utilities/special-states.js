//offsets for states that are small / irregularly shaped

//will create pill at this offset
const SMALL_STATES = {
	"DC": {
		"name" : "DC",
		"abbr" : "DC",
		"pillX" : 860,
		"pillY" : 320
	},
	"DE": {
		"name" : "Delaware",
		"abbr" : "DE",
		"pillX" : 860,
		"pillY" : 280
	},
	"CT": {
		"name" : "Connecticut",
		"abbr" : "CT",
		"pillX" : 865,
		"pillY" : 240
	},

	"RI": {
		"name" : "Rhode Island",
		"abbr" : "RI",
		"pillX" : 910,
		"pillY" : 205
	},
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
