import { Pipe, PipeTransform } from '@angular/core';
import { DeepControlIdentifier, MFC, MFF, MargaritaFormControl } from '@margarita-form/core';
import { MargaritaFormService } from './margarita-form.service';

@Pipe({
  name: 'getControl',
})
export class GetControlPipe implements PipeTransform {
  constructor(private mfService: MargaritaFormService) {}

  transform(control: MFC | DeepControlIdentifier<MFF>): MFC | undefined {
    if (control instanceof MargaritaFormControl) {
      return control;
    } else if (this.mfService.form) {
      return this.mfService.form.getControl(control);
    }
    return undefined;
  }
}
