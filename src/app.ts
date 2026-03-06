import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BoxList } from './components/box-list/box-list';
import { OptionSelector } from './components/option-selector/option-selector';
import { BoxState } from './services/box-state';
import { SelectionUi } from './services/selection-ui';
import { map } from 'rxjs/operators';

/**
 * AppComponent
 *
 * Shell component — thin orchestration layer.
 * Contains the box grid, the option selector panel, and the clear button.
 * All logic lives in services.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, BoxList, OptionSelector],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly boxStateService = inject(BoxState);
  private readonly selectionUiService = inject(SelectionUi);

  // Drive @if in the template — null means no active box (falsy), a number means active (truthy)
  // readonly hasActiveBox$ = this.selectionUiService.activeBoxId$;
  readonly hasActiveBox$ = this.selectionUiService.activeBoxId$.pipe(
    map((id) => id !== null) // 0 becomes true, null becomes false
  );
  onClearAll(): void {
    this.boxStateService.clearAll();
    this.selectionUiService.clearActiveBox();
  }
}
