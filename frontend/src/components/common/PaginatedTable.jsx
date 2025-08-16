// src/components/common/PaginatedTable.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TableSortLabel, Pagination, Paper, Typography
} from '@mui/material';

const PaginatedTable = ({ columns, fetchDataFunction, refreshKey, titleKey }) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(columns.find(c => c.sortable)?.id || '');

  const fetchData = useCallback(async () => {
    try {
      const response = await fetchDataFunction({ 
        page: pagination.page, 
        limit: pagination.limit, 
        sortBy: orderBy, 
        order: order 
      });
      setData(response.data.data);
      setPagination(prev => ({ ...prev, totalPages: response.data.pagination.totalPages }));
    } catch (err) {
      console.error("Failed to fetch data for table:", err);
      // You could pass a prop to handle errors here if needed
    }
  }, [pagination.page, pagination.limit, orderBy, order, fetchDataFunction, refreshKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      {titleKey && (
        <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
          {t(titleKey)}
        </Typography>
      )}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={order}
                      onClick={() => handleRequestSort(col.id)}
                    >
                      {t(col.label)}
                    </TableSortLabel>
                  ) : (
                    t(col.label)
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow hover key={row._id}>
                {columns.map((col) => (
                  <TableCell key={`${row._id}-${col.id}`} align={col.align || 'left'}>
                    {/* The magic is here: renderCell handles custom rendering */}
                    {col.renderCell ? col.renderCell(row) : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, mt: 2 }}>
        <Pagination count={pagination.totalPages} page={pagination.page} onChange={handlePageChange} color="primary" />
      </Box>
    </Paper>
  );
};

export default PaginatedTable;