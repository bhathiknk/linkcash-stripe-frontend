import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaDownload, FaCheckCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function GroupSuccess() {
    const { search } = useLocation();
    const navigate = useNavigate();
    const receiptRef = useRef(null);

    const params = new URLSearchParams(search);
    const gpId = params.get('groupPaymentId');
    const mId = params.get('memberPaymentId');

    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        let attempts = 0;
        const maxAttempts = 15;

        const pollData = async () => {
            if (!gpId || !mId) {
                setError('Missing identifiers');
                return;
            }

            attempts += 1;
            try {
                const res = await fetch(
                    `http://localhost:8080/api/group-payment-links/${gpId}/member/${mId}/web`
                );
                if (res.ok) {
                    const json = await res.json();
                    if (isMounted) setData(json);
                } else {
                    if (attempts < maxAttempts) {
                        setTimeout(pollData, 1000);
                    } else {
                        throw new Error('Failed to load transaction details.');
                    }
                }
            } catch (e) {
                if (attempts < maxAttempts) {
                    setTimeout(pollData, 1000);
                } else {
                    if (isMounted) setError(e.message);
                }
            }
        };

        pollData();
        return () => {
            isMounted = false;
        };
    }, [gpId, mId]);

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const onPop = () => navigate('/', { replace: true });
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, [navigate]);

    const handleDownload = async () => {
        if (!receiptRef.current) return;
        try {
            const canvas = await html2canvas(receiptRef.current);
            const link = document.createElement('a');
            link.download = `receipt_group_${gpId}_${mId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Download failed', e);
        }
    };

    if (error) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center bg-danger-subtle">
                <div className="alert alert-danger text-center shadow-lg p-4 rounded">{error}</div>
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
        <div className="d-flex vh-100 justify-content-center align-items-center" style={{
            background: 'linear-gradient(to right, #eef2f7, #dee8ff)',
        }}>
            <div
                ref={receiptRef}
                className="card shadow-lg border-0 p-4"
                style={{
                    maxWidth: '520px',
                    width: '100%',
                    borderRadius: '1rem',
                    background: 'linear-gradient(145deg, #ffffff, #f4f7fb)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div className="text-center mb-4">
                    <FaCheckCircle size={56} className="text-success mb-3" />
                    <h2 className="fw-bold text-dark">Payment Successful!</h2>
                    <p className="text-muted small">Your group payment has been securely processed.</p>
                </div>

                <hr className="mb-4" />

                <div className="mb-3">
                    <h6 className="text-primary">Group Information</h6>
                    <p className="mb-1"><strong>Title:</strong> {data.title}</p>
                    <p className="text-muted"><strong>Description:</strong> {data.description}</p>
                </div>

                <div className="mb-3">
                    <h6 className="text-primary">Member Details</h6>
                    <p className="mb-1"><strong>Member:</strong> {data.memberName}</p>
                    <p className="mb-1"><strong>Amount:</strong> £{data.assignedAmount.toFixed(2)}</p>
                </div>

                <div className="mb-4">
                    <h6 className="text-primary">Transaction Details</h6>
                    <p className="mb-1"><strong>Transaction ID:</strong></p>
                    <p className="text-break text-dark small">{data.stripeTransactionId}</p>
                    <p><strong>Paid At:</strong> {new Date(data.paidAt).toLocaleString()}</p>
                </div>

                <div className="d-flex justify-content-center mt-3">
                    <button className="btn btn-outline-primary" onClick={handleDownload}>
                        <FaDownload className="me-2" /> Download Receipt
                    </button>

                </div>
            </div>
        </div>
    );
}
