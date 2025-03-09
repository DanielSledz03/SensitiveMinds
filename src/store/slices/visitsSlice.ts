import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  consentGiven: boolean;
  exercises: {
    pastMemory: boolean;
    arithmetic: {completed: boolean; time?: number};
    reading: boolean;
    stroopTest?: {completed: boolean; time?: number; errors?: number};
  };
  notes?: string;
}

export interface VisitsState {
  visits: Visit[];
}

const initialState: VisitsState = {
  visits: [
    {
      id: '1',
      patientId: '1',
      date: '2024-02-25',
      consentGiven: true,
      exercises: {
        pastMemory: true,
        arithmetic: {completed: true, time: 120},
        reading: false,
        stroopTest: {completed: true, time: 60, errors: 2},
      },
      notes: 'Pacjent dobrze reagował na ćwiczenia.',
    },
  ],
};

const visitsSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    addVisit: (state, action: PayloadAction<Visit>) => {
      state.visits.push(action.payload);
    },
    updateVisit: (state, action: PayloadAction<Visit>) => {
      const index = state.visits.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.visits[index] = action.payload;
      }
    },
    deleteVisit: (state, action: PayloadAction<string>) => {
      state.visits = state.visits.filter(v => v.id !== action.payload);
    },
  },
});

export const {addVisit, updateVisit, deleteVisit} = visitsSlice.actions;
export default visitsSlice.reducer;
