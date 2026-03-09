import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { type CoffeeId } from '../../models/options.model';
import { BoxState } from '../../services/box-state';
import { SelectionUi } from '../../services/selection-ui';

/**
 * OptionItem
 *
 * Single selectable coffee option inside OptionSelector.
 *
 * Receives only its `coffeeId` as a signal input — all state is derived
 * from SignalStores using that id.
 * Click is forwarded directly to BoxState and SelectionUi.
 */
@Component({
  selector: 'app-option-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './option-item.html',
  styleUrls: ['./option-item.css'],
})
export class OptionItem {
  /** Signal input. */
  readonly coffeeId = input.required<CoffeeId>();

  private readonly boxState = inject(BoxState);
  private readonly selectionUi = inject(SelectionUi);

  /**
   * The CoffeeOption resolved from the static list for this coffeeId, or null if not found.
   */
  readonly option = computed(() => this.boxState.getOption(this.coffeeId()));

  /**
   * The display label of this coffee option (e.g. 'Espresso', 'Cold Brew').
   * Derived from the option computed signal.
   */
  readonly label = computed(() => this.option()?.label ?? '');

  /**
   * The descriptive value of this coffee option (e.g. 'pure shot', 'silky milk').
   * Derived from the option computed signal.
   */
  readonly value = computed(() => this.option()?.value ?? '');

  //NOTE: Each OptionItem creates its own computed signal (activeSlotId + selections).
  //This means N options = N computed signals. For a larger dataset, isSelected would be derived 
  // once in the service or parent and passed downas a boolean input() — reducing computeds to 1.
  //Kept here due to assignment constraint: no @Output, state must live in services.
  /**
   * Whether this option is currently selected for the active slot.
   * Recomputes automatically when activeSlotId or selections change.
   */
  readonly isSelected = computed(() => {
    const activeSlotId = this.selectionUi.activeSlotId();
    if (activeSlotId === null) return false;
    return this.boxState.selections()[activeSlotId] === this.coffeeId();
  });

  /**
   * Handles a click on this option:
   * 1. Persists the selection via BoxState.onOptionSelected
   * 2. Advances focus to the next slot via SelectionUi.advanceToNextSlot
   *
   * Active slot id is read synchronously from the signal.
   */
  onOptionClick(): void {
    const activeSlotId = this.selectionUi.activeSlotId();
    if (activeSlotId === null) return;
    this.boxState.onOptionSelected({ slotId: activeSlotId, coffeeId: this.coffeeId() });
    this.selectionUi.advanceToNextSlot(activeSlotId);
  }
}
