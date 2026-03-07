# Box Selector (RxJS)

Angular app: 10 boxes, each can hold one selected option. Option selector appears when a box is active; selecting an option persists it and auto-advances to the next box. State is persisted in `localStorage` and restored on refresh.

## Assignment alignment

- **State in services** — `BoxState` (selections, options, persistence), `SelectionUi` (active box).
- **Observables** — All state exposed as streams; components use `AsyncPipe` and derived observables.
- **Events as observables** — Box clicks → `boxClick$`; option clicks → `optionSelected$`. Services subscribe to these streams and react (toggle active box, persist, advance).
- **Minimal inputs/outputs** — Children receive only ids (`boxId`, `optionId`); they read state from services. No `@Output`; clicks go to services.
- **Component split** — App → BoxList → Box; App → OptionSelector → OptionItem (each in its own component).
- **Angular** — Latest (21.x), standalone, `@if`/`@for`, `[class]`/`[style]`, OnPush, zoneless.

## Architecture

```
App (shell)
├── BoxList          → reads boxIds from BoxState, renders <app-box [boxId]>
│   └── Box          → reads selection + active from services, clicks → SelectionUi.onBoxClick
├── OptionSelector   → visible when activeBoxId !== null, reads options from BoxState
│   └── OptionItem   → [optionId], reads isSelected from services, clicks → BoxState.onOptionSelected
└── Clear button     → BoxState.clearAll() + SelectionUi.clearActiveBox()

Event flow:
  box click     → boxClick$        → SelectionUi (toggle active box)
  option click  → optionSelected$  → BoxState (persist) + SelectionUi (advance to next box)
```

## Run

```bash
npm install
npm start
```

Open the URL shown (e.g. `http://localhost:4201`).

## Build & test

```bash
npm run build
npm test
```

## Tech

- Angular 21 (standalone, zoneless, OnPush)
- RxJS 7 (BehaviorSubject, Subject, async pipe, combineLatest, map, tap)
