import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileProjectsComponent } from './profile-projects.component';

describe('ProfileProjectsComponent', () => {
  let component: ProfileProjectsComponent;
  let fixture: ComponentFixture<ProfileProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
