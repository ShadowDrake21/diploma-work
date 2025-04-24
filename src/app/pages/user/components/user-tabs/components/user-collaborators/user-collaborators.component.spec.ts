import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCollaboratorsComponent } from './user-collaborators.component';

describe('UserCollaboratorsComponent', () => {
  let component: UserCollaboratorsComponent;
  let fixture: ComponentFixture<UserCollaboratorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCollaboratorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCollaboratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
