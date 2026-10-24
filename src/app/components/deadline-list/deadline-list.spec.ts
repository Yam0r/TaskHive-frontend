import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeadlineList } from './deadline-list';

describe('DeadlineList', () => {
  let component: DeadlineList;
  let fixture: ComponentFixture<DeadlineList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeadlineList],
    }).compileComponents();

    fixture = TestBed.createComponent(DeadlineList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
