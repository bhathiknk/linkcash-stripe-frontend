import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './components/CheckoutForm';
import PaymentDetails from './components/ PaymentDetails';
import './App.css'; // Import CSS for styling

const stripePromise = loadStripe('pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6'); // Replace with your Stripe Publishable Key

function App() {
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const getLinkIdFromUrl = () => {
    const url = window.location.href;
    const match = url.match(/link\/([^/]+)/);
    return match ? match[1] : null;
  };

  const fetchPaymentDetails = async (linkId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/payment-links/link/${linkId}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      const data = await response.json();
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
            paymentDetailId: paymentDetails.paymentDetailId,
            userId: paymentDetails.paymentDetailUserId,
            amount: paymentDetails.amount,
          }),
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      }
    } catch (error) {
      console.error('Error fetching client secret:', error);
    }
  };

  useEffect(() => {
    const linkId = getLinkIdFromUrl();
    if (linkId) {
      fetchPaymentDetails(linkId);
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
          {paymentDetails && <PaymentDetails details={paymentDetails} />}
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
