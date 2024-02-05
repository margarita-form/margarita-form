import { Subscription, debounceTime, fromEvent } from 'rxjs';
import { ExtensionName, MFC, MargaritaFormState } from '../../typings/margarita-form-types';
import { ExtensionBase } from '../base/extension-base';
import { MargaritaFormControl } from '../../margarita-form-control';
import { toHash } from '../../helpers/to-hash';

export class HistoryEntry {
  public timestamp: number = Date.now();
  public value: unknown;
  public state: MargaritaFormState;

  constructor(control: MFC) {
    this.value = structuredClone(control.value);
    this.state = structuredClone(control.state);
  }

  get hash() {
    const valueHash = toHash(this.value);
    const stateHash = toHash(this.state);
    return `${valueHash}-${stateHash}`;
  }
}

export class HistoryExtension extends ExtensionBase {
  public static override extensionName: ExtensionName = 'history';
  public override activeCheck = (control: MFC) => control.isRoot;
  public history: HistoryEntry[] = [];
  private subscriptions: Subscription[] = [];
  private lastEvent: 'new' | 'undo' | 'redo' = 'new';
  private currentEntry: HistoryEntry | null = null;

  constructor(public override root: MFC) {
    super(root);

    MargaritaFormControl.extend({
      get history(): HistoryEntry[] {
        return this.extensions.history.history;
      },
      undo: () => this.undo(),
      redo: () => this.redo(),
    });
  }

  public override afterReady = () => {
    const valueChanges = this.root.valueChanges.pipe(debounceTime(500)).subscribe(() => this.addHistoryEntry());
    this.subscriptions.push(valueChanges);

    const ctrlZListener = fromEvent<KeyboardEvent>(window, 'keydown').subscribe((event) => {
      if (this.root.state.focusWithin && event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        this.undo();
      }
    });
    this.subscriptions.push(ctrlZListener);

    const ctrlYListener = fromEvent<KeyboardEvent>(window, 'keydown').subscribe((event) => {
      if (this.root.state.focusWithin && event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        this.redo();
      }
    });
    this.subscriptions.push(ctrlYListener);
  };

  public override onCleanup = () => {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  };

  private createHistoryEntry(): HistoryEntry {
    return new HistoryEntry(this.root);
  }

  private addHistoryEntry() {
    const entry = this.createHistoryEntry();
    if (this.currentEntry && this.currentEntry.hash === entry.hash) return;
    if (this.lastEvent !== 'new' && this.currentEntry) {
      const currentEntryIndex = this.history.indexOf(this.currentEntry);
      this.history = this.history.slice(0, currentEntryIndex + 1);
    }
    this.history.push(entry);
    this.lastEvent = 'new';
    this.currentEntry = entry;
  }

  private undo() {
    if (!this.currentEntry) return;
    const currentEntryIndex = this.history.indexOf(this.currentEntry);
    const previousEntry = this.history[currentEntryIndex - 1];
    if (previousEntry) {
      this.root.setValue(previousEntry.value);
      this.root.updateState(previousEntry.state);
      this.lastEvent = 'undo';
      this.currentEntry = previousEntry;
    }
  }

  private redo() {
    if (!this.currentEntry) return;
    const currentEntryIndex = this.history.indexOf(this.currentEntry);
    const nextEntry = this.history[currentEntryIndex + 1];
    if (nextEntry) {
      this.root.setValue(nextEntry.value);
      this.root.updateState(nextEntry.state);
      this.lastEvent = 'redo';
      this.currentEntry = nextEntry;
    }
  }
}

export * from './history-extension-types';
