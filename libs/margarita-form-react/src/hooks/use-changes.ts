import type { ControlChange, MFC } from '@margarita-form/core';
import { useEffect, useState } from 'react';
import { filter } from 'rxjs';

type Filter = (change: ControlChange) => boolean;
const defaultFilterFn: Filter = () => true;

export const useControlChanges = <CHANGES = unknown>(control: MFC, filterFn: Filter = defaultFilterFn) => {
  const [current, setCurrent] = useState<undefined | CHANGES>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<undefined | unknown>(undefined);

  useEffect(() => {
    try {
      const subscription = control.ownChanges.pipe(filter(filterFn)).subscribe(({ change }) => {
        setCurrent(change as CHANGES);
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    } catch (error: any) {
      setError(error);
      return;
    }
  }, []);

  return { current, loading, error };
};

export const useUpdateOnChanges = (control: MFC) => {
  useControlChanges(control);
};
