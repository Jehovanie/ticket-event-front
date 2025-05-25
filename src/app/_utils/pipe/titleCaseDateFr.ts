import { Pipe, PipeTransform } from "@angular/core";
import { formatDate } from "@angular/common";

@Pipe({
  name: 'titleCaseDateFr',
  standalone: true,
})
export class TitleCaseDateFrPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const formatted = formatDate(value, 'EEEE, d MMMM y', 'fr'); // ex: lundi, 22 décembre 2025
    const [jour, reste] = formatted.split(', ');
    // Met en majuscule uniquement la première lettre du jour
    return `${jour.charAt(0).toUpperCase()}${jour.slice(1)}, ${reste}`;
  }
}
