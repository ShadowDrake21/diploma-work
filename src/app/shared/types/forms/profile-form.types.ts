import { FormControl } from '@angular/forms';
import { UserType } from '@shared/enums/user.enum';

export interface ProfileForm {
  dateOfBirth: FormControl<string | null>;
  userType: FormControl<UserType | null>;
  universityGroup: FormControl<string | null>;
  phoneNumber: FormControl<string | null>;
}
