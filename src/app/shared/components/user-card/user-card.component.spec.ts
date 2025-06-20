import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCardComponent } from './user-card.component';
import { Router } from '@angular/router';
import { IUser } from '@models/user.model';
import { UserRole } from '@shared/enums/user.enum';

describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;
  let router: Router;

  const mockUser: IUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: UserRole.ADMIN,
    affiliation: 'Test University',
    avatarUrl: 'https://example.com/avatar.jpg',
    publicationCount: 5,
    patentCount: 2,
    researchCount: 3,
    tags: [],
    active: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user information', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.querySelector('img').src).toBe(mockUser.avatarUrl);
    expect(element.textContent).toContain(mockUser.username);
    expect(element.textContent).toContain(mockUser.email);
    expect(element.textContent).toContain(mockUser.affiliation);
  });

  it('should navigate to profile when button clicked', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(router.navigate).toHaveBeenCalledWith(['/users', mockUser.id]);
  });

  it('should show hover content on hover', () => {
    fixture.componentRef.setInput('user', mockUser);

    fixture.detectChanges();

    const hoverContent = fixture.nativeElement.querySelector(
      'div[class*="group-hover:opacity-100"]'
    );
    expect(hoverContent).toBeTruthy();
  });

  it('should display counts correctly', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.textContent).toContain(
      `Публікації: ${mockUser.publicationCount}`
    );
    expect(element.textContent).toContain(`Патенти: ${mockUser.patentCount}`);
    expect(element.textContent).toContain(
      `Дослідницькі проекти: ${mockUser.researchCount}`
    );
  });
});
