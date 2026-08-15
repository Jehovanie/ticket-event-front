import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { OrganizerNewComponent } from './organizer-new.component';
import { NotificationService } from '@/app/_shared/services/notification.service';
import { environment } from '@/app/environements/environement';

describe('OrganizerNewComponent', () => {
  let fixture: ComponentFixture<OrganizerNewComponent>;
  let component: OrganizerNewComponent;
  let httpMock: HttpTestingController;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  /** Clique le bouton d'envoi, comme le ferait l'utilisateur. */
  const clickSubmit = () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    );
    button.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    notificationSpy = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'success',
      'error',
      'info',
    ]);

    await TestBed.configureTestingModule({
      imports: [OrganizerNewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        // Les notifications passent par un overlay Material : hors sujet ici, et
        // `@angular/animations` n'est pas installé dans ce projet.
        { provide: NotificationService, useValue: notificationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizerNewComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  /**
   * Le bouton vit hors du `<form>` et le relie par `form="organizerForm"`.
   * Sans `FormsModule`, `(ngSubmit)` n'écoute aucun événement réel : le clic
   * ne déclenche rien, sans la moindre erreur. C'est ce que ce test verrouille.
   */
  it('envoie la création au clic sur le bouton', () => {
    component.name.set('Antsika Prod');
    component.email.set('contact@antsika.mg');
    fixture.detectChanges();

    clickSubmit();

    const request = httpMock.expectOne(`${environment.apiUrl}/organizers`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Antsika Prod',
      email: 'contact@antsika.mg',
      phone: null,
      website: null,
    });

    request.flush({
      message: 'créée',
      status: 201,
      data: { id: 9, name: 'Antsika Prod', role: 'owner', isOwner: true },
    });
  });

  it('redirige vers la liste une fois créée', () => {
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate');

    component.name.set('Antsika Prod');
    component.email.set('contact@antsika.mg');
    clickSubmit();

    httpMock.expectOne(`${environment.apiUrl}/organizers`).flush({
      message: 'créée',
      status: 201,
      data: { id: 9, name: 'Antsika Prod' },
    });

    expect(navigate).toHaveBeenCalledWith(['/organizers']);
  });

  it("n'envoie rien tant que les champs requis manquent", () => {
    clickSubmit();

    httpMock.expectNone(`${environment.apiUrl}/organizers`);
    expect(component.submitted()).toBeTrue();
  });

  // Le message de l'API est plus utile que le nôtre : on le remonte tel quel.
  it("affiche le message d'erreur renvoyé par l'API", () => {
    component.name.set('Antsika Prod');
    component.email.set('contact@antsika.mg');
    clickSubmit();

    httpMock.expectOne(`${environment.apiUrl}/organizers`).flush(
      { message: '« nawak » n’est pas une adresse web valide.', status: 400, data: null },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(component.submitError()).toBe('« nawak » n’est pas une adresse web valide.');
    expect(component.isSubmitting()).toBeFalse();
  });
});
