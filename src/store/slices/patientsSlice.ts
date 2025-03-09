import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Patient {
  id: string;
  name: string;
  age: number;
  bedNumber: string;
  gender: 'Mężczyzna' | 'Kobieta';
  weight: number;
}

interface PatientsState {
  patients: Patient[];
}

const initialState: PatientsState = {
  patients: [],
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    addPatient: (state, action: PayloadAction<Patient>) => {
      state.patients.push(action.payload);
    },
    updatePatient: (state, action: PayloadAction<Patient>) => {
      const index = state.patients.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.patients[index] = action.payload;
      }
    },
    deletePatient: (state, action: PayloadAction<string>) => {
      state.patients = state.patients.filter(p => p.id !== action.payload);
    },
  },
});

export const {addPatient, updatePatient, deletePatient} = patientsSlice.actions;
export default patientsSlice.reducer;
