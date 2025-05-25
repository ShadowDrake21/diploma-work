import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { SocialLink } from '@models/user.model';
import { UserType } from '@shared/enums/user.enum';

export interface ProfileForm {
  dateOfBirth: FormControl<string | Date | null>;
  userType: FormControl<UserType | null>;
  universityGroup: FormControl<string | null>;
  phoneNumber: FormControl<string | null>;
  socialLinks: FormArray<
    FormGroup<{
      url: FormControl<string>;
      name: FormControl<string>;
    }>
  >;
}
