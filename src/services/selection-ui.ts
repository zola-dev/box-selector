import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { CoffeeId, SLOT_COUNT, type SlotId } from '../models/options.model';
import { BoxState } from './box-state';

/**
 * SelectionUi — NgRx SignalStore for purely transient UI state:
 *  - Which slot is currently "active" (showing the option selector)
 *
 * Keeping this separate from BoxState makes the distinction clear:
 * BoxState = persisted domain state
 * SelectionUi = transient UI state
 *
 * State is mutated directly via patchState() in response to user events.
 * Components read state via signals directly.
 */
export const SelectionUi = signalStore(
  { providedIn: 'root' },

  withState({
    /** The currently active slot id, or null if no slot is selected. */
    activeSlotId: null as SlotId | null,
  }),

  withComputed(({ activeSlotId }) => ({
    /**
     * Whether any slot is currently active.
     * Used by App to show/hide the OptionSelector panel.
     */
    hasActiveSlot: computed(() => activeSlotId() !== null),
  })),

  withMethods(({ activeSlotId, ...store }) => {
    const boxState = inject(BoxState);
  
    return {
      /**
       * Called by Box when a slot is clicked.
       * Toggles the active slot — clicking the already-active slot closes the selector.
       * @param slotId — 0-based slot index to toggle
       * @returns void
       */
      onBoxClick(slotId: SlotId): void {
        const next = activeSlotId() === slotId ? null : slotId;
        patchState(store, { activeSlotId: next });
      },
  
      /**
       * Closes the option selector by clearing the active slot.
       * @returns void
       */
      clearActiveSlot(): void {
        patchState(store, { activeSlotId: null });
      },
  
      /**
       * Whether a given coffeeId is selected for the currently active slot.
       * Derived from activeSlotId and BoxState.selections — component does not need to combine these.
       * @param coffeeId — id of the coffee option to check
       * @returns boolean
       */
      isOptionSelected(coffeeId: CoffeeId): boolean {
        const slot = activeSlotId();
        if (slot === null) return false;
        return boxState.selections()[slot] === coffeeId;
      },
  
      /**
       * Handles a coffee option click — persists selection via BoxState and advances to next slot.
       * @param coffeeId — id of the coffee option to click
       * @returns void
       */
      onOptionClick(coffeeId: CoffeeId): void {
        const slot = activeSlotId();
        if (slot === null) return;
        boxState.onOptionSelected({ slotId: slot, coffeeId });
        const nextId = slot + 1;
        patchState(store, { activeSlotId: nextId < SLOT_COUNT ? nextId : slot });
      },
    };
  }),
);
