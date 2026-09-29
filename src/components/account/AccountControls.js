import React, { useState } from 'react';

export default function AccountControls({ user, signOutUser, onSignIn }) {
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  return (
    <>
      <div className="account-bar">
        {user ? (
          <button
            className="account-avatar"
            onClick={() => setShowSignOutConfirm(true)}
            aria-label="Account options"
            title={`Signed in as ${user.displayName || user.email}`}
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="" />
            ) : (
              <span>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
            )}
          </button>
        ) : (
          <button className="login-button" onClick={onSignIn}>Sign in</button>
        )}
      </div>

      {showSignOutConfirm && (
        <div className="confirm-overlay">
          <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="signout-title">
            <h2 id="signout-title">Log out?</h2>
            <p>Are you sure you want to log out of your current account?</p>
            <div className="confirm-actions">
              <button className="secondary-button" onClick={() => setShowSignOutConfirm(false)}>
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={async () => {
                  await signOutUser();
                  setShowSignOutConfirm(false);
                }}
              >
                Confirm Logout
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
