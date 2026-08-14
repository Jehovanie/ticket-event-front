# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Admin panel for TicketUp (event/ticketing platform): manage users, events, ticket sales, analytics.
It is a pure frontend — the backend lives in a separate repo, [ticketup-api](https://github.com/jehovanie/ticketup-api).

Angular 19 (standalone components, no NgModules), TailwindCSS 4, Angular Material 19, ng2-charts/chart.js.
Note: the README claims Angular 16 / Tailwind 3 — that is stale; trust `package.json`.

## Commands

```bash
npm start                 # ng serve → http://localhost:4200
npm run build             # production build (default config) → dist/review
npm run watch             # dev build in watch mode
npm test                  # Karma + Jasmine, Chrome, watch mode
ng test --watch=false --browsers=ChromeHeadless          # single CI-style run
ng test --include='**/events.service.spec.ts'            # run one spec file
```

There is no lint setup (no ESLint config, no `lint` script). Don't invent one.

The Angular project is named `review` (leftover from scaffolding), so build targets are
`review:build:production` / `review:build:development` and output goes to `dist/review`.

## Architecture

### Layers

- `src/app/_core/` — cross-cutting, app-wide: `model/` (interfaces, re-exported from `model/index.ts`) and `services/` (HTTP data access).
- `src/app/_shared/` — reusable UI (`components/`: navbar, asidebar, footer, loading, btn-loading), `pipes/`, `utils/`.
- `src/app/layout/` — shell components. `MainLayoutComponent` (sidebar + `<router-outlet>`) wraps every route; `AuthLayoutComponent` exists but is not wired into routing yet.
- `src/app/features/<feature>/` — one folder per feature, each exporting a `<feature>.routes.ts`.
- `src/app/environements/` — note the misspelling; that's the real directory name. Only `environement.ts` (dev, `apiUrl: http://127.0.0.1:8000/api`) and `environement.test.ts` have content; `.prod.ts` and `.staging.ts` are **empty files**, and `angular.json` has no `fileReplacements`, so builds always use the dev environment. Adding a real prod build means filling those in *and* adding the file replacement.

### Routing

Fully lazy-loaded and hierarchical. `app.routes.ts` mounts `MainLayoutComponent` at `''`, then
`loadChildren` per feature; each feature's routes file uses `loadComponent` per page. A feature's
top-level component (e.g. `EventsComponent`) is just a `<router-outlet>` host for its children.
Unknown paths redirect to `/dashboard`.

Events routes: `''` (list) · `new` · `:eventID` (detail) · `:eventID/ticket-state`.

### HTTP layer

**The API never returns a bare entity or array.** Two envelope shapes coexist:

| Endpoint | Shape |
| --- | --- |
| `/events`, `/events/{id}`, `/categories` | `{ message, status, data }` — collections add `data: { itemsTotal, currentPage, nombreParPage, items }` |
| `/organizers`, `/locations` | Content-negotiated: plain array with `Accept: application/json` (what `AppService` sends), Hydra `{ totalItems, member }` without it. Capped at 30 items/page — use `getAllPages()` to get the full list |
| `/admin/events/{id}` | `{ events: { event, statusTicket } }` — no `data` |

`_core/services/AppService.ts` is the base class: it holds `HttpClient` + `environment.apiUrl` and exposes
only **protected** `get/post/put/remove<R>()` typed by the *raw* response. Each service unwraps and exposes
typed domain methods, so no component ever sees an envelope:

```ts
@Injectable({ providedIn: 'root' })
export class EventsService extends AppService {
  constructor(httpClient: HttpClient) { super(httpClient, environment.apiUrl); }

  getAllEvents(page = 1, itemsPerPage = DEFAULT_EVENTS_PER_PAGE): Observable<IPaginated<IEvent>> {
    const params = new HttpParams().set('page', page).set('itemsPerPage', itemsPerPage);
    return this.get<IApiResponse<IPaginated<IEvent>>>('/events', params).pipe(map(r => r.data));
  }
}
```

Envelope types live in `_core/model/api-response.interface.ts`. New endpoints belong as named methods on a
service — never a raw `HttpClient` call in a component, and never a method typed `Observable<T[]>` over an
enveloped response (that mismatch is invisible to TypeScript and blows up at runtime).

Pagination is **server-side**: `?page=` (1-based) and `?itemsPerPage=`. List components hold the page state
and re-query on page change; they must not slice a full array client-side.

### Auth

JWT, handled by `_core/services/auth/auth.service.ts` (`login` / `register` / `me` / `refreshToken` / `logout`),
with `currentUser` as a signal read from storage at startup. API contract:

| Endpoint | In | Out |
| --- | --- | --- |
| `POST /auth/register` | `{email, password, firstname, lastname, phone?, language?}` | `{token, refresh_token, user}` (201) |
| `POST /auth/login` | `{email, password}` | `{token, refresh_token}` — 401 `{code, message}` on bad credentials |
| `GET /user/me` | Bearer token | the user, roles included |

The access token lives **15 minutes**. `authInterceptor` (`_core/interceptors/`) attaches the Bearer, and on a
401 tries a single refresh before replaying the request; concurrent 401s share one refresh call. If the refresh
fails, the session is cleared and the user lands back on `/auth/login`.

Storage key prefix `ticketup.admin.*`; "stay signed in" picks `localStorage`, otherwise `sessionStorage` —
`AuthService.storage()` resolves whichever holds the token.

Routing: `/auth/**` sits under `AuthLayoutComponent` behind `guestGuard`; everything else is under
`MainLayoutComponent` behind `authGuard`, which passes the attempted URL as `returnUrl`.

### Components

Standalone throughout, `imports: [...]` in the decorator. Data flows through plain `@Input()`/`@Output()`
(no state library, no signals). A page component fetches data via services in `ngOnInit` and passes it down
to presentational children in a local `components/` folder next to it (see `event-detail/components/*`,
`event-list/components/*`). Subscriptions are cleaned up with a `destroy$` Subject + `takeUntil` where it's
done at all — follow that pattern in new code.

Loading/error state is usually modelled inline as an object literal on the component
(`{ isLoading, items, error }` or `{ isLoading, value, error }`), not via a shared type.

### Localization

The app is French-only and locale is wired at bootstrap: `registerLocaleData(localeFr, 'fr')` in `main.ts`,
`LOCALE_ID: 'fr'` and a French `MatPaginatorIntl` (`paginator-intl-fr.ts`) in `app.config.ts`.
User-facing strings and code comments are written in French — keep that convention.

### Styling

Tailwind 4 via PostCSS (`.postcssrc.json`); `src/styles.css` does `@import "tailwindcss"` and declares the
theme colors in an `@theme` block — that is the source of truth, not `tailwind.config.cjs` (a v3-style
leftover only defining an unused `angular` color).

Palette: `primary` is the sidebar indigo `#121063`, declined 50→900 (`bg-primary` = 900 = the sidebar color;
`hover:bg-primary-800`; `bg-primary-50` + `text-primary-700` for tinted chips and hover states). `secondary`
is the teal `#3ab7bf`. `success` / `warning` / `danger` carry meaning only — event status, destructive
actions, alerts. **Don't reach for raw Tailwind palettes for accents** (`blue-600`, `purple-100`…): the page
chrome uses `primary`, neutrals use `gray`. Event status has a fixed encoding reused on list and detail:
upcoming → primary, ongoing → success, past → gray.

Focus states use `focus-visible:ring-2 focus-visible:ring-primary-500`; clickable cards are `<a routerLink>`,
not clickable `<div>`s. Prefer Tailwind utilities in templates; per-component `.css` files stay thin.
Angular Material is used for icons, buttons, tooltips, and snackbars.

## Conventions

- TypeScript is in `strict` mode with `strictTemplates` and `noPropertyAccessFromIndexSignature`.
- Path alias `@/*` → `src/*` (e.g. `@/app/_core/model`). Imports are inconsistent today — some files use the
  alias, others deep relative paths; prefer the alias in new code.
- Models are `I`-prefixed interfaces (`IEvent`, `ITicketType`) in `_core/model/`, one file per entity,
  re-exported from `_core/model/index.ts`.
- Money is in **ariary**, formatted with the `ariary` pipe (`_shared/pipes/ariary.pipe.ts`): `{{ prix | ariary }}`
  → `30 000 Ar`, `0` → `Gratuit`. Never `| currency:'EUR'`.
- Dates: `titleCaseDateFr` gives the day only; when the hour matters use the `date` pipe (locale is `fr`)
  with `first-letter:uppercase` to capitalize the day name.
- Specs are the untouched Angular scaffolding ("should be created"); there is no real test coverage.
