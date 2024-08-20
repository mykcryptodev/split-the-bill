import { NextPage } from "next";
import { useMemo, useState } from "react";
import CreateSplit from "~/components/Create";

export const Create: NextPage = () => {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(0);

  const amountPerPerson = useMemo(() => {
    if (numberOfPeople === 0) return 0;
    return totalAmount / numberOfPeople
  }, [totalAmount, numberOfPeople]);

  return (
    <div className="flex flex-col gap-2 justify-center max-w-md mx-auto">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto my-4">
        <h1 className="text-2xl font-bold">Split The Bill</h1>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Create a Split</h2>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Total Amount</span>
          </div>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Total Amount"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value))}
          />
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">How many people?</span>
          </div>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Number of People"
            type="number"
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(Number(e.target.value))}
          />
          <div className="label">
            <span />
            <span className="label-text-alt">Everyone will pay {amountPerPerson} each.</span>
          </div>
        </label>
        <CreateSplit totalAmount={totalAmount} amountPerPerson={amountPerPerson} />
      </div>
    </div>
  );
}

export default Create;