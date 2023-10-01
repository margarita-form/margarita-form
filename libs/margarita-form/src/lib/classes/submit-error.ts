export class SubmitError {
  constructor(public message: string, public value?: any) {
    console.error('Valid submit resulted in error!');
  }
}
