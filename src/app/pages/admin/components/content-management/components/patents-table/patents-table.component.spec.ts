import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatentsTableComponent } from './patents-table.component';

describe('PatentsTableComponent', () => {
  let component: PatentsTableComponent;
  let fixture: ComponentFixture<PatentsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatentsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatentsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
