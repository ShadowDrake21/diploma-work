import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchSettingsComponent } from './research-settings.component';

describe('ResearchSettingsComponent', () => {
  let component: ResearchSettingsComponent;
  let fixture: ComponentFixture<ResearchSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResearchSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
