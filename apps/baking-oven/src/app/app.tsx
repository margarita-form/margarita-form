import styled from 'styled-components';
import {
  MargaritaFormControl,
  useMargaritaForm,
  MargaritaFormField,
  MargaritaFormGroup,
} from '@margarita-form/react';
import { useState } from 'react';

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
    min-width: clamp(400px, 25vw, 620px);
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

const fields: MargaritaFormField[] = [
  {
    name: 'title',
    initialValue: 'Hello world',
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
  {
    name: 'steps',
    grouping: 'repeat-group',
    startWith: 2,
    template: {
      name: 'test',
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

export function App() {
  const [submitResponse, setSubmitResponse] = useState<string | null>(null);
  const { form, value } = useMargaritaForm({
    fields,
    handleSubmit: {
      valid: (value) => {
        console.log('Valid submit', { value });
        setSubmitResponse('Form is valid!');
      },
      invalid: (value) => {
        console.log('Invalid submit', { value });
        setSubmitResponse('Form is invalid!');
      },
    },
  });

  const titleControl = form.getControl<MargaritaFormControl>('title');
  const descriptionControl =
    form.getControl<MargaritaFormControl>('description');
  const stepsControl = form.getControl<MargaritaFormGroup>('steps');

  return (
    <AppWrapper>
      <div className="form-wrapper">
        <form ref={form.setRef}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            ref={titleControl.setRef}
            placeholder="How to make a cake"
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            ref={descriptionControl.setRef}
            placeholder="Lorem ipsum"
          />

          {stepsControl &&
            stepsControl.controls.map((stepGroup) => {
              const stepTitleControl =
                stepGroup.getControl<MargaritaFormControl>('title');
              const stepDescriptionControl =
                stepGroup.getControl<MargaritaFormControl>('description');

              return (
                <div className="step-container" key={stepGroup.key}>
                  {stepTitleControl && (
                    <input
                      id="title"
                      name="title"
                      type="text"
                      ref={stepTitleControl.setRef}
                      placeholder="Title"
                    />
                  )}
                  {stepDescriptionControl && (
                    <input
                      id="description"
                      name="description"
                      type="text"
                      ref={stepDescriptionControl.setRef}
                      placeholder="Description"
                    />
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
              stepsControl.appendRepeatingControls();
            }}
          >
            Add new step
          </button>

          <hr />

          <button type="submit">Submit</button>

          {submitResponse && <span>{submitResponse}</span>}
        </form>
      </div>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </AppWrapper>
  );
}

export default App;
