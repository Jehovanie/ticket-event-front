# TicketUp Admin

This is the admin panel for the TicketUp project. It provides tools for managing users, events, and ticket sales.

Vous pouvez également explorer le côté API en consultant le dépôt [TicketUp API](https://github.com/jehovanie/ticketup-api) sur GitHub.

📄 **Connexion à l'API** : la configuration du backend (URL, enveloppes de réponse, JWT, endpoints) est documentée dans [README.API.md](README.API.md). Le point de départ est `src/app/environements/environement.ts`.

## Features

- User management (create, update, delete)
- Event creation and editing
- Ticket sales tracking
- Analytics dashboard

## Technologies utilisées

- TypeScript (v4.x)
- Angular (v16)
- TailwindCSS (v3)
- Angular Material (v16)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/jehovanie/ticketup-admin.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Folder Structure

- `/src` - Source code.
- `/public` - Static files.
- `/src/app/app.route.ts` - Root definition.
- `/src/app/environements` - environements definition.
- `/src/app/_core` - Defition entity model and services all service
- `/src/app/_utils` - definition variable const and type constant.
- `/src/app/environements` - Defintion d'environements


# Connexion à l'API — TicketUp Admin

Ce document décrit **comment ce panneau d'administration se branche sur l'API
TicketUp** ([ticketup-api](https://github.com/jehovanie/ticketup-api)) : d'où vient
l'URL du serveur, comment une requête est construite, authentifiée, puis déballée
avant d'arriver dans un composant.

Le point de départ de toute la chaîne est le dossier
[`src/app/environements/`](src/app/environements) — orthographe d'origine, avec la
faute, c'est bien le nom réel du dossier.

---

## 1. Le dossier `environements/` : l'origine de tout

```
src/app/environements/
├── environement.ts            ← le seul réellement utilisé (dev)
├── environement.test.ts       ← pointe vers jsonplaceholder (bac à sable)
├── environement.prod.ts       ← VIDE
└── environement.staging.ts    ← VIDE
```

`environement.ts` :

```ts
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8080/api',
};
```

`apiUrl` est **l'unique définition de l'adresse du backend**. Toute requête sortante
de l'application est préfixée par cette valeur. Changer de serveur (local, machine
d'un collègue, staging) se fait ici et nulle part ailleurs.

> ⚠️ Le port dépend de la façon dont l'API est démarrée : `symfony server:start`
> écoute en général sur `8000`, `php -S`/Docker souvent sur `8080`. Alignez
> `apiUrl` sur ce que sert réellement l'API, en gardant le suffixe `/api`.

### Qui lit ce fichier ?

Uniquement les services, jamais un composant :

| Fichier | Usage |
| --- | --- |
| `_core/services/auth/auth.service.ts` | `super(httpClient, environment.apiUrl)` |
| `_core/services/events/events.service.ts` | idem |
| `_core/services/category/category.service.ts` | idem |
| `_core/services/location/location.service.ts` | idem |
| `_core/services/organizer/organizer.service.ts` | idem |
| `_core/services/users/users.service.ts` | idem |

### Limite connue : il n'y a pas encore de build de production

`environement.prod.ts` et `environement.staging.ts` sont des **fichiers vides**, et
`angular.json` ne déclare **aucun `fileReplacements`**. Conséquence : `ng build`
(configuration `production` comprise) embarque toujours l'environnement de
développement, donc `http://127.0.0.1:...`.

Pour livrer un vrai build de prod, deux étapes sont nécessaires — les deux, l'une
sans l'autre ne sert à rien :

1. Remplir `environement.prod.ts` :

   ```ts
   export const environment = {
     production: true,
     apiUrl: 'https://api.ticketup.example/api',
   };
   ```

2. Ajouter le remplacement dans `angular.json`, sous
   `projects.review.architect.build.configurations.production` :

   ```json
   "fileReplacements": [
     {
       "replace": "src/app/environements/environement.ts",
       "with": "src/app/environements/environement.prod.ts"
     }
   ]
   ```

(Le projet Angular s'appelle `review` — reste du scaffolding — d'où les cibles
`review:build:production` et la sortie dans `dist/review`.)

---

## 2. La chaîne d'un appel

```
environement.ts (apiUrl)
        │
        ▼
AppService  ──── get/post/put/remove protégés, typés sur la réponse BRUTE
        │
        ▼
Service métier (EventsService, OrganizerService…)  ──── déballe l'enveloppe
        │
        ▼
Composant  ──── ne voit que des IEvent[], IOrganizer[]… jamais { message, status, data }
        │
   authInterceptor (transverse) ──── pose le Bearer, rejoue après refresh sur 401
```

### `AppService` (`_core/services/AppService.ts`)

Classe de base de tous les services. Elle détient le `HttpClient` et la `baseUrl`,
et pose systématiquement les en-têtes :

```
Content-Type: application/json
Accept: application/json
```

L'en-tête `Accept` n'est pas décoratif : sur les endpoints API Platform
(`/organizers`, `/locations`), il déclenche la négociation de contenu et fait
renvoyer un **tableau simple** au lieu de l'enveloppe Hydra.

Les méthodes `get` / `post` / `put` / `remove` sont **`protected`** et typées par la
réponse *brute* (`R`), enveloppe comprise. C'est volontaire : un composant ne doit
jamais appeler `HttpClient` ni `AppService` directement.

`getAllPages<R>(url, pageSize = 30, maxPages = 20)` enchaîne les pages jusqu'à en
recevoir une incomplète, et gère indifféremment le tableau nu et l'enveloppe Hydra.
Il existe parce que l'API plafonne à 30 éléments par page : sans lui, une liste
déroulante d'organisateurs (32 en base) perdrait silencieusement les deux derniers.

### Règles à respecter

- ❌ Jamais de `HttpClient` injecté dans un composant.
- ❌ Jamais une méthode typée `Observable<T[]>` sur une réponse enveloppée : la
  divergence est invisible pour TypeScript et casse à l'exécution.
- ✅ Un nouvel endpoint = une méthode nommée sur le service concerné, qui déballe.

---

## 3. Les formes de réponse

L'API **ne renvoie jamais une entité ou un tableau nu**. Trois enveloppes coexistent,
décrites dans `_core/model/api-response.interface.ts`.

### a. Enveloppe maison — `IApiResponse<T>`

`/events`, `/events/me`, `/events/{id}`, `/categories`, `/user/me/organizations`

```jsonc
{ "message": "...", "status": 200, "data": { /* … */ } }
```

Pour une collection, `data` est un `IPaginated<T>` :

```jsonc
{
  "itemsTotal": 57,
  "currentPage": 1,        // indexée à partir de 1
  "nombreParPage": 12,
  "items": [ /* … */ ]
}
```

### b. API Platform — tableau nu ou Hydra

`/organizers`, `/locations`

Avec `Accept: application/json` (ce qu'envoie `AppService`) : un tableau JSON.
Sans cet en-tête : `{ "totalItems": n, "member": [...] }` (`IHydraCollection<T>`).
Plafonné à 30 éléments par page → passer par `getAllPages()`.

### c. Cas particulier — `/admin/events/{id}`

Pas d'enveloppe `data` :

```jsonc
{ "events": { "event": { /* … */ }, "statusTicket": { /* … */ } } }
```

### d. Écritures : forme non garantie

`POST /events` et `PUT /events/{id}` peuvent renvoyer l'enveloppe, l'entité à la
racine, ou un corps vide. `EventsService.unwrap()` traite les trois cas ; ne
présumez pas de la forme sur une écriture.

---

## 4. Authentification (JWT)

Tout est dans `_core/services/auth/auth.service.ts`.

### Contrat d'API

| Endpoint | Entrée | Sortie |
| --- | --- | --- |
| `POST /auth/register` | `{ email, password, firstname, lastname, phone?, language? }` | `{ token, refresh_token, user }` (201) |
| `POST /auth/login` | `{ email, password }` | `{ token, refresh_token }` — 401 `{ code, message }` si identifiants invalides |
| `POST /auth/refresh` | `{ refresh_token }` | `{ token, refresh_token }` |
| `GET /user/me` | en-tête `Bearer` | l'utilisateur, `roles` compris |

Le jeton d'accès vit **15 minutes** ; le refresh token **30 jours** (créé côté API par
`JwtLoginSuccessSubscriber`). `login()` enchaîne automatiquement sur `me()`, car le
login seul ne renvoie pas le profil.

Contraintes de `POST /auth/register` (`RegisterDTO` côté API) : email valide, mot de
passe de 4 à 72 caractères, prénom et nom obligatoires (50 caractères max),
téléphone 30 max.

### Stockage

Préfixe de clé `ticketup.admin.*` :

| Clé | Contenu |
| --- | --- |
| `ticketup.admin.token` | jeton d'accès |
| `ticketup.admin.refresh_token` | jeton de renouvellement |
| `ticketup.admin.user` | profil sérialisé (relu au démarrage) |

« Se souvenir de moi » choisit le support : `localStorage` (survit à la fermeture du
navigateur) ou `sessionStorage`. `AuthService.storage()` résout à la lecture celui
qui contient réellement le jeton, et un changement de support purge l'autre pour
éviter deux jetons concurrents.

`currentUser` est un **signal** initialisé depuis le stockage ; `isAuthenticated` et
`isSuperAdmin` en sont dérivés.

### Intercepteur (`_core/interceptors/auth.interceptor.ts`)

Enregistré dans `app.config.ts` via
`provideHttpClient(withInterceptors([authInterceptor]))`.

- Pose `Authorization: Bearer <token>` sur toutes les requêtes **sauf**
  `/auth/login`, `/auth/register`, `/auth/refresh`.
- Sur un `401` : tente **un seul** renouvellement, puis rejoue la requête d'origine.
- Les 401 concurrents partagent le même appel de refresh
  (`refreshInFlight$` + `shareReplay(1)`) : sinon les renouvellements simultanés
  s'invalideraient mutuellement.
- Si le refresh échoue (ou s'il n'y a pas de refresh token) : session purgée et
  redirection vers `/auth/login`.

### Garde de routes (`_core/guards/auth.guard.ts`)

- `authGuard` protège tout ce qui est sous `MainLayoutComponent` et conserve l'URL
  demandée dans `returnUrl`.
- `guestGuard` protège `/auth/**` : un utilisateur déjà connecté est renvoyé sur
  `/dashboard`.

### Le cas du super administrateur

`ROLE_SUPER_ADMIN` est un rôle **global** : il ouvre tous les droits mais ne crée
**aucune appartenance à une organisation**. Les endpoints en `/me` (`/events/me`,
`/user/me/organizations`) lui répondent donc *vide*. Les services basculent
explicitement sur les listes complètes dans ce cas — voir
`EventsService.getMyEvents()` et `OrganizerService.getMyOrganizers()`. Sans ce
repli, le fondateur verrait un tableau de bord désert.

---

## 5. Endpoints consommés

Toutes les URL ci-dessous sont **relatives à `environment.apiUrl`**.

### Événements — `EventsService`

| Méthode | Endpoint | Renvoie |
| --- | --- | --- |
| `getAllEvents(page, itemsPerPage)` | `GET /events` | `IPaginated<IEvent>` |
| `getMyEvents(page, itemsPerPage)` | `GET /events/me` (ou `/events` si super admin) | `IPaginated<IEvent>` |
| `getEvent(id)` | `GET /events/{id}` | `IEvent` |
| `createEvent(event)` | `POST /events` | `IEvent \| null` |
| `updateEvent(id, event)` | `PUT /events/{id}` | `IEvent \| null` |
| `deleteEvent(id)` | `DELETE /events/{id}` | `void` |
| `getDetailStatusEvent(id)` | `GET /admin/events/{id}` | `IEventStatusDetail` |

`DEFAULT_EVENTS_PER_PAGE = 12`.

### Organisateurs — `OrganizerService`

| Méthode | Endpoint | Renvoie |
| --- | --- | --- |
| `getAllOrganizers()` | `GET /organizers` (toutes pages) | `IOrganizer[]` |
| `getMyOrganizers()` | `GET /user/me/organizations` | `IMyOrganizer[]` (repli liste complète si super admin) |
| `getMyOrganizations()` | `GET /user/me/organizations` | `IMyOrganizations` (`isSuperAdmin` conservé) |
| `createOrganizer(payload)` | `POST /organizers` | `IMyOrganizer` |

`getMyOrganizers()` et `getMyOrganizations()` frappent le même endpoint mais ne
servent pas au même usage : la seconde conserve `isSuperAdmin`, ce qui permet à la
page « Organisateurs » de distinguer « vous n'appartenez à aucune organisation » de
« votre rôle est global ».

### Catégories — `CategoryService`

| Méthode | Endpoint | Renvoie |
| --- | --- | --- |
| `getCategoriesPage(page, itemsPerPage = 100)` | `GET /categories` | `IPaginated<ICategory>` |
| `getAllCategries(page)` | `GET /categories` | `ICategory[]` |

### Lieux — `LocationService`

| Méthode | Endpoint | Renvoie |
| --- | --- | --- |
| `getAllLocations()` | `GET /locations` (toutes pages) | `ILocation[]` |

### Utilisateurs — `UsersService`

Le service existe et est branché sur `apiUrl`, mais n'expose **encore aucune
méthode**.

---

## 6. Pagination

Elle est **côté serveur**, jamais côté client :

- paramètres `?page=` (indexé à partir de **1**) et `?itemsPerPage=` ;
- le composant de liste détient l'état de page et **relance une requête** à chaque
  changement ;
- ❌ ne jamais découper un tableau complet côté client ;
- les collections API Platform sont plafonnées à 30 éléments par page →
  `getAllPages()`.

---

## 7. Ajouter un endpoint

1. Décrire la réponse dans `_core/model/<entité>.interface.ts` (interfaces
   préfixées `I`), puis la ré-exporter depuis `_core/model/index.ts`.
2. Ajouter une méthode métier sur le service concerné (ou créer le service, en
   étendant `AppService` et en passant `environment.apiUrl` au `super()`).
3. Typer l'appel `this.get<…>()` sur la **réponse brute**, enveloppe comprise, puis
   déballer avec `map()`.
4. Le composant consomme la méthode du service — jamais l'URL.

```ts
@Injectable({ providedIn: 'root' })
export class EventsService extends AppService {
  constructor(httpClient: HttpClient) {
    super(httpClient, environment.apiUrl);
  }

  getAllEvents(page = 1, itemsPerPage = DEFAULT_EVENTS_PER_PAGE): Observable<IPaginated<IEvent>> {
    const params = new HttpParams().set('page', page).set('itemsPerPage', itemsPerPage);
    return this.get<IApiResponse<IPaginated<IEvent>>>('/events', params)
      .pipe(map((response) => response.data));
  }
}
```

Côté composant, les abonnements sont nettoyés avec un `Subject destroy$` +
`takeUntil`, et l'état de chargement est modélisé en objet littéral local
(`{ isLoading, items, error }`).

---

## 8. Démarrage local

1. Lancer l'API ([ticketup-api](https://github.com/jehovanie/ticketup-api)) et noter
   le port réellement servi.
2. Aligner `apiUrl` dans `src/app/environements/environement.ts`, suffixe `/api`
   compris.
3. Vérifier que l'API autorise l'origine `http://localhost:4200` (CORS —
   `nelmio_cors` côté Symfony). Il n'y a **pas** de `proxy.conf.json` dans ce
   projet : le navigateur appelle l'API directement, en cross-origin.
4. `npm install` puis `npm start` → <http://localhost:4200>.
5. Se connecter via `/auth/login` : sans jeton valide, `authGuard` renvoie sur le
   login avec un `returnUrl`.

---

## 9. Dépannage

| Symptôme | Piste |
| --- | --- |
| `ERR_CONNECTION_REFUSED` sur toutes les requêtes | API éteinte, ou port de `apiUrl` différent de celui servi (8000 vs 8080) |
| Erreur CORS dans la console | Origine `http://localhost:4200` non autorisée côté API |
| 404 sur tout | Suffixe `/api` oublié dans `apiUrl` |
| Renvoyé sur `/auth/login` en boucle | Refresh token expiré ou absent → l'intercepteur purge la session ; se reconnecter |
| `undefined` en lisant une propriété du résultat | Enveloppe non déballée, ou méthode typée `Observable<T[]>` sur une réponse enveloppée |
| Le dernier organisateur / lieu manque dans un `<select>` | Plafond de 30 par page : utiliser `getAllPages()` |
| Tableau de bord vide en super admin | Endpoint en `/me` : penser au repli `isSuperAdmin` |
| Le build de prod appelle `127.0.0.1` | `environement.prod.ts` vide et/ou `fileReplacements` absent — voir §1 |

---

## Références

- `src/app/environements/environement.ts` — URL de l'API
- `src/app/_core/services/AppService.ts` — socle HTTP
- `src/app/_core/model/api-response.interface.ts` — enveloppes
- `src/app/_core/services/auth/auth.service.ts` — JWT, stockage, refresh
- `src/app/_core/interceptors/auth.interceptor.ts` — Bearer et 401
- `src/app/_core/guards/auth.guard.ts` — `authGuard` / `guestGuard`
- `src/app/app.config.ts` — enregistrement de l'intercepteur
