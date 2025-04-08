import { Component } from '@angular/core';

@Component({
  selector: 'app-create-event',
  imports: [],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css',
})
export class CreateEventComponent {
  openModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  closeModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}
