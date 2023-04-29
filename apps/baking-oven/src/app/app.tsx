import styled from 'styled-components';
import { useMargaritaForm, MargaritaFormField, Form, MFC } from '@margarita-form/react';
import { useState } from 'react';
import { recipeFields } from './fields/receipe';
import { websiteFields } from './fields/website';

const AppWrapper = styled.div`
  font-family: Arial, sans-serif;
  padding: 10vw;
  display: grid;
  justify-content: center;
  justify-items: start;
  grid-template-columns: 1fr 1fr;
  width: fit-content;
  gap: 50px;
  margin: auto;
  form {
    min-width: clamp(500px, 25vw, 720px);
    display: grid;
    gap: 10px;
    input,
    textarea {
      font-family: Arial, sans-serif;
      padding: 0.5em;
    }
    .field-wrapper {
      display: grid;
      gap: 4px;
      &.repeatable {
        gap: 10px;
      }
      h2,
      h3,
      h4 {
        margin: 0;
      }
    }
    .locales-fields {
      display: grid;
      gap: 10px;
      border-left: 1px solid #ccc;
      padding: 0 10px;
      margin: 10px 0;
    }
    .step-container {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr max-content;
      padding: 10px;
      border: 1px solid #ccc;
      button {
        height: fit-content;
      }
      .step-fields {
        grid-column: 1 / -1;
        display: grid;
        gap: 10px;
      }
    }
    hr {
      width: 100%;
    }
  }
  pre {
    width: 100%;
    padding: 20px;
    background: #f8f8f8;
    min-height: 100%;
    box-sizing: border-box;
    margin: 0;
  }
`;

export interface CustomField extends MargaritaFormField<CustomField> {
  type: 'text' | 'textarea' | 'repeatable' | 'localized';
  title: string;
}

interface FormValue {
  title: string;
  description: string;
  steps: { title: string; description: string }[];
}

export function App() {
  const [submitResponse, setSubmitResponse] = useState<string | null>(null);
  const [currentFields, setCurrentFields] = useState(recipeFields);
  const [shouldReset, setShouldReset] = useState(true);

  const form = useMargaritaForm<FormValue, CustomField>(
    {
      fields: currentFields,
      locales: ['en', 'fi'],
      handleLocalize: {
        parent: () => {
          return {
            type: 'localized',
          };
        },
        child: ({ locale }) => {
          return {
            title: locale.toUpperCase(),
          };
        },
      },
      handleSubmit: {
        valid: async (form) => {
          setSubmitResponse('Fake submitting for 1s...');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log('Valid submit', { form });
          setSubmitResponse('Form is valid!');
        },
        invalid: async (form) => {
          setSubmitResponse('Fake submitting for 1s...');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log('Invalid submit', { form });
          setSubmitResponse('Form is invalid!');
        },
      },
      options: {
        handleSuccesfullSubmit: 'enable',
        addMetadataToArrays: true,
      },
    },
    {
      resetFormOnFieldChanges: shouldReset,
    }
  );

  return (
    <AppWrapper>
      <div className="form-wrapper">
        <Form form={form}>
          <h2>Options</h2>

          <div>
            <input
              type="checkbox"
              id="should-reset"
              name="should-reset"
              checked={shouldReset}
              onChange={(e) => {
                setShouldReset(e.target.checked);
              }}
            />
            <label htmlFor="should-reset">Form should reset on field changes?</label>
          </div>

          <hr />

          <div className="change-fields-wrapper">
            <h2>Change fields</h2>
            <button
              type="button"
              onClick={() => {
                setCurrentFields(recipeFields);
              }}
            >
              Recipe fields
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentFields(websiteFields);
              }}
            >
              Website fields
            </button>
          </div>

          <hr />

          <h2>Fields</h2>

          {form.controls.map((control) => (
            <FormField key={control.key} control={control} />
          ))}

          <hr />

          <button type="submit">Submit</button>

          <hr />

          <button type="button" onClick={form.reset}>
            Reset
          </button>

          {submitResponse && <span>{submitResponse}</span>}
        </Form>
      </div>
      <pre>{JSON.stringify(form.value, null, 2)}</pre>
    </AppWrapper>
  );
}

interface FormFieldProps {
  control: MFC<unknown, CustomField>;
}

const FormField = ({ control }: FormFieldProps) => {
  const uid = control.name + '-' + control.key;

  switch (control.field.type) {
    case 'text':
      return (
        <div className="field-wrapper">
          <label htmlFor={uid}>{control.field.title}</label>
          <input id={uid} name={uid} type="text" ref={control.setRef} />
        </div>
      );

    case 'textarea':
      return (
        <div className="field-wrapper">
          <label htmlFor={uid}>{control.field.title}</label>
          <textarea id={uid} name={uid} ref={control.setRef} />
        </div>
      );

    case 'localized':
      return (
        <div className="field-wrapper">
          <h3>{control.field.title}</h3>
          <div className="locales-fields">
            {control.controls.map((localeControl) => {
              return <FormField key={localeControl.key} control={localeControl} />;
            })}
          </div>
        </div>
      );

    case 'repeatable':
      return (
        <div className="field-wrapper repeatable">
          <h3>{control.field.title}</h3>

          {control.controls.map((childGroup) => {
            return (
              <div className="step-container" key={childGroup.key}>
                <h3>
                  {childGroup.field.title}: {childGroup.index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    childGroup.remove();
                  }}
                >
                  Delete step
                </button>

                <div className="step-fields">
                  {childGroup.controls.map((control) => (
                    <FormField key={control.key} control={control} />
                  ))}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              control.appendRepeatingControls();
            }}
          >
            Add new step
          </button>
        </div>
      );

    default:
      return <p>Unknown field type: {control.field.type}</p>;
  }
};

export default App;

/* 


          {stepsControl &&
            stepsControl.controls.map((stepGroup) => {
              const stepTitleControl = stepGroup.getControl('title');
              const stepDescriptionControl = stepGroup.getControl('description');

              return (
                <div className="step-container" key={stepGroup.key}>
                  {stepTitleControl && <input id="title" name="title" type="text" ref={stepTitleControl.setRef} placeholder="Title" />}
                  {stepDescriptionControl && (
                    <input id="description" name="description" type="text" ref={stepDescriptionControl.setRef} placeholder="Description" />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      stepGroup.remove();
                    }}
                  >
                    Delete step
                  </button>
                </div>
              );
            })}

          <button
            type="button"
            onClick={() => {
              stepsControl?.appendRepeatingControls();
            }}
          >
            Add new step
          </button>


*/
