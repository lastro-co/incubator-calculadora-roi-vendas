import type { ReactElement, ReactNode } from 'react';

type Props = { children: ReactNode };
type Provider = ({ children }: Props) => ReactElement;

export const composeProviders =
  (...providers: Provider[]) =>
  ({ children }: Props) =>
    providers.reduceRight(
      (Acc, P) =>
        ({ children }: Props) => (
          <P>
            <Acc>{children}</Acc>
          </P>
        ),
      ({ children }: Props) => <>{children}</>
    )({ children });
