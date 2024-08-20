import { type FC, type ReactNode } from "react";

import { Wallet } from "~/components/Wallet";

type Props = {
  children: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col gap-2 max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto my-4">
        <h1 className="text-2xl font-bold">Split The Bill</h1>
        <Wallet />
      </div>
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;