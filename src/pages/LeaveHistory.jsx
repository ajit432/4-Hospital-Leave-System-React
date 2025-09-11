import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, getStatusClass } from '../utils/helpers';
import { toast } from 'react-toastify';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, [currentPage, statusFilter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
      };
      const response = await leaveAPI.getMyLeaves(params);
      setLeaves(response.data.data.leaves);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading leave history..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave History</h1>
          <p className="mt-1 text-sm text-gray-600">
            View all your leave applications and their status
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <Card.Content className="py-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === '' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'approved' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('approved')}
            >
              Approved
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('rejected')}
            >
              Rejected
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Leave Applications List */}
      <Card>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        )}

        {!loading && leaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave applications found</h3>
            <p className="text-gray-600">
              {statusFilter 
                ? `No ${statusFilter} leave applications to display`
                : 'You haven\'t applied for any leaves yet'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {leave.category_name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {leave.reason}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {formatDate(leave.start_date)} -
                        </div>
                        <div>
                          {formatDate(leave.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.total_days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusClass(leave.status)}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(leave.applied_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const details = `
Leave Type: ${leave.category_name}
Duration: ${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}
Total Days: ${leave.total_days}
Status: ${leave.status}
Reason: ${leave.reason}
Applied: ${formatDate(leave.applied_at)}
${leave.reviewed_at ? `Reviewed: ${formatDate(leave.reviewed_at)}` : ''}
${leave.reviewed_by_name ? `Reviewed by: ${leave.reviewed_by_name}` : ''}
${leave.admin_comment ? `Admin Comment: ${leave.admin_comment}` : ''}
                            `.trim();
                            alert(details);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.page} of {pagination.pages} 
                    ({pagination.total} total applications)
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default LeaveHistory;
