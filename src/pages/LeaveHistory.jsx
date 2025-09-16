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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave History</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && leaves.length === 0 ? (
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No leave applications found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {statusFilter 
                  ? `No ${statusFilter} leave applications to display`
                  : 'You haven\'t applied for any leaves yet'
                }
              </p>
            </div>
          </Card.Content>
        </Card>
      ) : (
        /* Leave Applications Grid */
        <div className="space-y-4">
          {leaves.map((leave) => (
            <Card key={leave.id} className="hover:shadow-md transition-shadow duration-200">
              <Card.Content className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                              {leave.category_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {leave.category_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Applied on {formatDate(leave.applied_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(leave.status)}`}>
                          {leave.status}
                        </span>
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
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Duration
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Days
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Applied Date
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(leave.applied_at)}
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    {leave.reason && (
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Reason
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {leave.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Card>
              <Card.Content className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
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
              </Card.Content>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;
