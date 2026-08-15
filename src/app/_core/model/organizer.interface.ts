export interface IOrganizer {
    /** Entier côté API (`Organizer::$id`), malgré l'ancien typage en chaîne. */
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/** Une organisation vue depuis l'utilisateur : l'organisation, plus son rôle dedans. */
export interface IMyOrganizer extends IOrganizer {
    role?: string;
    roleLabel?: string;
    isOwner?: boolean;
    joinedAt?: string;
}

/**
 * Corps de `/user/me/organizations` (dans `data`).
 *
 * `isSuperAdmin` compte autant que `items` : le rôle global n'ouvre aucune
 * appartenance, donc un super administrateur reçoit `items: []` alors qu'il a
 * accès à toutes les organisations. Sans ce drapeau, son sélecteur resterait vide.
 */
export interface IMyOrganizations {
    itemsTotal: number;
    isSuperAdmin: boolean;
    items: IMyOrganizer[];
}

/** Corps de `POST /organizers`. `name` et `email` sont exigés par l'API. */
export interface ICreateOrganizerPayload {
    name: string;
    email: string;
    phone?: string | null;
    website?: string | null;
}
