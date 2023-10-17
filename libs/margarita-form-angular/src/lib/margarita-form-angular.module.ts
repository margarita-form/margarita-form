import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MargaritaFormControlDirective } from './margarita-form.directive';
import { MargaritaFormService } from './margarita-form.service';

@NgModule({
  imports: [CommonModule],
  declarations: [MargaritaFormControlDirective],
  exports: [MargaritaFormControlDirective],
  providers: [MargaritaFormService],
})
export class MargaritaFormModule {}
