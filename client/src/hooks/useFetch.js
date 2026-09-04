import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Bir API adresinden veri çeken, tekrar kullanılabilir hook.
// Her sayfada aynı fetch/loading/error mantığını tekrar yazmak yerine
// bu hook'u çağırmak yeterli.
function useFetch(url, dependencies = []) {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...dependencies]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}

export default useFetch;