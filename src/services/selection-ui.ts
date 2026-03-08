import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { SLOT_COUNT, type SlotId } from '../models/options.model';

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

  withMethods(({ activeSlotId, ...store }) => ({
    /**
     * Called by Box when a slot is clicked.
     * Toggles the active slot — clicking the already-active slot closes the selector.
     * @param slotId — 0-based slot index
     */
    onBoxClick(slotId: SlotId): void {
      const next = activeSlotId() === slotId ? null : slotId;
      patchState(store, { activeSlotId: next });
    },

    /**
     * Advances focus to the next slot after an option is selected.
     * Called by OptionItem after selection.
     * If the last slot was just selected, stays on it so the user can immediately change their selection.
     * @param currentSlotId — 0-based index of the slot that was just selected
     */
    advanceToNextSlot(currentSlotId: SlotId): void {
      const nextId = currentSlotId + 1;
      patchState(store, { activeSlotId: nextId < SLOT_COUNT ? nextId : currentSlotId });
    },

    /**
     * Closes the option selector by clearing the active slot.
     */
    clearActiveSlot(): void {
      patchState(store, { activeSlotId: null });
    },
  })),
);
