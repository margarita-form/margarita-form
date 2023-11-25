import type { ControlChange, MFC } from '@margarita-form/core/light';
import { useEffect, useState } from 'react';
import { filter } from 'rxjs';

type Filter = (change: ControlChange) => boolean;
const defaultFilterFn: Filter = () => true;

export const useControlChanges = <CHANGES = unknown>(control: MFC, filterFn: Filter = defaultFilterFn) => {
  const [syncId, setSyncId] = useState(control.syncId);
  const [current, setCurrent] = useState<undefined | CHANGES>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<undefined | unknown>(undefined);

  useEffect(() => {
    try {
      const subscription = control.ownChanges.pipe(filter(filterFn)).subscribe(({ change }) => {
        setCurrent(change as CHANGES);
        setSyncId(control.syncId);
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    } catch (error: any) {
      setError(error);
      return;
    }
  }, []);

  return { current, loading, error, syncId };
};

export const useUpdateOnChanges = (control: MFC) => {
  useControlChanges(control);
};
