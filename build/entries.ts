export const buildEntries = [
  {
    main: true,
    src: 'index',
    globalName: 'MargaritaForm',
    outfile: 'margarita-form.min.js',
  },
  {
    main: true,
    src: 'light',
    globalName: 'MargaritaForm',
    outfile: 'margarita-form-light.min.js',
  },
  {
    main: false,
    globalName: 'HistoryExtension',
    src: 'extensions/history/history-extension',
  },
  {
    main: false,
    globalName: 'HTMLTemplateExtension',
    src: 'extensions/html-template/html-template-extension',
  },
];
