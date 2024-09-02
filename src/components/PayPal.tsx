import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { type FC } from "react";

import { env } from "~/env";

type Props = {
  amount: string;
}
const PayPalCheckout: FC<Props> = ({ amount }) => {
  return (
    <PayPalScriptProvider options={{ clientId: env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE", // Add this line
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: amount,
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order!.capture().then((details) => {
            console.log({ details, data, actions })
            alert("Transaction completed");
            // Handle successful transaction here
          });
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalCheckout;