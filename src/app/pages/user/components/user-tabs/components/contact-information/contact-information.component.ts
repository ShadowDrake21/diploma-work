import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { IUser } from '@models/user.model';

@Component({
  selector: 'user-contact-information',
  imports: [MatIcon, MatCardModule],
  templateUrl: './contact-information.component.html',
})
export class ContactInformationComponent {
  user = input.required<IUser>();
}
