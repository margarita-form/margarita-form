type Validators = Record<string, unknown>;

class MargaritaFormValidators {
  private validators: Validators = {};
  // constructor(){}
  addValidator(key: string, validatorFn: unknown) {
    this.validators[key] = validatorFn;
  }

  registerValidators(validators: Validators) {
    console.log(validators);
  }
}
