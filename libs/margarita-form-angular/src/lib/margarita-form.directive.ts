import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { DeepControlIdentifier, MFC, MFF, MargaritaFormControl } from '@margarita-form/core';
import { MargaritaFormService } from './margarita-form.service';

@Directive({
  selector: '[mfControl], [mfForm]',
})
export class MargaritaFormControlDirective implements OnInit {
  @Input() mfControl?: MFC | DeepControlIdentifier<MFF>;

  constructor(private el: ElementRef, private mfService: MargaritaFormService) {}

  ngOnInit(): void {
    if (this.mfControl instanceof MargaritaFormControl) {
      this.mfControl.setRef(this.el.nativeElement);
    } else if (this.mfService.form) {
      const control = this.mfService.form.getControl(this.mfControl);
      if (control) control.setRef(this.el.nativeElement);
    }
  }
}
