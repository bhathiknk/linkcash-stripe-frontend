import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './components/CheckoutForm';
import PaymentDetails from './components/ PaymentDetails';
import OneTimePaymentPage from './components/OneTimePaymentPage';
import './App.css';

const stripePromise = loadStripe('pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6');

function App() {
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const getLinkInfoFromUrl = () => {
    const url = window.location.href;

    const oneTimeMatch = url.match(/\/one-time\/([^/]+)/);
    const regularMatch = url.match(/\/link\/([^/]+)/);

    if (oneTimeMatch) {
      console.log('Detected One-Time Payment:', oneTimeMatch[1]);
      return { linkId: oneTimeMatch[1], isOneTime: true };
    }

    if (regularMatch) {
      console.log('Detected Regular Payment:', regularMatch[1]);
      return { linkId: regularMatch[1], isOneTime: false };
    }

    return { linkId: null, isOneTime: false };
  };

  const fetchPaymentDetails = async (linkId, isOneTime) => {
    try {
      const apiUrl = isOneTime
          ? `http://localhost:8080/api/one-time-payment-links/link/${linkId}/details`
          : `http://localhost:8080/api/payment-links/link/${linkId}/details`;

      console.log('Fetching from API:', apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }

      const data = await response.json();
      console.log('Fetched Payment Details:', data);
      setPaymentDetails(data);
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };

  const fetchClientSecret = async () => {
    try {
      if (paymentDetails) {
        const response = await fetch('http://localhost:8080/api/payments/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentDetailId: paymentDetails.paymentDetailId || paymentDetails.oneTimePaymentDetailsId,
            userId: paymentDetails.paymentDetailUserId,
            amount: paymentDetails.amount,
          }),
        });

        const data = await response.json();
        console.log('Fetched Client Secret:', data.clientSecret);
        setClientSecret(data.clientSecret);
      }
    } catch (error) {
      console.error('Error fetching client secret:', error);
    }
  };

  useEffect(() => {
    const { linkId, isOneTime } = getLinkInfoFromUrl();
    if (linkId) {
      fetchPaymentDetails(linkId, isOneTime);
    }
  }, []);

  useEffect(() => {
    if (paymentDetails && !clientSecret) {
      fetchClientSecret();
    }
  }, [paymentDetails, clientSecret]);

  return (
      <div className="container mt-4">
        <div className="payment-container shadow rounded p-4 bg-light">
          {paymentDetails && (
              <>
                {paymentDetails.oneTimePaymentDetailsId ? (
                    <OneTimePaymentPage details={paymentDetails} />
                ) : (
                    <PaymentDetails details={paymentDetails} />
                )}
              </>
          )}
          <div className="checkout-form mt-4">
            {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <CheckoutForm />
                </Elements>
            ) : (
                paymentDetails && (
                    <div className="loading-container text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p>Initializing payment...</p>
                    </div>
                )
            )}
          </div>
        </div>
      </div>
  );
}

export default App;
