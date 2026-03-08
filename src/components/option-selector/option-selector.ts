import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { type CoffeeId } from '../../models/options.model';
import { BoxState } from '../../services/box-state';
import { SelectionUi } from '../../services/selection-ui';
import { OptionItem } from '../option-item/option-item';

/**
 * OptionSelector
 *
 * Displays the list of available coffee options when a slot is active.
 * Reads the active slot from SelectionUi signal store
 * and the option list from BoxState signal store.
 *
 * Visibility is controlled by the parent (App) via hasActiveBox computed signal.
 * Signals are read directly in the template.
 */
@Component({
  selector: 'app-option-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OptionItem],
  templateUrl: './option-selector.html',
  styleUrls: ['./option-selector.css'],
})
export class OptionSelector {
  private readonly boxState = inject(BoxState);
  private readonly selectionUi = inject(SelectionUi);

  /**
   * Label for the currently active slot.
   * Returns null when no slot is active (selector is hidden by parent).
   */
  readonly activeBoxLabel = computed(() => {
    const id = this.selectionUi.activeSlotId();
    return id !== null ? id + 1 : null;
  });

  /**
   * Static list of coffee option ids — passed to each OptionItem as input.
   * Read once from BoxState since options never change at runtime.
   */
  readonly optionIds: readonly CoffeeId[] = this.boxState.options().map((o) => o.id);
}
