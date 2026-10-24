import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusChart } from './status-chart';

describe('StatusChart', () => {
  let component: StatusChart;
  let fixture: ComponentFixture<StatusChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusChart],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
