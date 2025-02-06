import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function GroupPaymentDetails({ details, selectedMember, onSelectMember }) {
    const [localSelectedMember, setLocalSelectedMember] = useState(null); // Default: No member selected

    if (!details) {
        return <p>Loading group payment details...</p>;
    }

    return (
        <div className="card">
            <div className="card-body">
                <h3 className="card-title">{details.title || 'Group Payment'}</h3>
                <p className="card-text">{details.description || 'No description available.'}</p>
                <h5>Total Amount: £{details.totalAmount?.toFixed(2)}</h5>

                {details.isCompleted ? (
                    <div className="alert alert-success mt-3">
                        <strong>All payments completed!</strong> This group payment is now closed.
                    </div>
                ) : (
                    <>
                        <h6 className="mt-4">Select Your Name to Proceed with Payment</h6>
                        <ul className="list-group">
                            {details.members.map((member) => (
                                <li
                                    key={member.memberPaymentId}
                                    className={`list-group-item d-flex justify-content-between align-items-center ${member.paid ? 'text-muted' : ''}`}
                                    style={{ cursor: member.paid ? 'not-allowed' : 'pointer' }}
                                    onClick={() => {
                                        if (!member.paid) {
                                            setLocalSelectedMember(member);
                                            onSelectMember(member);
                                        }
                                    }}
                                >
                                    <div>
                                        <input
                                            type="radio"
                                            name="selectedMember"
                                            checked={
                                                localSelectedMember &&
                                                localSelectedMember.memberPaymentId === member.memberPaymentId
                                            }
                                            onChange={() => {}}
                                            disabled={member.paid}
                                            style={{ marginRight: '10px' }}
                                        />
                                        <strong>{member.memberName}</strong> - £{member.assignedAmount.toFixed(2)}
                                    </div>
                                    <span className={`badge ${member.paid ? 'bg-success' : 'bg-warning text-dark'}`}>
                                        {member.paid ? 'Paid' : 'Pending'}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {localSelectedMember && (
                            <div className="mt-3 alert alert-info">
                                <strong>Selected Member:</strong> {localSelectedMember.memberName} <br />
                                <strong>Amount Due:</strong> £{localSelectedMember.assignedAmount.toFixed(2)}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default GroupPaymentDetails;
