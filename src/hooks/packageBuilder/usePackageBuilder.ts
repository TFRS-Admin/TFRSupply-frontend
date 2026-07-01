import { useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import { packageBuilderService } from '@/services/packageBuilder';
import type { PackageAssemblyInput, PackageAssemblyResult, PackageDefinition, PackageValidationResult } from '@/types';

interface PackageBuilderResourceState<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
}

function usePackageBuilderResource<T>(load: () => Promise<T> | null, dependencies: DependencyList): PackageBuilderResourceState<T> {
  const [state, setState] = useState<PackageBuilderResourceState<T>>({ data: null, loading: false, error: null });

  useEffect(() => {
    let active = true;
    const pending = load();
    if (!pending) {
      setState({ data: null, loading: false, error: null });
      return () => { active = false; };
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    pending.then((data) => {
      if (active) setState({ data, loading: false, error: null });
    }).catch((error) => {
      if (active) setState({ data: null, loading: false, error });
    });
    return () => { active = false; };
  }, dependencies);

  return state;
}

export function usePackageDefinition(packageId: string | null | undefined): PackageBuilderResourceState<PackageDefinition | null> {
  return usePackageBuilderResource(() => (packageId ? packageBuilderService.getPackageDefinition(packageId) : null), [packageId]);
}

export function usePackageAssembly(input: PackageAssemblyInput | null | undefined): PackageBuilderResourceState<PackageAssemblyResult> {
  return usePackageBuilderResource(() => (input ? packageBuilderService.assemblePackage(input) : null), [input]);
}

export function usePackageValidation(input: PackageAssemblyInput | null | undefined): PackageBuilderResourceState<PackageValidationResult> {
  return usePackageBuilderResource(() => (input ? packageBuilderService.validatePackage(input) : null), [input]);
}
