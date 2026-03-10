import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
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
  public test = 'test';
  /**
   * Whether this option is currently selected for the active box.
   * 
   * NOTE: Each OptionItem creates its own combineLatest stream (activeBoxId$ + selections$).
   * This means N options = N streams. For a larger dataset, isSelected would be derived
   * once in the service or parent and passed down as a boolean @Input — reducing N streams to 1.
   * Kept here due to assignment constraint: no @Output, state must live in services.
   */
  isSelected$!: Observable<boolean>;

  ngOnInit(): void {
    const option = this.boxStateService.getOption(this.coffeeId)!;
    this.label = option.label;
    this.value = option.value;
    this.isSelected$ = this.selectionUiService.isOptionSelected$(this.coffeeId);
  }

  onOptionClick(): void {
    this.selectionUiService.onOptionClick(this.coffeeId);
  }
}
