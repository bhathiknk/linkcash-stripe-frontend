import React from 'react';
import { BsCashStack, BsListCheck } from 'react-icons/bs';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

function QRpaymentDetails({ billData, shopData }) {
    if (!billData) return <p>Loading bill data...</p>;

    const totalItems = billData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const calculatedTotal = billData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

    return (
        <div style={{
            background: '#ffffff',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
        }}>
            <h5 className="text-primary mb-3">
                <FaFileInvoiceDollar className="me-2" />
                Bill & Shop Summary
            </h5>

            <p><strong>Bill ID:</strong> {billData.billId}</p>
            <p><strong>Customer:</strong> {billData.customerName}</p>
            <p><strong>Status:</strong> {billData.status}</p>
            <p><strong>Total Items:</strong> {totalItems}</p>

            <hr />

            <p><strong>Shop ID:</strong> {shopData?.shopId}</p>
            <p><strong>Shop Name:</strong> {shopData?.shopName}</p>
            <p><strong>Address:</strong> {shopData?.address}</p>

            {billData.items?.length > 0 && (
                <>
                    <hr />
                    <h6 className="text-secondary">
                        <BsListCheck className="me-2" />
                        Itemized Breakdown
                    </h6>
                    {billData.items.map((item, idx) => (
                        <div key={idx} className="ps-2 mb-2 border-start border-3 border-primary">
                            <p className="mb-1"><strong>{item.itemName}</strong></p>
                            <p className="mb-1">{item.quantity} × £{item.price.toFixed(2)}</p>
                            <p className="fw-bold text-success">£{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                    ))}
                </>
            )}

            <div className="bg-light p-3 mt-4 rounded text-center">
                <h5 className="text-dark fw-bold">
                    <BsCashStack className="me-2" />
                    Grand Total: £{calculatedTotal.toFixed(2)}
                </h5>
            </div>

            <div className="mt-4 alert alert-warning">
                <strong>Note:</strong> This payment is initiated via QR. Once paid, the bill will be marked as <b>PAID</b>.
            </div>
        </div>
    );
}

export default QRpaymentDetails;
