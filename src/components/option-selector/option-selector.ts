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
  template: `

      <div class="option-selector" role="listbox">
        <h3 class="option-selector__title">Box {{ activeBoxLabel$ | async }} — choose an option</h3>
        <div class="option-selector__list">
          @for (optionId of optionIds; track optionId) {
            <app-option-item [optionId]="optionId" />
          }
        </div>
      </div>
 
  `,
  styles: [
    `
    .option-selector {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px;
      background: #fff;
      min-width: 280px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .option-selector__title {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    .option-selector__list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 320px;
      overflow-y: auto;
    }
  `,
  ],
})
export class OptionSelector {
  private readonly boxStateService = inject(BoxState);
  private readonly selectionUiService = inject(SelectionUi);

  // Human-readable label for the active box (1-based)
  readonly activeBoxLabel$ = this.selectionUiService.activeBoxId$.pipe(
    map((id) => (id !== null ? id + 1 : null))
  );

  // Static list of option ids — passed down to OptionItemComponents
  readonly optionIds = this.boxStateService.options.map((o) => o.id);
}
