import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaDownload, FaCheckCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';


export default function OneTimeSuccess() {
    const { linkId } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const receiptRef = useRef();

    // Prevent back button
    useEffect(() => {
        window.history.pushState(null, null, window.location.href);
        const handlePopstate = () => {
            window.history.pushState(null, null, window.location.href);
        };
        window.addEventListener('popstate', handlePopstate);
        return () => window.removeEventListener('popstate', handlePopstate);
    }, []);

    // Poll for transaction details
    useEffect(() => {
        let isMounted = true;
        let attempts = 0;
        const maxAttempts = 15;

        const poll = async () => {
            attempts++;
            try {
                const res = await fetch(
                    `http://localhost:8080/api/one-time-payment-links/details/${linkId}`
                );
                if (res.ok) {
                    const json = await res.json();
                    if (isMounted) setData(json);
                } else if (attempts < maxAttempts) {
                    setTimeout(poll, 1000);
                } else {
                    throw new Error('Unable to load transaction details.');
                }
            } catch (err) {
                if (attempts < maxAttempts) {
                    setTimeout(poll, 1000);
                } else {
                    if (isMounted) setError(err.message);
                }
            }
        };

        poll();
        return () => {
            isMounted = false;
        };
    }, [linkId]);

    const downloadReceipt = async () => {
        if (!receiptRef.current) return;
        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
            });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `one_time_payment_${linkId}.png`;
            link.click();
        } catch (e) {
            console.error('Download failed', e);
        }
    };

    if (error) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center bg-danger-subtle">
                <div className="alert alert-danger text-center shadow-lg p-4 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    return (
        <div
            className="d-flex vh-100 justify-content-center align-items-center"
            style={{ background: 'linear-gradient(to right, #eef2f7, #dee8ff)' }}
        >
            <div
                ref={receiptRef}
                className="card shadow-lg border-0 p-4"
                style={{
                    maxWidth: '520px',
                    width: '100%',
                    borderRadius: '1rem',
                    background: 'linear-gradient(145deg, #ffffff, #f4f7fb)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                }}
            >
                <div className="text-center mb-4">
                    <FaCheckCircle size={56} className="text-success mb-3" />
                    <h2 className="fw-bold text-dark">Payment Successful!</h2>
                    <p className="text-muted small">Your one-time payment has been processed.</p>
                </div>

                <hr className="mb-4" />

                <div className="mb-3">
                    <h6 className="text-primary">Payment Information</h6>
                    <p className="mb-1"><strong>Title:</strong> {data.title}</p>
                    <p className="text-muted"><strong>Description:</strong> {data.description}</p>
                </div>

                <div className="mb-3">
                    <h6 className="text-primary">Amount Paid</h6>
                    <p className="fw-bold">£{data.amount.toFixed(2)}</p>
                </div>

                <div className="mb-4">
                    <h6 className="text-primary">Transaction Details</h6>
                    <p className="mb-1"><strong>Transaction ID:</strong></p>
                    <p className="text-break text-dark small">{data.stripeTransactionId}</p>
                    <p><strong>Paid At:</strong> {new Date(data.usedAt).toLocaleString()}</p>
                </div>

                <div className="d-flex justify-content-center mt-3">
                    <Button variant="outline-primary" onClick={downloadReceipt}>
                        <FaDownload className="me-2" /> Download Receipt
                    </Button>
                </div>
            </div>
        </div>
    );
}
