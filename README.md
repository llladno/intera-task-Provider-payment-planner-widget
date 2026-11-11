# Provider Payment Planner Widget

An interactive, read-only dashboard widget for the **INTERA Core** platform. It plans payments to
providers from the `provider-payment-queue` data source (Enigma integration): the user chooses how many
of the first bills in the filtered queue to pay, and the widget shows per-currency totals and each
provider's share inside every currency.

Stack: React 19 · TypeScript 5 (strict, no `any`) · Vite 7 · Vitest 4. No runtime dependencies besides
React; no network access is needed — the sandbox runs on a bundled mock data set.

> The original task statement (in Russian) is kept in [`docs/TASK.ru.md`](docs/TASK.ru.md).

## Screenshots

| Size | Light | Dark |
| --- | --- | --- |
| **XL** `full` (4×2) | ![full light](docs/screenshots/full-light.png) | ![full dark](docs/screenshots/full-dark.png) |
| **L** `half` (3×2) | ![half light](docs/screenshots/half-light.png) | ![half dark](docs/screenshots/half-dark.png) |
| **M** `third` (2×2) | ![third light](docs/screenshots/third-light.png) | ![third dark](docs/screenshots/third-dark.png) |
| **S** `quarter` (1×2) | ![quarter light](docs/screenshots/quarter-light.png) | ![quarter dark](docs/screenshots/quarter-dark.png) |

Data states (`full`): [stale](docs/screenshots/full-state-stale.png) ·
[loading](docs/screenshots/full-state-loading.png) · [empty](docs/screenshots/full-state-empty.png) ·
[error](docs/screenshots/full-state-error.png). `quarter`:
[loading](docs/screenshots/quarter-state-loading.png) · [error](docs/screenshots/quarter-state-error.png).

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev        # interactive sandbox, http://localhost:5173
npm test           # unit tests (Vitest)
npm run typecheck  # TypeScript, strict
npm run build      # type-check + production build into dist/
```

The sandbox (`src/sandbox/`) lets you switch the card size (or show all four), the data state
(`ready`, `stale`, `refreshing`, `loading`, `empty`, `error`), the theme, and every widget parameter.

## Tests

`npm test` runs 74 tests in four files:

| File | Covers |
| --- | --- |
| `payment-planner.test.ts` | `parsePaymentPlannerParams` and `computePaymentPlan`: filter → sort → cut, invalid amounts, currencies never mixed, shares, ranks, overrides. |
| `payment-planner-format.test.ts` | Amount / percent / date / plural formatting. |
| `use-planner-state.test.tsx` | Interactive state: slider override, filters, row limit, and when overrides are dropped. |
| `payment-planner.ui.test.tsx` | The rendered widget (Testing Library + jsdom): every data state, all four sizes, slider / number input / filters, bill details and customer bills, the `quarter` currency overflow, the dialog, and state surviving a background refresh. |

UI tests use jsdom, which has no modal `<dialog>`; `src/test/setup-ui.ts` emulates `showModal()` /
`close()`.

## Usage

```tsx
import { PaymentPlannerWidget } from './widget/payment-planner';

<PaymentPlannerWidget
  params={{ selectedCount: 14, currencyIds: [643, 840], rowLimit: 25 }}
  data={collectionData} // ICollectionDataResult<IProviderPaymentQueueRow>
  size="third"          // optional, overrides params.size
