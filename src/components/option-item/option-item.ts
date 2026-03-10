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

  /**
   * Whether this option is currently selected for the active slot.
   * Delegates to SelectionUi.isOptionSelected for clean separation of concerns.
   *
   * NOTE: Each OptionItem creates its own computed signal wrapping isOptionSelected.
   * This means N options = N computed signals. For a larger dataset, isSelected would
   * be derived once in the store and passed down as a boolean input() — reducing
   * computeds to 1. Kept here due to assignment constraint: state must live in services.
   */
  readonly isSelected = computed(() => this.selectionUi.isOptionSelected(this.coffeeId()));

  /**
   * Delegates the option click to SelectionUi.onOptionClick,
   * which persists the selection and advances to the next slot.
   */
  onOptionClick(): void {
    this.selectionUi.onOptionClick(this.coffeeId());
  }
}
