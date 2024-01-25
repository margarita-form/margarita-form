import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MargaritaFormField, MargaritaFormModule, MargaritaFormService } from '@margarita-form/angular';

interface MyFormValue {
  name?: string;
  message?: string;
}

interface MyFormField extends MargaritaFormField<{ fields: MyFormField }> {
  type: 'text' | 'textarea';
  title: string;
}

type RootField = MargaritaFormField<{ value: MyFormValue; fields: MyFormField }>;

@Component({
  selector: 'app-readme-example',
  standalone: true,
  imports: [CommonModule, MargaritaFormModule],
  styles: `
  // Very basic styling
  :host {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    h2 {
      font-size: 16px
    }
    form {
      display: grid;
      gap: 10px;
      font-family: sans-serif;
    }
    .field-wrapper {
      display: grid;
      gap: 4px;
    }
    input, textarea {
      padding: 0.5em;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: sans-serif;
      width: 100%;
    }
    button[type="submit"] {
      padding: 0.5em 2em;
      width: fit-content;
    } 
    code {
      display: block;
      background: #111;
      color: #fff;
      padding: 20px;
    }
  }
`,
  template: `
    <!-- Render the current value -->
    <h2>Current value</h2>
    <code>{{ form.value | json }}</code>

    <!-- Render the form -->
    <h2>Form</h2>
    <form *ngIf="form" [mfControl]="form">
      <!-- Map controls and connect to inputs -->
      <div class="field-wrapper" *ngFor="let control of form.controls">
        <label [for]="control.uid">{{ control.field.title }}</label>

        <ng-container [ngSwitch]="control.field.type">
          <div *ngSwitchCase="'text'">
            <input [id]="control.uid" [name]="control.uid" type="text" [mfControl]="control" />
          </div>

          <div *ngSwitchCase="'textarea'">
            <textarea [id]="control.uid" [name]="control.uid" type="text" [mfControl]="control"></textarea>
          </div>

          <div *ngSwitchDefault>Unknown field type: {{ control.field.type }}</div>
        </ng-container>
      </div>

      <!-- Submit the form -->
      <button type="submit">Submit</button>
    </form>
  `,
})
export class ReadmeExampleComponent {
  private formService = inject(MargaritaFormService);

  public form = this.formService.createForm<RootField>({
    name: 'my-form',
    fields: [
      {
        name: 'name',
        title: 'Full name',
        type: 'text',
        validation: { required: true },
        attributes: { placeholder: 'John Doe' },
      },
      {
        name: 'message',
        title: 'Message',
        type: 'textarea',
        validation: { required: true },
        attributes: { placeholder: 'Lorem ipsum' },
      },
    ],
    handleSubmit: {
      valid: async ({ value }) => {
        console.log('Valid submit', { value });
      },
      invalid: async ({ control, value }) => {
        const { allErrors } = control.state;
        console.log('Form is not valid!', { value, allErrors });
      },
    },
    config: {
      handleSuccesfullSubmit: 'reset', // Change what happens when form is successfully submitted
    },
  });
}
