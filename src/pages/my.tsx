import { type NextPage } from "next";

export const MySplits: NextPage = () => {
  return (
    <div className="flex flex-col gap-2 justify-center max-w-md mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">My Splits</h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-sm">Lunch</span>
            <span className="text-sm">$10.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Dinner</span>
            <span className="text-sm">$20.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Groceries</span>
            <span className="text-sm">$50.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Drinks</span>
            <span className="text-sm">$15.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MySplits;