export const Grid = ({ children }: { children?: any }) => (
  <div className="mt-12 space-y-6 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-12 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
    {children}
  </div>
);
