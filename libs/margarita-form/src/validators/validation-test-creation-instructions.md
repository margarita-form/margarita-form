create tests for all validators in following format:
`import { createMargaritaForm } from '../../create-margarita-form';
import { colorValidator } from './color-validator';

const validator = colorValidator(true, "Please enter a valid color");

describe('colorValidator', () => {
it('should return valid for empty value', async () => {
const form = createMargaritaForm({
name: 'color-validator-test-form',
initialValue: undefined,
validation: { required: false, color: validator },
});
await form.validate();
const { valid, errors } = form.state;
expect(valid).toBe(true);
expect(errors).toEqual({});
form.cleanup();
});
it('should return invaid for "invalid value"', async () => {
const form = createMargaritaForm({
name: 'color-validator-test-form',
initialValue: "invalid value",
validation: { required: false, color: validator },
});
await form.validate();
const { valid, errors } = form.state;
expect(valid).toBe(false);
expect(errors).toEqual({ color: "Please enter a valid color" });
form.cleanup();
});
});`
Also note that if "required" validation is not present, validator will give output of valid true when value is undefined, null or similar. Keeping required as false is best option for the tests.
