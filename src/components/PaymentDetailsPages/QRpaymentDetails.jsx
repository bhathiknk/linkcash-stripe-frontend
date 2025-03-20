import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Shows Bill + Shop details for a QR-based payment flow.
 * Similar to OneTimePaymentDetails, but tailored to Bill data.
 */
function QRpaymentDetails({ billData, shopData }) {
    if (!billData) {
        return <p>Loading bill data...</p>;
    }

    // We'll calculate total items and confirm total from the bill, just as a final check
    const totalItems = billData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const calculatedTotal = billData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

    // Basic styles
    const containerStyles = {
        background: '#ffffff',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
    };
    const itemRowStyle = {
        textAlign: 'left',
        marginBottom: '0.75rem'
    };

    return (
        <div style={containerStyles}>
            <h4 className="text-primary">Bill & Shop Details</h4>

            {/* Bill Info */}
            <div className="mt-3" style={{ textAlign: 'left' }}>
                <strong>Bill ID:</strong> {billData.billId} <br />
                <strong>Customer:</strong> {billData.customerName} <br />
                <strong>Status:</strong> {billData.status} <br />
                <strong>Total Items:</strong> {totalItems} <br />
            </div>

            {/* Shop Info */}
            {shopData && (
                <div className="mt-3" style={{ textAlign: 'left' }}>
                    <strong>Shop ID:</strong> {shopData.shopId} <br />
                    <strong>Shop Name:</strong> {shopData.shopName} <br />
                    <strong>Address:</strong> {shopData.address} <br />
                </div>
            )}

            {/* Item Breakdown */}
            {billData.items && billData.items.length > 0 && (
                <div className="mt-4" style={{ textAlign: 'left' }}>
                    <strong>Item Breakdown:</strong>
                    <div className="mt-2">
                        {billData.items.map((item, idx) => (
                            <div key={idx} style={itemRowStyle}>
                                <strong>{item.itemName}</strong> <br />
                                {item.quantity} x £{item.price.toFixed(2)} ={' '}
                                <strong>£{(item.price * item.quantity).toFixed(2)}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Grand Totals */}
            <div className="mt-4" style={{ textAlign: 'left' }}>
                <div style={{ backgroundColor: '#dff4c8', padding: '0.75rem', borderRadius: '0.25rem' }}>
                    <strong>Grand Total: £{calculatedTotal.toFixed(2)}</strong>
                </div>
            </div>

            {/* Optional disclaimers */}
            <div
                className="mt-3"
                style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffeeba',
                    padding: '1rem',
                    borderRadius: '0.25rem'
                }}
            >
                <strong>Note:</strong> This payment flow is initiated via QR code. Once completed, the bill status should change to "PAID."
            </div>
        </div>
    );
}

export default QRpaymentDetails;
