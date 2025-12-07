import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListConsumerComponent } from './list-consumer.component';

describe('ListConsumerComponent', () => {
  let component: ListConsumerComponent;
  let fixture: ComponentFixture<ListConsumerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListConsumerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListConsumerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
