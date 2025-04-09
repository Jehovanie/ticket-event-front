import { Component, Input } from '@angular/core';
import { IUser } from '../../../../../_core/model/user.interface';

@Component({
  selector: 'app-list-consumer',
  imports: [],
  templateUrl: './list-consumer.component.html',
  styleUrl: './list-consumer.component.css'
})
export class ListConsumerComponent {

  @Input() consumers: any[] = [];

  constructor() {

  }

    ngOnInit(): void {

    }
}
