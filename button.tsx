{
  "regionalSpread": {
    "bus": [
      { "region": "North", "count": 148 },
      { "region": "West", "count": 96 },
      { "region": "South", "count": 72 },
      { "region": "East", "count": 39 }
    ],
    "auto": [
      { "region": "Metro", "count": 412 },
      { "region": "Tier 2", "count": 268 },
      { "region": "Industrial", "count": 94 },
      { "region": "Rural", "count": 51 }
    ],
    "pickup": [
      { "region": "Metro", "count": 211 },
      { "region": "Tier 2", "count": 134 },
      { "region": "Industrial", "count": 88 },
      { "region": "Coastal", "count": 22 }
    ],
    "truck": [
      { "region": "Highway Corridor", "count": 64 },
      { "region": "Industrial", "count": 47 },
      { "region": "Port Routes", "count": 28 },
      { "region": "Tier 2", "count": 11 }
    ]
  },
  "highlights": {
    "bus": [
      { "label": "Fleet Uptime", "value": "98.2%" },
      { "label": "CO2 Avoided", "value": "2.1M kg" },
      { "label": "Avg Real Range", "value": "294 km" },
      { "label": "Lower OpEx", "value": "38%" }
    ],
    "auto": [
      { "label": "Vehicles Active", "value": "825" },
      { "label": "Energy Cost", "value": "₹0.9/km" },
      { "label": "Avg Daily Run", "value": "96 km" },
      { "label": "Driver Earnings Up", "value": "22%" }
    ],
    "pickup": [
      { "label": "Units Deployed", "value": "455" },
      { "label": "Energy Cost", "value": "₹1.6/km" },
      { "label": "Avg Daily Run", "value": "110 km" },
      { "label": "Remote Resolve", "value": "84%" }
    ],
    "truck": [
      { "label": "Units Active", "value": "150" },
      { "label": "Cost / Tonne-km", "value": "₹2.1" },
      { "label": "Avg Trip Length", "value": "180 km" },
      { "label": "Uptime", "value": "95.4%" }
    ]
  },
  "issues": {
    "bus": [
      {
        "id": "BUS-01",
        "title": "AC compressor noise at high load",
        "severity": "Minor",
        "status": "Resolved",
        "desc": "Rattling under sustained high load in peak summer.",
        "action": "Mounting dampeners replaced across Q2 batch; firmware capped peak draw."
      },
      {
        "id": "BUS-02",
        "title": "BMS over-temp false positives",
        "severity": "Critical",
        "status": "Resolved",
        "desc": "False alerts within safe temp range caused route stops.",
        "action": "OTA threshold recalibration; polling interval reduced to 1s."
      }
    ],
    "auto": [
      {
        "id": "AUTO-01",
        "title": "Regen braking jerk at low speed",
        "severity": "Minor",
        "status": "Resolved",
        "desc": "Abrupt deceleration below 12 km/h in early units.",
        "action": "Regen curve smoothed via OTA below 18 km/h."
      },
      {
        "id": "AUTO-02",
        "title": "Seat frame rattle on rough roads",
        "severity": "Minor",
        "status": "In Progress",
        "desc": "Reported on unpaved-route operators in 3 cities.",
        "action": "Reinforced bracket in design validation, rollout next batch."
      }
    ],
    "pickup": [
      {
        "id": "PUMA-01",
        "title": "Cargo latch corrosion — coastal units",
        "severity": "Minor",
        "status": "In Progress",
        "desc": "Early corrosion in high-humidity coastal deployments.",
        "action": "Marine-grade hardware sourced; 48 units retrofitted."
      },
      {
        "id": "PUMA-02",
        "title": "Charging inlet pin wear",
        "severity": "Critical",
        "status": "Resolved",
        "desc": "Accelerated wear after 800+ cycles on early batches.",
        "action": "Reinforced inlet spec from Batch 4; earlier units retrofitted under warranty."
      }
    ],
    "truck": [
      {
        "id": "HD-01",
        "title": "Battery thermal derate on long highway runs",
        "severity": "Critical",
        "status": "In Progress",
        "desc": "Power derates after 2.5 hrs continuous highway load.",
        "action": "Upgraded thermal loop in validation; interim route advisory issued."
      },
      {
        "id": "HD-02",
        "title": "Cabin door seal wind noise",
        "severity": "Minor",
        "status": "Resolved",
        "desc": "Wind noise above 70 km/h reported by drivers.",
        "action": "Seal profile updated; applied to all units in service."
      }
    ]
  },
  "training": {
    "bus": {
      "sessions": [
        { "label": "Driver Induction — Pune", "date": "Feb 2025" },
        { "label": "BMS Diagnostics Workshop", "date": "Jan 2025" },
        { "label": "HV Safety Bootcamp", "date": "Sep 2024" }
      ],
      "stats": [
        { "label": "Trainees", "value": "450" },
        { "label": "Sessions", "value": "38" },
        { "label": "Satisfaction", "value": "94%" }
      ]
    },
    "auto": {
      "sessions": [
        { "label": "Driver Onboarding — Mumbai", "date": "Mar 2025" },
        { "label": "Charging Network Walkthrough", "date": "Jan 2025" },
        { "label": "Earnings App Training", "date": "Nov 2024" }
      ],
      "stats": [
        { "label": "Trainees", "value": "610" },
        { "label": "Sessions", "value": "52" },
        { "label": "Satisfaction", "value": "91%" }
      ]
    },
    "pickup": {
      "sessions": [
        { "label": "Loading Drills — Chennai", "date": "Feb 2025" },
        { "label": "Cargo Securing Certification", "date": "Dec 2024" },
        { "label": "City Route Simulation", "date": "Oct 2024" }
      ],
      "stats": [
        { "label": "Trainees", "value": "290" },
        { "label": "Sessions", "value": "24" },
        { "label": "Satisfaction", "value": "93%" }
      ]
    },
    "truck": {
      "sessions": [
        { "label": "Highway Driver Certification", "date": "Mar 2025" },
        { "label": "Thermal System Workshop", "date": "Jan 2025" },
        { "label": "Fleet Manager Summit", "date": "Aug 2024" }
      ],
      "stats": [
        { "label": "Trainees", "value": "95" },
        { "label": "Sessions", "value": "14" },
        { "label": "Satisfaction", "value": "96%" }
      ]
    }
  },
  "generatedAt": "2025-01-01T00:00:00.000Z"
}
