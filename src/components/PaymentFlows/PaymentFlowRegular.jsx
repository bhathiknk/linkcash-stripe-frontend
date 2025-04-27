import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate, useParams } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';
import RegularPaymentDetails from '../PaymentDetailsPages/RegularPaymentDetails';
import 'bootstrap/dist/css/bootstrap.min.css';

const stripePromise = loadStripe(
    'pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6'
);

export default function PaymentFlowRegular() {
    const { linkId } = useParams();
    const navigate = useNavigate();

    const [clientSecret, setClientSecret] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    /* ---------------------------- data fetching ---------------------------- */
    useEffect(() => {
        if (linkId) loadDetails(linkId);
    }, [linkId]);

    const loadDetails = async (id) => {
        try {
            const res = await fetch(
                `http://localhost:8080/api/payment-links/link/${id}/details`
            );
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setPaymentDetails(data);
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    /* fetch intent once details are present */
    useEffect(() => {
        if (paymentDetails && !clientSecret) {
            initIntent({
                paymentType: 'regular',
                paymentDetailId: paymentDetails.paymentDetailId,
                userId: paymentDetails.paymentDetailUserId,
                amount: paymentDetails.amount,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentDetails]);

    const initIntent = async (payload) => {
        try {
            const res = await fetch(
                'http://localhost:8080/api/transactions/initiate',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );
            if (!res.ok)
                throw new Error((await res.json()).error || 'Failed to initiate');
            const data = await res.json();
            setClientSecret(data.clientSecret);
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    /* ------------------------------ UI states ----------------------------- */
    if (errorMessage)
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
                <div className="alert alert-danger text-center">{errorMessage}</div>
            </div>
        );

    if (!paymentDetails)
        return (
            <div
                className="d-flex vh-100 justify-content-center align-items-center"
                style={{ backgroundColor: '#E3F2FD' }}
            >
                <div className="spinner-border text-primary" role="status" />
            </div>
        );

    /* ------------------------------- render ------------------------------- */
    return (
        <div className="gradient-bg d-flex flex-column justify-content-center align-items-center min-vh-100 overflow-hidden">
            {/* decorative blob (hidden on xs) */}
            <div className="blob d-none d-sm-block" />

            <div className="container-fluid px-3">
                <div className="row justify-content-center">
                    {/* ⬇️ Narrower columns: full width on phones, max ~400 px on xl */}
                    <div className="col-12 col-sm-10 col-md-7 col-lg-6 col-xl-4">
                        <div
                            className="payment-card animate-enter shadow-lg"
                            style={{ maxWidth: '550px', margin: '0 auto' }}
                        >
                            {/* Security ribbon */}
                            <div className="ribbon text-center mb-3">
                                🔒 256-bit&nbsp;SSL encrypted&nbsp;&nbsp;•&nbsp;&nbsp;Powered by Stripe
                            </div>

                            {/* Details */}
                            <RegularPaymentDetails details={paymentDetails} />

                            <hr className="my-4" />

                            {/* Form */}
                            {clientSecret ? (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutForm
                                        onPaymentSuccess={(pid) =>
                                            navigate(
                                                `/regular-success/${linkId}?paymentIntentId=${pid}`
                                            )
                                        }
                                        onPaymentError={() =>
                                            navigate('/payment-status?status=error')
                                        }
                                    />
                                </Elements>
                            ) : (
                                <div className="text-center mt-4">
                                    <div className="spinner-border text-primary" role="status" />
                                    <p className="mt-2">Securing payment session…</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* styling */}
            <style>{`
        /* ---------- base gradient ---------- */
        .gradient-bg{
          background:linear-gradient(135deg,#83B6B9 0%,#E3F2FD 50%,#0054FF 100%);
          animation:bgFade 1.2s both;
        }
        @keyframes bgFade{from{opacity:0} to{opacity:1}}

        /* ---------- entrance & blob ---------- */
        @keyframes cardIn{
          0%{opacity:0;transform:translateY(45px) scale(.95)}
          80%{opacity:1;transform:translateY(-6px) scale(1)}
          100%{transform:translateY(0) scale(1)}
        }
        .animate-enter{animation:cardIn .9s cubic-bezier(.16,1,.3,1) forwards}

        .blob{
          position:absolute;
          width:65vw;max-width:500px;height:65vw;max-height:500px;
          background:radial-gradient(circle at 30% 30%,#ffffff55 0%,#ffffff00 70%);
          filter:blur(80px);
          animation:blobFloat 14s ease-in-out infinite alternate;
        }
        @keyframes blobFloat{
          from{transform:translate(-25%,-35%) scale(1)}
          to{transform:translate(15%,10%) scale(1.15)}
        }

        /* ---------- glass card ---------- */
        .payment-card{
          position:relative;
          padding:2.2rem 1.9rem;
          border-radius:1.75rem;
          background:rgba(255,255,255,.86);
          backdrop-filter:blur(20px) saturate(150%);
          border:3px solid transparent;
          background-clip:padding-box;
        }
      

        /* ---------- ribbon ---------- */
        .ribbon{
          font-size:.8rem;
          color:#0054FF;
          background:#E3F2FD;
          padding:.32rem .8rem;
          border-radius:1rem;
          box-shadow:0 2px 5px rgba(0,84,255,.12) inset;
          line-height:1.15;
        }

        /* ---------- accessibility rings ---------- */
        button:focus,input:focus,.StripeElement--focus{
          outline:none!important;
          box-shadow:0 0 0 .18rem rgba(0,84,255,.35)!important;
        }

        /* ---------- responsive tweak for XS ---------- */
        @media(max-width:576px){
          .payment-card{padding:1.6rem 1.3rem}
          .blob{display:none}
        }
      `}</style>
        </div>
    );
}