/>
```

### Parameters

`params` is untyped on purpose (it comes from a dashboard layout). It is normalised by
`parsePaymentPlannerParams`, which never throws: every bad value falls back to its default.
Numeric params accept real numbers only, as typed in the task statement (`'7'` is an error, not `7`).

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `description` | `string` | `'Provider Payment Planner'` | Also reads `title`; trimmed. |
| `subtitle` | `string` | `''` | Trimmed. |
| `size` | `'full' \| 'half' \| 'third' \| 'quarter'` | `'full'` | Unknown value → `'full'`. The `size` prop wins over it. |
| `selectedCount` | `number` | `10` | Rounded, clamped to `>= 0`. Anything that is not a finite number (including `'7'`) → `10`. |
| `currencyIds` | `number[]` | `[]` | Unique finite numbers; empty = all currencies. |
| `providerId` | `number \| 'all'` | `'all'` | |
| `billingCycleId` | `number \| 'all'` | `'all'` | |
| `amountFormat` | `'grouped' \| 'plain'` | `'grouped'` | `1 248 500,00 ₽` or `1248500.00 ₽`. |
| `rowLimit` | `10 \| 25 \| 50 \| 100` | `10` | Reads `rowLimit`, then legacy `maxRows` if `rowLimit` is absent or not allowed. |
| `showCustomerBills` | `boolean` | `true` | Linked customer bills in the table and details. |
| `showProviderBreakdown` | `boolean` | `true` | Provider shares. |
| `showSummary` | `boolean` | `true` | Counters and per-currency totals. |

## Functionality

### Domain rules (implemented in `computePaymentPlan`)

1. **Filter → sort → cut.** `providerId`, `billingCycleId` and `currencyIds` narrow the queue *before*
   the first `selectedCount` bills are taken.
   `effectiveSelectedCount = min(max(0, selectedCount), filteredQueue.length)`.
2. **Sort order:** `payment_rank` ascending (a rank may be a number or a numeric string; missing or
   invalid ranks go last) → `provider_bill_id` ascending → original array order. `payment_rank` is
   numbered *per provider* in Enigma, so the bill id tie-break is what makes the queue deterministic.
3. **Invalid amounts.** `provider_total_due` that is `null`, `''`, `0`, negative or not numeric marks the bill
   `hasInvalidAmount`. The bill stays in the queue, takes its position in the cut, is flagged in the
   table, and is **excluded** from `currencyTotals` and `providerBreakdown` (never counted as `0`).
   `invalidSelectedCount` reports how many selected bills were excluded.
4. **Currencies are never mixed.** Totals are grouped by `provider_currency_id`; there is no conversion.
5. **Shares** are computed per `(provider, currency)` as `totalAmount / currencyTotal * 100`, so the
   shares of one currency sum to 100%. On screen they are shown as whole percents distributed with
   the largest remainder method, so the *displayed* numbers add up to exactly 100 too.
6. **Customer bills** are shown when `customer_bill_no` is non-empty *and* `customer_total_due` is a
   valid number.

### What each size shows

| Size | Content |
| --- | --- |
| `full` | Queue stats, slider + number input + `−`/`+`, in-widget filters (provider, cycle, currencies), per-currency totals, provider shares with a currency switch, the queue table with selected/invalid highlighting and expandable bill details (including the linked customer bill). A "Show more" link grows the table in `rowLimit` steps. |
| `half` | `N of M` indicator with the percentage, compact slider, all currencies, provider count, oldest selected bill, provider shares, "Open payment queue" (opens the full view in a dialog). |
| `third` | `N / M` counter, all currency totals, stacked provider strip with a currency switch, "Open details" (same dialog). |
| `quarter` | Selected count and the first two currencies. When more exist it shows an explicit `+ ещё N валюты (EUR, GBP)` line and an "All currencies" toggle — currencies are never hidden silently or summed. |

### Data states

| State | Behaviour |
| --- | --- |
| `loading && !loaded` | Skeleton inside the card. |
| `loading && loaded` | Widget stays mounted; slider position, filters, open bill details are preserved; "Обновление…" appears in the header. |
| `stale === true` | `<FreshnessMark source="rows" stale />` in the header (also when `loaded` is false). |
| `error && !loaded` | Error block (`role="alert"`). |
| `error && loaded` | Data stays, with a warning that the refresh failed. |
| `loaded && items.length === 0` | Empty state. |
| Filters match nothing | A dedicated "queue is empty for these filters" state with a reset button. |

## Architecture

```
src/
  widget/
    payment-planner-params.ts    params  → IPaymentPlannerConfig (defensive parsing, no React)
    payment-planner-compute.ts   rows + config + runtime state → IPaymentPlanResult (pure, no React/DOM)
    payment-planner-format.ts    amount / date / percent / plural formatting (pure)
    use-planner-state.ts         interactive state: slider, filters, row limit
    payment-planner-parts.tsx    presentational pieces (slider, totals, shares, table, states)
    payment-planner.tsx          PaymentPlannerWidget: wires the above, picks the layout per size
    payment-planner.css          styles, theme tokens only
    *.test.ts(x)                 Vitest unit and UI tests
  test/setup-ui.ts               jsdom setup for UI tests
  platform/                      INTERA primitives (theme, card, FreshnessMark, helpers) — provided
  sandbox/                       interactive playground — provided
```

Key decisions:

- **Three layers.** `params` and `compute` are plain TypeScript with no React or DOM, so all business
  rules are unit-tested without rendering. The view only formats and lays out what `compute` returns.
- **Runtime state vs. config.** Interactive changes (slider, quick filters, "show more") are passed to
  `computePaymentPlan` as `IPaymentPlannerRuntimeState` overrides and never mutate `params`. If the host
  edits the matching param, the override is dropped and the new param wins, so a stale slider never
  shadows a setting.
- **State survives refreshes.** The state lives in the widget, which is never unmounted while
  `loading && loaded`.
- **Money.** Amounts are accumulated in minor units (kopecks/cents) so that repeated additions do not
  drift; formatting is done with `Intl` and never converts between currencies.
- **Currency order** in the totals is the order of first appearance in the sorted queue.
- **Provider breakdown** is sorted by amount, descending.
- **Styling.** Only INTERA theme tokens (`src/platform/theme.css`), light and dark themes. Layout
  adapts via `data-size` and container queries, so it follows the card width rather than the viewport.
- **Accessibility.** Native controls, labelled slider with `aria-valuetext`, `aria-pressed` toggles,
  `aria-expanded` rows, live regions for loading / errors, `prefers-reduced-motion` respected.

## Third-party libraries

| Package | Use | License |
| --- | --- | --- |
| `react`, `react-dom` | UI | MIT |
| `typescript` | Types | Apache-2.0 |
| `vite`, `@vitejs/plugin-react` | Dev server and build | MIT |
| `vitest` | Test runner | MIT |
| `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` | UI tests (dev only) | MIT |

No other runtime dependencies and no bundled fonts or images.

## Known limitations

- **Fixture size.** The task statement and the reference layout mention 30 queue records, but the
  provided `src/data/mock-payment-queue.json` contains **32**. The widget works on the actual data; the
  provided starter test that expected `30` was updated to `32`. The data file was not modified.
- **"Open payment queue" / "Open details"** open the full widget view in a dialog, because the host
  navigation target is not part of the task. Hooking them to host routing would mean adding an optional
  callback prop.
- **One row = one bill.** The task does not say what happens if the same provider bill arrives on
  several rows (e.g. one per linked customer bill). Rows are treated independently, so such a bill
  would be counted once per row; the table keys rows by queue position, not by bill id.
- The table is not virtualised; `rowLimit` (max 100) plus "Show more" keep it small for typical queues.
- UI text is in Russian, matching the reference layout. There is no i18n layer.
- Layout and visuals are not covered by automated tests (jsdom has no layout engine); they were
  checked manually in the sandbox in all four sizes, all six data states and both themes.
