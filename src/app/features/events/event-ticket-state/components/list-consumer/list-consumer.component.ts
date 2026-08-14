import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-list-consumer',
  imports: [],
  templateUrl: './list-consumer.component.html',
  styles: ``
})
export class ListConsumerComponent {

  @Input() consumers: any[] = [];

  constructor() {

  }

    ngOnInit(): void {

    }
}
