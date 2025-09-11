import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { doctorAPI, leaveAPI } from '../services/api';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { formatDate, getStatusClass } from '../utils/helpers';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading dashboard..." />
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Applications',
      value: dashboardData?.statistics?.total_applications || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Approved',
      value: dashboardData?.statistics?.approved_count || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Pending',
      value: dashboardData?.statistics?.pending_count || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Rejected',
      value: dashboardData?.statistics?.rejected_count || 0,
      icon: XCircleIcon,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-sm">
        <div className="px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-primary-100">
            Here's what's happening with your leave applications
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Balance */}
        <Card>
          <Card.Header>
            <Card.Title>Leave Balance</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {dashboardData?.leaveBalance?.length > 0 ? (
                dashboardData.leaveBalance.map((balance) => (
                  <div key={balance.category_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{balance.category_name}</p>
                      <p className="text-sm text-gray-600">
                        {balance.remaining_days} of {balance.total_days} days remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-primary-600 rounded-full"
                          style={{
                            width: `${(balance.remaining_days / balance.total_days) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No leave balance data available</p>
              )}
            </div>
            {user?.role === 'doctor' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link to="/leave/apply">
                  <Button className="w-full" icon={CalendarIcon}>
                    Apply for Leave
                  </Button>
                </Link>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Pending Leaves */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Pending Applications</Card.Title>
              {user?.role === 'doctor' && (
                <Link to="/leave/history">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              )}
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {dashboardData?.pendingLeaves?.length > 0 ? (
                dashboardData.pendingLeaves.map((leave) => (
                  <div key={leave.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{leave.category_name}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {leave.total_days} day{leave.total_days > 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className={getStatusClass(leave.status)}>
                        {leave.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No pending applications</p>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Leave History */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>Recent Leave History</Card.Title>
            {user?.role === 'doctor' && (
              <Link to="/leave/history">
                <Button variant="outline" size="sm">
                  View All History
                </Button>
              </Link>
            )}
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData?.recentLeaves?.length > 0 ? (
                  dashboardData.recentLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {leave.category_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No recent leave history
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>

      {/* Quick Actions for Admin */}
      {user?.role === 'admin' && (
        <Card>
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/leaves">
                <Button variant="outline" className="w-full h-20 flex-col" icon={DocumentTextIcon}>
                  <span className="text-lg font-semibold">Manage Leaves</span>
                  <span className="text-sm text-gray-500">Review applications</span>
                </Button>
              </Link>
              <Link to="/doctors">
                <Button variant="outline" className="w-full h-20 flex-col" icon={UsersIcon}>
                  <span className="text-lg font-semibold">View Doctors</span>
                  <span className="text-sm text-gray-500">Manage doctor profiles</span>
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" className="w-full h-20 flex-col" icon={ClockIcon}>
                  <span className="text-lg font-semibold">Settings</span>
                  <span className="text-sm text-gray-500">System configuration</span>
                </Button>
              </Link>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;