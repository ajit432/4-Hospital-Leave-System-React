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
        <h1 className="text-2xl font-bold text-gray-900">Manage Leave Applications</h1>
        <p className="mt-1 text-sm text-gray-600">
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
                : 'No leave applications have been submitted yet'
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
                      Doctor
                    </th>
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
                      Applied
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
                            {leave.doctor_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {leave.employee_id} • {leave.department}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {leave.category_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {leave.reason}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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
              </div>
            )}
          </>
        )}
      </Card>

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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
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
