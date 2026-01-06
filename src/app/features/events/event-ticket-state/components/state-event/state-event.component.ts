import { Component, Input } from '@angular/core';
import { CardUiStateComponent } from '../card-ui-state/card-ui-state.component';
import { ChartDoughnutType } from './type';
import { EventStateType } from '../../event-ticket-state.component';


@Component({
  selector: 'app-state-event',
  imports: [CardUiStateComponent],
  templateUrl: './state-event.component.html',
  styles: ``
})
export class StateEventComponent {
  @Input() eventStates!: EventStateType;
  // @Input() isLoading!: boolean;

  isLoading: boolean = false;

  globalState!: ChartDoughnutType;
  actualState!: ChartDoughnutType;
  filterTimeState!: ChartDoughnutType;

  tabColors: string[] = [
    '#3B82F6',
    '#F472B6',
    '#FB923C',
    '#FBBF24',
    '#34D399',
    '#3B82F6',
    '#F472B6',
    '#FB923C',
  ];

  ngOnInit(): void {
    this.setInternalEventState();
  }

  setInternalEventState() {
    this.setGlobalState();
    this.setActualtState();
    this.setFilterState();
  }

  setGlobalState() {
    const copiedTabColors = JSON.parse(JSON.stringify(this.tabColors));
    this.globalState = {
      isLoading: this.isLoading,
      title: 'Statique des tickets',
      isFilter: false,
      filterTime: null,
      state: this.eventStates['statusTicket']['global'].map((item) => {
        const [key] = Object.keys(item);
        const value = item[key];

        let data: { [key: string]: { count: number; color: string } } = {};
        data[key] = {
          count: value,
          color: copiedTabColors.shift() ?? '#3B82F6',
        };
        return data;
      }),
    };
  }

  setActualtState() {
    const copiedTabColors = JSON.parse(JSON.stringify(this.tabColors));
    this.actualState = {
      isLoading: this.isLoading,
      title: 'Statique des tickets actuels',
      isFilter: false,
      filterTime: null,
      state: this.eventStates['statusTicket']['actuel'].map((item) => {
        const [key] = Object.keys(item);
        const value = item[key];

        let data: { [key: string]: { count: number; color: string } } = {};
        data[key] = {
          count: value,
          color: copiedTabColors.shift() ?? '#3B82F6',
        };
        return data;
      }),
    };
  }

  setFilterState() {
    const copiedTabColors = JSON.parse(JSON.stringify(this.tabColors));
    this.filterTimeState = {
      isLoading: this.isLoading,
      title: 'Statique des tickets filtrés',
      isFilter: true,
      filterTime: new Date(this.eventStates['statusTicket']['filter']['time']),
      state: this.eventStates['statusTicket']['filter']['value'].map((item) => {
        const [key] = Object.keys(item);
        const value = item[key];

        let data: { [key: string]: { count: number; color: string } } = {};
        data[key] = {
          count: value,
          color: copiedTabColors.shift() ?? '#3B82F6',
        };
        return data;
      }),
    };
  }
}
