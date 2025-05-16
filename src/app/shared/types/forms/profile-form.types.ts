import { FormControl } from '@angular/forms';
import { UserType } from '@models/user.model';

export interface ProfileForm {
  dateOfBirth: FormControl<string | null>;
  userType: FormControl<UserType | null>;
  universityGroup: FormControl<string | null>;
  phoneNumber: FormControl<string | null>;
}
