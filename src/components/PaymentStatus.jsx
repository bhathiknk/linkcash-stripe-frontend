/* PaymentStatus.jsx */

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function PaymentStatus() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');

    useEffect(() => {
        navigate(location.pathname + location.search, { replace: true });
        window.onpopstate = () => {
            window.history.go(1);
        };
        return () => {
            window.onpopstate = null;
        };
    }, [navigate, location.pathname, location.search]);

    if (!status) {
        return (
            <div className="container py-5 text-center">
                <h2>Invalid Payment Status</h2>
                <p>No payment status was provided.</p>
            </div>
        );
    }

    const isSuccess = status === 'success';
    const heading = isSuccess ? 'Payment Successful!' : 'Payment Failed';
    const message = isSuccess
        ? 'Thank you for your payment. Your transaction was processed successfully!'
        : 'Something went wrong during payment. Please try again or contact support.';

    return (
        <div
            className="container py-5 d-flex flex-column align-items-center justify-content-center"
            style={{ minHeight: '100vh' }}
        >
            <div className="text-center">
                <h2 className={isSuccess ? 'text-success mb-4' : 'text-danger mb-4'}>
                    {heading}
                </h2>
                <p className="mb-5">{message}</p>
                {isSuccess ? (
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            window.location.href = 'https://www.linkcash.com';
                        }}
                    >
                        Go to LinkCash
                    </button>
                ) : (
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            window.location.href = 'https://www.yourdomain.com/support';
                        }}
                    >
                        Contact Support
                    </button>
                )}
            </div>
        </div>
    );
}

export default PaymentStatus;
