import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface SearchSelectOption {
  value: string | number;
  label: string;
  /** Information secondaire affichée à droite (capacité, email…). */
  hint?: string;
  /** Pastille de couleur, pour les catégories. */
  color?: string;
}

/**
 * Liste déroulante avec recherche.
 *
 * Un `<select>` natif oblige à parcourir des dizaines d'entrées sans pouvoir
 * filtrer : dès que la liste dépasse une poignée d'éléments, la recherche au
 * clavier devient le seul moyen raisonnable de choisir.
 */
@Component({
  selector: 'app-search-select',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './search-select.component.html',
  host: {
    class: 'block relative'
  },
  styles: ``
})
export class SearchSelectComponent {
  readonly options = input<SearchSelectOption[]>([]);
  readonly value = input<string | number | null>(null);
  readonly placeholder = input('Sélectionner');
  readonly searchPlaceholder = input('Rechercher…');
  readonly emptyLabel = input('Aucun résultat');
  readonly invalid = input(false);
  readonly disabled = input(false);

  /** Émet la valeur choisie sous forme de chaîne, ou `''` si l'on efface. */
  readonly valueChange = output<string>();

  readonly isOpen = signal(false);
  readonly query = signal('');
  /** Index survolé au clavier, pour la navigation par flèches. */
  readonly activeIndex = signal(0);

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  readonly selectedOption = computed<SearchSelectOption | null>(() => {
    const current = this.value();
    if (current === null || current === '') {
      return null;
    }
    return (
      this.options().find((option) => String(option.value) === String(current)) ??
      null
    );
  });

  /** Recherche insensible à la casse et aux accents (« Conference » trouve « Conférence »). */
  readonly filteredOptions = computed<SearchSelectOption[]>(() => {
    const query = this.normalize(this.query().trim());
    if (query.length === 0) {
      return this.options();
    }

    return this.options().filter((option) => {
      const haystack = this.normalize(`${option.label} ${option.hint ?? ''}`);
      return haystack.includes(query);
    });
  });

  private normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    this.isOpen.set(true);
    this.query.set('');
    this.activeIndex.set(0);
    // Le champ n'existe qu'une fois le panneau rendu.
    setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  close(): void {
    this.isOpen.set(false);
  }

  select(option: SearchSelectOption): void {
    this.valueChange.emit(String(option.value));
    this.close();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.valueChange.emit('');
  }

  onSearch(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  /** Navigation clavier dans la liste filtrée. */
  onSearchKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set(
          options.length === 0 ? 0 : (this.activeIndex() + 1) % options.length
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(
          options.length === 0
            ? 0
            : (this.activeIndex() - 1 + options.length) % options.length
        );
        break;
      case 'Enter': {
        event.preventDefault();
        const option = options[this.activeIndex()];
        if (option) {
          this.select(option);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  /** Fermeture au clic extérieur : sans ça le panneau resterait ouvert. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.isOpen() &&
      !this.elementRef.nativeElement.contains(event.target as Node)
    ) {
      this.close();
    }
  }
}
