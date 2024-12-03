import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './components/CheckoutForm';
import './App.css'; // Import the CSS for animation

const stripePromise = loadStripe('pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6'); // Replace with your Stripe Publishable Key

function App() {
  const [clientSecret, setClientSecret] = useState(null);
  const stripeAccountId = 'acct_1QQP4cCdwebH2AJZ';
  // Function to fetch the client secret
  const fetchClientSecret = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentDetailId: 21, // Replace with your paymentDetailId
          userId: 1, // Replace with your userId
          amount: 45.00, // Replace with your payment amount
          stripeAccountId: stripeAccountId,
        }),
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error fetching client secret:', error);
    }
  };

  // Fetch client secret when the component mounts
  useEffect(() => {
    if (!clientSecret) {
      fetchClientSecret();
    }
  }, [clientSecret]);

  return (
      <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '50px' }}>
        {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm />
            </Elements>
        ) : (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading payment information...</p>
            </div>
        )}
      </div>
  );
}

export default App;
