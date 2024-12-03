import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './components/CheckoutForm';
import PaymentDetails from './components/ PaymentDetails';
import './App.css'; // Import the CSS for animation and layout

const stripePromise = loadStripe('pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6'); // Replace with your Stripe Publishable Key

function App() {
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null); // Store payment details
  const stripeAccountId = 'acct_1QQP4cCdwebH2AJZ';

  // Extract `linkId` from the URL
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
      setPaymentDetails(data); // Store the fetched payment details
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
            paymentDetailId: paymentDetails.paymentDetailId, // Use fetched payment details
            userId: paymentDetails.linkUserId, // Use fetched user ID
            amount: paymentDetails.amount, // Use fetched amount
            stripeAccountId: stripeAccountId, // Use provided Stripe account ID
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
      fetchPaymentDetails(linkId); // Fetch payment details
    }
  }, []);

  useEffect(() => {
    if (paymentDetails && !clientSecret) {
      fetchClientSecret(); // Fetch client secret only after payment details are loaded
    }
  }, [paymentDetails, clientSecret]);

  return (
      <div className="container">
        <div className="content-wrapper">
          {/* Payment Details */}
          <PaymentDetails details={paymentDetails} />

          {/* Checkout Section */}
          <div className="checkout-section">
            {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <CheckoutForm />
                </Elements>
            ) : (
                paymentDetails && (
                    <div className="loading-container">
                      <div className="spinner"></div>
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
