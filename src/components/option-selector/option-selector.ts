import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { BoxState } from '../../services/box-state';
import { SelectionUi } from '../../services/selection-ui';
import { OptionItem } from '../option-item/option-item';

/**
 * OptionSelectorComponent
 *
 * Displays the list of available options when a box is active.
 * Has NO inputs — it reads the active box from SelectionUiService
 * and renders one OptionItemComponent per available option.
 *
 * Visibility is controlled by the parent via @if on activeBoxId$.
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
  // Static list of option ids — passed down to OptionItemComponents
  readonly optionIds = this.boxStateService.options.map((o) => o.id);
}
