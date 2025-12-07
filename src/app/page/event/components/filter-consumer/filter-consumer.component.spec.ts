import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterConsumerComponent } from './filter-consumer.component';

describe('FilterConsumerComponent', () => {
  let component: FilterConsumerComponent;
  let fixture: ComponentFixture<FilterConsumerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterConsumerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterConsumerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
