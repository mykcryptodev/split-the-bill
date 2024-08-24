import { type FC } from "react";

type Props = {
  onPayAgain: () => void;
  hide?: boolean;
  splitIsFullyPaid: boolean;
}
export const SuccessfulPayment: FC<Props> = ({ onPayAgain, hide, splitIsFullyPaid }) => {
  if (hide) return null;
  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col items-center justify-center text-center h-42 w-full bg-gradient-to-br from-success via-indigo-300 to-secondary rounded-lg p-1">
        <div className="flex flex-col items-center justify-center text-center h-40 w-full bg-base-100 rounded p-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>You paid your share!</span>
          <div className="flex items-center gap-2">
            {/* <button
              className="btn btn-xs btn-link mt-2"
              onClick={onPayAgain}
            >
              Your Receipt
            </button> */}
            {!splitIsFullyPaid && (
              <button
                className="btn btn-xs btn-link mt-2"
                onClick={onPayAgain}
              >
                Pay Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
};

export default SuccessfulPayment;