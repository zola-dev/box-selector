import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, combineLatest, map } from 'rxjs';
import { type CoffeeId } from '../../models/options.model';
import { BoxState } from '../../services/box-state';
import { SelectionUi } from '../../services/selection-ui';

/**
 * Single option in the selector. Input: coffeeId; selection state from BoxState + SelectionUi.
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
  @Input({ required: true }) coffeeId!: CoffeeId;

  private readonly boxStateService = inject(BoxState);
  private readonly selectionUiService = inject(SelectionUi);

  // Static — set once in ngOnInit, never changes
  label = '';
  value = '';

  // Reactive — only what actually changes needs to be an observable
  isSelected$!: Observable<boolean>;

  ngOnInit(): void {
    const option = this.boxStateService.getOption(this.coffeeId)!;
    this.label = option.label;
    this.value = option.value;

    this.isSelected$ = combineLatest([
      this.selectionUiService.activeBoxId$,
      this.boxStateService.selections$,
    ]).pipe(
      map(([activeBoxId, selections]) => {
        if (activeBoxId === null) return false;
        return selections[activeBoxId] === this.coffeeId;
      }),
    );
  }

  onOptionClick(): void {
    const activeBoxId = this.selectionUiService.getActiveBoxIdSnapshot();
    if (activeBoxId === null) return;
    this.boxStateService.onOptionSelected(activeBoxId, this.coffeeId);
  }
}
