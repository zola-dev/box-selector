import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  COFFEE_OPTIONS,
  CoffeeOption,
  CoffeeSelectionEvent,
  type CoffeeId,
  type SlotId,
  OrderMap,
  SLOT_COUNT,
  STORAGE_KEY,
} from '../models/options.model';

/**
 * BoxState — NgRx SignalStore, single source of truth for:
 *  - Which coffee is selected per slot (persisted to localStorage)
 *  - The full list of available coffee options
 *  - Derived total caffeine score
 *
 * State is exposed as signals — components read them directly via signal() calls.
 */
export const BoxState = signalStore(
  { providedIn: 'root' },

  withState({
    /** Map of slotId → selected coffeeId (or null). Persisted to localStorage. */
    selections: loadFromStorage() as OrderMap,
  }),

  withComputed(({ selections }) => ({
    /** Static list of all available coffee options. */
    options: computed(() => COFFEE_OPTIONS),

    /** Slot ids 0..SLOT_COUNT-1 for iteration in templates. */
    boxIds: computed(() => Array.from({ length: SLOT_COUNT }, (_, i) => i) as SlotId[]),

    /**
     * Sum of caffeine scores of all currently selected coffees.
     * Recomputes automatically when selections change.
     */
    totalScore: computed(() =>
      Object.values(selections())
        .filter((id): id is CoffeeId => id !== null)
        .reduce((sum, id) => sum + (optionMap.get(id)?.score ?? 0), 0),
    ),
  })),

  withMethods(({ selections, ...store }) => ({
    /**
     * Called by OptionItem when a coffee is clicked.
     * Persists the new selection to state and localStorage.
     * @param slotId — 0-based slot index
     * @param coffeeId — id of the selected coffee option
     */
    onOptionSelected({ slotId, coffeeId }: CoffeeSelectionEvent): void {
      const updated = updateSelection(selections(), slotId, coffeeId);
      patchState(store, { selections: updated });
      saveToStorage(updated);
    },

    /**
     * Returns the full CoffeeOption selected for a slot, or null if none.
     * @param slotId — 0-based slot index
     * @returns CoffeeOption | null
     */
    getSelectedOption(slotId: SlotId): CoffeeOption | null {
      const id = selections()[slotId];
      return id ? (optionMap.get(id) ?? null) : null;
    },
    
    /**
     * Returns the selected coffeeId for a slot, or null if none.
     * @param slotId — 0-based slot index
     * @returns CoffeeId | null
     */
    getSelectionForSlot(slotId: SlotId): CoffeeId | null {
      return selections()[slotId] ?? null;
    },

    /**
     * Clears all slot selections and persists empty state to localStorage.
     */
    clearAll(): void {
      patchState(store, { selections: {} as OrderMap });
      saveToStorage({} as OrderMap);
    },
  })),
);

/** O(1) lookup map from coffeeId → CoffeeOption. Avoids repeated O(n) find calls. */
const optionMap = new Map(COFFEE_OPTIONS.map((o) => [o.id, o]));

/**
 * Pure reducer — returns a new OrderMap with the given slot updated.
 * No side effects; all persistence is handled by the caller.
 */
function updateSelection(selections: OrderMap, slotId: SlotId, coffeeId: CoffeeId): OrderMap {
  return { ...selections, [slotId]: coffeeId };
}

/**
 * Loads persisted selections from localStorage on app init.
 * Returns empty object if storage is unavailable or corrupted.
 */
function loadFromStorage(): OrderMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persists the current selections map to localStorage.
 * Silently ignores errors.
 */
function saveToStorage(state: OrderMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
