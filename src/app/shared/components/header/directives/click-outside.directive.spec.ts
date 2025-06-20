import { Component, ElementRef } from '@angular/core';
import { ClickOutsideDirective } from './click-outside.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <div>
      <div id="inside" clickOutside (clickOutside)="onClickOutside()">
        Inside
      </div>
      <div id="outside">Outside</div>
    </div>
  `,
  standalone: true,
  imports: [ClickOutsideDirective],
})
class TestComponent {
  onClickOutside() {}
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let insideElement: HTMLElement;
  let outsideElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    insideElement = fixture.debugElement.query(By.css('#inside')).nativeElement;
    outsideElement = fixture.debugElement.query(
      By.css('#outside')
    ).nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    const directive = new ClickOutsideDirective(
      new ElementRef(document.createElement('div')),
      document
    );
    expect(directive).toBeTruthy();
  });

  it('should emit clickOutside when clicking outside the element', () => {
    spyOn(component, 'onClickOutside');
    outsideElement.click();
    expect(component.onClickOutside).toHaveBeenCalled();
  });

  it('should not emit clickOutside when clicking inside the element', () => {
    spyOn(component, 'onClickOutside');
    insideElement.click();
    expect(component.onClickOutside).not.toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const directive = fixture.debugElement
      .query(By.directive(ClickOutsideDirective))
      .injector.get(ClickOutsideDirective);
    spyOn(directive.documentClickSubscription!, 'unsubscribe');

    directive.ngOnDestroy();
    expect(directive.documentClickSubscription?.unsubscribe).toHaveBeenCalled();
  });
});
