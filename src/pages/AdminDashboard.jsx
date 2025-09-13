import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { leaveAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => (
  <Card>
    <Card.Content className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <p className={`ml-2 text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </p>
            )}
          </div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
      </div>
    </Card.Content>
  </Card>
);

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    applicationsSummary: { pending: 0, approved: 0, rejected: 0 },
    categoryUsage: [],
    topRequesters: []
  });
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSummary();
  }, [currentYear]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getLeaveSummary({ year: currentYear });
      setSummary(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const { applicationsSummary, categoryUsage, topRequesters } = summary;
  const totalApplications = applicationsSummary.pending + applicationsSummary.approved + applicationsSummary.rejected;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of leave management system for {currentYear}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="input w-auto"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() + i - 2;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <Button onClick={fetchSummary} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applications"
          value={totalApplications}
          icon={CalendarDaysIcon}
          color="blue"
        />
        <StatCard
          title="Pending Reviews"
          value={applicationsSummary.pending}
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={applicationsSummary.approved}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Rejected"
          value={applicationsSummary.rejected}
          icon={XCircleIcon}
          color="red"
        />
      </div>

      {/* Applications by Status Chart */}
      <Card>
        <Card.Header>
          <Card.Title>Leave Applications Overview</Card.Title>
        </Card.Header>
        <Card.Content>
          {totalApplications === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600">No leave applications have been submitted for {currentYear}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress Bars */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="text-sm text-gray-600">
                    {applicationsSummary.pending} ({Math.round((applicationsSummary.pending / totalApplications) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(applicationsSummary.pending / totalApplications) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Approved</span>
                  <span className="text-sm text-gray-600">
                    {applicationsSummary.approved} ({Math.round((applicationsSummary.approved / totalApplications) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(applicationsSummary.approved / totalApplications) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Rejected</span>
                  <span className="text-sm text-gray-600">
                    {applicationsSummary.rejected} ({Math.round((applicationsSummary.rejected / totalApplications) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(applicationsSummary.rejected / totalApplications) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Usage */}
        <Card>
          <Card.Header>
            <Card.Title>Leave Usage by Category</Card.Title>
          </Card.Header>
          <Card.Content>
            {categoryUsage.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📋</div>
                <p className="text-gray-600">No leave allocations for {currentYear}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryUsage.map((category) => (
                  <div key={category.category_name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{category.category_name}</h4>
                      <span className="text-sm text-gray-600">
                        {category.doctors_count} doctor{category.doctors_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Allocated</p>
                        <p className="font-medium text-blue-600">{category.total_allocated || 0} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Used</p>
                        <p className="font-medium text-orange-600">{category.total_used || 0} days</p>
                      </div>
                    </div>
                    {category.total_allocated > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${(category.total_used / category.total_allocated) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {Math.round((category.total_used / category.total_allocated) * 100)}% utilized
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Top Requesters */}
        <Card>
          <Card.Header>
            <Card.Title>Top Leave Requesters</Card.Title>
          </Card.Header>
          <Card.Content>
            {topRequesters.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">👥</div>
                <p className="text-gray-600">No leave requests for {currentYear}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topRequesters.map((requester, index) => (
                  <div
                    key={`${requester.employee_id}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{requester.doctor_name}</p>
                        <p className="text-sm text-gray-600">
                          {requester.employee_id} • {requester.department}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{requester.approved_days} days</p>
                      <p className="text-sm text-gray-600">
                        {requester.applications_count} application{requester.applications_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => window.location.href = '/admin/leaves'}
            >
              <ClockIcon className="w-6 h-6" />
              <span>Review Pending Leaves</span>
              {applicationsSummary.pending > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  {applicationsSummary.pending} pending
                </span>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => window.location.href = '/admin/leave-allocation'}
            >
              <UserGroupIcon className="w-6 h-6" />
              <span>Manage Allocations</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => window.location.href = '/admin/leave-categories'}
            >
              <TagIcon className="w-6 h-6" />
              <span>Leave Categories</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => fetchSummary()}
            >
              <ChartBarIcon className="w-6 h-6" />
              <span>Refresh Reports</span>
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboard;
