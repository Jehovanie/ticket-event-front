import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardUiStateComponent } from './card-ui-state.component';

describe('CardUiStateComponent', () => {
  let component: CardUiStateComponent;
  let fixture: ComponentFixture<CardUiStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardUiStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardUiStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
