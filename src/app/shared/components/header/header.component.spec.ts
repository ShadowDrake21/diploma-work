import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { HeaderService } from '@core/services/header.service';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockHeaderService: jasmine.SpyObj<HeaderService>;

  beforeEach(async () => {
    mockHeaderService = jasmine.createSpyObj('HeaderService', [], {
      headerTitle$: of('Test Title'),
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [{ provide: HeaderService, useValue: mockHeaderService }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    spyOnProperty(component, 'isSidebarOpened', 'get').and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title from HeaderService', () => {
    const titleElement = fixture.nativeElement.querySelector('h1');
    expect(titleElement.textContent).toContain('Test Title');
  });

  it('should emit sidebarToggle event when menu button is clicked', () => {
    spyOn(component.sidebarToggle, 'emit');
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Toggle sidebar"]'
    );
    button.click();
    expect(component.sidebarToggle.emit).toHaveBeenCalled();
  });

  it('should apply different background to menu button when sidebar is opened', () => {
    spyOnProperty(component, 'isSidebarOpened', 'get').and.returnValue(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Toggle sidebar"]'
    );
    expect(button.classList).toContain('!bg-[#c5cae9]');
  });
});
