import { useSnackbar } from 'notistack';
import { type FC,useState } from "react";
import { QRCode } from 'react-qrcode-logo';

import { APP_NAME, USDC_COLOR, USDC_IMAGE } from "~/constants";
import { type Split } from "~/types/split";

const QRCodeModal: FC<{ formattedAmount: string; split: Split; splitId: string; }> = ({ formattedAmount }) => {
  return (
    <>
      <label htmlFor="qr-code-modal" className="btn btn-sm btn-ghost">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
        </svg>
      </label>

      <input type="checkbox" id="qr-code-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle" role="dialog">
        <div className="modal-box flex items-center justify-center w-full min-h-96">
          <button 
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            aria-label="Close"
            onClick={() => document.getElementById('qr-code-modal')?.click()}
          >
            ✕
          </button>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg text-center font-bold">
              {`Scan this to pay ${formattedAmount} USDC`}
            </h3>
            <QRCode 
              value={window.location.href}
              size={256}
              fgColor={USDC_COLOR}
              logoImage={USDC_IMAGE}
              logoWidth={72}
              logoHeight={72}
              qrStyle="dots"
              eyeRadius={2}
            />
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="qr-code-modal">Close</label>
      </div>
    </>
  )
}

const CopyCode: FC<{ splitId: string }> = ({ splitId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [showCheck, setShowCheck] = useState<boolean>(false);

  return (
    <button 
      className="btn btn-xs btn-ghost btn-circle"
      onClick={() => {
        setShowCheck(true);
        void navigator.clipboard.writeText(splitId);
        enqueueSnackbar('Code copied to clipboard', { variant: 'success' });
        setTimeout(() => setShowCheck(false), 2000);
      }}
    >
      {showCheck ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
        </svg>
      )}
    </button>
  );
}

type Props = {
  splitId: string;
  split: Split;
  formattedAmount: string;
}

export const Share: FC<Props> = ({ splitId, split, formattedAmount }) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: APP_NAME,
        text: `Here is the link for splitting the bill. It came out to ${formattedAmount} USDC each.`,
        url: window.location.href,
      });
    } else {
      // copy the url to the clipboard
      await navigator.clipboard.writeText(window.location.href);
      enqueueSnackbar('Link copied to clipboard', { variant: 'success' });
    }
  }
  return (
    <div className="flex flex-col">
      <div className="flex">
        <QRCodeModal formattedAmount={formattedAmount} split={split} splitId={splitId} />
        <button
          className="btn btn-sm btn-ghost"
          onClick={handleShare}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
          </svg>
        </button>
      </div>
      <div className="text-xs text-center flex items-center">
        share code: {splitId}
        <CopyCode splitId={splitId} />
      </div>
    </div>
  )
};