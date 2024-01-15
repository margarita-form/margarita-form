import { MargaritaFormResolver } from '../../typings/margarita-form-types';

export const localizeResolver: MargaritaFormResolver = (context) => {
  const { control, params } = context;
  const { extensions } = control;
  const { localization } = extensions;
  return localization.getLocalizedValue(params);
};
