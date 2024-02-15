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
    globalName: 'Validators',
    src: 'validators/index',
  },
  {
    main: false,
    globalName: 'AndOr',
    src: 'resolvers/and-or/index',
  },
  {
    main: false,
    globalName: 'ConfigManager',
    src: 'managers/config-manager',
  },
  {
    main: false,
    globalName: 'ControlsManager',
    src: 'managers/controls-manager',
  },
  {
    main: false,
    globalName: 'EventsManager',
    src: 'managers/events-manager',
  },
  {
    main: false,
    globalName: 'FieldManager',
    src: 'managers/field-manager',
  },
  {
    main: false,
    globalName: 'ParamsManager',
    src: 'managers/params-manager',
  },
  {
    main: false,
    globalName: 'RefManager',
    src: 'managers/ref-manager',
  },
  {
    main: false,
    globalName: 'StateManager',
    src: 'managers/state-manager',
  },
  {
    main: false,
    globalName: 'ValueManager',
    src: 'managers/value-manager',
  },
  {
    main: false,
    globalName: 'ExtensionBase',
    src: 'extensions/base/extension-base',
  },
  {
    main: false,
    globalName: 'I18nExtension',
    src: 'extensions/i18n/i18n-extension',
  },
  {
    main: false,
    globalName: 'FieldModifiersExtension',
    src: 'extensions/field-modifiers/field-modifiers-extension',
  },
  {
    main: false,
    globalName: 'StorageExtensionBase',
    src: 'extensions/storage/storage-extension-base',
  },
  {
    main: false,
    globalName: 'BrowserLocalStorage',
    src: 'extensions/storage/browser-local-storage',
  },
  {
    main: false,
    globalName: 'BrowserSearchParamsStorage',
    src: 'extensions/storage/browser-search-params-storage',
  },
  {
    main: false,
    globalName: 'BrowserSessionStorage',
    src: 'extensions/storage/browser-session-storage',
  },
  {
    main: false,
    globalName: 'SyncronizationExtensionBase',
    src: 'extensions/syncronization/syncronization-extension-base',
  },
  {
    main: false,
    globalName: 'BrowserSyncronization',
    src: 'extensions/syncronization/browser-syncronization',
  },
  {
    main: false,
    globalName: 'UnloadExtension',
    src: 'extensions/unload/unload-extension',
  },
  {
    main: false,
    globalName: 'HTMLTemplateExtension',
    src: 'extensions/html-template/html-template-extension',
  },
  {
    main: false,
    globalName: 'HistoryExtension',
    src: 'extensions/history/history-extension',
  },
];
