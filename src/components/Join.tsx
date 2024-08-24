import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, useState } from "react";

export const Join: FC = () => {
  const router = useRouter();
  const [showInput, setShowInput] = useState<boolean>(false);
  const [splitId, setSplitId] = useState<string>('');

  // if the user hits enter, we should navigate to the split page
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // navigate to the split
      void router.push(`/split/${splitId}`);
    }
  };

  return (
    <div>
      <div 
        className="cursor-pointer flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20" 
        onClick={() => setShowInput(true)}
      >
        <h3 className="text-2xl font-bold">Pay Split →</h3>
        <div className="text-lg">
          Pay your share of the bill
        </div>
      </div>
      {showInput && (
        <div className="my-2">
          <label className="form-control w-full">
            <div className="flex items-center justify-between">
              <div className="label">
                <span className="label-text">Code</span>
              </div>
              <button
                className="cursor-pointer text-xs p-2 w-fit"
                onClick={() => setShowInput(false)}
              >
                ✕
              </button>
            </div>
            <input 
              type="text" 
              value={splitId}
              onKeyDown={handleKeyDown}
              onChange={(e) => setSplitId(e.target.value)}
              placeholder="Enter your code here" 
              className="input input-bordered w-full"
            />
            <Link
              href={`/split/${splitId}`}
              className="btn btn-primary w-full mt-2"
            >
              Join
            </Link>
          </label>
        </div>
      )}
    </div>
  )
};

export default Join;