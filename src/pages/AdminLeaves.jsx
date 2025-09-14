import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, getStatusClass } from '../utils/helpers';
import { toast } from 'react-toastify';

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ status: '', admin_comment: '' });
  const [submitting, setSubmitting] = useState(false);

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
      const response = await leaveAPI.getAllLeaves(params);
      setLeaves(response.data.data.leaves);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleReview = (leave) => {
    setSelectedLeave(leave);
    setReviewData({ status: '', admin_comment: '' });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewData.status) {
      toast.error('Please select a status');
      return;
    }

    try {
      setSubmitting(true);
      await leaveAPI.reviewLeave(selectedLeave.id, reviewData);
      toast.success(`Leave application ${reviewData.status} successfully`);
      setShowReviewModal(false);
      fetchLeaves(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review leave application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading leave applications..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Leave Applications</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Review and approve/reject leave applications from doctors
        </p>
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
              All ({pagination.total || 0})
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
                  : 'No leave applications have been submitted yet'
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
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">
                              {leave.doctor_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {leave.doctor_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {leave.employee_id} • {leave.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(leave.status)}`}>
                          {leave.status}
                        </span>
                        {leave.status === 'pending' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReview(leave)}
                          >
                            Review
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const details = `
Doctor: ${leave.doctor_name} (${leave.employee_id})
Department: ${leave.department}
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
                        )}
                      </div>
                    </div>

                    {/* Leave Type and Reason */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{leave.category_name}</h4>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{leave.reason}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
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
                          Applied Date
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(leave.applied_at)}
                        </div>
                      </div>
                    </div>
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
                      onClick={() => setCurrentPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.page + 1)}
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

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Leave Application"
        size="md"
      >
        {selectedLeave && (
          <div className="space-y-4">
            {/* Leave Details */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Application Details</h4>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p><strong>Doctor:</strong> {selectedLeave.doctor_name}</p>
                <p><strong>Leave Type:</strong> {selectedLeave.category_name}</p>
                <p><strong>Duration:</strong> {formatDate(selectedLeave.start_date)} - {formatDate(selectedLeave.end_date)}</p>
                <p><strong>Total Days:</strong> {selectedLeave.total_days}</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              </div>
            </div>

            {/* Review Form */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decision <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="approved"
                    checked={reviewData.status === 'approved'}
                    onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">Approve</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="rejected"
                    checked={reviewData.status === 'rejected'}
                    onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">Reject</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Comment (Optional)
              </label>
              <textarea
                rows={3}
                className="input"
                placeholder="Add any comments about this decision..."
                value={reviewData.admin_comment}
                onChange={(e) => setReviewData({...reviewData, admin_comment: e.target.value})}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                loading={submitting}
                disabled={submitting || !reviewData.status}
              >
                Submit Review
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminLeaves;
