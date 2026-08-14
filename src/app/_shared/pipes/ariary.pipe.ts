import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

/**
 * Formate un montant en ariary : `118` → `118 Ar`, `37052` → `37 052 Ar`.
 *
 * Les pages affichaient jusqu'ici `| currency: 'EUR'`, ce qui donnait des euros
 * sur une billetterie malgache.
 */
@Pipe({
  name: 'ariary',
  standalone: true,
})
export class AriaryPipe implements PipeTransform {
  /**
   * @param zeroLabel texte affiché pour un montant nul. « Gratuit » convient à
   * un prix de billet, pas à un total ou à un revenu : passer `'0 Ar'` dans ce cas.
   */
  transform(value: number | null | undefined, zeroLabel = 'Gratuit'): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '—';
    }
    if (value === 0) {
      return zeroLabel;
    }
    return `${formatNumber(value, 'fr', '1.0-0')} Ar`;
  }
}
