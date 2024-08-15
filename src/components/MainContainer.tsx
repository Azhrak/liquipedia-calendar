import { ReactNode } from 'react';

export const MainContainer = ({ children }: { children: ReactNode }) => (
	<main className="flex flex-col items-center justify-center p-24">{children}</main>
);
