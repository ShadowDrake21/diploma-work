import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IUser } from '@models/user.model';

@Component({
  selector: 'user-contact-information',
  imports: [MatIcon],
  templateUrl: './contact-information.component.html',
  styleUrl: './contact-information.component.scss',
})
export class ContactInformationComponent {
  user = input.required<IUser>();
}
