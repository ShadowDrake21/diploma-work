import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchesTableComponent } from './researches-table.component';

describe('ResearchesTableComponent', () => {
  let component: ResearchesTableComponent;
  let fixture: ComponentFixture<ResearchesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResearchesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
