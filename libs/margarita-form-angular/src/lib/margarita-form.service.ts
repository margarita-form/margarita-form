import { Injectable } from '@angular/core';
import { MF, MFF, addFormToCache, createMargaritaForm, getFormFromCache, removeFormFromCache } from '@margarita-form/core/light';

@Injectable()
export class MargaritaFormService {
  private _currentForm: MF | undefined;

  public get form(): MF | undefined {
    return this._currentForm;
  }

  public setForm = <F extends MF>(form: F): void => {
    this._currentForm = form;
  };

  public createForm = <F extends MFF>(formField: F): MF<F> => {
    const form = createMargaritaForm(formField);
    this.setForm(form);
    return this.form as MF<F>;
  };

  public static getForm = (name: string): MF | undefined => {
    return getFormFromCache(name);
  };

  public static addForm = (form: MF): void => {
    return addFormToCache(form);
  };

  public static removeForm = (name: string): void => {
    return removeFormFromCache(name);
  };
}
