import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function RegularSuccess() {
    const { linkId } = useParams();
    const { search } = useLocation();
    const navigate = useNavigate();
    const receiptRef = useRef(null);

    const params = new URLSearchParams(search);
    const paymentIntentId = params.get('paymentIntentId');

    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!paymentIntentId) {
            setError('Missing Payment Intent ID.');
            return;
        }

        fetch(`http://localhost:8080/api/payment-links/${linkId}/web?paymentIntentId=${paymentIntentId}`)
            .then(res => {
                if (!res.ok) throw new Error('Unable to load payment info');
                return res.json();
            })
            .then(json => {
                setData(json);
            })
            .catch(e => setError(e.message));
    }, [linkId, paymentIntentId]);

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const onBack = () => navigate('/', { replace: true });
        window.addEventListener('popstate', onBack);
        return () => window.removeEventListener('popstate', onBack);
    }, [navigate]);

    const handleDownload = async () => {
        if (!receiptRef.current) return;
        try {
            const canvas = await html2canvas(receiptRef.current, { scale: 2 });
            const link = document.createElement('a');
            link.download = `receipt_regular_${linkId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Download failed', e);
        }
    };

    if (error) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center">
                <div className="alert alert-danger text-center">{error}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    return (
        <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
            <div
                ref={receiptRef}
                className="card shadow-lg px-4 py-5"
                style={{ maxWidth: '450px', width: '100%', borderRadius: '1rem', background: '#fff' }}
            >
                <div className="text-center mb-4">
                    <FaCheckCircle size={50} className="text-success mb-3" />
                    <h3 className="fw-bold">Payment Successful</h3>
                    <p className="text-muted">Thank you for your payment!</p>
                </div>

                <hr />

                <div className="mb-3">
                    <h5 className="text-primary">Payment Details</h5>
                    <p><strong>Title:</strong> {data.title}</p>
                    <p className="text-muted"><strong>Description:</strong> {data.description}</p>
                    <p><strong>Amount:</strong> £{parseFloat(data.amount).toFixed(2)}</p>
                    {data.expireAfter && (
                        <p><strong>Expires After:</strong> {data.expireAfter}</p>
                    )}
                </div>

                <div className="mb-4">
                    <h5 className="text-primary">Transaction</h5>
                    <p><strong>Stripe Tx ID:</strong> <span className="text-break">
                        {data.stripeTransactionId || 'N/A'}
                    </span></p>
                </div>

                <div className="d-flex justify-content-center">
                    <button className="btn btn-outline-primary" onClick={handleDownload}>
                        <FaDownload className="me-1" /> Download Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}
