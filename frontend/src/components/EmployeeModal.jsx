import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/react';
import {
  personCircleOutline,
  businessOutline,
  briefcaseOutline,
  callOutline,
  locationOutline,
  mailOutline,
} from 'ionicons/icons';
import './EmployeeModal.css';

const EmployeeModal = ({ isOpen, onDidDismiss, employee, user }) => {
  if (!employee || !user) {
    return null;
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Employee Profile</IonTitle>
          <IonButton slot="end" fill="clear" onClick={onDidDismiss}>
            Close
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding employee-modal-content">
        <IonCard className="employee-card">
          <IonCardContent>
            <div className="employee-header">
              <IonIcon
                icon={personCircleOutline}
                className="employee-avatar"
              />
              <div className="employee-name-section">
                <h2>{user.name}</h2>
                <p className="employee-email">{user.email}</p>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        <IonGrid className="employee-details">
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <div className="detail-item">
                <IonIcon icon={briefcaseOutline} className="detail-icon" />
                <div>
                  <label>Position</label>
                  <p>{employee.position || 'N/A'}</p>
                </div>
              </div>
            </IonCol>
            <IonCol size="12" sizeMd="6">
              <div className="detail-item">
                <IonIcon icon={businessOutline} className="detail-icon" />
                <div>
                  <label>Department</label>
                  <p>{employee.department?.name || 'N/A'}</p>
                </div>
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" sizeMd="6">
              <div className="detail-item">
                <IonIcon icon={callOutline} className="detail-icon" />
                <div>
                  <label>Phone</label>
                  <p>{employee.phone || 'N/A'}</p>
                </div>
              </div>
            </IonCol>
            <IonCol size="12" sizeMd="6">
              <div className="detail-item">
                <IonIcon icon={mailOutline} className="detail-icon" />
                <div>
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" sizeMd="6">
              <div className="detail-item">
                <IonIcon icon={locationOutline} className="detail-icon" />
                <div>
                  <label>Address</label>
                  <p>
                    {employee.address && employee.city
                      ? `${employee.address}, ${employee.city}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </IonCol>
            <IonCol size="12" sizeMd="6">
              <div className="detail-item">
                <IonIcon icon={briefcaseOutline} className="detail-icon" />
                <div>
                  <label>Hire Date</label>
                  <p>
                    {employee.hire_date
                      ? new Date(employee.hire_date).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <div className="detail-item">
                <div>
                  <label>Status</label>
                  <p>
                    <span
                      className={`status-badge status-${employee.status?.toLowerCase()}`}
                    >
                      {employee.status || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <div className="modal-footer">
          <IonButton expand="block" color="primary" onClick={onDidDismiss}>
            Close
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default EmployeeModal;
