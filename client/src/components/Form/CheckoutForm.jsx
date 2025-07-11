import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";
import "./chackoutForm.css";
import { ClipLoader } from "react-spinners";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const CheckoutForm = ({ totalPrice, closeModal, orderData,refetch }) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const axiosSecure = useAxiosSecure();
  useEffect(() => {
    const getClientSecret = async () => {
      // server request...
      const { data } = await axiosSecure.post("/payment/create-payment-intent", {
        quantity: orderData?.quantity,
        plantId: orderData?.plantId,
      });
      console.log(data);
      setClientSecret(data?.clientSecret);
    };
    getClientSecret();
  }, [axiosSecure, orderData]);

  const handleSubmit = async (event) => {
    setProcessing(true);
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("[error]", error);
      setCardError(error.message);
      setProcessing(false);
      return;
    } else {
      // console.log("[PaymentMethod]", paymentMethod);
      setCardError(null);
    }

    //  Taka katar pala
 const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: user?.displayName,
          email: user?.email,
        },
      },
    })

    if (result?.error) {
      setCardError(result?.error?.message)
      return
    }
    if (result?.paymentIntent?.status === 'succeeded') {
      // save order data in db
      orderData.transactionId = result?.paymentIntent?.id
      try {
        const { data } = await axiosSecure.post('/order', orderData)
      
        if (data?.insertedId) {
          toast.success('Order Placed Successfully!')
        }
        const { data: result } = await axiosSecure.patch(
          `/plant/update-quantity/${orderData?.plantId}`,
          { quantityToUpdate: orderData?.quantity, status: 'decrease' }
        )
        refetch()
     
      } catch (err) {
        console.log(err)
      } finally {
        setProcessing(false)
        setCardError(null)
        closeModal()
      }
      // update product quantity in db from plant collection
    }
   
  }


  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />

      {cardError && <p className="text-red-500 my-2">{cardError}</p>}
      <div className="flex justify-between">
        <button
          className="px-3 py-1 bg-green-400 rounded cursor-pointer"
          type="submit"
          disabled={!stripe || processing}
        >
          {processing ? (
            <ClipLoader size={24} className="mt-2" />
          ) : (
            `Pay ${totalPrice}$`
          )}
        </button>
        <button
          onClick={closeModal}
          className="px-3 py-1 bg-red-400 rounded cursor-pointer"
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
