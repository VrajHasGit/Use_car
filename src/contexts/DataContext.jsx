import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAll } from '../services/db';

const DataContext = createContext(null);

const COLLECTIONS = [
  'pur_inq', 'val', 'pfu', 'pcl', 'ob',
  'sal_inq', 'sfu', 'scl', 'sob', 'stk',
  'ws', 'pay', 'del', 'doc', 'cust',
  'dn', 'gp', 'sp', 'td', 'fin',
  'exp_rec', 'gst_inv', 'targets', 'feedback', 'tasks', 'users'
];

export function DataProvider({ children }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (colName) => {
    try {
      const records = await getAll(colName);
      setData(prev => ({ ...prev, [colName]: records }));
    } catch (e) {
      console.error(`refresh(${colName}):`, e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        COLLECTIONS.map(col => getAll(col).then(records => [col, records]))
      );
      const dataMap = Object.fromEntries(results);
      setData(dataMap);
    } catch (e) {
      console.error('refreshAll:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, []);

  const value = { data, loading, refresh, refreshAll };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
