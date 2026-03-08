import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { type CoffeeId } from '../../models/options.model';
import { BoxState } from '../../services/box-state';
import { SelectionUi } from '../../services/selection-ui';
import { OptionItem } from '../option-item/option-item';

/**
 * Displays the list of available options when a box is active.
 * No inputs — reads active box from SelectionUi and option list from BoxState;
 * renders one OptionItem per option. Visibility controlled by parent (App) via hasActiveBox$, derived from activeBoxId$.
 */
@Component({
  selector: 'app-option-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, OptionItem],
  templateUrl: './option-selector.html',
  styleUrls: ['./option-selector.css'],
})
export class OptionSelector {
  private readonly boxStateService = inject(BoxState);
  private readonly selectionUiService = inject(SelectionUi);
  readonly activeBoxLabel$ = this.selectionUiService.activeBoxId$.pipe(
    map((id) => (id !== null ? id + 1 : null)),
  );
  /** CoffeeOption ids passed to each OptionItem (from BoxState.options). */
  readonly optionIds: readonly CoffeeId[] = this.boxStateService.options.map((o) => o.id);
}
