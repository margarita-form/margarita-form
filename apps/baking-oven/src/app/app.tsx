import styled from 'styled-components';
import { useMargaritaForm, MargaritaFormField, Form } from '@margarita-form/react';
import { useCallback, useState } from 'react';

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
    .step-container {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr 1fr max-content;
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

interface CustomField extends MargaritaFormField<CustomField> {
  title?: string;
}

const fields: CustomField[] = [
  {
    name: 'title',
    title: 'Title',
    initialValue: 'Hello world',
    validation: {
      required: true,
    },
  },
  {
    name: 'description',
    title: 'Description',
    validation: {
      required: true,
    },
  },
  {
    name: 'steps',
    title: 'Steps',
    grouping: 'repeat-group',
    startWith: 2,
    template: {
      fields: [
        {
          name: 'title',
          validation: {
            required: true,
          },
        },
        {
          name: 'description',
          validation: {
            required: true,
          },
        },
      ],
    },
  },
];

const simpler: CustomField[] = [
  {
    name: 'title',
    title: 'Short title',
    initialValue: 'Hello world',
    validation: {
      required: true,
    },
  },
  {
    name: 'description',
    title: 'Short description',
    validation: {
      required: true,
    },
  },
  {
    name: 'steps',
    title: 'Steps',
    grouping: 'repeat-group',
    startWith: 0,
    template: {
      fields: [
        {
          name: 'title',
          validation: {
            required: true,
          },
        },
        {
          name: 'description',
          validation: {
            required: true,
          },
        },
      ],
    },
  },
];

interface FormValue {
  title: string;
  description: string;
  steps: { title: string; description: string }[];
}

export function App() {
  const [submitResponse, setSubmitResponse] = useState<string | null>(null);
  const [currentFields, setCurrentFields] = useState(fields);
  const [shouldReset, setShouldReset] = useState(false);

  const form = useMargaritaForm<FormValue, CustomField>(
    {
      fields: currentFields,
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
      },
    },
    {
      resetFormOnFieldChanges: shouldReset,
    }
  );

  const titleControl = form.getControl('title');
  const descriptionControl = form.getControl('description');

  const stepsControl = form.getControl('steps');

  const changeFields = useCallback(() => {
    if (currentFields === fields) {
      setCurrentFields(simpler);
    } else {
      setCurrentFields(fields);
    }
  }, [currentFields]);

  return (
    <AppWrapper>
      <div className="form-wrapper">
        <Form form={form}>
          <div>
            <input
              type="checkbox"
              id="should-reset"
              name="should-reset"
              onChange={(e) => {
                setShouldReset(e.target.checked);
              }}
            />
            <label htmlFor="should-reset">Form should reset on field changes?</label>
          </div>

          <button type="button" onClick={changeFields}>
            Change fields
          </button>

          <hr />

          {titleControl && (
            <>
              {' '}
              <label htmlFor="title">{titleControl.field.title}</label>
              <input id="title" name="title" type="text" ref={titleControl.setRef} placeholder="How to make a cake" />
            </>
          )}
          {descriptionControl && (
            <>
              <label htmlFor="description">{descriptionControl.field.title}</label>
              <textarea id="description" name="description" ref={descriptionControl.setRef} placeholder="Lorem ipsum" />
            </>
          )}

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

export default App;
