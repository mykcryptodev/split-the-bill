import { PaymentElement,useElements, useStripe } from '@stripe/react-stripe-js';
import { type StripePaymentElementOptions } from '@stripe/stripe-js';
import { type FC,useEffect, useState } from 'react';

type Props = {
  clientSecret: string;
}

const PayWithFiat: FC<Props> = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }
  }, [stripe, clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/completion`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      // Payment succeeded, you can redirect or show a success message
      console.log('Payment succeeded!');
    }

    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs"
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={paymentElementOptions} />
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

export default PayWithFiat;