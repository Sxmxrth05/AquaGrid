export const initialZones = [
  { id: 1, crop: "Tomato", stage: "Flowering", soil: "OK", moisture: 58, waterNeed: 0, priority: "LOW", area: "0.8 ha", delivered: 0, target: 0 },
  { id: 2, crop: "Tomato", stage: "Flowering", soil: "DRY", moisture: 29, waterNeed: 2400, priority: "HIGH", area: "0.8 ha", delivered: 0, target: 2400 },
  { id: 3, crop: "Chilli", stage: "Vegetative", soil: "OK", moisture: 51, waterNeed: 0, priority: "LOW", area: "0.6 ha", delivered: 0, target: 0 },
  { id: 4, crop: "Beans", stage: "Fruiting", soil: "WET", moisture: 74, waterNeed: 0, priority: "LOW", area: "0.7 ha", delivered: 0, target: 0 }
];

export const initialHistory = [
  { time: "06:20", zone: "Zone 3", water: 1200, energy: 1.1 },
  { time: "09:30", zone: "Zone 1", water: 1800, energy: 1.4 },
  { time: "Yesterday", zone: "Zone 4", water: 1600, energy: 1.3 }
];

export const energyData = [
  { time: "06:00", energy: 0.4, solar: 1.2 },
  { time: "08:00", energy: 0.8, solar: 1.7 },
  { time: "10:00", energy: 1.4, solar: 2.1 },
  { time: "12:00", energy: 2.0, solar: 2.8 },
  { time: "14:00", energy: 2.6, solar: 2.5 },
  { time: "16:00", energy: 3.1, solar: 1.9 },
  { time: "18:00", energy: 3.5, solar: 0.8 }
];

export const waterData = [
  { day: "Mon", water: 9.2 },
  { day: "Tue", water: 11.5 },
  { day: "Wed", water: 8.8 },
  { day: "Thu", water: 13.1 },
  { day: "Fri", water: 10.6 },
  { day: "Sat", water: 12.4 },
  { day: "Sun", water: 9.8 }
];