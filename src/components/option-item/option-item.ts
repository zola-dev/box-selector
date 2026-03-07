import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, combineLatest, map } from 'rxjs';
import { type OptionId } from '../../models/options.model';
import { BoxState } from '../../services/box-state';
import { SelectionUi } from '../../services/selection-ui';

/**
 * Single option in the selector. Input: optionId; selection state from BoxState + SelectionUi.
 * Click emits via BoxState.onOptionSelected (no @Output).
 */
@Component({
  selector: 'app-option-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe],
  templateUrl: './option-item.html',
  styleUrls: ['./option-item.css'],
})
export class OptionItem implements OnInit {
  @Input({ required: true }) optionId!: OptionId;

  private readonly boxStateService = inject(BoxState);
  private readonly selectionUiService = inject(SelectionUi);

  // Static — set once in ngOnInit, never changes
  label = '';
  value = '';

  // Reactive — only what actually changes needs to be an observable
  isSelected$!: Observable<boolean>;

  ngOnInit(): void {
    const option = this.boxStateService.options.find((o) => o.id === this.optionId)!;
    this.label = option.label;
    this.value = option.value;

    this.isSelected$ = combineLatest([
      this.selectionUiService.activeBoxId$,
      this.boxStateService.selections$,
    ]).pipe(
      map(([activeBoxId, selections]) => {
        if (activeBoxId === null) return false;
        return selections[activeBoxId] === this.optionId;
      }),
    );
  }

  onOptionClick(): void {
    const activeBoxId = this.selectionUiService.getActiveBoxIdSnapshot();
    if (activeBoxId === null) return;
    this.boxStateService.onOptionSelected(activeBoxId, this.optionId);
  }
}
