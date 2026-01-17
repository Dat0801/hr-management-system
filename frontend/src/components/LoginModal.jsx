import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { authService } from '@/api/authService';
import './LoginModal.css';

const LoginModal = ({ isOpen, onDidDismiss, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      const { user, employee, token } = response.data;

      // Save token and user data
      authService.setToken(token);
      authService.setUserData(user);
      if (employee) {
        authService.setEmployeeData(employee);
      }

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess({ user, employee, token });
      }

      // Dismiss modal
      onDidDismiss();

      // Clear form
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setEmail('');
    setPassword('');
    setError('');
    onDidDismiss();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleDismiss} backdropDismiss={false}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Employee Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding login-modal-content">
        <div className="login-form">
          <h2>HR Management System</h2>

          {error && (
            <IonText color="danger" className="error-message">
              <p>{error}</p>
            </IonText>
          )}

          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value || '')}
              placeholder="Enter your email"
              disabled={loading}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value || '')}
              placeholder="Enter your password"
              disabled={loading}
            />
          </IonItem>

          <div className="login-button-container">
            <IonButton
              expand="block"
              onClick={handleLogin}
              disabled={!email || !password || loading}
              className="login-button"
            >
              {loading ? <IonSpinner name="crescent" /> : 'Login'}
            </IonButton>
          </div>

          <p className="login-hint">
            Contact your administrator if you don't have login credentials
          </p>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default LoginModal;
