/** 0-based index of a coffee slot in the order (0..SLOT_COUNT-1). */
export type SlotId = number;

/** Id of a coffee option (e.g. 'coffee-1'). */
export type CoffeeId = string;

/** Map from slot id to selected coffee id (or null). Persisted to localStorage. */
export type OrderMap = Record<SlotId, CoffeeId | null>;

/** A single coffee option with caffeine level as score. */
export interface CoffeeOption {
  id: CoffeeId;
  label: string;
  value: string;
  score: number; // caffeine in mg
}

/** Payload emitted on coffeeSelected$ when the user picks a coffee for a slot. */
export interface CoffeeSelectionEvent {
  slotId: SlotId;
  coffeeId: CoffeeId;
}

export const COFFEE_OPTIONS: CoffeeOption[] = [
  { id: 'coffee-1', label: 'Espresso', value: 'pure shot', score: 63 },
  { id: 'coffee-2', label: 'Double Espresso', value: 'double shot', score: 126 },
  { id: 'coffee-3', label: 'Americano', value: 'long black', score: 75 },
  { id: 'coffee-4', label: 'Cappuccino', value: 'foamy milk', score: 63 },
  { id: 'coffee-5', label: 'Flat White', value: 'silky milk', score: 130 },
  { id: 'coffee-6', label: 'Latte', value: 'milky', score: 75 },
  { id: 'coffee-7', label: 'Macchiato', value: 'marked', score: 85 },
  { id: 'coffee-8', label: 'Mocha', value: 'chocolatey', score: 95 },
  { id: 'coffee-9', label: 'Cold Brew', value: 'ice cold', score: 200 },
  { id: 'coffee-10', label: 'Iced Latte', value: 'cold milky', score: 75 },
  { id: 'coffee-11', label: 'Cortado', value: 'half & half', score: 63 },
  { id: 'coffee-12', label: 'Ristretto', value: 'short shot', score: 55 },
  { id: 'coffee-13', label: 'Lungo', value: 'long shot', score: 80 },
  { id: 'coffee-14', label: 'Affogato', value: 'with gelato', score: 63 },
  { id: 'coffee-15', label: 'Vienna Coffee', value: 'with cream', score: 90 },
  { id: 'coffee-16', label: 'Irish Coffee', value: 'with whiskey', score: 63 },
  { id: 'coffee-17', label: 'Frappuccino', value: 'blended ice', score: 95 },
  { id: 'coffee-18', label: 'Turkish Coffee', value: 'unfiltered', score: 50 },
  { id: 'coffee-19', label: 'Decaf', value: 'no caffeine', score: 5 },
  { id: 'coffee-20', label: 'Matcha Latte', value: 'green tea', score: 70 },
];

/** Number of team members ordering coffee (slots 0..SLOT_COUNT-1). */
export const SLOT_COUNT = 10;

/** localStorage key for persisting the team coffee order. */
export const STORAGE_KEY = 'team-coffee-order';
