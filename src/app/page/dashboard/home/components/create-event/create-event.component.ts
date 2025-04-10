import {
  Component,
  computed,
  signal,
  Signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-event',
  imports: [FormsModule],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css',
})
export class CreateEventComponent {
  event: {
    title: Signal<string>;
    description: Signal<string>;
    startedAt: Signal<Date>;
    endedAt: Signal<Date>;
    location: Signal<string>;
    imageUrl: Signal<string[]>;
    category: Signal<string>;
    createdAt: Signal<Date>;
    updatedAt: Signal<Date>;
  } = {
    title: signal<string>(''),
    description: signal<string>(''),
    startedAt: signal<Date>(new Date(NaN)),
    endedAt: signal<Date>(new Date(NaN)),
    location: signal<string>(''),
    imageUrl: signal<string[]>([]),
    category: signal<string>(''),
    createdAt: signal<Date>(new Date(NaN)),
    updatedAt: signal<Date>(new Date(NaN)),
  };

  isValidEvent: {
    title: Signal<boolean>;
    description: Signal<boolean>;
    category: Signal<boolean>;
  } = {
    title: computed<boolean>(() => this.event.title().trim().length >= 3),
    description: computed(() => this.event.description().trim().length >= 3),
    category: computed(() => this.event.category().trim().length >= 3),
  };

  isFormValid = computed(() => {
    return (
      this.isValidEvent.title() &&
      this.isValidEvent.description() &&
      this.isValidEvent.category()
    );
  });

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

  onSubmit() {}
}
