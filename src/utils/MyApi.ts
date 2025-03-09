import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {RootState} from '../store/store';
export const API_URL =
  'https://sensitiveminds-backend-production.up.railway.app';

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateData: (
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: any,
  ) => Promise<void>;
}

export const useFetch = <T>(url: string): FetchResult<T> => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) {
      setError('Brak tokena uwierzytelniającego');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<T>(API_URL + url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setData(response.data);
    } catch (err) {
      setError('Błąd podczas pobierania danych');
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  // Aktualizacja danych (POST, PUT, PATCH, DELETE)
  const updateData = useCallback(
    async (method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body?: any) => {
      if (!token) {
        setError('Brak tokena uwierzytelniającego');
        return;
      }

      setLoading(true);
      setError(null);

      // Przykład – usuwamy id z body, jeśli było obecne (opcjonalnie)
      if (body) {
        delete body.id;
      }

      try {
        const response = await axios({
          method,
          url: API_URL + url,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: body,
        });

        // Automatyczne odświeżenie danych po udanej aktualizacji
        if (method !== 'DELETE') {
          setData(response.data);
        } else {
          setData(null);
        }
      } catch (err) {
        setError('Błąd podczas aktualizacji danych');
      } finally {
        setLoading(false);
      }
    },
    [url, token],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {data, loading, error, refetch: fetchData, updateData};
};
