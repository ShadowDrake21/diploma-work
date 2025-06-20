import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactInformationComponent } from './contact-information.component';
import { IUser } from '@models/user.model';
import { UserRole } from '@shared/enums/user.enum';

describe('ContactInformationComponent', () => {
  let component: ContactInformationComponent;
  let fixture: ComponentFixture<ContactInformationComponent>;

  const mockUser: IUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    phoneNumber: '1234567890',
    affiliation: 'Test University',
    socialLinks: [
      { name: 'LinkedIn', url: 'https://linkedin.com/test' },
      { name: 'Twitter', url: 'https://twitter.com/test' },
    ],
    role: UserRole.USER,
    publicationCount: 0,
    patentCount: 0,
    researchCount: 0,
    tags: [],
    active: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactInformationComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('user', mockUser);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display email if available', () => {
    const emailElement = fixture.nativeElement.querySelector(
      'mat-icon[svgIcon="email"]'
    );
    expect(emailElement).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('test@example.com');
  });

  it('should display phone number if available', () => {
    const phoneElement = fixture.nativeElement.querySelector(
      'mat-icon[svgIcon="phone"]'
    );
    expect(phoneElement).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('1234567890');
  });

  it('should display affiliation if available', () => {
    const workElement = fixture.nativeElement.querySelector(
      'mat-icon[svgIcon="work"]'
    );
    expect(workElement).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Test University');
  });

  it('should display social links if available', () => {
    const socialLinksHeader = fixture.nativeElement.querySelector('h4');
    expect(socialLinksHeader.textContent).toContain(
      'Посилання на соціальні мережі'
    );

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].href).toContain('linkedin.com/test');
    expect(links[1].href).toContain('twitter.com/test');
  });

  it('should not display elements if data is missing', () => {
    fixture.componentRef.setInput('user', { id: 1, username: 'test' });
    fixture.detectChanges();

    const emailElement = fixture.nativeElement.querySelector(
      'mat-icon[svgIcon="email"]'
    );
    expect(emailElement).toBeFalsy();

    const socialLinksHeader = fixture.nativeElement.querySelector('h4');
    expect(socialLinksHeader).toBeFalsy();
  });
});
