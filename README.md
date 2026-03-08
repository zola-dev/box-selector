# Box Selector (NgRx SignalStore)

Angular app: 10 boxes, each can hold one selected coffee option. Option selector appears when a box is active; selecting an option persists it and auto-advances to the next box. State is persisted in `localStorage` and restored on refresh.

## Assignment alignment

- **State in stores** — `BoxState` (selections, options, persistence, totalScore), `SelectionUi` (active slot) — both implemented as NgRx `signalStore()`.
- **Signals** — All state exposed as signals; components read them directly via `()` calls. No `async pipe`, no `Observable`, no `BehaviorSubject`.
- **Signal inputs** — Child components use `input.required<T>()` instead of `@Input()` as required by the assignment.
- **Minimal inputs/outputs** — Children receive only ids (`slotId`, `coffeeId`); they read state from stores. No `@Output`; clicks go directly to store methods.
- **Component split** — App → BoxList → Box; App → OptionSelector → OptionItem (each in its own component).
- **Angular** — Latest (21.x), standalone, `@if`/`@for`, `[class]`/`[style]`, OnPush, zoneless.

## Architecture
```
App (shell)
├── BoxList          → reads boxIds() from BoxState, renders <app-box [slotId]>
│   └── Box          → reads selectedOption() + isActive() from stores, clicks → SelectionUi.onBoxClick
├── OptionSelector   → visible when selectionUi.hasActiveSlot(), reads options() from BoxState
│   └── OptionItem   → [coffeeId] signal input, reads isSelected() from stores, clicks → BoxState.onOptionSelected
└── Clear button     → BoxState.clearAll() + SelectionUi.clearActiveSlot()

State flow:
  box click    → SelectionUi.onBoxClick()     → patchState (toggle activeSlotId)
  option click → BoxState.onOptionSelected()  → patchState (persist selection)
               → SelectionUi.advanceToNextSlot() → patchState (advance activeSlotId)
```

## Run
```bash
npm install
npm start
```

Open the URL shown (e.g. `http://localhost:4201`).

## Build
```bash
npm run build
```

## Tech

- Angular 21 (standalone, zoneless, OnPush)
- NgRx Signals (signalStore, withState, withComputed, withMethods, patchState)
- Signal inputs (input.required)
- Computed signals (computed)