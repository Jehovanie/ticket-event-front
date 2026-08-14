import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ILocation } from '../../../../../_core/model/location.interface';
import { AriaryPipe } from '../../../../../_shared/pipes/ariary.pipe';

@Component({
  selector: 'app-event-detail-stats',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, AriaryPipe],
  templateUrl: './event-detail-stats.component.html',
  host: {
    class: 'block'
  },
  styleUrl: './event-detail-stats.component.css'
})
export class EventDetailStatsComponent {
  @Input() totalTickets: number = 0;
  @Input() totalRevenue: number = 0;
  @Input() ticketTypesCount: number = 0;
  @Input() location: ILocation | null = null;

  /**
   * Part de la salle couverte par les quotas de billets. Au-delà de 100 %, la
   * billetterie promet plus de places que le lieu n'en contient : c'est une
   * anomalie qu'un administrateur doit voir immédiatement.
   */
  get occupancyRatio(): number | null {
    const size = this.location?.size ?? 0;
    if (size <= 0) {
      return null;
    }
    return this.totalTickets / size;
  }

  get occupancyPercent(): number {
    return Math.round((this.occupancyRatio ?? 0) * 100);
  }

  /** Largeur de la barre, plafonnée pour ne pas déborder du conteneur. */
  get occupancyBarWidth(): number {
    return Math.min(100, this.occupancyPercent);
  }

  get isOverbooked(): boolean {
    return (this.occupancyRatio ?? 0) > 1;
  }
}
