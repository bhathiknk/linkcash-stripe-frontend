import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function GroupPaymentDetails({ details, onSelectMember }) {
    if (!details) {
        return <p>Loading group payment details...</p>;
    }

    return (
        <div className="card">
            <div className="card-body">
                <h3 className="card-title">{details.title || 'Untitled Group Payment'}</h3>
                <p className="card-text">{details.description || 'No description available.'}</p>
                <h5>Total Amount: £{details.totalAmount?.toFixed(2) || '0.00'}</h5>
                <h6 className="mt-4">Group Members (Select your name):</h6>
                <ul className="list-group">
                    {details.members?.length > 0 ? (
                        details.members.map((member, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{member.memberName || 'Unnamed Member'}</strong>: £{member.assignedAmount?.toFixed(2) || '0.00'}
                                </div>
                                <div>
                                    {member.paid ? (
                                        <span className="badge bg-success">Paid</span>
                                    ) : (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => onSelectMember(member)}
                                        >
                                            Select
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item">No members found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default GroupPaymentDetails;
