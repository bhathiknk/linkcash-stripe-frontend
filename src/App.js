import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PaymentFlow from './components/PaymentFlow';
import PaymentStatus from './components/PaymentStatus';

function App() {
    return (
        <Routes>
            <Route path="/link/:linkId" element={<PaymentFlow />} />
            <Route path="/one-time/:linkId" element={<PaymentFlow />} />
            <Route path="/group-payment/:linkId" element={<PaymentFlow />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
        </Routes>
    );
}

export default App;
