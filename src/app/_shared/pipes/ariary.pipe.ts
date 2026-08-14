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
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '—';
    }
    if (value === 0) {
      return 'Gratuit';
    }
    return `${formatNumber(value, 'fr', '1.0-0')} Ar`;
  }
}
