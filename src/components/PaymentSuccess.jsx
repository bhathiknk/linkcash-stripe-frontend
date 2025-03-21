import React, { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

function PaymentSuccess() {
    const [transactionData, setTransactionData] = useState(null);
    const [error, setError] = useState('');

    // Parse query param: billId
    const urlParams = new URLSearchParams(window.location.search);
    const billId = urlParams.get('billId');

    useEffect(() => {
        if (!billId) return;
        fetchTransactionData(billId);
    }, [billId]);

    const fetchTransactionData = async (billId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/shop-transactions/bill/${billId}`);
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const data = await response.json();
            setTransactionData(data);
        } catch (err) {
            setError(err.message);
        }
    };

    // Download the PDF file
    async function handleDownload() {
        try {
            const response = await fetch(`http://localhost:8080/api/shop-transactions/bill/${billId}/pdf`);
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const pdfBlob = await response.blob();

            // create a link and download
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transaction_${billId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            alert("Failed to download PDF: " + err.message);
        }
    }

    if (!billId) {
        return (
            <div className="container my-5 text-center">
                <h4>No bill ID provided in the URL.</h4>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger text-center">
                    <h4>Error</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!transactionData) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3">Loading transaction data...</p>
            </div>
        );
    }

    // Destructure the data
    const {
        transactionId,
        stripeTransactionId,
        amount,
        transactionCreatedAt,
        billId: bId,
        billStatus,
        billTotal,
        billExpiresAt,
        customerName,
        items,
        totalItems,
        shopId,
        shopName,
        shopAddress
    } = transactionData;

    return (
        <div className="container my-5" style={{ maxWidth: '800px' }}>

            {/* --- PAGE TITLE --- */}
            <div className="text-center mb-4">
                <h2 className="text-success">Payment Successful!</h2>
                <p>Thank you for your payment. Below are the details.</p>
            </div>

            {/* --- SHOP INFO (TOP) --- */}
            <div className="card mb-4">
                <div className="card-header text-center fw-bold bg-info text-white">Shop Info</div>
                <div className="card-body">
                    <p><strong>Shop ID:</strong> {shopId}</p>
                    <p><strong>Shop Name:</strong> {shopName}</p>
                    <p><strong>Shop Address:</strong> {shopAddress}</p>
                </div>
            </div>

            {/* --- MAIN CONTAINER for Bill + Transaction Info --- */}
            <div className="card mb-4">
                <div className="card-header text-center fw-bold bg-secondary text-white">Payment Details</div>
                <div className="card-body">

                    {/* Bill Info */}
                    <h5 className="text-decoration-underline">Bill Info</h5>
                    <p><strong>Bill ID:</strong> {bId}</p>
                    <p><strong>Customer Name:</strong> {customerName}</p>
                    <p><strong>Bill Status:</strong> {billStatus}</p>
                    <p><strong>Total Items:</strong> {totalItems}</p>
                    <p><strong>Bill Total:</strong> £{billTotal.toFixed(2)}</p>
                    {billExpiresAt && <p><strong>Expires At:</strong> {billExpiresAt}</p>}

                    {/* Items List */}
                    <h6 className="mt-3 text-decoration-underline">Items</h6>
                    <ul className="list-group mb-3">
                        {items?.map((item) => (
                            <li key={item.itemId} className="list-group-item">
                                {item.itemName} - {item.quantity} x £{item.price.toFixed(2)} ={" "}
                                <strong>£{(item.price * item.quantity).toFixed(2)}</strong>
                            </li>
                        ))}
                    </ul>

                    {/* Transaction Info */}
                    <h5 className="text-decoration-underline">Transaction Info</h5>
                    <p><strong>Transaction ID:</strong> {transactionId}</p>
                    <p><strong>Stripe Tx ID:</strong> {stripeTransactionId}</p>
                    <p><strong>Amount Paid:</strong> £{amount.toFixed(2)}</p>
                    <p><strong>Created At:</strong> {transactionCreatedAt}</p>

                    {/* BALANCE (if you want to show the Bill total as "Balance") */}
                    <div className="mt-3 p-2 text-center" style={{ backgroundColor: '#d4edda', borderRadius: '4px' }}>
                        <strong>Total Balance:</strong> £{billTotal.toFixed(2)}
                    </div>

                </div>
            </div>

            {/* --- DOWNLOAD BUTTON --- */}
            <div className="text-end">
                <button
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                    onClick={handleDownload}
                >
                    <FaDownload className="me-2" />
                    Download PDF
                </button>
            </div>
        </div>
    );
}

export default PaymentSuccess;
