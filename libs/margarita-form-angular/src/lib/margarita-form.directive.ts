import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core';
import { DeepControlIdentifier, MFC, MFF, MargaritaFormControl } from '@margarita-form/core';
import { MargaritaFormService } from './margarita-form.service';

@Directive({
  selector: '[mfControl], [mfForm]',
  standalone: false,
})
export class MargaritaFormControlDirective implements OnInit {
  @Input() mfControl?: MFC | DeepControlIdentifier<MFF>;

  public mfService = inject(MargaritaFormService);
  public el = inject(ElementRef);

  ngOnInit(): void {
    if (!this.mfControl) throw 'Value for [mfControl] is required!';
    if (this.mfControl instanceof MargaritaFormControl) {
      this.mfControl.setRef(this.el.nativeElement);
    } else if (this.mfService.form) {
      const control = this.mfService.form.getControl(this.mfControl);
      if (control) control.setRef(this.el.nativeElement);
    }
  }
}
