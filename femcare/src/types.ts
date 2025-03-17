export enum UserType {
    PATIENT = 'patient',
    DOCTOR = 'doctor'
  }
  
  export interface User {
    uid: string;
    email: string;
    userType: UserType;
    fullName: string;
    phoneNumber?: string;
  }
  
  export interface Doctor extends User {
    specialization: string;
    licenseNumber: string;
    isApproved: boolean;
  }
  
  export interface Patient extends User {
    dateOfBirth: string;
    medicalHistory?: string;
  }