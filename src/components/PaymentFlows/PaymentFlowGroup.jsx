import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate, useParams } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';
import GroupPaymentDetails from '../PaymentDetailsPages/GroupPaymentDetails';
import 'bootstrap/dist/css/bootstrap.min.css';

const stripePromise = loadStripe(
    'pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6'
);

export default function PaymentFlowGroup() {
    const { linkId } = useParams();
    const navigate = useNavigate();

    const [clientSecrets, setClientSecrets] = useState({});
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    /* ------------ fetch group link details ------------ */
    useEffect(() => {
        if (!linkId) return;
        (async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/api/group-payment-links/link/${linkId}/details`
                );
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setPaymentDetails(data);
            } catch (err) {
                setErrorMessage(err.message);
            }
        })();
    }, [linkId]);

    /* pick first unpaid member */
    useEffect(() => {
        if (!paymentDetails || selectedMember) return;
        const pending = paymentDetails.members.find((m) => !m.paid);
        if (pending) setSelectedMember(pending);
    }, [paymentDetails, selectedMember]);

    /* fetch clientSecret for chosen member */
    useEffect(() => {
        if (
            !selectedMember ||
            !paymentDetails ||
            clientSecrets[selectedMember.memberPaymentId]
        )
            return;

        (async () => {
            try {
                const payload = {
                    paymentType: 'group',
                    groupPaymentId: paymentDetails.groupPaymentId,
                    memberPaymentId: selectedMember.memberPaymentId,
                    amount: selectedMember.assignedAmount,
                };
                const res = await fetch(
                    'http://localhost:8080/api/transactions/initiate',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    }
                );
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed to initiate');
                setClientSecrets((prev) => ({
                    ...prev,
                    [selectedMember.memberPaymentId]: json.clientSecret,
                }));
            } catch (err) {
                setErrorMessage(err.message);
            }
        })();
    }, [selectedMember, paymentDetails, clientSecrets]);

    const secretForMember =
        selectedMember && clientSecrets[selectedMember.memberPaymentId];

    /* ------------------ reusable card renderer ------------------ */
    const renderCardContent = () => {
        if (errorMessage)
            return (
                <div className="text-center">
                    <h4 className="text-danger mb-3">Payment Link Unavailable</h4>
                    <p>{errorMessage}</p>
                </div>
            );

        if (!paymentDetails)
            return (
                <div className="text-center">
                    <p>Loading payment details…</p>
                </div>
            );

        if (paymentDetails.completed)
            return (
                <div className="text-center">
                    <h4 className="text-success mb-2">Group Payment Complete</h4>
                    <p>All members have finished paying.</p>
                </div>
            );

        /* active flow */
        return (
            <div className="row">
                <div className="col-12 mb-4">
                    <GroupPaymentDetails
                        details={paymentDetails}
                        selectedMember={selectedMember}
                        onSelectMember={(m) =>
                            m.memberPaymentId !== selectedMember?.memberPaymentId &&
                            setSelectedMember(m)
                        }
                    />
                </div>

                <hr className="my-3" />

                <div className="col-12">
                    {secretForMember ? (
                        <Elements
                            stripe={stripePromise}
                            options={{ clientSecret: secretForMember }}
                        >
                            <CheckoutForm
                                onPaymentSuccess={() =>
                                    navigate(
                                        `/group-success?groupPaymentId=${paymentDetails.groupPaymentId}&memberPaymentId=${selectedMember.memberPaymentId}`
                                    )
                                }
                                onPaymentError={() =>
                                    navigate('/payment-status?status=error')
                                }
                            />
                        </Elements>
                    ) : (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status" />
                            <p className="mt-2">
                                {selectedMember
                                    ? `Preparing payment for ${selectedMember.memberName}…`
                                    : 'Loading payment…'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    /* ------------------------ UI wrapper ----------------------- */
    return (
        <div className="gradient-bg d-flex flex-column justify-content-center align-items-center min-vh-100 overflow-hidden">
            <div className="blob d-none d-sm-block" />

            <div className="container-fluid px-3">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
                        <div
                            className="payment-card animate-enter shadow-lg"
                            style={{ maxWidth: '550px', margin: '0 auto' }}
                        >
                            <div className="ribbon text-center mb-3">
                                🔒 256-bit&nbsp;SSL encrypted&nbsp;&nbsp;•&nbsp;&nbsp;Powered by
                                Stripe
                            </div>

                            {renderCardContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* identical CSS to regular/one-time flow */}
            <style>{`
        .gradient-bg{
          background:linear-gradient(135deg,#83B6B9 0%,#E3F2FD 50%,#0054FF 100%);
          animation:bgFade 1.2s both;
        }
        @keyframes bgFade{from{opacity:0}to{opacity:1}}

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

        .payment-card{
          position:relative;
          padding:2.2rem 1.9rem;
          border-radius:1.75rem;
          background:rgba(255,255,255,.86);
          backdrop-filter:blur(20px) saturate(150%);
          border:3px solid transparent;
          background-clip:padding-box;
        }
       

        .ribbon{
          font-size:.8rem;color:#0054FF;background:#E3F2FD;
          padding:.32rem .8rem;border-radius:1rem;
          box-shadow:0 2px 5px rgba(0,84,255,.12) inset;line-height:1.15;
        }

        button:focus,input:focus,.StripeElement--focus{
          outline:none!important;
          box-shadow:0 0 0 .18rem rgba(0,84,255,.35)!important;
        }

        @media(max-width:576px){
          .payment-card{padding:1.6rem 1.3rem}
          .blob{display:none}
        }
      `}</style>
        </div>
    );
}
