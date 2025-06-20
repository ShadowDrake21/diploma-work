import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default diameter of 75', () => {
    expect(component.diameter()).toBe(75);
  });

  it('should calculate correct loader styles for default diameter', () => {
    const styles = component.loaderStyles;
    expect(styles['width']).toBe('75px');
    expect(styles['height']).toBe('75px');
    expect(styles['borderWidth']).toBe('7.5px');
  });

  it('should calculate correct loader styles for custom diameter', () => {
    fixture.componentRef.setInput('diameter', 100);
    fixture.detectChanges();

    const styles = component.loaderStyles;
    expect(styles['width']).toBe('100px');
    expect(styles['height']).toBe('100px');
    expect(styles['borderWidth']).toBe('10px'); // 100 * 0.1
  });

  it('should have minimum border width of 4px', () => {
    fixture.componentRef.setInput('diameter', 30);
    fixture.detectChanges();

    const styles = component.loaderStyles;
    expect(styles['borderWidth']).toBe('4px');
  });
});
